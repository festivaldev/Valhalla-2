<template>
	<div>		
        <MetroComboBox header="Variante" placerholder-text="Variante auswählen" :itemsSource="{ 'classic': 'Klassisch' }" v-model="gameOptions.variant" style="margin-bottom: 8px" />
	
        <MetroToggleSwitch header="Hexadezimale Karten verwenden" v-model="gameOptions.flags['hex']" />
        {{ gameOptions }}
    </div>
</template>

<script>
    module.exports = {
        name: "UnoCreateGame",
        data: () => ({
            SocketService: null
        }),
        methods: {
            test() {
                alert("Test");
            }
        },
        computed: {
            gameOptions() {
                return this.$parent.gameOptions;
            },
            defaultGameOptions() {
                return window.gameBundles["UnoGameBundle"].defaultGameOptions;
            }
        }
    }
</script>