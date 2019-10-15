export enum DisconnectReason {
    BANNED = "Banned",
    IDLE_TIMEOUT = "Kicked due to idle",
    KICKED = "Kicked by server administrator",
    MANUAL = "Leaving",
    PING_TIMEOUT = "Ping timeout"
}

export enum ErrorCode {
    ACCESS_DENIED = "Access denied.",
    ALREADY_STARTED = "The game has already started.",
    ALREADY_STOPPED = "The game has already stopped.",
    BAD_OP = "Invalid operation.",
    BAD_REQUEST = "Bad request.",
    BANNED = "Banned.",
    CANNOT_JOIN_ANOTHER_GAME = "You cannot join another game.",
    CAPSLOCK = "Try turning caps lock off.",
    GAME_FULL = "That game is full. Join another.",
    INVALID_GAME = "Invalid game specified.",
    INVALID_ID_CODE = "Identification code, if provided, must be between 8 and 100 characters, inclusive.",
    INVALID_NICK = "Nickname must contain only upper and lower case letters, numbers, or underscores, must be 3 to 30 characters long, and must not start with a number.",
    MESSAGE_TOO_LONG = "Messages cannot be longer than {n} characters.",
    NICK_IN_USE = "Nickname is already in use.",
    NO_GAME_SPECIFIED = "No game specified.",
    NO_MSG_SPECIFIED = "No message specified.",
    NO_NICK_SPECIFIED = "No nickname specified.",
    NO_SESSION = "Session not detected. Make sure you have cookies enabled.",
    NO_SUCH_USER = "No such user.",
    NOT_ADMIN = "You are not an administrator.",
    NOT_ENOUGH_PLAYERS = "There are not enough players to start the game.",
    NOT_ENOUGH_SPACES = "You must use more words in a message that long.",
    NOT_GAME_HOST = "Only the game host can do that.",
    NOT_IN_THAT_GAME = "You are not in that game.",
    NOT_REGISTERED = "Not registered. Refresh the page.",
    OP_NOT_SPECIFIED = "Operation not specified.",
    RESERVED_NICK = "That nick is reserved.",
    REPEAT_MESSAGE = "You can't repeat the same message multiple times in a row.",
    REPEATED_WORDS = "You must use more unique words in your message.",
    SERVER_ERROR = "An error occurred on the server.",
    SESSION_EXPIRED = "Your session has expired. Refresh the page.",
    TOO_FAST = "You are chatting too fast. Wait a few seconds and try again.",
    TOO_MANY_GAMES = "There are too many games already in progress. Either join an existing game, or wait for one to become available.",
    TOO_MANY_SPECIAL_CHARACTERS = "You used too many special characters in that message.",
    TOO_MANY_USERS = "There are too many users connected. Either join another server, or wait for a user to disconnect.",
    WRONG_PASSWORD = "That password is incorrect."
}

export enum GameInfo {
    CREATED = "created",
    HOST = "host",
	ID = "id",
	GAME_BUNDLE = "game-bundle",
    GAME_OPTIONS = "game-options",
    HAS_PASSWORD = "has-password",
    PLAYERS = "players",
    SPECTATORS = "spectators",
    STATE = "state"
}

export enum GameOptionData {
    PASSWORD = "password",
    PLAYER_LIMIT = "playerLimit",
    SPECTATOR_LIMIT = "spectatorLimit",
    SCORE_LIMIT = "scoreLimit"
}

export enum GamePlayerInfo {
    NAME = "name",
    SCORE = "score",
    STATUS = "status"
}

export enum GamePlayerStatus {
	HOST = "host",
	IDLE = "idle",
	JUDGE = "judge",
	JUDGING = "judging",
	PLAYING = "playing",
	WINNER = "winner",
	SPECTATOR = "spectator"
}

export enum LongPollEvent {
    BANNED = "banned",
	CHAT = "chat",
	GAME_JOIN = "game-join",
	GAME_LEAVE = "game-leave",
    GAME_LIST_REFRESH = "game-list-refresh",
    GAME_OPTIONS_CHANGED = "game-options-changed",
    GAME_PLAYER_INFO_CHANGE = "game-player-info-change",
    GAME_PLAYER_JOIN = "game-player-join",
    GAME_PLAYER_KICKED_IDLE = "game-player-kicked-idle",
    GAME_PLAYER_LEAVE = "game-player-leave",
    GAME_PLAYER_SKIPPED = "game-player-skipped",
    GAME_SPECTATOR_JOIN = "game-spectator-join",
    GAME_SPECTATOR_LEAVE = "game-spectator-leave",
    GAME_ROUND_COMPLETE = "game-round-complete",
    GAME_STATE_CHANGE = "game-state-change",
    KICKED = "kicked",
    KICKED_FROM_GAME_IDLE = "kicked-from-game-idle",
    NEW_PLAYER = "new-player",
    NOOP = "noop",
    PLAYER_LEAVE = "player-leave"
}

export enum LongPollResponse {
    EMOTE = "emote",
    ERROR = "error",
    ERROR_CODE = "error-code",
    EVENT = "event",
    FROM = "from",
    FROM_ADMIN = "from-admin",
    GAME_ID = "game-id",
	GAME_INFO = "game-info",
	GAME_LIST = "game-list",
    GAME_STATE = "game-state",
    SOCKET_ID = "socket-id",
    INTERMISSION = "intermission",
    MESSAGE = "message",
    NICKNAME = "nickname",
    PLAYER_INFO = "player-info",
    REASON = "reason",
    ROUND_WINNER = "round-winner",
    TIMESTAMP = "timestamp",
}

export enum MessageType {
    KICKED = "kicked",
    PLAYER_EVENT = "player-event",
    GAME_EVENT = "game-event",
    GAME_PLAYER_EVENT = "game-player-event",
	CHAT = "chat",
	ERROR = "error"
}