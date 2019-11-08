<script>

    String.prototype.formatWithArray = function (format) {
        return this.replace(/\{([0-9])\}/g, (match, number) => typeof format[number] !== "undefined" ? format[number] : match);
    }

    export default {
        name: "UnoGame",
        data: () => ({
            handExpanded: false,
        }),
    }
</script>

<template>
	<div id="uno-game-view">
		
        <section class="board">

        </section>

        <section :class="['hand', { 'expanded': handExpanded }]">
            <MetroButton @click="handExpanded = !handExpanded" style="position: absolute; right: 0; top: 0">
                <span v-if="!handExpanded" class="icon">&#xE010;</span>
                <span v-else class="icon">&#xE011;</span>
            </MetroButton>

            <MetroTextBlock text="Aktuelle Karte" text-style="base" style="line-height: 33.2px; padding-left: 6px" />
        </section>

	</div>
</template>

<style lang="less">

    @font-face {
	    font-family: "Segoe MDL2 Assets";
	    src: local("Segoe MDL2 Assets");
    }

    #uno-game-view {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
    }

    .icon {
        font-family: "Segoe MDL2 Assets" !important;
    }

    .board {
        flex-grow: 1;
    }

    .hand {
        background-color: #EEE;
        height: 300px;
        position: relative;
        transition: all .25s cubic-bezier(0.215, 0.610, 0.355, 1.000);
        width: 100%;

        &.expanded {
            height: 100%;
        }
    }

</style>