import Game from "../../classes/Game";
import IGameLogic from "../IGameLogic"
import Logger, { LogLevel } from "../../util/Logger";
import { MessageType, ErrorCode, GamePlayerStatus } from "../../classes/Constants";
import Player from "../../classes/Player";

import BlackDeck from "./classes/BlackDeck";
import BlackCard from "./classes/BlackCard";
import WhiteDeck from "./classes/WhiteDeck";
import WhiteCard from "./classes/WhiteCard";
import PlayerPlayedCardsTracker from "./classes/PlayerPlayedCardsTracker";
import CAHPlayer from "./classes/CAHPlayer";
import User from "../../classes/User";

enum CAHGameState {
	JUDGING = "judging",
	LOBBY = "lobby",
	PLAYING = "playing",
	ROUND_OVER = "round-over"
};

export default class CAHGameLogic implements IGameLogic {
	delegate: Game;
	
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
	
	private dealSeq: number = 0;
	
	constructor(delegate: Game) {
		this.delegate = delegate;
	}
	
	public handlePlayerJoin(player: Player) {
		Logger.log(`${player.getUser().getNickname()} joined example!`, LogLevel.Warn);
		this.players.set(player, new CAHPlayer(player));
	}
	
	public handlePlayerLeave(player: Player) {
		let cahPlayer = this.players.get(player);
		let cards: Array<WhiteCard> = this.playedCards.remove(cahPlayer);
		if (cards && cards.length) {
			cards.forEach(card => this.whiteDeck.discard(card));
		}
		
		if (this.roundPlayers.splice(this.roundPlayers.indexOf(cahPlayer), 1)) {
			// if (this.startJudging()) {
			// 	this.judgingState();
			// }
		}
		
		if (cahPlayer.getHand().length) {
			let hand: Array<WhiteCard> = cahPlayer.getHand();
			hand.forEach(card => this.whiteDeck.discard(card));
		}
		
		if (Array.from(this.players.values()).indexOf(cahPlayer) < this.judgeIndex) {
			this.judgeIndex--;
		}
	}
	
	public handleGameStart(): boolean {
		Logger.log(`Starting example game with id ${this.delegate.getId()}`, LogLevel.Warn);
		
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
	
	
	
	//#region Game Info
	public getState(): CAHGameState {
		return this.state;
	}
	
	private getJudge(): CAHPlayer {
		return null;
	}
	
	private getPlayerStatus(player: Player): GamePlayerStatus {
		return null;
	}
	
	public getRequiredWhiteCardCount(): number {
		return CAHGameLogic.MINIMUM_WHITE_CARDS_PER_PLAYER * this.delegate.getGameSettings().playerLimit;
	}
	
	public hasEnoughCards(): boolean {
		return false;
	}
	//#endregion
	
	//#region Game Methods
	public loadBlackDeck(cardSets: Array<string>): BlackDeck {
		return null;
	}
	
	public loadWhiteDeck(cardSets: Array<string>): WhiteDeck {
		return null;
	}
	
	private getNextBlackCard(): BlackCard {
		return null;
	}
	
	private getNextWhiteCard(): WhiteCard {
		return null;
	}
	
	public getBlackCard(): object {
		return null;
	}
	
	public getWhiteCards(user: User = null): Array<Array<object>> {
		return null
	}
	
	private getWhiteCardData(cards: Array<WhiteCard>): Array<object> {
		return null;
	}
	
	private sendCardsToPlayer(player: Player, cards: Array<WhiteCard>) {}
	
	
	
	private playCard(user: User, cardId: string, cardText: string): ErrorCode {
		return null;
	}
	private judgeCard(judge: User, cardId: string): ErrorCode {
		return null;
	}
	
	private returnCardsToHand() {}
	//#endregion
	
	//#region Game States
	public start(): boolean {
		return false;
	}
	
	private startNextRound() {}
	private startJudging() {}
	
	private dealState() {}
	private playingState() {}
	private judgingState() {}
	private winState() {}
	
	private resetState(lostPlayer: boolean) {}
	//#endregion
}