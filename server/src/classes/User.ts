import useragent, { Agent } from "useragent"

/**
 * A user connected to the server.
 *
 * @author Sniper_GER (sniperger@festival.ml)
 */
export default class User {
    private nickname: string;
    private idCode: string;
    private lastHeardFrom: number;
    private lastUserAction: number;
    private connectedAt: number = new Date().getTime();
    private currentGame: Object;
    private hostname: string;
    private _isAdmin: boolean;
    private persistentId: string;
    private sessionId: string;
    private clientLanguage: string;
    private agent: Agent;

    /**
     * Reset when this user object is no longer valid, most likely because it pinged out.
     */
    private valid: boolean = true;

    /**
     * Create a new user.
     *
     * @param nickname
     *          The user's nickname.
     * @param idCode
     *          The user's ID code, after hashing with salt and their name, or the empty string if
     *          none provided.
     * @param hostname
     *          The user's Internet hostname (which will likely just be their IP address).
     * @param isAdmin
     *          Whether this user is an admin.
     * @param persistentId
     *          This user's persistent (cross-session) ID.
     * @param sessionId
     *          The unique ID of this session for this server instance.
     * @param clientLanguage
     *          The language of the user's web browser/client.
     * @param clientAgent
     *          The name of the user's web browser/client.
     */
    constructor(nickname: string, idCode: string, hostname: string, isAdmin: boolean, persistentId: string, sessionId: string, clientLanguage: string, clientAgent: string) {
        this.nickname = nickname;
        this.idCode = idCode;
        this.hostname = hostname;
        this._isAdmin = isAdmin;
        this.persistentId = persistentId;
        this.sessionId = sessionId;
        this.clientLanguage = clientLanguage == null ? "" : clientLanguage;
        this.agent = useragent.parse(clientAgent)
    }

    // TODO: Broadcast stuff

    public isAdmin(): boolean {
        return this._isAdmin;
    }

    public getIdCode(): string {
        return this.idCode;
    }

    public getSessionId(): string {
        return this.sessionId;
    }

    public getPersistentId(): string {
        return this.persistentId;
    }

    /**
     * @return The user's nickname.
     */
    public getNickname(): string {
        return this.nickname;
    }

    /**
     * @return The user's Internet hostname, or IP address.
     */
    public getHostname(): string {
        return this.hostname;
    }

    public getAgentName(): string {
        return this.agent.toString();
    }

    public getAgentType(): string {
        return this.agent.device.toString();
    }

    public getAgentOS(): string {
        return this.agent.os.toString();
    }

    public getAgentLanguage(): string {
        return this.clientLanguage.split(",")[0];
    }

    /**
     * Update the timestamp that we have last heard from this user to the current time.
     */
    public contactedServer() {
        this.lastHeardFrom = new Date().getTime();
    }

    /**
     * @return The time the user was last heard from, in nanoseconds.
     */
    public getLastHeardFrom(): number {
        return this.lastHeardFrom;
    }

    public userDidSomething() {
        this.lastUserAction = new Date().getTime();
    }

    public getLastUserAction(): number {
        return this.lastUserAction;
    }

    /**
     * @return The UNIX timestamp at which this user connected, in milliseconds.
     */
    public getConnectedAt(): number {
        return this.connectedAt;
    }
    
    /**
     * @return False when this user object is no longer valid, probably because it pinged out.
     */
    public isValid(): boolean {
        return this.valid;
    }
    
    public isValidFromHost(currentHostname: string): boolean {
        let addrValid: boolean = this.hostname.localeCompare(currentHostname) == 0;
        
        return this.isValid() && addrValid;
    }
    
    /**
     * Mark this user as no longer valid, probably because they pinged out.
     */
    public noLongerValid() {
        if (this.currentGame != null) {
            // TODO: Remove player from game
        }
        
        this.valid = false;
    }
    
    /**
     * @return The current game in which this user is participating.
     */
    public getGame(): Object {
        return this.currentGame;
    }
    
    /**
     * Marks a given game as this user's active game.
     *
     * This should only be called from Game itself.
     *
     * @param game
     *          Game in which this user is playing.
     */
    joinGame(game: Object) {
        if (this.currentGame != null) {
            throw new Error("User is already in a game");
        }
        
        this.currentGame = game;
    }
    
    /**
     * Marks the user as no longer participating in a game.
     *
     * This should only be called from Game itself.
     *
     * @param game
     *          Game from which to remove the user.
     */
    leaveGame(game: Object) {
        if (this.currentGame == game) {
            this.currentGame = null;
        }
    }
}