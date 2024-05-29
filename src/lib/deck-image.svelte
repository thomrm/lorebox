<script>
    export let deck;
</script>

<div class="image-contain">
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

<style>
	.image-contain {
        padding: 20px;
		display: flex;
		flex-direction: row;
		align-items: center;
        align-content: flex-start;
        justify-content: flex-start;
        flex-wrap: wrap;
        gap: 10px;
		background-color: #E3CAA8;
		font-family: 'Barlow Medium';
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