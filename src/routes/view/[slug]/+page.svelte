<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { fade } from 'svelte/transition';

    import { preload } from '$lib/preload.js';

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

    // Card colors
    $: amber = deck.cards.filter(x => x.data.color == 'Amber');
    $: amethyst = deck.cards.filter(x => x.data.color == 'Amethyst');
    $: emerald = deck.cards.filter(x => x.data.color == 'Emerald');
    $: ruby = deck.cards.filter(x => x.data.color == 'Ruby');
    $: sapphire = deck.cards.filter(x => x.data.color == 'Sapphire');
    $: steel = deck.cards.filter(x => x.data.color == 'Steel');
    $: unink = deck.cards.filter(x => !x.data.inkwell);

    // Sort cards in deck
    $: deckCards = deck.cards.sort((a, b) => { return (a.data.cost - b.data.cost) || (a.data.baseName.localeCompare(b.data.baseName)); });

    // Show hover image when specified
    let hoverCard = null;
    let hoverRotate = false;
    let hoverTimer;
    const showHover = (image, rotate, timer) => {
        if (timer) {
            if (hoverTimer) clearTimeout(hoverTimer);

            hoverTimer = setTimeout(() => {
                hoverCard = image;
                hoverRotate = rotate ? true : false;
            }, 200);
        } else {
            hoverCard = image;
            hoverRotate = rotate ? true : false;
        }
    }
    const hideHover = () => { hoverCard = null; clearTimeout(hoverTimer); }

    // Get scrollbar width
    let scrollOffset;
    let scrollClient;
    $: scrollWidth = scrollOffset - scrollClient;
</script>

<svelte:head>
	<title>Lorebox - {deck.colors[0]} {deck.colors[1]} Deck</title>
    <meta name="description" content="View Deck.">
</svelte:head>

<div class="view-contain">
    <div class="col frame-full">
        <div class="col__scroll-contain">
            {#if hoverCard}
                <button class="hover-view hover-view--no-interact" transition:fade={{duration: 200}} on:click={hideHover} on:mouseleave={hideHover}>
                    <div class="hover-view__card">
                        <div class="card" class:card--rotate={hoverRotate}>
                            <div class="card__image-contain">
                                {#key hoverCard}
                                    <img class="card__image" src="{hoverCard}" alt="Full View" />
                                {/key}
                            </div>
                        </div>
                    </div>
                </button>
            {/if}
            <div class="col__scroll col__scroll--grid" bind:offsetWidth={scrollOffset} bind:clientWidth={scrollClient} style="padding-right: {20 - scrollWidth}px">
                {#if deckCards}
                    {#each deckCards as card (card.id)}
                        <div class="card card--view">
                            {#if card.number > 1}<div class="card__copy-card"></div>{/if}
                            {#if card.number > 2}<div class="card__copy-card"></div>{/if}
                            {#if card.number > 3}<div class="card__copy-card"></div>{/if}
                            <div class="card__image-contain">
                                {#await preload(card.data.images.thumbnail)}
                                    <!--Loading-->
                                {:then}
                                    <div in:fade={{duration: 200}}>
                                        <!-- svelte-ignore a11y-mouse-events-have-key-events a11y-no-static-element-interactions -->
                                        <div class="card__view" on:mouseover={showHover(card.data.images.full, (card.data.type == 'Location' ? true : false))} on:mouseleave={hideHover}>
                                            <img src="/images/icon-view.svg" alt="View Card" />
                                        </div>
                                        <div class="card__count">
                                            <span class="card__num">{card.number}</span>
                                            <span class="card__x">X</span>
                                        </div>
                                        <div class="card__image">
                                            <img src="{card.data.images.thumbnail}" alt="{card.data.fullName}" />
                                        </div>
                                    </div>
                                {/await}
                            </div>
                        </div>
                    {/each}
                {/if}
            </div>
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

    .col__scroll--grid {
        grid-template-columns: repeat(auto-fill,minmax(16rem,1fr));
    }

    @media screen and (max-width: 1160px) {
        :root {
            --Hover-Width: 320px;
        }

        .col__scroll--grid {
            grid-template-columns: repeat(auto-fill,minmax(15rem,1fr));
        }
    }

    @media screen and (max-width: 960px) {
        :root {
            --Hover-Width: 300px;
            --Page-Gutters: 10px;
            --Grid-Gutters: 5px;
        }
    }

    @media screen and (max-width: 760px) {
        :root {
            --Hover-Width: 280px;
        }

        .col__scroll--grid {
            grid-template-columns: repeat(auto-fill,minmax(13.5rem,1fr));
        }
    }

    @media screen and (max-width: 560px) {
        :root {
            --Hover-Width: 260px;
            --Page-Gutters: 5px;
        }

        .card__count {
            font-size: 8px;
        }

        .col__scroll--grid {
            grid-template-columns: repeat(3,1fr);
        }
    }
</style>