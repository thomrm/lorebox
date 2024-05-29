<script>
    export let deck;

    // Card colors
    $: amber = deck.cards.filter(x => x.data.ink == 'Amber');
    $: amethyst = deck.cards.filter(x => x.data.ink == 'Amethyst');
    $: emerald = deck.cards.filter(x => x.data.ink == 'Emerald');
    $: ruby = deck.cards.filter(x => x.data.ink == 'Ruby');
    $: sapphire = deck.cards.filter(x => x.data.ink == 'Sapphire');
    $: steel = deck.cards.filter(x => x.data.ink == 'Steel');
    $: unink = deck.cards.filter(x => !x.data.inkwell);
</script>

<div class="i-contain">
    <div class="i-info">
        <div>
            {#if amber.reduce((a,b) => a + b.number, 0)}<div class="i-info__color i-text-amber"><span>{amber.reduce((a,b) => a + b.number, 0)}</span> Amber</div>{/if}
            {#if amethyst.reduce((a,b) => a + b.number, 0)}<div class="i-info__color i-text-amethyst"><span>{amethyst.reduce((a,b) => a + b.number, 0)}</span> Amethyst</div>{/if}
            {#if emerald.reduce((a,b) => a + b.number, 0)}<div class="i-info__color i-text-emerald"><span>{emerald.reduce((a,b) => a + b.number, 0)}</span> Emerald</div>{/if}
            {#if ruby.reduce((a,b) => a + b.number, 0)}<div class="i-info__color i-text-ruby"><span>{ruby.reduce((a,b) => a + b.number, 0)}</span> Ruby</div>{/if}
            {#if sapphire.reduce((a,b) => a + b.number, 0)}<div class="i-info__color i-text-sapphire"><span>{sapphire.reduce((a,b) => a + b.number, 0)}</span> Sapphire</div>{/if}
            {#if steel.reduce((a,b) => a + b.number, 0)}<div class="i-info__color i-text-steel"><span>{steel.reduce((a,b) => a + b.number, 0)}</span> Steel</div>{/if}
            <div class="i-info__color i-text-grey"><span>{unink.reduce((a,b) => a + b.number, 0)}</span> Uninkable</div>
        </div>
        <div>
            <div class="i-info__total">{deck.cardsCount}/60</div>
        </div>
    </div>
    <div class="i-cards">
        {#each deck.cards as card (card.id)}
            <div class="i-card">
                <div class="i-card__image-contain">
                    <div class="i-card__image">
                        <img src="{card.data.image_uris.digital.large.replace("large", "full").replace(".avif", ".jpg")}" alt="Card" />
                    </div>
                    <div class="i-card__count">
                        <span class="i-card__num">{card.number}</span>
                        <span class="i-card__x">X</span>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    /* .i-ink-amber { color: #F3B123; }
    .i-ink-amethyst { color: #7C4182; }
    .i-ink-emerald { color: #329044; }
    .i-ink-ruby { color: #D40037; }
    .i-ink-sapphire { color: #0093C8; }
    .i-ink-steel { color: #97A3AE; } */

    .i-text-amber { color: #F3B123; }
    .i-text-amethyst { color: #CC93DA;; }
    .i-text-emerald { color: #44BD5A; }
    .i-text-ruby { color: #FF8084; }
    .i-text-sapphire { color: #29B3E6; }
    .i-text-steel { color: #A1A8B0; }

    .i-text-grey { color: #8D8D8C; }

	.i-contain {
        padding: 20px;
		display: flex;
		flex-direction: column;
        gap: 10px;
		background-color: #E3CAA8;
	}

    .i-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px;
        height: 60px;
        background: #000;
        border-radius: 10px;

        & > div {
            display: flex;
            gap: 20px;
        }
    }

    .i-info__color {
        display: flex;
        gap: 5px;
        justify-content: center;
        align-items: center;
		font-family: 'Barlow Medium';
        font-size: 26px;
        height: 60px;

        & span {
		    font-family: 'Barlow Bold';
            font-weight: bold;
            color: #fff;
        }
    }

    .i-info__total {
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: 'Barlow Bold';
        font-weight: bold;
        color: #fff;
        font-size: 26px;
        height: 60px;
    }

    .i-cards {
		display: flex;
		flex-direction: row;
		align-items: center;
        align-content: flex-start;
        justify-content: flex-start;
        flex-wrap: wrap;
        gap: 10px;
    }

    .i-card {
        display: flex;
    }

    .i-card__image-contain {
        display: flex;
        width: 250px;
        height: 350px;
        position: relative;
        border-radius: 16px;
        overflow: hidden;
    }

    .i-card__image {
        display: flex;
        position: absolute;
        top: 0;
        left: 0;

        & img {
            width: 250px;
            height: 350px;
        }
    }

    .i-card__count {
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px 20px;
        bottom: 0;
        right: 0;
        background: #000;
        border-top-left-radius: 16px;
        gap: 2px;
        font-size: 10px;
    }

    .i-card__num {
        display: flex;
        color: #fff;
        font-size: 40px;
		font-family: 'Barlow Bold';
        font-weight: bold;
    }

    .i-card__x {
        display: flex;
        color: #8D8D8C;
        font-size: 20px;
		font-family: 'Barlow Bold';
        font-weight: bold;
    }
</style>