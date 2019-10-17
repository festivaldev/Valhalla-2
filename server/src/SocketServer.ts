import io from "socket.io";
import HTTPServer from "./HTTPServer";
import GameServer from "./classes/Server"
import User from "./classes/User"
import { DisconnectReason, ErrorCode, MessageType, LongPollResponse, LongPollEvent } from "./classes/Constants"
import Logger from "./util/Logger"
import bcrypt from "bcryptjs"

export default class SocketServer {
	httpServer: HTTPServer;
	gameServer: GameServer;
	socket: io.Server;

	constructor(httpServer: HTTPServer, gameServer: GameServer) {
		this.httpServer = httpServer;
		this.gameServer = gameServer;
		
		this.socket = io(httpServer.httpServer);
		this.socket.on("connection", this.handleSocketConnection.bind(this));
	}

	private handleSocketConnection(socket: io.Socket) {
		let hostname = socket.request.connection.remoteAddress.replace(/:*(.*?):/g, '');
		Logger.log(`New connection from ${hostname}`);
		
		let user = new User(
			socket.handshake.query["username"],
			socket.id,
			hostname,
			["1", "127.0.0.1"].indexOf(hostname) >= 0,
			socket.request.headers["accept-language"],
			socket.request.headers["user-agent"]
		);
		
		let errorCode: ErrorCode = this.gameServer.getConnectedUsers().checkAndAdd(user);
		
		if (null == errorCode) {
			// this.gameServer.getGameManager().createGameWithPlayer(user, this.httpServer.gameBundles["ExampleGameBundle"]);
			this.gameServer.getConnectedUsers().broadcastToList([user], MessageType.GAME_EVENT, {
				[LongPollResponse.EVENT]: LongPollEvent.GAME_LIST_REFRESH
			});
		} else {
			socket.emit("connect_error", JSON.stringify({ error: errorCode }));
			socket.disconnect(true);
		}
		
		socket.on("disconnect", () => {
			let user = this.gameServer.getConnectedUsers().getUser(socket.handshake.query["username"]);
			
			if (user) {
				user.noLongerValid();
				this.gameServer.getConnectedUsers().removeUser(user, DisconnectReason.MANUAL);
				
				Logger.log(`User ${user.getNickname()} disconnected`);
			}
		});

		socket.on("message", (data) => this.handleMessage(socket, JSON.parse(data)));
	}
	
	private handleMessage(socket: io.Socket, messageData: any) {
		let user = this.gameServer.getConnectedUsers().getUser(socket.handshake.query["username"]);
		
		switch (messageData.type) {
			case "create-game": {
				let game = this.gameServer.getGameManager().createGameWithPlayer(user, this.httpServer.gameBundles[messageData.payload["gameBundle"]]);
				
				if (game) {
					game.updateGameSettings(this.httpServer.gameBundles[messageData.payload["gameBundle"]].getOptions().deserialize(messageData.payload["gameOptions"]));
				}
				break;
			}
			case "join-game": {
				let game = this.gameServer.getGameManager().getGame(messageData.payload["gameId"]);
				
				if (!game) return socket.emit("message", JSON.stringify({
					type: MessageType.ERROR,
					payload: {
						[LongPollResponse.ERROR_CODE]: ErrorCode.INVALID_GAME
					}
				}));
				
				let gamePassword = game.getPassword();
				let password = messageData.payload["password"];
				
				if (gamePassword && gamePassword.length && !user.isAdmin()) {
					if (!password || !bcrypt.compareSync(password, gamePassword)) {
						return socket.emit("message", JSON.stringify({
							type: MessageType.ERROR,
							payload: {
								[LongPollResponse.ERROR_CODE]: ErrorCode.WRONG_PASSWORD
							}
						}));
					}
				}
				
				let errorCode: ErrorCode = game.addPlayer(user);
				
				if (null == errorCode) {} else {
					return socket.emit("message", JSON.stringify({
						type: MessageType.ERROR,
						payload: {
							[LongPollResponse.ERROR_CODE]: errorCode
						}
					}));
				}
				break;
			}
			case "start-game":
				user.getGame().start(user);
				break;
			case "leave-game":
				user.getGame().removePlayer(user);
				break;
			case "game-event":
				user.getGame().getGameLogic().handleMessage(MessageType.GAME_EVENT, messageData.payload);
				break;
			default: break;
		}
	}
}