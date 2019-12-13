<script>
    String.prototype.formatWithArray = function (format) {
        return this.replace(/\{([0-9])\}/g, (match, number) => typeof format[number] !== "undefined" ? format[number] : match);
    }

    export default {
        name: "UnoGame",
        data: () => ({

            handExpanded: false,
            placedCards: [
                {
                    variant: 0,
                    value: "2",
                }
            ],
        }),
        methods: {
            getColorForCard(card) {
                switch (card.variant) {
                    case 0: return "blue";
                    case 1: return "black";
                    case 2: return "green";
                }
            },
            getEdgeTextForCard(card) {
                return card.value;
            },
            getTextForCard(card) {
                return card.value;
            },
            pushRandomCard() {
                if (this.placedCards.length == 4) {
                    this.placedCards.shift();
                }

                this.placedCards.push({
                    variant: Math.floor(Math.random() * 2) + 1,
                    value: Math.floor(Math.random() * 10) + 1,
                });
            },
        },
    }
</script>

<template>
	<div id="uno-game-view">
		
        <section class="board">

            <div class="deck">
                <template v-for="(card, index) in placedCards">
                    <div :class="`card ${getColorForCard(card)} placed`" :key="`placed-card-${index}`">
                        <p class="corner">{{ getEdgeTextForCard(card) }}</p>
                        <p class="corner bottom">{{ getEdgeTextForCard(card) }}</p>
                        <div class="backdrop"></div>
                        <p class="content">{{ getTextForCard(card) }}</p>
                    </div>
                </template>
            </div>

        </section>

        <section :class="['hand', { 'expanded': handExpanded }]">
            <MetroButton @click="handExpanded = !handExpanded" style="position: absolute; right: 0; top: 0">
                <span v-if="!handExpanded" class="icon">&#xE010;</span>
                <span v-else class="icon">&#xE011;</span>
            </MetroButton>

            <MetroButton @click="pushRandomCard()">
                <span class="icon">&#xE011;</span>
            </MetroButton>
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
        position: relative;
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

    @keyframes placeCard {
        from {
            transform: rotate(0) translate3d(100%, 200%, 0);
        }
        to {
            transform: rotate(0) translate3d(0, 0, 0);
        }
    }

    @keyframes placeCard2 {
        from {
            transform: rotate(0) translate3d(100%, 200%, 0);
        }
        to {
            transform: rotate(7deg) translate3d(0, 0, 0);
        }
    }

    @keyframes placeCard3 {
        from {
            transform: rotate(0) translate3d(100%, 200%, 0);
        }
        to {
            transform: rotate(-4deg) translate3d(0, 0, 0);
        }
    }

    .deck {
        left: 50%;
        position: absolute;
        top: 50%;
        transform: translate3d(-50%, -50%, 0);

        .card {
            border-color: #EEE;
            transform: translate3d(100%, 200%, 0);
            animation: placeCard .5s cubic-bezier(.08, .82, .17, 1);

            &:not(:first-of-type) {
                left: 0;
                position: absolute;
                top: 0;
            }

            &:nth-of-type(2) {
                animation: placeCard2 .5s cubic-bezier(.08, .82, .17, 1);
            }

            &:nth-of-type(3) {
                animation: placeCard3 .5s cubic-bezier(.08, .82, .17, 1);
            }

            &:nth-of-type(n+4) {                
                animation: placeCard .5s cubic-bezier(.08, .82, .17, 1);
            }

            &.placed:first-of-type,
            &.placed:nth-of-type(n+4) {
                transform: translate3d(0, 0, 0);
            }

            &.placed:nth-of-type(2) {
                transform: rotate(7deg);
            }

            &.placed:nth-of-type(3) {
                transform: rotate(-4deg);
            }
        }
    }

</style>