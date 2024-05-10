<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';

    let deckString = $page.params.slug;
    let cards;
    let deck = {
        colors: [],
        cardsCount: 0,
        cards: []
    };
    
    onMount(async () => {
        // Data provided by LorcanaJSON.org
        const response = await fetch('/data/allCards.json');
        const data = await response.json();
        cards = data.cards;

        if (deckString) {
            // Parse deck string and add cards to deck
            deckString.match(/.{5}/g).forEach(function(x) {
                let cardID = parseInt(x.slice(1, 5));
                let num = parseInt(x[0])

                deck.cards.push({
                    id: cardID,
                    data: cards.filter(x => x.id == cardID)[0],
                    number: Math.min(num, 4)
                });
            });

            // Set deck colors
            if (deck.cards.some(x => x.data.color == "Amber")) { deck.colors.push("Amber"); }
            if (deck.cards.some(x => x.data.color == "Amethyst")) { deck.colors.push("Amethyst"); }
            if (deck.cards.some(x => x.data.color == "Emerald")) { deck.colors.push("Emerald"); }
            if (deck.cards.some(x => x.data.color == "Ruby")) { deck.colors.push("Ruby"); }
            if (deck.cards.some(x => x.data.color == "Sapphire")) { deck.colors.push("Sapphire"); }
            if (deck.cards.some(x => x.data.color == "Steel")) { deck.colors.push("Steel"); }

            // Set total cards in deck
            deck.cardsCount = deck.cards.reduce((a,b) => a + b.number, 0);

            console.log(deck);
        }
    });

    // Sort cards in deck
    $: deckCards = deck.cards.sort((a, b) => { return (a.data.cost - b.data.cost) || (a.data.baseName.localeCompare(b.data.baseName)); });
</script>


<div class="view-contain">
    <div class="col frame-full">
        <div class="col__scroll col__scroll--grid">
            {#if deckCards}
                {#each deckCards as card (card.id)}
                    <div class="card card--view">
                        {#if card.number > 1}<div class="card__copy-card"></div>{/if}
                        {#if card.number > 2}<div class="card__copy-card"></div>{/if}
                        {#if card.number > 3}<div class="card__copy-card"></div>{/if}
                        <div class="card__image-contain">
                            <div>
                                <div class="card__view">
                                    <img src="/images/icon-view.svg" alt="View Card" />
                                </div>
                                <div class="card__count">
                                    {card.number}<span class="card__x">X</span>
                                </div>
                                <div class="card__image">
                                    <img src="{card.data.images.thumbnail}" alt="{card.data.fullName}" />
                                </div>
                            </div>
                        </div>
                    </div>
                {/each}
            {/if}
        </div>
    </div>
</div>

<style>
    :root {
        --Hover-Width: 340px;
        --Page-Gutters: 20px;
        --Grid-Gutters: 10px;
    }

    .view-contain {
        height: 100%;
        box-sizing: border-box;
        display: flex;
        gap: var(--Page-Gutters);
        padding: var(--Page-Gutters);
        overflow-x: clip;
    }
</style>