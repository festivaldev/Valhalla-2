import Game from "../../classes/Game";
import IGameLogic from "../IGameLogic"
import Logger, { LogLevel } from "../../util/Logger";
import { MessageType, ErrorCode, LongPollResponse, LongPollEvent, GamePlayerInfo, GameInfo } from "../../classes/Constants";
import Player from "../../classes/Player";

import CardSet from "./classes/CardSet";
import BlackDeck from "./classes/BlackDeck";
import BlackCard from "./classes/BlackCard";
import WhiteDeck from "./classes/WhiteDeck";
import WhiteCard from "./classes/WhiteCard";
import PlayerPlayedCardsTracker from "./classes/PlayerPlayedCardsTracker";
import CAHPlayer from "./classes/CAHPlayer";
import User from "../../classes/User";
import CAHGameOptions from "./CAHGameOptions";

enum CAHErrorCode {
	DO_NOT_HAVE_CARD = "You don't have that card",
	INVALID_CARD = "Invalid card specified",
	NO_CARD_SPECIFIED = "No card specified",
	NOT_JUDGE = "You are not the judge",
	NOT_YOUR_TURN = "It is not your turn to play a card",
	PLAYED_ALL_CARDS = "You already played all the necessary cards"
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
	ROUND_OVER = "round-over"
};

enum CAHLongPollResponse {
	BLACK_CARD = "black-card",
	HAND = "hand",
	WHITE_CARDS = "white-cards",
	WINNING_CARD = "winning-card"
};

enum CAHLongPollEvent {
	GAME_BLACK_RESHUFFLE = "game-black-reshuffle",
	GAME_JUDGE_LEFT = "game-judge-left",
	GAME_WHITE_RESHUFFLE = "game-white-reshuffle",
	HAND_DEAL = "hand-deal"
};

export default class CAHGameLogic implements IGameLogic {
	delegate: Game;
	private database: any;
	
	private players: Map<Player, CAHPlayer> = new Map();
	private roundPlayers: Array<CAHPlayer> = [];
	private playedCards: PlayerPlayedCardsTracker = new PlayerPlayedCardsTracker();
	private blackDeck: BlackDeck = null;
	private blackCard: BlackCard = null;
	private whiteDeck: WhiteDeck;
	private state: CAHGameState = CAHGameState.LOBBY;
	
	private judgeIndex: number = 0;
	
	public static MINIMUM_BLACK_CARDS: number = 50;
	public static MINIMUM_WHITE_CARDS_PER_PLAYER: number = 20;
	private static ROUND_INTERMISSION: number = 8 * 1000;
	
	private dealSeq: number = 0;
	
	constructor(delegate: Game, database: any) {
		this.delegate = delegate;
		this.database = database;
	}
	
	public handlePlayerJoin(player: Player) {
		Logger.log(`${player.getUser().getNickname()} joined example!`, LogLevel.Warn);
		this.players.set(player, new CAHPlayer(player));
	}
	
	public handlePlayerLeave(player: Player) {
		let wasJudge: boolean = false;
		
		let cahPlayer = this.players.get(player);
		let cards: Array<WhiteCard> = this.playedCards.remove(cahPlayer);
		if (cards && cards.length) {
			cards.forEach(card => this.whiteDeck.discard(card));
		}
		
		if (this.roundPlayers.splice(this.roundPlayers.indexOf(cahPlayer), 1)) {
			if (this.startJudging()) {
				this.judgingState();
			}
		}
		
		if (cahPlayer.getHand().length) {
			let hand: Array<WhiteCard> = cahPlayer.getHand();
			hand.forEach(card => this.whiteDeck.discard(card));
		}
		
		if (this.getJudge() == player && (this.state == CAHGameState.PLAYING || this.state == CAHGameState.JUDGING)) {
			this.delegate.broadcastToPlayers(MessageType.GAME_EVENT, {
				[LongPollResponse.EVENT]: CAHLongPollEvent.GAME_JUDGE_LEFT,
				[LongPollResponse.INTERMISSION]: CAHGameLogic.ROUND_INTERMISSION
			});
			
			this.returnCardsToHand();
			
			this.judgeIndex--;
			wasJudge = true;
		} else if (Array.from(this.players.values()).indexOf(cahPlayer) < this.judgeIndex) {
			this.judgeIndex--;
		}
		
		if (this.players.size < 3 && this.state != CAHGameState.LOBBY) {
			Logger.log(`[CAH] Resetting game ${this.delegate.getId()} due to too few players after someone left.`);
			this.resetState(true);
		} else if (wasJudge) {
			setTimeout(this.startNextRound.bind(this), CAHGameLogic.ROUND_INTERMISSION);
		}
	}
	
	public async handleGameStart(): Promise<boolean> {
		if (this.state != CAHGameState.LOBBY) return false;
		if (!(await this.hasEnoughCards())) return false;
		if (!(await this.start())) return false;
		
		return true;
	}
	public handleGameStartNextRound(): boolean {
		this.startNextRound();
		return true;
	}
	public handleGameEnd() {
		Logger.log(`Example game with id ${this.delegate.getId()} ended`, LogLevel.Warn);
	}
	
	public handleMessage(type: MessageType, masterData: Object) {
		this.delegate.broadcastToPlayers(MessageType.GAME_EVENT, {
			fuck: "this"
		});
	}
	
	public getInfo(): object {
		return {
			[GameInfo.STATE]: this.state
		}
	}
	
	public getPlayerInfo(player: Player): object {
		let cahPlayer: CAHPlayer = this.players.get(player);
		
		return {
			[GamePlayerInfo.SCORE]: cahPlayer.getScore(),
			[GamePlayerInfo.STATUS]: this.getPlayerStatus(player)
		}
	}
	
	
	
	//#region Game Info
	public getState(): CAHGameState {
		return this.state;
	}
	
	private getJudge(): CAHPlayer {
		if (this.judgeIndex >= 0 && this.judgeIndex < this.players.size) {
			return Array.from(this.players.values())[this.judgeIndex];
		}
		
		return null;
	}
	
	private getPlayerStatus(player: Player): CAHGamePlayerStatus {
		let cahPlayer = this.players.get(player);
		let playerStatus: CAHGamePlayerStatus;
		
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
					playerStatus = CAHGamePlayerStatus.JUDGE
				} else {
					if (this.roundPlayers.indexOf(cahPlayer) < 0) {
						playerStatus = CAHGamePlayerStatus.IDLE;
						break;
					}
					let playerCards: Array<WhiteCard> = this.playedCards.getCards(player);
					if (playerCards != null && this.blackCard != null && playerCards.length == this.blackCard.getPick()) {
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
				} else if (cahPlayer.getScore() >= (this.delegate.getGameSettings() as CAHGameOptions).scoreGoal) {
					playerStatus = CAHGamePlayerStatus.WINNER;
				} else {
					playerStatus = CAHGamePlayerStatus.IDLE;
				}
				break;
			default:
				throw new Error(`Unknown GameState ${this.state}`);
		}
		
		return playerStatus;
	}
	
	public getRequiredWhiteCardCount(): number {
		return CAHGameLogic.MINIMUM_WHITE_CARDS_PER_PLAYER * this.delegate.getGameSettings().playerLimit;
	}
	
	public async hasEnoughCards(): Promise<boolean> {
		let cardSets: Array<CardSet> = await this.loadCardSets();
		
		// if (!cardSets.length) {
		// 	return false;
		// }
		
		let tempBlackDeck: BlackDeck = await this.loadBlackDeck(cardSets);
		if (tempBlackDeck.totalCount() < CAHGameLogic.MINIMUM_BLACK_CARDS) return false;
		
		let tempWhiteDeck: WhiteDeck = await this.loadWhiteDeck(cardSets);
		if (tempWhiteDeck.totalCount() < this.getRequiredWhiteCardCount()) return false;
		
		return true;
	}
	//#endregion
	
	//#region Game Methods
	public async loadCardSets(): Promise<Array<CardSet>> {
		let cardSets: Array<CardSet> = [];
		
		if ((this.delegate.getGameSettings() as CAHGameOptions).cardSetIds.length) {
			let cardSetList: Array<any> = await this.database.models.Decks.findAll({
				where: {
					id: (this.delegate.getGameSettings() as CAHGameOptions).cardSetIds
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
		let blackDeck: BlackDeck = new BlackDeck(this.database, cardSets);
		await blackDeck.loadCards();
		
		return blackDeck;
	}
	
	public async loadWhiteDeck(cardSets: Array<CardSet>): Promise<WhiteDeck> {
		let whiteDeck: WhiteDeck = new WhiteDeck(this.database, cardSets, (this.delegate.getGameSettings() as CAHGameOptions).blanksInDeck);
		await whiteDeck.loadCards();
		
		return whiteDeck;
	}
	
	private getNextBlackCard(): BlackCard {
		try {
			return this.blackDeck.getNextCard();
		} catch (e) {
			this.blackDeck.reshuffle();
			this.delegate.broadcastToPlayers(MessageType.GAME_EVENT, {
				[LongPollResponse.EVENT]: CAHLongPollEvent.GAME_BLACK_RESHUFFLE
			});
			return this.getNextBlackCard();
		}
	}
	
	private getNextWhiteCard(): WhiteCard {
		try {
			return this.whiteDeck.getNextCard();
		} catch (e) {
			this.whiteDeck.reshuffle();
			this.delegate.broadcastToPlayers(MessageType.GAME_EVENT, {
				[LongPollResponse.EVENT]: CAHLongPollEvent.GAME_WHITE_RESHUFFLE
			});
			return this.getNextWhiteCard();
		}
	}
	
	public getBlackCard(): object {
		if (!this.blackCard) return null;
		
		return this.blackCard.getClientData();
	}
	
	public getWhiteCards(user: User = null): Array<Array<object>> {
		let cardData: Array<Array<object>> = [];
		
		if (this.state == CAHGameState.JUDGING) {
			let shuffledPlayedCards: Array<Array<WhiteCard>> = this.playedCards.cards();
			
			
			shuffledPlayedCards.shuffle();
			shuffledPlayedCards.forEach(cards => {
				cardData.push(this.getWhiteCardData(cards));
			});
			
			return cardData;
		} else if (this.state == CAHGameState.PLAYING) {
			let player: Player = this.delegate.getPlayerForUser(user);
			
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
	
	private getWhiteCardData(cards: Array<WhiteCard>): Array<object> {
		let data: Array<object> = [];
		cards.forEach(card => {
			data.push(card.getClientData());
		});
		
		return data;
	}
	
	private sendCardsToPlayer(player: Player, cards: Array<WhiteCard>) {
		player.getUser().emitMessage({
			type: MessageType.GAME_EVENT,
			payload: {
				[LongPollResponse.EVENT]: CAHLongPollEvent.HAND_DEAL,
				[CAHLongPollResponse.HAND]: this.getWhiteCardData(cards)
			}
		});
	}
	
	private returnCardsToHand() {
		this.playedCards.playedPlayers().forEach(player => {
			let cahPlayer = this.players.get(player);
			cahPlayer.getHand().concat(this.playedCards.getCards(player));
			this.sendCardsToPlayer(player, this.playedCards.getCards(player));
		});
	}
	
	private playCard(user: User, cardId: string, cardText: string): CAHErrorCode {
		let player: Player = this.delegate.getPlayerForUser(user);
		
		if (player) {
			let cahPlayer: CAHPlayer = this.players.get(player);
			
			if (this.getJudge() == cahPlayer || this.state != CAHGameState.PLAYING) {
				return CAHErrorCode.NOT_YOUR_TURN;
			}
			
			if (this.playedCards.getCardsCount(player) >= this.blackCard.getPick()) {
				return CAHErrorCode.PLAYED_ALL_CARDS;
			}
			
			let hand: Array<WhiteCard> = cahPlayer.getHand();
			let playCard: WhiteCard;
			
			for (let card of hand) {
				if (card.getId() == cardId) {
					playCard = card;
					if (WhiteDeck.isBlankCard(card)) {
						playCard.setText(cardText)
					}
					
					break;
				}
			};
			
			if (playCard) {
				this.playedCards.addCard(player, playCard);
				this.delegate.notifyPlayerInfoChange(player);
				
				if (this.startJudging()) this.judgingState();
				return null;
			}
			
			return CAHErrorCode.DO_NOT_HAVE_CARD;
		}
		
		return null;
	}
	private judgeCard(judge: User, cardId: string): CAHErrorCode {
		let cardPlayer: Player;
		let judgePlayer = this.delegate.getPlayerForUser(judge);
		
		if (this.getJudge().getPlayer() != judgePlayer) {
			return CAHErrorCode.NOT_JUDGE;
		} else if (this.state != CAHGameState.JUDGING) {
			return CAHErrorCode.NOT_YOUR_TURN;
		}
		
		cardPlayer = this.playedCards.getPlayerForId(cardId);
		if (!cardPlayer) return CAHErrorCode.INVALID_CARD;
		
		this.players.get(cardPlayer).increaseScore();
		this.state = CAHGameState.ROUND_OVER;
		
		let clientCardId: string = this.playedCards.getCards(cardPlayer)[0].getId();
		this.delegate.broadcastToPlayers(MessageType.GAME_EVENT, {
			[LongPollResponse.EVENT]: LongPollEvent.GAME_ROUND_COMPLETE,
			[LongPollResponse.ROUND_WINNER]: cardPlayer.getUser().getNickname(),
			[CAHLongPollResponse.WINNING_CARD]: clientCardId,
			[LongPollResponse.INTERMISSION]: CAHGameLogic.ROUND_INTERMISSION
		});
		
		this.delegate.notifyPlayerInfoChange(this.getJudge().getPlayer());
		this.delegate.notifyPlayerInfoChange(cardPlayer);
		
		setTimeout(() => {
			if (this.players.get(cardPlayer).getScore() >= (this.delegate.getGameSettings() as CAHGameOptions).scoreGoal) {
				this.winState();
			} else {
				this.startNextRound();
			}
		}, CAHGameLogic.ROUND_INTERMISSION);
		
		return null;
	}
	//#endregion
	
	//#region Game States
	public async start(): Promise<boolean> {
		if (this.state != CAHGameState.LOBBY || !(await this.hasEnoughCards())) return false;
		
		let started: boolean = false;
		
		let numPlayers: number = this.players.size;
		// if (numPlayers >= 3) {
			this.judgeIndex = Math.floor(Math.random() * numPlayers);
			started = true;
		// }
		
		if (started) {
			let _options = this.delegate.getGameSettings() as CAHGameOptions;
			Logger.log(`[CAH] Starting game ${this.delegate.getId()} with card sets ${_options.cardSetIds}, ${_options.blanksInDeck} blanks, ${_options.playerLimit} max players, ${_options.spectatorLimit} max spectators, ${_options.scoreGoal} score limit`);
			
			let cardSets: Array<CardSet> = await this.loadCardSets();
			this.blackDeck = await this.loadBlackDeck(cardSets);
			this.whiteDeck = await this.loadWhiteDeck(cardSets);
		}	
		
		return started;
	}
	
	private startNextRound() {
		this.playedCards.cards().forEach(cards => {
			cards.forEach(card => this.whiteDeck.discard(card));
		});
		
		this.judgeIndex++;
		if (this.judgeIndex >= this.players.size) {
			this.judgeIndex = 0;
		}
		
		this.roundPlayers = [];
		Array.from(this.players.values()).forEach(player => {
			if (player != this.getJudge()) {
				this.roundPlayers.push(player);
			}
		});
		
		this.dealState();
	}
	private startJudging(): boolean {
		if (this.state != CAHGameState.PLAYING) return false;
		
		if (this.playedCards.size() == this.roundPlayers.length) {
			let startJudging: boolean = true;
			
			for (let cards in this.playedCards.cards()) {
				if (cards.length != this.blackCard.getPick()) {
					startJudging = false;
					break;
				}
			}
			
			return startJudging;
		}
		
		return false;
	}
	
	private dealState() {
		let playersCopy: Array<Player> = [...Array.from(this.players.keys())];
		
		playersCopy.forEach(player => {
			let cahPlayer = this.players.get(player);
			let hand: Array<WhiteCard> = cahPlayer.getHand();
			let newCards: Array<WhiteCard> = [];
			
			/* Special Addition: Username cards */
			if (hand.length == 0) {
				let card: WhiteCard = new WhiteCard(player.getUser().getSocketId(), player.getUser().getNickname(), null, false)
				hand.push(card);
				newCards.push(card);
			}
			
			while (hand.length < 10) {
				let card: WhiteCard = this.getNextWhiteCard();
				hand.push(card);
				newCards.push(card);
			}
			
			this.sendCardsToPlayer(player, newCards);
		});
		
		this.playingState();
	}
	private playingState() {
		this.state = CAHGameState.PLAYING;
		
		this.playedCards.clear();
		
		if (this.blackCard) this.blackDeck.discard(this.blackCard);
		this.blackCard = this.getNextBlackCard();
		
		this.delegate.broadcastToPlayers(MessageType.GAME_EVENT, {
			[LongPollResponse.EVENT]: LongPollEvent.GAME_STATE_CHANGE,
			[CAHLongPollResponse.BLACK_CARD]: this.getBlackCard(),
			[LongPollResponse.GAME_STATE]: CAHGameState.PLAYING
		});
	}
	private judgingState() {
		this.state = CAHGameState.JUDGING;
		
		this.delegate.broadcastToPlayers(MessageType.GAME_EVENT, {
			[LongPollResponse.EVENT]: LongPollEvent.GAME_STATE_CHANGE,
			[LongPollResponse.GAME_STATE]: CAHGameState.JUDGING,
			[CAHLongPollResponse.WHITE_CARDS]: this.getWhiteCards()
		});
		
		this.delegate.notifyPlayerInfoChange(this.getJudge().getPlayer());
	}
	private winState() {
		this.resetState(false);
	}
	
	private resetState(lostPlayer: boolean) {
		Logger.log(`Resetting game ${this.delegate.getId()} to lobby (lostPlayer=${lostPlayer})`);
		
		this.players.forEach(player => {
			player.setHand([]);
			player.resetScore();
		});
		
		this.whiteDeck = null;
		this.blackDeck = null;
		this.blackCard = null;
		
		this.playedCards.clear();
		this.roundPlayers = [];
		
		this.state = CAHGameState.LOBBY;
		
		this.judgeIndex = 0;
		if (this.delegate.getHostPlayer()) {
			this.delegate.notifyPlayerInfoChange(this.delegate.getHostPlayer())
		}
		
		if (this.getJudge()) {
			this.delegate.notifyPlayerInfoChange(this.getJudge().getPlayer());
		}
		
		this.delegate.broadcastToPlayers(MessageType.GAME_EVENT, {
			[LongPollResponse.EVENT]: LongPollEvent.GAME_STATE_CHANGE,
			[LongPollResponse.GAME_STATE]: CAHGameState.LOBBY,
		});
		
		this.delegate.getGameManager().broadcastGameListRefresh();
	}
	//#endregion
}