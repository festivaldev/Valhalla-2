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

            <div class="card black">
                <p class="corner symbol">&#xE790;</p>
                <p class="corner bottom symbol">&#xE790;</p>
                <div class="backdrop"></div>
                <p class="content symbol">&#xE790;</p>
            </div>

            <div class="card blue">
                <p class="corner">×4</p>
                <p class="corner bottom">×4</p>
                <div class="backdrop"></div>
                <p class="content">×4</p>
            </div>

            <div class="card green">
                <p class="corner">E</p>
                <p class="corner bottom">E</p>
                <div class="backdrop"></div>
                <p class="content">E</p>
            </div>
        </section>

	</div>
</template>

<style lang="less">

    * {
        font-weight: unset;
    }

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
        display: flex;
        height: 300px;
        position: relative;
        transition: all .5s cubic-bezier(.55, 0, .1, 1); // all .25s cubic-bezier(0.215, 0.610, 0.355, 1.000)
        width: 100%;

        &.expanded {
            height: 100%;
        }
    }

    div.card {
        border: 4px solid #FFF;
        border-radius: 8px;
        color: #FFF;
        font-family: "Source Sans Pro";
        font-weight: 900;
        height: 300px;
        position: relative;
        width: 180px;

        &.black {
            background-color: #222;
        }

        &.blue {
            background-color: #0366D6;
            
            .content {
                color: #0366D6;
            }
        }

        &.green {
            background-color: #28A745;

            .content {
                color: #28A745;
            }
        }

        .corner {
            font-family: "Source Sans Pro", "Segoe MDL2 Assets";
            font-size: 24px;
            height: 32px;
            line-height: 32px;
            margin: 0 6px;
            position: absolute;
            text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000, 2px 2px 0 #000;
            width: 32px;

            &.bottom {
                bottom: 0;
                right: 0;
                transform: rotate(.5turn)
            }

            &.symbol {
                line-height: 48px;
                text-align: center;
            }
        }

        .backdrop {
            background-color: #FFF;
            border-bottom-right-radius: 100px;
            border-top-left-radius: 100px;
            height: calc(100% - 48px);
            left: 0;
            margin: 24px 0;
            position: absolute;
            top: 0;
            width: 100%;
        }

        .content {
            font-family: "Source Sans Pro", "Segoe MDL2 Assets";
            font-size: 8em;
            height: calc(100% - 64px);
            line-height: 1.8;
            position: absolute;
            text-align: center;
            text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000, 4px 4px 0 #000;
            top: 50%;
            transform: translateY(-50%);
            width: 100%;

            &.symbol {
                font-size: 6em;
                line-height: 2.8;
            }
        }
    }

</style>