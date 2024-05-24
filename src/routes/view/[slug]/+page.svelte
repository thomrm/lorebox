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
        cards: [],
        price: 0
    };
    
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

    // Card colors
    $: amber = deck.cards.filter(x => x.data.ink == 'Amber');
    $: amethyst = deck.cards.filter(x => x.data.ink == 'Amethyst');
    $: emerald = deck.cards.filter(x => x.data.ink == 'Emerald');
    $: ruby = deck.cards.filter(x => x.data.ink == 'Ruby');
    $: sapphire = deck.cards.filter(x => x.data.ink == 'Sapphire');
    $: steel = deck.cards.filter(x => x.data.ink == 'Steel');
    $: unink = deck.cards.filter(x => !x.data.inkwell);

    // Sort cards in deck
    $: deckCards = deck.cards.sort((a, b) => { return (a.data.cost - b.data.cost) || (a.data.name.localeCompare(b.data.name)); });

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
        <div class="col__section">
            <div class="deck-info">
                <div class="deck-info__section">
                    <div class="deck-identity">
                        {#if deck.colors.length == 0}
                            <div class="deck-identity__empty">?</div>
                        {:else}
                            {#if deck.colors[0] == "Amethyst"}
                                <div class="deck-identity__half deck-identity__half--left ink-amethyst">
                                    <svg width="30px" height="34px"><use href="/images/filter-color-icons.svg#amethyst" /></svg>
                                </div>
                            {:else if deck.colors[0] == "Amber"}
                                <div class="deck-identity__half deck-identity__half--left ink-amber">
                                    <svg width="30px" height="34px"><use href="/images/filter-color-icons.svg#amber" /></svg>
                                </div>
                            {:else if deck.colors[0] == "Emerald"}
                                <div class="deck-identity__half deck-identity__half--left ink-emerald">
                                    <svg width="30px" height="34px"><use href="/images/filter-color-icons.svg#emerald" /></svg>
                                </div>
                            {:else if deck.colors[0] == "Ruby"}
                                <div class="deck-identity__half deck-identity__half--left ink-ruby">
                                    <svg width="30px" height="34px"><use href="/images/filter-color-icons.svg#ruby" /></svg>
                                </div>
                            {:else if deck.colors[0] == "Sapphire"}
                                <div class="deck-identity__half deck-identity__half--left ink-sapphire">
                                    <svg width="30px" height="34px"><use href="/images/filter-color-icons.svg#sapphire" /></svg>
                                </div>
                            {:else if deck.colors[0] == "Steel"}
                                <div class="deck-identity__half deck-identity__half--left ink-steel">
                                    <svg width="30px" height="34px"><use href="/images/filter-color-icons.svg#steel" /></svg>
                                </div>
                            {/if}
                            {#if deck.colors[1] == "Amethyst"}
                                <div class="deck-identity__half deck-identity__half--right ink-amethyst">
                                    <svg width="30px" height="34px"><use href="/images/filter-color-icons.svg#amethyst" /></svg>
                                </div>
                            {:else if deck.colors[1] == "Amber"}
                                <div class="deck-identity__half deck-identity__half--right ink-amber">
                                    <svg width="30px" height="34px"><use href="/images/filter-color-icons.svg#amber" /></svg>
                                </div>
                            {:else if deck.colors[1] == "Emerald"}
                                <div class="deck-identity__half deck-identity__half--right ink-emerald">
                                    <svg width="30px" height="34px"><use href="/images/filter-color-icons.svg#emerald" /></svg>
                                </div>
                            {:else if deck.colors[1] == "Ruby"}
                                <div class="deck-identity__half deck-identity__half--right ink-ruby">
                                    <svg width="30px" height="34px"><use href="/images/filter-color-icons.svg#ruby" /></svg>
                                </div>
                            {:else if deck.colors[1] == "Sapphire"}
                                <div class="deck-identity__half deck-identity__half--right ink-sapphire">
                                    <svg width="30px" height="34px"><use href="/images/filter-color-icons.svg#sapphire" /></svg>
                                </div>
                            {:else if deck.colors[1] == "Steel"}
                                <div class="deck-identity__half deck-identity__half--right ink-steel">
                                    <svg width="30px" height="34px"><use href="/images/filter-color-icons.svg#steel" /></svg>
                                </div>
                            {/if}
                        {/if}
                    </div>
                    <!-- <div class="deck-info__total">{deck.cardsCount}/60</div> -->
                    <div class="deck-info__totals">
                        {#if deck.cards.length === 0}
                            <div class="deck-info__counts">
                                <span>--</span>
                                <span>--</span>
                                <span>--</span>
                            </div>
                            <div class="deck-info__counts">
                                <span>--</span>
                            </div>
                        {:else}
                            <div class="deck-info__counts">
                                {#if amber.reduce((a,b) => a + b.number, 0)}<div class="deck-info__color text-amber"><span>{amber.reduce((a,b) => a + b.number, 0)}</span> Amber</div>{/if}
                                {#if amethyst.reduce((a,b) => a + b.number, 0)}<div class="deck-info__color text-amethyst"><span>{amethyst.reduce((a,b) => a + b.number, 0)}</span> Amethyst</div>{/if}
                                {#if emerald.reduce((a,b) => a + b.number, 0)}<div class="deck-info__color text-emerald"><span>{emerald.reduce((a,b) => a + b.number, 0)}</span> Emerald</div>{/if}
                                {#if ruby.reduce((a,b) => a + b.number, 0)}<div class="deck-info__color text-ruby"><span>{ruby.reduce((a,b) => a + b.number, 0)}</span> Ruby</div>{/if}
                                {#if sapphire.reduce((a,b) => a + b.number, 0)}<div class="deck-info__color text-sapphire"><span>{sapphire.reduce((a,b) => a + b.number, 0)}</span> Sapphire</div>{/if}
                                {#if steel.reduce((a,b) => a + b.number, 0)}<div class="deck-info__color text-steel"><span>{steel.reduce((a,b) => a + b.number, 0)}</span> Steel</div>{/if}
                                <div class="deck-info__color text-grey"><span>{unink.reduce((a,b) => a + b.number, 0)}</span> Uninkable</div>
                            </div>
                            <div class="deck-info__counts">
                                <div class="deck-info__price"><span class="text-emerald">&#36;</span>{deck.price.toFixed(2)}</div>
                            </div>
                        {/if}
                    </div>
                </div>
                <div class="deck-info__section">
                    <!-- <button class="button">Share Deck</button> -->
                    <a class="button" href="/?d={deckString}"><img src="/images/icon-edit.svg" alt="Switch to Edit View" />Edit</a>
                </div>
            </div>
        </div>
        <div class="col__divider"></div>
        <div class="col__scroll-contain">
            {#if hoverCard}
                <button class="hover-view hover-view--no-interact" transition:fade={{duration: 200}} on:click={hideHover} on:mouseleave={hideHover}>
                    <div class="hover-view__card">
                        <div class="card" class:card--rotate={hoverRotate}>
                            <div class="card__image-contain">
                                {#key hoverCard}
                                    {#await preload(hoverCard)}
                                        <!--Loading-->
                                    {:then}
                                        <div in:fade={{duration: 200}}>
                                            <img class="card__image" src="{hoverCard}" alt="Full View" />
                                        </div>
                                    {/await}
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
                            <div class="card__view-price">
                                <div>
                                    <span>&#36;</span>
                                    {#if card.data.prices.usd}
                                        {(card.data.prices.usd * card.number).toFixed(2)}
                                    {:else}
                                        --
                                    {/if}
                                </div>
                                <div>
                                    (
                                    <span>&#36;</span>
                                    {#if card.data.prices.usd}
                                        {card.data.prices.usd.toFixed(2)}
                                    {:else}
                                        --
                                    {/if}
                                    <span>&nbsp;each)</span>
                                </div>
                            </div>
                            {#if card.number > 1}<div class="card__copy-card"></div>{/if}
                            {#if card.number > 2}<div class="card__copy-card"></div>{/if}
                            {#if card.number > 3}<div class="card__copy-card"></div>{/if}
                            <div class="card__image-contain">
                                {#await preload(card.data.image_uris.digital.normal ? card.data.image_uris.digital.normal : card.data.image_uris.digital.large)}
                                    <!--Loading-->
                                {:then}
                                    <div in:fade={{duration: 200}}>
                                        <!-- svelte-ignore a11y-mouse-events-have-key-events a11y-no-static-element-interactions -->
                                        <div class="card__view" on:mouseover={showHover(card.data.image_uris.digital.large, (card.data.layout == 'landscape' ? true : false))} on:mouseleave={hideHover}>
                                            <img src="/images/icon-view.svg" alt="View Card" />
                                        </div>
                                        <div class="card__count">
                                            <span class="card__num">{card.number}</span>
                                            <span class="card__x">X</span>
                                        </div>
                                        <div class="card__image">
                                            <img src="{card.data.image_uris.digital.normal ? card.data.image_uris.digital.normal : card.data.image_uris.digital.large}" alt="{card.data.name}" />
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
        --Grid-Gutters: 5px;
    }

    .deck-info {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: space-between;
    }

    .deck-info__section {
        display: flex;
        gap: 10px;
    }

    .deck-info__totals {
        display: flex;
        gap: 10px;
    }

    .deck-info__counts {
        font-size: 14px;
        display: flex;
        gap: 10px;
        justify-content: space-between;
        align-items: center;
        line-height: 1;
        padding: 0 10px;
        height: 30px;
        background: var(--Background-Dark);
        border-radius: 6px;
        color: var(--White);
    }

    .deck-info__color {
        & span:first-child {
            color: var(--White);
            font-weight: bold;
        }
    }

    .deck-info__price {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 2px;

        & span:first-child {
            font-size: .7em;
            font-weight: bold;
        }
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