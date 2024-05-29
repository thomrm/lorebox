<script>
	import DeckImage from '$lib/deck-image.svelte';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';

    let deckString = $page.url.searchParams.get('d');
    let cards;
    let deck = {
        colors: [],
        cardsCount: 0,
        cards: [],
        price: 0
    };

    let gap = 10;
    let gutter = 20;
    let cardHeight = 350;
    
    onMount(async () => {
        // Data provided by Lorcast API
        const response = await fetch('/data/allCards.json');
        const data = await response.json();
        cards = data.results;

        if (deckString) {
            // Parse deck string and add cards to deck
            deckString.match(/.{6}/g).forEach(function(x) {
                let cardID = bigID(x.slice(1, 6));
                let num = parseInt(x[0])

                deck.cards.push({
                    id: cardID,
                    data: cards.filter(x => x.id == cardID)[0],
                    number: Math.min(num, 4)
                });
            });

            // Set deck colors
            if (deck.cards.some(x => x.data.ink == "Amber")) { deck.colors.push("Amber"); }
            if (deck.cards.some(x => x.data.ink == "Amethyst")) { deck.colors.push("Amethyst"); }
            if (deck.cards.some(x => x.data.ink == "Emerald")) { deck.colors.push("Emerald"); }
            if (deck.cards.some(x => x.data.ink == "Ruby")) { deck.colors.push("Ruby"); }
            if (deck.cards.some(x => x.data.ink == "Sapphire")) { deck.colors.push("Sapphire"); }
            if (deck.cards.some(x => x.data.ink == "Steel")) { deck.colors.push("Steel"); }

            // Set total cards in deck
            deck.cardsCount = deck.cards.reduce((a,b) => a + b.number, 0);

            // Update price of deck
            deck.cards.forEach(function(x) {
                deck.price = deck.price + (x.number * (x.data.prices.usd ? x.data.prices.usd : 0));
            });

            //console.log(deck);
        }
    });

    // Convert small ID to big ID
    const bigID = (cardID) => {
        let set = String(cardID).slice(0, 2);
        let id = String(cardID).slice(2, 5);
        
        let card = cards.filter(function(x) {
            return x.collector_number == String(parseInt(id)) && x.set.code == String(parseInt(set));
        });

        return card[0].id;
    }

    $: height = (Math.ceil(deck.cards.length / 4) * cardHeight) + ((Math.ceil(deck.cards.length / 4) - 1) * gap) + (gutter * 2);
</script>

<div class="deck-image-contain" style="height: {height}px;">
    <DeckImage deck={deck} />
</div>

<style>
    :root {
        background: var(--White);

        & body {
            overflow: scroll;
        }
    }

	.deck-image-contain {
		width: 1070px;
        display: flex;
        box-sizing: border-box;
	}
</style>