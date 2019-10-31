import { ErrorCode, EventDetail, EventType, MessageType } from "../../classes/Constants";
import Game from "../../classes/Game";
import Player from "../../classes/Player";
import User from "../../classes/User";
import Logger from "../../util/Logger";
import IGameLogic from "../IGameLogic";
import CAHGameOptions from "./CAHGameOptions";
import BlackCard from "./classes/BlackCard";
import BlackDeck from "./classes/BlackDeck";
import CAHPlayer from "./classes/CAHPlayer";
import CardSet from "./classes/CardSet";
import PlayerPlayedCardsTracker from "./classes/PlayerPlayedCardsTracker";
import WhiteCard from "./classes/WhiteCard";
import WhiteDeck from "./classes/WhiteDeck";

enum CAHErrorCode {
	DO_NOT_HAVE_CARD = "doNotHaveCard",
	INVALID_CARD = "invalidCard",
	INVALID_STATE = "invalidState",
	NO_CARD_SPECIFIED = "noCardSpecified",
	NOT_ENOUGH_CARDS = "notEnoughCards",
	NOT_JUDGE = "notJudge",
	NOT_YOUR_TURN = "notYourTurn",
	PLAYED_ALL_CARDS = "playedAllCards"
}

enum CAHEventDetail {
	BLACK_CARD = "blackCard",
	HAND = "hand",
	JUDGE_INDEX = "judgeIndex",
	WHITE_CARDS = "whiteCards",
	WINNING_CARD = "winningCard"
}

enum CAHEventType {
	GAME_BLACK_RESHUFFLE = "gameBlackReshuffle",
	GAME_JUDGE_LEFT = "gameJudgeLeft",
	GAME_WHITE_RESHUFFLE = "gameWhiteReshuffle",
	HAND_DEAL = "handDeal",
	JUDGE_CARD = "judgeCard",
	PLAY_CARD = "playCard"
}

enum CAHGameInfo {
	STATE = "state"
}

enum CAHGamePlayerInfo {
	SCORE = "score",
	STATUS = "status"
}

enum CAHGamePlayerStatus {
	HOST = "host",
	IDLE = "idle",
	JUDGE = "judge",
	JUDGING = "judging",
	PLAYING = "playing",
	WINNER = "winner",
	SPECTATOR = "spectator"
}

enum CAHGameState {
	JUDGING = "judging",
	LOBBY = "lobby",
	PLAYING = "playing",
	ROUND_OVER = "roundOver"
}

export default class CAHGameLogic implements IGameLogic {
	delegate: Game;
	private models: { [modelId: string]: any };
	
	private gamePlayers: Map<Player, CAHPlayer> = new Map();
	private roundPlayers: Array<CAHPlayer> = [];
	private playedCards: PlayerPlayedCardsTracker = new PlayerPlayedCardsTracker();
	private blackDeck: BlackDeck;
	private blackCard: BlackCard;
	private whiteDeck: WhiteDeck;
	private state: CAHGameState = CAHGameState.LOBBY;
	
	private judgeIndex: number = 0;
	
	public static MINIMUM_BLACK_CARDS: number = 50;
	public static MINIMUM_WHITE_CARDS_PER_PLAYER: number = 20;
	private static ROUND_INTERMISSION: number = 5 * 1000;
	
	constructor(delegate: Game, models: { [modelId: string]: any }) {
		this.delegate = delegate;
		this.models = models;
	}
	
	handlePlayerJoin(player: Player) {
		if (this.state != CAHGameState.LOBBY) throw new Error(ErrorCode.ALREADY_STARTED);
		
		this.gamePlayers.set(player, new CAHPlayer(player));
	}
	handlePlayerLeave(player: Player) {
		let wasJudge: boolean = false;
		
		let cahPlayer: CAHPlayer = this.gamePlayers.get(player);
		let cards: Array<WhiteCard> = this.playedCards.remove(cahPlayer);
		
		if (cards && cards.length) {
			for (let card of cards) {
				this.whiteDeck.discard(card);
			}
		}
		
		if (this.roundPlayers.indexOf(cahPlayer) >= 0 && this.roundPlayers.splice(this.roundPlayers.indexOf(cahPlayer), 1)) {
			if (this.startJudging()) {
				this.judgingState()
			}
		}
		
		if (cahPlayer.getHand().length > 0) {
			let hand: Array<WhiteCard> = cahPlayer.getHand();
			for (let card of hand) {
				this.whiteDeck.discard(card);
			}
		}
		
		if (this.getJudge() == cahPlayer && (this.state == CAHGameState.PLAYING || this.state == CAHGameState.JUDGING)) {
			this.judgeIndex--;
			wasJudge = true;
			
			this.delegate.broadcastToPlayers(MessageType.GAME_EVENT, {
				[EventDetail.EVENT]: CAHEventType.GAME_JUDGE_LEFT,
				[EventDetail.PLAYER_INFO]: [...this.gamePlayers.keys()].map(player => this.delegate.getPlayerInfo(player)),
				[CAHEventDetail.JUDGE_INDEX]: this.judgeIndex,
				[EventDetail.INTERMISSION]: CAHGameLogic.ROUND_INTERMISSION
			});
			
			this.returnCardsToHand();
		} else if ([...this.gamePlayers.keys()].indexOf(player) < this.judgeIndex) {
			this.judgeIndex--;
		}
		
		this.gamePlayers.delete(player);
		if (this.gamePlayers.size < 3 && this.state != CAHGameState.LOBBY) {
			Logger.log(`[CAH] Resetting game ${this.delegate.getId()} due to too few players after someone left.`);
			this.resetState(true);
		} else if (wasJudge && this.state == CAHGameState.JUDGING) {
			setTimeout(this.startNextRound.bind(this), CAHGameLogic.ROUND_INTERMISSION);
		}
	}
	async handleGameStart(user?: User): Promise<boolean> {
		if (this.state != CAHGameState.LOBBY) throw new Error(ErrorCode.ALREADY_STARTED);
		if (!(await this.hasEnoughCards())) throw new Error(CAHErrorCode.NOT_ENOUGH_CARDS);
		if (!(await this.start())) throw new Error(ErrorCode.SERVER_ERROR);
		
		return true;
	}
	handleGameStartNextRound?(user?: User): boolean {
		this.startNextRound();
		
		return true;
	}
	handleGameEvent(user: User, payload: any) {
		switch (payload[EventDetail.EVENT]) {
			case CAHEventType.PLAY_CARD:
				this.playCard(user, payload.card.id, payload.card.text);
				break;
			case CAHEventType.JUDGE_CARD:
				this.judgeCard(user, payload.card.id);
				break;
			default: break;
		}
	}
	getGameInfo(): object {
		return {
			[CAHGameInfo.STATE]: this.getState()
		}
	}
	getPlayerInfo(player: Player): object {
		let cahPlayer: CAHPlayer = this.gamePlayers.get(player);
		
		if (!cahPlayer) return null;
		
		return {
			[CAHGamePlayerInfo.SCORE]: cahPlayer.getScore(),
			[CAHGamePlayerInfo.STATUS]: this.getPlayerStatus(player)
		}
	}
	
	//#region Game Info
	private getState(): CAHGameState {
		return this.state;
	}
	
	private getJudge(): CAHPlayer {
		if (this.judgeIndex >= 0 && this.judgeIndex < this.gamePlayers.size) {
			return [...this.gamePlayers.values()][this.judgeIndex];
		}
		
		return null;
	}
	
	private getPlayerStatus(player: Player): CAHGamePlayerStatus {
		let playerStatus: CAHGamePlayerStatus;
		let cahPlayer = this.gamePlayers.get(player);
		
		switch (this.state) {
			case CAHGameState.LOBBY:
				if (this.delegate.getHostPlayer() == player) {
					playerStatus = CAHGamePlayerStatus.HOST;
				} else {
					playerStatus = CAHGamePlayerStatus.IDLE;
				}
				break;
			case CAHGameState.PLAYING:
				if (this.getJudge() == cahPlayer) {
					playerStatus = CAHGamePlayerStatus.JUDGE;
				} else {
					if (!this.roundPlayers.includes(cahPlayer)) {
						playerStatus = CAHGamePlayerStatus.IDLE;
						break;
					}
					
					let playerCards: Array<WhiteCard> = this.playedCards.getCards(player);
					if (playerCards && this.blackCard && playerCards.length == this.blackCard.getPick()) {
						playerStatus = CAHGamePlayerStatus.IDLE;
					} else {
						playerStatus = CAHGamePlayerStatus.PLAYING;
					}
				}
				break;
			case CAHGameState.JUDGING:
				if (this.getJudge() == cahPlayer) {
					playerStatus = CAHGamePlayerStatus.JUDGING;
				} else {
					playerStatus = CAHGamePlayerStatus.IDLE;
				}
				break;
			case CAHGameState.ROUND_OVER:
				if (this.getJudge() == cahPlayer) {
					playerStatus = CAHGamePlayerStatus.JUDGE;
				} else if (cahPlayer.getScore() >= (this.delegate.getGameOptions() as CAHGameOptions).scoreGoal) {
					playerStatus = CAHGamePlayerStatus.WINNER;
				} else {
					playerStatus = CAHGamePlayerStatus.IDLE;
				}
				break;
			default:
				throw new Error(`Invalid GameState ${this.state}`);
		}
		
		return playerStatus;
	}
	
	public getRequiredWhiteCardCount(): number {
		return CAHGameLogic.MINIMUM_WHITE_CARDS_PER_PLAYER * this.delegate.getGameOptions().playerLimit;
	}
	
	public async hasEnoughCards(): Promise<boolean> {
		let cardSets: Array<CardSet> = await this.loadCardSets();
		
		// if (!cardSets.length) return false;
		
		let tempBlackDeck: BlackDeck = await this.loadBlackDeck(cardSets);
		if (tempBlackDeck.totalCount() < CAHGameLogic.MINIMUM_BLACK_CARDS) return false;
		
		let tempWhiteDeck: WhiteDeck = await this.loadWhiteDeck(cardSets);
		if (tempWhiteDeck.totalCount() < this.getRequiredWhiteCardCount()) return false;
		
		return true;
	}
	
	public async loadCardSets(): Promise<Array<CardSet>> {
		let cardSets: Array<CardSet> = [];
		
		if ((this.delegate.getGameOptions() as CAHGameOptions).cardSetIds.length) {
			let cardSetList: Array<any> = await this.models.Decks.findAll({
				where: {
					id: (this.delegate.getGameOptions() as CAHGameOptions).cardSetIds
				}
			});
			
			cardSetList.forEach(cardSetObj => {
				let cardSet: CardSet = new CardSet(cardSetObj["id"], cardSetObj["name"], cardSetObj["description"]);
				cardSets.push(cardSet);
			});
		}
		
		return cardSets;
	}
	
	public async loadBlackDeck(cardSets: Array<CardSet>): Promise<BlackDeck> {
		let blackDeck: BlackDeck = new BlackDeck(this.models, cardSets);
		await blackDeck.loadCards();
		
		return blackDeck;
	}
	
	public async loadWhiteDeck(cardSets: Array<CardSet>): Promise<WhiteDeck> {
		let whiteDeck: WhiteDeck = new WhiteDeck(this.models, cardSets, (this.delegate.getGameOptions() as CAHGameOptions).blanksInDeck);
		await whiteDeck.loadCards();
		
		return whiteDeck;
	}
	//#endregion
	
	//#region Game Methods
	private getNextBlackCard(): BlackCard {
		try {
			return this.blackDeck.getNextCard();
		} catch (error) {
			this.blackDeck.reshuffle();
			
			this.delegate.broadcastToPlayers(MessageType.GAME_EVENT, {
				[EventDetail.EVENT]: CAHEventType.GAME_BLACK_RESHUFFLE
			});
			
			return this.getNextBlackCard();
		}
	}
	private getNextWhiteCard(): WhiteCard {
		try {
			return this.whiteDeck.getNextCard();
		} catch (error) {
			this.whiteDeck.reshuffle();
			
			this.delegate.broadcastToPlayers(MessageType.GAME_EVENT, {
				[EventDetail.EVENT]: CAHEventType.GAME_WHITE_RESHUFFLE
			});
			
			return this.getNextWhiteCard();
		}
	}
	
	public getBlackCard(): any {
		if (!this.blackCard) return null;
		
		return this.blackCard.getClientData();
	}
	
	private getWhiteCards(user: User = null): Array<Array<any>> {
		if (this.state == CAHGameState.JUDGING) {
			let shuffledPlayCards: Array<Array<WhiteCard>> = this.playedCards.cards();
			
			let cardData: Array<Array<any>> = [];
			shuffledPlayCards.shuffle();
			
			for (let cards of shuffledPlayCards) {
				cardData.push(this.getWhiteCardData(cards));
			}
			
			return cardData;
		} else if (this.state == CAHGameState.PLAYING) {
			let player: Player = this.delegate.getPlayerForUser(user);
			
			let cardData: Array<Array<any>> = [];
			let faceDownCards: number = this.playedCards.size();
			
			if (this.playedCards.hasPlayer(player)) {
				cardData.push(this.getWhiteCardData(this.playedCards.getCards(player)));
				faceDownCards--;
			}
			
			while (faceDownCards-- > 0) {
				cardData.push([WhiteCard.getFaceDownCardClientData()]);
			}
			
			return cardData;
		} else {
			return [];
		}
	}
	
	private getWhiteCardData(cards: Array<WhiteCard>): Array<any> {
		let data: Array<any> = [];
		
		for (let card of cards) {
			data.push(card.getClientData());
		}
		
		return data;
	}
	
	private sendCardsToPlayer(player: Player, cards: Array<WhiteCard>) {
		player.getUser().emitMessage(MessageType.GAME_EVENT, {
			[EventDetail.EVENT]: CAHEventType.HAND_DEAL,
			[CAHEventDetail.HAND]: this.getWhiteCardData(cards)
		});
	}
	
	private returnCardsToHand() {
		for (let p of this.playedCards.playedPlayers()) {
			let cahPlayer = this.gamePlayers.get(p);
			
			cahPlayer.getHand().concat(this.playedCards.getCards(p));
			this.sendCardsToPlayer(p, this.playedCards.getCards(p));
		}
	}
	
	private playCard(user: User, cardId: string, cardText: string) {
		let player: Player = this.delegate.getPlayerForUser(user);
		
		if (player) {
			let cahPlayer: CAHPlayer = this.gamePlayers.get(player);
			
			if (this.getJudge() == cahPlayer || this.state != CAHGameState.PLAYING) {
				throw new Error(CAHErrorCode.NOT_YOUR_TURN);
			}
			
			if (this.playedCards.getCardsCount(player) >= this.blackCard.getPick()) {
				throw new Error(CAHErrorCode.PLAYED_ALL_CARDS);
			}
			
			let hand: Array<WhiteCard> = cahPlayer.getHand();
			let playCard: WhiteCard;
			
			for (let card of hand) {
				if (card.getId() == cardId) {
					playCard = card;
					if (WhiteDeck.isBlankCard(card)) {
						playCard.setText(cardText)
					}
					
					hand.splice(hand.indexOf(card), 1);
					
					break;
				}
			}
			
			if (playCard) {
				this.playedCards.addCard(player, playCard);
				this.delegate.notifyPlayerInfoChange(player);
				
				if (this.startJudging()) this.judgingState();
			} else {
				throw new Error(CAHErrorCode.DO_NOT_HAVE_CARD);
			}
		}
	}
	
	private judgeCard(judge: User, cardId: string) {
		let cardPlayer: Player;
		let judgePlayer = this.delegate.getPlayerForUser(judge);
		
		if (this.getJudge().getPlayer() != judgePlayer) {
			return CAHErrorCode.NOT_JUDGE;
		} else if (this.state != CAHGameState.JUDGING) {
			return CAHErrorCode.NOT_YOUR_TURN;
		}
		
		cardPlayer = this.playedCards.getPlayerForId(cardId);
		if (!cardPlayer) throw new Error(CAHErrorCode.INVALID_CARD);
		
		this.gamePlayers.get(cardPlayer).increaseScore();
		this.state = CAHGameState.ROUND_OVER;
		
		let clientCardId: string = this.playedCards.getCards(cardPlayer)[0].getId();
		this.delegate.broadcastToPlayers(MessageType.GAME_EVENT, {
			[EventDetail.EVENT]: EventType.GAME_ROUND_COMPLETE,
			[EventDetail.ROUND_WINNER]: this.delegate.getPlayerInfo(cardPlayer),
			[CAHEventDetail.WINNING_CARD]: clientCardId,
			[EventDetail.INTERMISSION]: CAHGameLogic.ROUND_INTERMISSION
		});
		
		this.delegate.notifyPlayerInfoChange(this.getJudge().getPlayer());
		this.delegate.notifyPlayerInfoChange(cardPlayer);
		
		setTimeout(() => {
			if (this.gamePlayers.get(cardPlayer).getScore() >= (this.delegate.getGameOptions() as CAHGameOptions).scoreGoal) {
				this.winState();
			} else {
				this.startNextRound();
			}
		}, CAHGameLogic.ROUND_INTERMISSION);
	}
	
	private startJudging(): boolean {
		if (this.state != CAHGameState.PLAYING) return false;
		
		if (this.playedCards.size() == this.roundPlayers.length) {
			let startJudging: boolean = true;
			
			for (let cards of this.playedCards.cards()) {
				if (cards.length != this.blackCard.getPick()) {
					startJudging = false;
					break;
				}
			}
			
			return startJudging;
		}
		
		return false;
	}
	//#endregion
	
	//#region Game States
	private async start(): Promise<boolean> {
		if (this.state != CAHGameState.LOBBY || !(await this.hasEnoughCards())) return false;
		
		let started: boolean = false;
		let numPlayers = this.gamePlayers.size;
		// if (numPlayers >= 3) {
			this.judgeIndex = Math.floor(Math.random() * numPlayers);
			started = true;
		// }
		
		if (started) {
			let _options = this.delegate.getGameOptions() as CAHGameOptions;
			Logger.log(`[CAH] Starting game ${this.delegate.getId()} with card sets ${_options.cardSetIds}, ${_options.blanksInDeck} blanks, ${_options.playerLimit} max players, ${_options.spectatorLimit} max spectators, ${_options.scoreGoal} score limit`);
			
			let cardSets: Array<CardSet> = await this.loadCardSets();
			this.blackDeck = await this.loadBlackDeck(cardSets);
			this.whiteDeck = await this.loadWhiteDeck(cardSets);
		}
		
		return started;
	}
	
	private startNextRound() {
		for (let cards of this.playedCards.cards()) {
			for (let card of cards) {
				this.whiteDeck.discard(card);
			}
		}
		
		this.judgeIndex++;
		if (this.judgeIndex >= this.gamePlayers.size) {
			this.judgeIndex = 0;
		}
		
		this.roundPlayers = [];
		for (let player of [...this.gamePlayers.values()]) {
			if (player != this.getJudge()) {
				this.roundPlayers.push(player);
			}
		}
		
		this.dealState();
	}
	
	private dealState() {
		let playersCopy: Array<CAHPlayer> = [...this.gamePlayers.values()];
		playersCopy.forEach(player => {
			let hand: Array<WhiteCard> = player.getHand();
			
			if (!hand.length) {
				let card: WhiteCard = new WhiteCard(player.getUser().getSocketId(), player.getUser().getNickname(), null, false)
				hand.push(card);
			}
			
			while (hand.length < 10) {
				let card: WhiteCard = this.getNextWhiteCard();
				hand.push(card);
			}
			
			this.sendCardsToPlayer(player, hand);
		});
		
		this.playingState();
	}
	
	private playingState() {
		this.state = CAHGameState.PLAYING;
		
		this.playedCards.clear();
		
		if (this.blackCard) {
			this.blackDeck.discard(this.blackCard);
		}
		this.blackCard = this.getNextBlackCard();
		
		this.delegate.broadcastToPlayers(MessageType.GAME_EVENT, {
			[EventDetail.EVENT]: EventType.GAME_STATE_CHANGE,
			[EventDetail.GAME_STATE]: CAHGameState.PLAYING,
			[CAHEventDetail.BLACK_CARD]: this.getBlackCard(),
			[CAHEventDetail.JUDGE_INDEX]: this.judgeIndex,
			[EventDetail.PLAYER_INFO]: [...this.gamePlayers.keys()].map(player => this.delegate.getPlayerInfo(player))
		});
	}
	
	private judgingState() {
		this.state = CAHGameState.JUDGING;
		
		this.delegate.broadcastToPlayers(MessageType.GAME_EVENT, {
			[EventDetail.EVENT]: EventType.GAME_STATE_CHANGE,
			[EventDetail.GAME_STATE]: CAHGameState.JUDGING,
			[CAHEventDetail.WHITE_CARDS]: this.getWhiteCards(),
			[EventDetail.PLAYER_INFO]: [...this.gamePlayers.keys()].map(player => this.delegate.getPlayerInfo(player))
		});
		
		this.delegate.notifyPlayerInfoChange(this.getJudge().getPlayer());
	}
	
	private winState() {
		this.resetState(false);
	}
	
	private resetState(lostPlayer: boolean) {
		Logger.log(`Resetting game ${this.delegate.getId()} to lobby (lostPlayer=${lostPlayer})`);
		
		this.gamePlayers.forEach((cahPlayer, player) => {
			cahPlayer.setHand([]);
			cahPlayer.resetScore();
		});
		
		this.whiteDeck = null;
		this.blackDeck = null;
		this.blackCard = null;
		
		this.playedCards.clear();
		this.roundPlayers = [];
		this.state = CAHGameState.LOBBY;
		
		let judge: CAHPlayer = this.getJudge();
		this.judgeIndex = 0;
		
		this.delegate.broadcastToPlayers(MessageType.GAME_EVENT, {
			[EventDetail.EVENT]: EventType.GAME_STATE_CHANGE,
			[EventDetail.GAME_STATE]: CAHGameState.LOBBY,
			[EventDetail.PLAYER_INFO]: [...this.gamePlayers.keys()].map(player => this.delegate.getPlayerInfo(player))
		});
		
		if (this.delegate.getHostPlayer()) {
			this.delegate.notifyPlayerInfoChange(this.delegate.getHostPlayer());
		}
		
		if (judge) {
			this.delegate.notifyPlayerInfoChange(judge);
		}
		
		global.gameManager.broadcastGameListRefresh();
	}
	//#endregion
}