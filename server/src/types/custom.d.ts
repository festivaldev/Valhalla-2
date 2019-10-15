import SocketServer from "../SocketServer";

declare global {
	namespace NodeJS {
		interface Global {
			socketServer: SocketServer
		}
	}
	interface Array<T> {
		shuffle(): void
	}
}