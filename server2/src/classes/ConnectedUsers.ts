import { DisconnectReason, ErrorCode, EventDetail, EventType, MessageType } from "./Constants";
import User from "./User";

export default class ConnectedUsers {
	public static PING_TIMEOUT: number = 90 * 1000;
	public static IDLE_TIMEOUT: number = 60 * 1000;

	private users: { [socketId: string]: User } = {};
	private maxUsers: number;

	constructor(maxUsers: number) {
		this.maxUsers = maxUsers;
	}

	public hasUser(userName: string): boolean {
		return Object.keys(this.users).indexOf(userName) >= 0;
	}

	public checkAndAdd(user: User): string {
		if (this.hasUser(user.getSocketId())) {
			throw new Error(ErrorCode.NICK_IN_USE);
		} else if (Object.keys(this.users).length >= this.maxUsers && !user.isAdmin()) {
			throw new Error(ErrorCode.TOO_MANY_USERS);
		} else {
			this.users[user.getSocketId()] = user;

			let data = {
				[EventDetail.EVENT]: EventType.NEW_PLAYER,
				[EventDetail.NICKNAME]: user.getNickname(),
				[EventDetail.SOCKET_ID]: user.getSocketId()
			}

			if (true) {
				this.broadcastToAll(MessageType.PLAYER_EVENT, data);
			} else {
				this.broadcastToList(this.getAdmins(), MessageType.PLAYER_EVENT, data);
			}

			return null;
		}
	}

	public removeUser(user: User, reason: string) {
		if (Object.keys(this.users).indexOf(user.getSocketId()) >= 0) {
			user.noLongerValid();
			delete this.users[user.getSocketId()];
			this.notifyRemoveUser(user, reason);
		}
	}

	public getUser(socketId: string): User {
		return this.users[socketId];
	}

	private notifyRemoveUser(user: User, reason: string) {
		let data = {
			[EventDetail.EVENT]: EventType.PLAYER_LEAVE,
			[EventDetail.NICKNAME]: user.getNickname(),
			[EventDetail.REASON]: reason
		};

		if (true || reason == DisconnectReason.BANNED || DisconnectReason.KICKED) {
			this.broadcastToAll(MessageType.PLAYER_EVENT, data);
		} else {
			this.broadcastToList(this.getAdmins(), MessageType.PLAYER_EVENT, data);
		}
	}

	public checkForPingAndIdleTimeouts() {
		const removedUsers: Map<User, string> = new Map();

		Object.entries(this.users).forEach(([username, user]) => {
			let reason: string = null;

			if (new Date().getTime() - user.getLastHeardFrom() > ConnectedUsers.PING_TIMEOUT) {
				reason = DisconnectReason.PING_TIMEOUT;
			} else if (!user.isAdmin() && new Date().getTime() - user.getLastUserAction() > ConnectedUsers.IDLE_TIMEOUT) {
				reason = DisconnectReason.IDLE_TIMEOUT;
			}

			if (null != reason) {
				removedUsers.set(user, reason);
			}
		});

		for (let [user, reason] of removedUsers) {
			user.noLongerValid();
			this.notifyRemoveUser(user, reason);
		}
	}

	public broadcastToAll(type: string, masterData: Object) {
		this.broadcastToList(Object.values(this.users), type, masterData);
	}

	public broadcastToList(broadcastTo: Array<User>, type: string, masterData: Object) {
		broadcastTo.forEach(u => {
			u.emitMessage({
				type: type,
				payload: masterData
			});
		});
	}

	public getUsers(): Array<User> {
		return Object.values(this.users);
	}

	public getAdmins(): Array<User> {
		return Object.values(this.users).filter(user => user.isAdmin);
	}
}