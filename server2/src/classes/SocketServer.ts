import bcrypt from "bcryptjs";
import io from "socket.io";

import { DisconnectReason, ErrorCode, EventDetail, EventType, MessageType } from "./Constants";
import GameServer from "./GameServer";
import HTTPServer from "./HTTPServer";
import User from "./User";
import Logger, { LogLevel } from "../util/Logger";

export default class SocketServer {
	private httpServer: HTTPServer;
	private gameServer: GameServer;
	public socket: io.Server;
	
	constructor(httpServer: HTTPServer, gameServer: GameServer) {
		this.httpServer = httpServer;
		this.gameServer = gameServer;
		
		this.socket = io(httpServer.getHTTPServer());
		this.socket.on("connection", this.handleSocketConnection.bind(this));
	}
	
	private handleSocketConnection(socket: io.Socket) {
		let nickname: string = socket.handshake.query["nickname"] || socket.handshake.query["username"];
		
		if (!nickname || !nickname.length) {
			return this.disconnectSocket(socket, ErrorCode.INVALID_NICK);
		}
		
		let hostname = socket.request.connection.remoteAddress.replace(/:*(.*?):/g, '');
		Logger.log(`User ${nickname} connected from ${hostname}`);
		
		let user = new User(
			nickname,
			socket.id,
			hostname,
			["1", "127.0.0.1"].indexOf(hostname) >= 0,
			socket.request.headers["accept-language"],
			socket.request.headers["user-agent"]
		);
		
		try {
			this.gameServer.getConnectedUsers().checkAndAdd(user);
			this.gameServer.getConnectedUsers().broadcastToList([user], MessageType.CLIENT_EVENT, {
				[EventDetail.EVENT]: EventType.GAME_LIST_REFRESH
			});
		} catch (e) {
			this.disconnectSocket(socket, e.message);
		}
		
		socket.on("disconnect", () => {
			let user = this.gameServer.getConnectedUsers().getUser(socket.id);
			
			if (user) {
				user.noLongerValid();
				this.gameServer.getConnectedUsers().removeUser(user, DisconnectReason.MANUAL);
				
				Logger.log(`User ${user.getNickname()} disconnected`);
			}
		});
		
		socket.on("message", (message) => this.handleMessage(socket, JSON.parse(message)));
	}
	
	private handleMessage(socket: io.Socket, data: any) {
		console.log(data);
		const payload = data.payload;
		let user = this.gameServer.getConnectedUsers().getUser(socket.id);
		
		switch (data.type) {
			case MessageType.CHAT:
				break;
			case MessageType.CLIENT_EVENT:
				switch (payload[EventDetail.EVENT]) {
					case EventType.GAME_CREATE:
						try {
							let game = this.gameServer.getGameManager().createGameWithPlayer(user, this.httpServer.getGameBundles()[payload[EventDetail.GAME_BUNDLE]], payload[EventDetail.GAME_OPTIONS]);
							
							// game.updateGameSettings(this.httpServer.getGameBundles()[payload[EventDetail.GAME_BUNDLE]].getDefaultOptions().deserialize());
							
							// Logger.log("Destroying game for debug purposes!", LogLevel.DEBUG);
							// this.gameServer.getGameManager().destroyGame(game.getId());
						} catch (e) {
							this.sendErrorToSocket(socket, e.message);
						}
						
						break;
					case EventType.GAME_JOIN:
						let game = this.gameServer.getGameManager().getGame(payload[EventDetail.GAME_ID]);
						
						if (!game) return this.sendErrorToSocket(socket, ErrorCode.INVALID_GAME);
						
						let password = payload[EventDetail.GAME_PASSWORD];
						let gamePassword = game.getPassword();
						
						if (gamePassword && gamePassword.length && !user.isAdmin()) {
							if (!password || !bcrypt.compareSync(password, gamePassword)) {
								return this.sendErrorToSocket(socket, ErrorCode.WRONG_PASSWORD);
							}
						}
						
						try {
							game.addPlayer(user);
						} catch (e) {
							this.sendErrorToSocket(socket, e.message);
						}
						break;
					case EventType.GAME_LEAVE:
						user.getGame().removePlayer(user);
						break;
					case EventType.GAME_START:
						try {
							user.getGame().start(user);
						} catch (e) {
							this.sendErrorToSocket(socket, e.message);
						}
						break;
				}
				break;
			case MessageType.GAME_EVENT:
				try {
					user.getGame().getGameLogic().handleGameEvent(user, payload);
				} catch (e) {
					this.sendErrorToSocket(socket, e.message);
				}
				break;
			default:
				this.sendErrorToSocket(socket, ErrorCode.BAD_REQUEST);
				break;
		}
	}
	
	private disconnectSocket(socket: io.Socket, reason: string) {
		Logger.log(reason, LogLevel.ERROR);
		socket.emit("connect_error", JSON.stringify({ error: reason }));
		socket.disconnect(true);
	}
	
	private sendErrorToSocket(socket: io.Socket, error: string) {
		Logger.log(error, LogLevel.ERROR);
		socket.emit("message", JSON.stringify({
			type: MessageType.ERROR,
			payload: {
				[EventDetail.ERROR]: error
			}
		}));
	}
}