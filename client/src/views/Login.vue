<template>
	<MetroView view-id="main-view">
		<MetroPage page-id="login">
			<div class="container">
				<div class="row justify-content-around">
					<div class="col col-12 col-md-6 col-xl-4">
						<nav class="mb-5">
							<div class="nav-logo pb-0">
								<div class="nav-link">
									<MetroTextBlock text-style="header">client</MetroTextBlock>
								</div>
							</div>
						</nav>
						<hr>
						
						<div class="row mt-3 d-flex">
							<div class="col progress-indicator-container" >
								<MetroProgressBar :indeterminate="isWorking" :style="{'width': '100%', 'opacity': isWorking ? 1 : 0}" />
							</div>
						</div>
						
						<form novalidate class="mb-3">
								<MetroStackPanel orientation="horizontal" vertical-alignment="bottom">
									<MetroTextBox
										header="Server-Adresse"
										v-model="serverAddress"
										placeholder="127.0.0.1"
										:disabled="isWorking || socket != null"
										@keyup.13="connect"
									/>
								</MetroStackPanel>
						</form>
						
						<form novalidate @submit.prevent>
							<MetroStackPanel orientation="horizontal" vertical-alignment="bottom">
								<MetroTextBox
									header="Benutzername"
									placeholder-text="Max Mustermann"
									v-model="username"
									:disabled="isWorking || socket != null"
									@input="$v.username.$touch()"
									@keyup.13="login"
									style="margin-right: 8px"
								/>
								<MetroButton @click.prevent="connect()" :disabled="$v.serverAddress.$invalid || $v.username.$invalid || isWorking || socket != null">Verbinden</MetroButton>
							</MetroStackPanel>
						</form>
					</div>
				</div>
			</div>
		</MetroPage>
	</MetroView>
</template>

<script>
import io from "socket.io-client"
import { required } from "vuelidate/lib/validators"

import SocketService from "@/scripts/SocketService"

export default {
	name: "Login",
	data: () => ({
		socket: null,
		serverAddress: `${window.location.hostname}:${parseInt(window.location.port) - 1}`,
		
		username: "",
		
		isWorking: false,
		isConnecting: false
	}),
	validations: {
		serverAddress: { required },
		username: { required }
	},
	beforeDestroy() {
		SocketService.$off("message", this.onMessage)
	},
	methods: {
		connect() {
			if (this.socket) {
				return;
			}
			SocketService.$off("open");
			SocketService.$off("close");
			SocketService.$off("error");
			SocketService.$off("package");
			
			SocketService.$on("open", this.onOpen);
			SocketService.$on("close", this.onClose);
			SocketService.$on("error", this.onError);
			SocketService.$on("message", this.onMessage);
			
			this.isWorking = true;
			SocketService.connect(`http://${this.serverAddress}`, {
				query: `username=${this.username}`,
			});
		},
		
		onOpen() {
			this.socket = SocketService.socket;
			
			this.isWorking = false;
			
			document.querySelector("script#game-scripts").setAttribute("src", `http://${this.serverAddress}/gameScripts.js?${new Date().getTime()}`);
			document.querySelector("script#game-scripts").onload = () => {
				this.$router.replace("/");
			}
		},
		onClose() {
			SocketService.$off("open");
			SocketService.$off("close");
			SocketService.$off("error");
			SocketService.$off("message");
			
			this.socket = null;
			this.$router.replace("/login");
		},
		async onError(error) {
			this.isWorking = false;
			
			let dialog = new metroUI.ContentDialog({
				title: "Verbindungsfehler",
				content: `client konnte sich nicht mit dem angegebenen Server verbinden.\n\n${error.error}`,
				commands: [{ text: "Ok", primary: true }]
			});
			
			if (await dialog.showAsync()) {
				this.socket = null;
			}
		},
		onMessage() {}
		// connect() {
		// 	if (this.socket) return;
			
		// 	this.isWorking = true;
		// 	this.socket = window.socket = io(`http://${this.serverAddress}`, {
		// 		query: `username=${this.username}`,
		// 		secure: true,
		// 		multiplex: false,
		// 		"force new connection": true,
		// 		"connect timeout": 5000,
		// 		reconnection: false
		// 	});
			
		// 	this.socket.on("connect", this.onOpen.bind(this));
		// 	this.socket.on("connect_error", this.onError.bind(this));
		// },
		// onOpen() {
		// 	this.isWorking = false;
			
		// 	document.querySelector("script#game-scripts").setAttribute("src", `http://${this.serverAddress}/gameScripts.js?${new Date().getTime()}`);
		// 	this.$router.replace("/");
		// },
		// async onError(error) {
		// 	this.isWorking = false;
			
		// 	let dialog = new metroUI.ContentDialog({
		// 		title: "Verbindungsfehler",
		// 		content: "client konnte sich nicht mit dem angegebenen Server verbinden.",
		// 		commands: [{ text: "Ok", primary: true }]
		// 	});
			
		// 	if (await dialog.showAsync()) {
		// 		this.socket = null;
		// 	}
		// }
	}
}
</script>

<style lang="less">
.page[data-page-id="login"] {
	.container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		
		& > .row {
			flex: 1;
		}
		
		input[type="email"],
		input[type="number"],
		input[type="password"],
		input[type="search"],
		input[type="tel"],
		input[type="text"],
		input[type="url"],
		.list {
			max-width: initial;
		}
	}
}
</style>