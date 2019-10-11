import User from "./User"
import { ErrorCode, DisconnectReason, MessageType, LongPollResponse, LongPollEvent } from "./Constants"

export default class ConnectedUsers {
    public static PING_TIMEOUT: number = 90 * 1000;

    public static IDLE_TIMEOUT: number = 60 * 1000;

    users: { [nickname: string]: User } = {}

    maxUsers: number;

    constructor(maxUsers: number = 100) {
        this.maxUsers = maxUsers;
    }

    public hasUser(userName: string): boolean {
        return Object.keys(this.users).indexOf(userName) >= 0;
    }

    public checkAndAdd(user: User): ErrorCode {
        if (this.hasUser(user.getNickname())) {
            return ErrorCode.NICK_IN_USE;
        } else if (Object.keys(this.users).length >= this.maxUsers && !user.isAdmin()) {
            return ErrorCode.TOO_MANY_USERS;
        } else {
            this.users[user.getNickname().toLowerCase()] = user;

            let data = {
				[LongPollResponse.EVENT]: LongPollEvent.NEW_PLAYER,
				[LongPollResponse.NICKNAME]: user.getNickname(),
				[LongPollResponse.SOCKET_ID]: user.getSocketId()
			}

            if (true) {
                this.broadcastToAll(MessageType.PLAYER_EVENT, data);
            } else {
                this.broadcastToList(this.getAdmins(), MessageType.PLAYER_EVENT, data);
            }

            return null;
        }
    }

    public removeUser(user: User, reason: DisconnectReason) {
        if (Object.keys(this.users).indexOf(user.getNickname().toLowerCase()) >= 0) {
            user.noLongerValid();
            delete this.users[user.getNickname().toLowerCase()];
            this.notifyRemoveUser(user, reason);
        }
    }

    public getUser(nickname: string): User {
        return this.users[nickname];
    }

    private notifyRemoveUser(user: User, reason: DisconnectReason) {
        let data = {
			[LongPollResponse.EVENT]: LongPollEvent.PLAYER_LEAVE,
			[LongPollResponse.NICKNAME]: user.getNickname(),
			[LongPollResponse.REASON]: reason
		};

        if (true || reason == DisconnectReason.BANNED || DisconnectReason.KICKED) {
            this.broadcastToAll(MessageType.PLAYER_EVENT, data);
        } else {
            this.broadcastToList(this.getAdmins(), MessageType.PLAYER_EVENT, data);
        }
    }

    public checkForPingAndIdleTimeouts() {
        const removedUsers: Map<User, DisconnectReason> = new Map();

        Object.entries(this.users).forEach(([username, user]) => {
            let reason: DisconnectReason = null;

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

    public broadcastToAll(type: MessageType, masterData: Object) {
        this.broadcastToList(Object.values(this.users), type, masterData);
    }

    public broadcastToList(broadcastTo: Array<User>, type: MessageType, masterData: Object) {
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