import User from "./User"
import { ErrorCode, DisconnectReason, MessageType } from "./Constants"

/**
 * Class that holds all users connected to the server, and provides functions to operate on said
 * list.
 *
 * @author Sniper_GER (sniperger@festival.ml)
 */
export default class ConnectedUsers {
    /**
     * Duration of a ping timeout, in milliseconds.
     */
    public static PING_TIMEOUT: number = 90 * 1000;

    /**
     * Duration of an idle timeout, in milliseconds.
     */
    public static IDLE_TIMEOUT: number = 60 * 1000;

    /**
     * Key (username) must be stored in lower-case to facilitate case-insensitivity in nicks.
     */
    users: { [username: string]: User } = {}

    maxUsers: number;

    constructor(maxUsers: number = 100) {
        this.maxUsers = maxUsers;
    }

    /**
     * @param userName User name to check.
     * @return True if userName is a connected user.
     */
    public hasUser(userName: string): boolean {
        return Object.keys(this.users).indexOf(userName) >= 0;
    }

    /**
     * Checks to see if the specified user is allowed to connect, and if so, add the user,
     * as an atomic operation.
     * @param user User to add. getNickname() is used to determine the nickname.
     * @return null if the user was added, or an Error explaining why the user was
     * rejected.
     */
    public checkAndAdd(user: User): ErrorCode {
        if (this.hasUser(user.getNickname())) {
            return ErrorCode.NICK_IN_USE;
        } else if (Object.keys(this.users).length >= this.maxUsers && !user.isAdmin()) {
            return ErrorCode.TOO_MANY_USERS;
        } else {
            this.users[user.getNickname().toLowerCase()] = user;

            const data: Map<String, any> = new Map();

            if (true) {
                this.broadcastToAll(MessageType.PLAYER_EVENT, data);
            } else {
                this.broadcastToList(this.getAdmins(), MessageType.PLAYER_EVENT, data);
            }

            return null;
        }
    }

    /**
     * Remove a user from the user list, and mark them as invalid so the next time they make a request
     * they can be informed.
     *
     * @param user
     *          User to remove.
     * @param reason
     *          Reason the user is being removed.
     */
    public removeUser(user: User, reason: DisconnectReason) {
        if (Object.keys(this.users).indexOf(user.getNickname().toLowerCase()) >= 0) {
            user.noLongerValid();
            delete this.users[user.getNickname().toLowerCase()];
            this.notifyRemoveUser(user, reason);
        }
    }

    /**
     * Get the User for the specified nickname, or null if no such user exists.
     *
     * @param nickname
     * @return User, or null.
     */
    public getUser(nickname: string): User {
        return this.users[nickname];
    }

    /**
     * Broadcast to all remaining users that a user has left. Also logs for metrics.
     *
     * @param user
     *          User that has left.
     * @param reason
     *          Reason why the user has left.
     */
    private notifyRemoveUser(user: User, reason: DisconnectReason) {
        const data: Map<String, any> = new Map();

        if (true || reason == DisconnectReason.BANNED || DisconnectReason.KICKED) {
            this.broadcastToAll(MessageType.PLAYER_EVENT, data);
        } else {
            this.broadcastToList(this.getAdmins(), MessageType.PLAYER_EVENT, data);
        }
    }

    /**
     * Check for any users that have not communicated with the server within the ping timeout delay,
     * and remove users which have not so communicated. Also remove clients which are still connected,
     * but have not actually done anything for a long time.
     */
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

    /**
     * Broadcast a message to all connected players.
     *
     * @param type
     *          Type of message to broadcast. This determines the order the messages are returned by
     *          priority.
     * @param masterData
     *          Message data to broadcast.
     */
    public broadcastToAll(type: MessageType, masterData: Map<String, any>) {
        this.broadcastToList(Object.values(this.users), type, masterData);
    }

    /**
     * Broadcast a message to a specified subset of connected players.
     *
     * @param broadcastTo
     *          List of users to broadcast the message to.
     * @param type
     *          Type of message to broadcast. This determines the order the messages are returned by
     *          priority.
     * @param masterData
     *          Message data to broadcast.
     */
    public broadcastToList(broadcastTo: Array<User>, type: MessageType, masterData: Map<String, any>) {
        broadcastTo.forEach(u => {
            // TODO: Broadcast to user
        });
    }

    /**
     * @return A copy of the list of connected users.
     */
    public getUsers(): Array<User> {
        return Object.values(this.users);
    }

    /**
     * @return A copy of the list of connected users, filtered to contain only administrators.
     */
    public getAdmins(): Array<User> {
        return Object.values(this.users).filter(user => user.isAdmin);
    }
}