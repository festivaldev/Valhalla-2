import io from "socket.io";
import HTTPServer from "./HTTPServer";
import GameServer from "./classes/Server"
import User from "./classes/User"
import { DisconnectReason, ErrorCode } from "./classes/Constants"
import Logger from "./util/Logger"

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
		
		let isAdmin = ["1", "127.0.0.1"].indexOf(hostname) >= 0;
		let user = new User(
			socket.handshake.query["username"],
			hostname,
			isAdmin,
			socket.request.headers["accept-language"],
			socket.request.headers["user-agent"]
		);
		
		let errorCode: ErrorCode = this.gameServer.getConnectedUsers().checkAndAdd(user);
		
		if (null == errorCode) {
			
		} else {
			socket.emit("message", { error: errorCode });
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

		socket.on("message", () => {
			console.log("message");
		});
	}
}