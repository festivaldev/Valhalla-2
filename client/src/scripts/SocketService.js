import Vue from "vue";
import io from "socket.io-client";

export default new Vue({
	data: {
		url: null,
		socket: null,
	},
	created() {
		window.SocketService = this;
	},
	methods: {
		connect(url, options) {
			this.url = url;
			
			this.socket = new io(url, Object.assign({
				secure: true,
				multiplex: false,
				"force new connection": true,
				"connect timeout": 5000,
				reconnection: false
			}, options));
			
			this.socket.on("connect", this.onOpen);
			this.socket.on("disconnect", this.onClose);
			this.socket.on("connect_error", this.onError);
			this.socket.on("message", data => this.onMessage(data));
		},
		onOpen(event) {
			this.$emit("open", event);
		},
		onClose(event) {
			this.url = null;
			this.socket = null;
			
			this.$emit("close", event);
		},
		onError(error) {
			this.url = null;
			this.socket = null;
			
			this.$emit("error", JSON.parse(error));
		},
		onMessage(data) {
			this.$emit("message", JSON.parse(data));
		},
		emit(data) {
			this.socket.emit("message", JSON.stringify(data));
		}
	}
});