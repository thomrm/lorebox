<script>
    import { onMount } from 'svelte';
    import { preload } from '../lib/preload.js';
    import { fade, slide } from 'svelte/transition';

    import Modal from './filter-modal.svelte';

    import CardAdded from './card-added.svelte';

    let cards = null;
    let filteredCards;
    let filters = {
        color: {
            amber: false,
            amethyst: false,
            emerald: false,
            ruby: false,
            sapphire: false,
            steel: false,
        },
        showType: {
            action: false,
            character: false,
            item: false,
            location: false
        },
        showInk: {
            ink: false,
            unink: false
        },
        sortType: "cost",
        sortAsc: true,
        pageSize: 60
    }
    let searchTerm = null;
    let currentPage = 0;
    let totalCards;
    let totalPages;
    let colorCount;
    let colorLock = false;
    let filterCount;
    let showFilterModal = false;
    let deck = {
        colors: [],
        cardsCount: 0,
        cards: []
    };
    let hoverCard = null;
    
    onMount(async () => {
        // Get data from Lorcast API
        const response = await fetch('/data/allCards.json');
        const data = await response.json();
        cards = data.cards;

        // Exclude Enchanted and Special (Promo) printings
        cards = cards.filter(x => !x.rarity.includes("Enchanted") && !x.rarity.includes("Special"));

        filterCards();
    });

    $: filterCards = async (reset) => {
        // Force a page reset - used for clearing search term
        currentPage = reset ? 0 : currentPage;
        totalCards = reset ? null : totalCards;

        // Sort cards
        if (filters.sortType === 'cost') {
            filteredCards = cards.sort((a, b) => {
                return (filters.sortAsc ? a.cost - b.cost : b.cost - a.cost) || (a.baseName.localeCompare(b.baseName));
            });
        }
        if (filters.sortType === 'name') {
            filteredCards = cards.sort((a, b) => {
                return (filters.sortAsc ? 1 : -1) * (a.baseName.localeCompare(b.baseName));
            });
        }
        if (filters.sortType === 'rarity') {
            filteredCards = cards.sort(rarityCompare);
        }

        // Filter type
        if (filters.showType.action == true || filters.showType.character == true || filters.showType.item == true || filters.showType.location == true) {
            filteredCards = filteredCards
                .filter(x => !filters.showType.action ? !x.type.includes("Action") : true)
                .filter(x => !filters.showType.character ? !x.type.includes("Character") : true)
                .filter(x => !filters.showType.item ? !x.type.includes("Item") : true)
                .filter(x => !filters.showType.location ? !x.type.includes("Location") : true);
        }

        // Filter inkwell
        if (filters.showInk.ink == true || filters.showInk.unink == true) {
            filteredCards = filteredCards
                .filter(x => !filters.showInk.ink ? !x.inkwell : true)
                .filter(x => !filters.showInk.unink ? x.inkwell : true)
        }

        // Filter color
        filteredCards = filteredCards.filter(function(x) {
            if (filters.color.amber || filters.color.amethyst || filters.color.emerald || filters.color.ruby || filters.color.sapphire || filters.color.steel) {
                return  (filters.color.amber ? x.color.includes("Amber") : '') ||
                    (filters.color.amethyst ? x.color.includes("Amethyst") : '') ||
                    (filters.color.emerald ? x.color.includes("Emerald") : '') ||
                    (filters.color.ruby ? x.color.includes("Ruby") : '') ||
                    (filters.color.sapphire ? x.color.includes("Sapphire") : '') ||
                    (filters.color.steel ? x.color.includes("Steel") : '');
            } else {
                return x;
            }
        });

        // Filter displayed cards by search term
        filteredCards = searchTerm ? filteredCards.filter(function(x) {
            return  x.fullText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    x.fullName.toLowerCase().includes(searchTerm.toLowerCase());
        }) : filteredCards;

        // Update number of colors selected
        colorCount = Object.values(filters.color).filter(item => item === true).length;

        // Update number of filters selected
        filterCount = Object.values(filters.showType).filter(item => item === true).length + Object.values(filters.showInk).filter(item => item === true).length;

        // Set card and page totals
        totalPages = Math.ceil(filteredCards.length / filters.pageSize);
        totalCards = totalCards ? totalCards : filteredCards.length;

        //console.log(filteredCards);
        console.log(scrollWidth);
    }

    const addCard = (cardID) => {
        if (deck.cards.find(x => x.id === cardID)) {
            // Increment card already added and less than 4
            if (deck.cards.find(x => x.id === cardID).number < 4) {
                deck.cards.find(x => x.id === cardID).number++;
            }
        } else {
            // Add new card
            deck.cards.push({
                id: cardID,
                data: cards.filter(x => x.id == cardID)[0],
                number: 1
            });
        }

        updateDeck();
    }

    const removeCard = (cardID) => {
        if (deck.cards.find(x => x.id === cardID).number > 1) {
            // deincrement card already added and greater than 1
            deck.cards.find(x => x.id === cardID).number--;
        } else {
            // Remove card
            deck.cards = deck.cards.filter(x => x.id !== cardID);

            // Clear hover
            hoverCard = null;
        }

        updateDeck();
    }

    const updateDeck = () => {
        // Update deck colors
        deck.colors = [];
        if (deck.cards.some(x => x.data.color == "Amber")) { deck.colors.push("Amber"); }
        if (deck.cards.some(x => x.data.color == "Amethyst")) { deck.colors.push("Amethyst"); }
        if (deck.cards.some(x => x.data.color == "Emerald")) { deck.colors.push("Emerald"); }
        if (deck.cards.some(x => x.data.color == "Ruby")) { deck.colors.push("Ruby"); }
        if (deck.cards.some(x => x.data.color == "Sapphire")) { deck.colors.push("Sapphire"); }
        if (deck.cards.some(x => x.data.color == "Steel")) { deck.colors.push("Steel"); }

        // Force color filters if deck now contains 2 colors
        if (deck.colors.length == 2 && !colorLock) {
            filters.color.amber = deck.colors.includes("Amber") ? true : false;
            filters.color.amethyst = deck.colors.includes("Amethyst") ? true : false;
            filters.color.emerald = deck.colors.includes("Emerald") ? true : false;
            filters.color.ruby = deck.colors.includes("Ruby") ? true : false;
            filters.color.sapphire = deck.colors.includes("Sapphire") ? true : false;
            filters.color.steel = deck.colors.includes("Steel") ? true : false;
            colorLock = true;
            filterCards(true);
        }

        // Reset color filters if deck no longer contains 2 colors
        if (deck.colors.length < 2 && colorLock) {
            filters.color.amber = false;
            filters.color.amethyst = false;
            filters.color.emerald = false;
            filters.color.ruby = false;
            filters.color.sapphire = false;
            filters.color.steel = false;
            colorCount == 0;
            colorLock = false;
            filterCards(true);
        }

        // Update total cards added to deck
        deck.cardsCount = deck.cards.reduce((a,b) => a + b.number, 0);
    }

    // Show hover image when specified
    const showHover = (image) => { hoverCard = image; }
    const hideHover = () => { hoverCard = null; }

    // Sort cards in deck by type
    $: characters = deck.cards.filter(x => x.data.type == 'Character').sort((a, b) => { return (a.data.cost - b.data.cost) || (a.data.baseName.localeCompare(b.data.baseName)); });
    $: actions = deck.cards.filter(x => x.data.type == 'Action').sort((a, b) => { return (a.data.cost - b.data.cost) || (a.data.baseName.localeCompare(b.data.baseName)); });
    $: items = deck.cards.filter(x => x.data.type == 'Item').sort((a, b) => { return (a.data.cost - b.data.cost) || (a.data.baseName.localeCompare(b.data.baseName)); });
    $: locations = deck.cards.filter(x => x.data.type == 'Location').sort((a, b) => { return (a.data.cost - b.data.cost) || (a.data.baseName.localeCompare(b.data.baseName)); });

    // Sort cards in deck by color
    $: amber = deck.cards.filter(x => x.data.color == 'Amber');
    $: amethyst = deck.cards.filter(x => x.data.color == 'Amethyst');
    $: emerald = deck.cards.filter(x => x.data.color == 'Emerald');
    $: ruby = deck.cards.filter(x => x.data.color == 'Ruby');
    $: sapphire = deck.cards.filter(x => x.data.color == 'Sapphire');
    $: steel = deck.cards.filter(x => x.data.color == 'Steel');
    $: unink = deck.cards.filter(x => !x.data.inkwell);

    // Count costs for each color
    $: costs = [
        {
            a: deck.cards.filter(x => x.data.color == deck.colors[0]).filter(x => x.data.cost == '1').reduce((a,b) => a + b.number, 0),
            b: deck.cards.filter(x => x.data.color == deck.colors[1]).filter(x => x.data.cost == '1').reduce((a,b) => a + b.number, 0)
        },
        {
            a: deck.cards.filter(x => x.data.color == deck.colors[0]).filter(x => x.data.cost == '2').reduce((a,b) => a + b.number, 0),
            b: deck.cards.filter(x => x.data.color == deck.colors[1]).filter(x => x.data.cost == '2').reduce((a,b) => a + b.number, 0)
        },
        {
            a: deck.cards.filter(x => x.data.color == deck.colors[0]).filter(x => x.data.cost == '3').reduce((a,b) => a + b.number, 0),
            b: deck.cards.filter(x => x.data.color == deck.colors[1]).filter(x => x.data.cost == '3').reduce((a,b) => a + b.number, 0)
        },
        {
            a: deck.cards.filter(x => x.data.color == deck.colors[0]).filter(x => x.data.cost == '4').reduce((a,b) => a + b.number, 0),
            b: deck.cards.filter(x => x.data.color == deck.colors[1]).filter(x => x.data.cost == '4').reduce((a,b) => a + b.number, 0)
        },
        {
            a: deck.cards.filter(x => x.data.color == deck.colors[0]).filter(x => x.data.cost == '5').reduce((a,b) => a + b.number, 0),
            b: deck.cards.filter(x => x.data.color == deck.colors[1]).filter(x => x.data.cost == '5').reduce((a,b) => a + b.number, 0)
        },
        {
            a: deck.cards.filter(x => x.data.color == deck.colors[0]).filter(x => x.data.cost == '6').reduce((a,b) => a + b.number, 0),
            b: deck.cards.filter(x => x.data.color == deck.colors[1]).filter(x => x.data.cost == '6').reduce((a,b) => a + b.number, 0)
        },
        {
            a: deck.cards.filter(x => x.data.color == deck.colors[0]).filter(x => x.data.cost == '7').reduce((a,b) => a + b.number, 0),
            b: deck.cards.filter(x => x.data.color == deck.colors[1]).filter(x => x.data.cost == '7').reduce((a,b) => a + b.number, 0)
        },
        {
            a: deck.cards.filter(x => x.data.color == deck.colors[0]).filter(x => x.data.cost == '8').reduce((a,b) => a + b.number, 0),
            b: deck.cards.filter(x => x.data.color == deck.colors[1]).filter(x => x.data.cost == '8').reduce((a,b) => a + b.number, 0)
        },
        {
            a: deck.cards.filter(x => x.data.color == deck.colors[0]).filter(x => x.data.cost == '9').reduce((a,b) => a + b.number, 0),
            b: deck.cards.filter(x => x.data.color == deck.colors[1]).filter(x => x.data.cost == '9').reduce((a,b) => a + b.number, 0)
        },
        {
            a: deck.cards.filter(x => x.data.color == deck.colors[0]).filter(x => x.data.cost == '10').reduce((a,b) => a + b.number, 0),
            b: deck.cards.filter(x => x.data.color == deck.colors[1]).filter(x => x.data.cost == '10').reduce((a,b) => a + b.number, 0)
        }
    ]

    const clearSearch = () => {
        // Clear search term
        searchTerm = null;

        // Reset displayed cards
        filterCards(true);
    }

    const resetFilters = () => {
        // Default filters
        filters.showType.action = false;
        filters.showType.character = false;
        filters.showType.item = false;
        filters.showType.location = false;
        filters.showInk.ink = false;
        filters.showInk.unink = false;

        // Reset displayed cards
        filterCards(true);
    }

    // Rarity compare for sorting
    const rarityCompare = (a, b) => {
        let aVal = 
            a.rarity === "Common" ? 1 : null || 
            a.rarity === "Uncommon" ? 2 : null ||
            a.rarity === "Rare" ? 3 : null ||
            a.rarity === "Super" ? 4 : null ||
            a.rarity === "Legendary" ? 5 : null;
        let bVal = 
            b.rarity === "Common" ? 1 : null || 
            b.rarity === "Uncommon" ? 2 : null ||
            b.rarity === "Rare" ? 3 : null ||
            b.rarity === "Super" ? 4 : null ||
            b.rarity === "Legendary" ? 5 : null;

        if ( aVal < bVal ) {
            return filters.sortAsc ? -1 : 1;
        }
        if ( aVal > bVal ) {
            return filters.sortAsc ? 1 : -1;
        }
        return (a.baseName.localeCompare(b.baseName));
    }

    // Get scrollbar width
    $: scrollWidth = window.innerWidth - document.documentElement.clientWidth;
</script>

<Modal bind:showFilterModal>
    <div class="col__section">
        <div class="filters filters--modal">
            <div class="filters__header">Card Types</div>
            <div class="filters__group">
                <input type="checkbox" class="checkbox" id="filter-actions" name="Actions" bind:checked={filters.showType.action} on:change={filterCards} />
                <label class="checkbox-item" for="filter-actions">Actions</label>
                <input type="checkbox" class="checkbox" id="filter-characters" name="Characters" bind:checked={filters.showType.character} on:change={filterCards} />
                <label class="checkbox-item" for="filter-characters">Characters</label>
                <input type="checkbox" class="checkbox" id="filter-items" name="Items" bind:checked={filters.showType.item} on:change={filterCards} />
                <label class="checkbox-item" for="filter-items">Items</label>
                <input type="checkbox" class="checkbox" id="filter-locations" name="Locations" bind:checked={filters.showType.location} on:change={filterCards} />
                <label class="checkbox-item" for="filter-locations">Locations</label>
            </div>
        </div>
    </div>
    <div class="col__divider"></div>
    <div class="col__section">
        <div class="filters filters--modal">
            <div class="filters__header">Inkwell</div>
            <div class="filters__group">
                <input type="checkbox" class="checkbox" id="filter-ink" name="Inkable" bind:checked={filters.showInk.ink} on:change={filterCards} />
                <label class="checkbox-item" for="filter-ink">Inkable</label>
                <input type="checkbox" class="checkbox" id="filter-unink" name="Uninkable" bind:checked={filters.showInk.unink} on:change={filterCards} />
                <label class="checkbox-item" for="filter-unink">Uninkable</label>
            </div>
        </div>
    </div>
    <div class="col__divider"></div>

    <button class="button" slot="action" on:click={resetFilters}>Reset All</button>
</Modal>

<div class="app-contain">
    <div class="col frame-full">
        <div class="col__section">
            <div class="filters">
                <fieldset class="filters__group" disabled={colorLock}>
                    <input type="checkbox" id="filter-amber" name="Amber" bind:checked={filters.color.amber} disabled={(colorCount == 2 && !filters.color.amber) ? true : false} on:change={filterCards} />
                    <label class="filter-ink ink-amber" for="filter-amber">
                        <svg width="30px" height="34px"><use href="images/filter-color-icons.svg#amber" /></svg>
                    </label>
                    <input type="checkbox" id="filter-amethyst" name="Amethyst" bind:checked={filters.color.amethyst} disabled={(colorCount == 2 && !filters.color.amethyst) ? true : false} on:change={filterCards} />
                    <label class="filter-ink ink-amethyst" for="filter-amethyst">
                        <svg width="30px" height="34px"><use href="images/filter-color-icons.svg#amethyst" /></svg>
                    </label>
                    <input type="checkbox" id="filter-emerald" name="Emerald" bind:checked={filters.color.emerald} disabled={(colorCount == 2 && !filters.color.emerald) ? true : false} on:change={filterCards} />
                    <label class="filter-ink ink-emerald" for="filter-emerald">
                        <svg width="30px" height="34px"><use href="images/filter-color-icons.svg#emerald" /></svg>
                    </label>
                    <input type="checkbox" id="filter-ruby" name="Ruby" bind:checked={filters.color.ruby} disabled={(colorCount == 2 && !filters.color.ruby) ? true : false} on:change={filterCards} />
                    <label class="filter-ink ink-ruby" for="filter-ruby">
                        <svg width="30px" height="34px"><use href="images/filter-color-icons.svg#ruby" /></svg>
                    </label>
                    <input type="checkbox" id="filter-sapphire" name="Sapphire" bind:checked={filters.color.sapphire} disabled={(colorCount == 2 && !filters.color.sapphire) ? true : false} on:change={filterCards} />
                    <label class="filter-ink ink-sapphire" for="filter-sapphire">
                        <svg width="30px" height="34px"><use href="images/filter-color-icons.svg#sapphire" /></svg>
                    </label>
                    <input type="checkbox" id="filter-steel" name="Steel" bind:checked={filters.color.steel} disabled={(colorCount == 2 && !filters.color.steel) ? true : false} on:change={filterCards} />
                    <label class="filter-ink ink-steel" for="filter-steel">
                        <svg width="30px" height="34px"><use href="images/filter-color-icons.svg#steel" /></svg>
                    </label>
                </fieldset>
                <div class="filters__group">
                    <button class="button" on:click={() => (showFilterModal = true)}>
                        <img src="./images/icon-filter.svg" alt="Filters" />Filters {#if filterCount > 0}({filterCount}){/if}
                    </button>
                    <select class="button button--dropdown" name="sort-type" id="sort-type" bind:value={filters.sortType} on:change={filterCards}>
                        <option value="name">Sort by Name</option>
                        <option value="cost">Sort by Cost</option>
                        <option value="rarity">Sort by Rarity</option>
                    </select>
                    <input type="checkbox" id="sort-direction" bind:checked={filters.sortAsc} on:change={filterCards} />
                    <label class="button" for="sort-direction">
                        {#if filters.sortAsc}
                            <img src="./images/icon-sortAsc.svg" alt="Ascending" />
                            Asc
                        {:else}
                            <img src="./images/icon-sortDesc.svg" alt="Descending" />
                            Desc
                        {/if}
                    </label>
                </div>
                <div class="filters__group filters__group--right">
                    <form id="search-form" class="search-form" on:submit|preventDefault={filterCards} on:reset={clearSearch}>
                        <input class="search-form__search-bar" type="text" placeholder="Search..."  bind:value={searchTerm} on:change={filterCards} />
                        {#if searchTerm}
                            <button type="reset" class="search-form__search-clear">
                                <img src="./images/icon-clear.svg" alt="Clear Search" />
                            </button>
                        {/if}
                    </form> 
                </div>
            </div>
        </div>
        <div class="col__divider"></div>
        <div class="col__scroll-contain">
            {#if hoverCard}
                <div class="hover-view" transition:fade={{duration: 200}}>
                    <div class="hover-view__card">
                        <div class="card">
                            {#key hoverCard}
                                <img class="card__image" src="{hoverCard}" alt="Full View" />
                            {/key}
                        </div>
                    </div>
                </div>
            {/if}
            {#if !filteredCards}
                <!--Loading-->
            {:else}
                {#if filteredCards.length === 0}
                    <div class="grid-status">No Results</div>
                {:else}
                    {#key filteredCards}
                        <div class="col__scroll col__scroll--grid" style="padding-right: {20 - scrollWidth}px">
                            {#each filteredCards.slice(currentPage * filters.pageSize, currentPage * filters.pageSize + filters.pageSize) as card (card.id)}
                                <div class="card">
                                    {#await preload(card.images.full)}
                                        <!--Loading-->
                                    {:then}
                                        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
                                        <img class="card__image" src="{card.images.full}" alt="{card.fullName}" in:fade={{duration: 200}} on:click={addCard(card.id)} />
                                    {/await}
                                </div>
                            {/each}
                        </div>
                    {/key}
                {/if}
            {/if}
        </div>
        <div class="col__divider"></div>
        <div class="col__section">
            <div class="pagination">
                <div class="pagination__buttons">
                    <button class="button button--left" disabled={currentPage == 0 ? true : false} on:click={() => {currentPage--;}}>
                        <img src="images/arrow-left.svg" alt="left arrow" />
                        Previous Page
                    </button>
                </div>


                {#if filteredCards}
                    <div class="pagination__stats">
                        <span>Page {currentPage + 1}</span>
                        <span>
                            {totalCards ? (currentPage * filters.pageSize + 1) + " - " + (Math.min((currentPage + 1) * filters.pageSize, totalCards)) + " of " : ""}
                            {totalCards} {totalCards == 1 ? "Result" : "Results"}
                        </span>
                    </div>
                {/if}

                <div class="pagination__buttons pagination__buttons--right">
                    <button class="button button--right" disabled={currentPage == totalPages - 1 || totalPages == 0 || !totalPages ? true : false} on:click={() => {currentPage++;}}>
                        Next Page
                        <img src="images/arrow-right.svg" alt="right arrow" />
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div class="col col--right frame-full">
        <div class="col__section">
            <div class="deck-header">
                <div class="deck-header__side">
                    <div class="deck-identity">
                        {#if deck.colors.length == 0}
                            <div class="deck-identity__empty">?</div>
                        {:else}
                            {#if deck.colors[0] == "Amethyst"}
                                <div class="deck-identity__half deck-identity__half--left ink-amethyst">
                                    <svg width="30px" height="34px"><use href="images/filter-color-icons.svg#amethyst" /></svg>
                                </div>
                            {:else if deck.colors[0] == "Amber"}
                                <div class="deck-identity__half deck-identity__half--left ink-amber">
                                    <svg width="30px" height="34px"><use href="images/filter-color-icons.svg#amber" /></svg>
                                </div>
                            {:else if deck.colors[0] == "Emerald"}
                                <div class="deck-identity__half deck-identity__half--left ink-emerald">
                                    <svg width="30px" height="34px"><use href="images/filter-color-icons.svg#emerald" /></svg>
                                </div>
                            {:else if deck.colors[0] == "Ruby"}
                                <div class="deck-identity__half deck-identity__half--left ink-ruby">
                                    <svg width="30px" height="34px"><use href="images/filter-color-icons.svg#ruby" /></svg>
                                </div>
                            {:else if deck.colors[0] == "Sapphire"}
                                <div class="deck-identity__half deck-identity__half--left ink-sapphire">
                                    <svg width="30px" height="34px"><use href="images/filter-color-icons.svg#sapphire" /></svg>
                                </div>
                            {:else if deck.colors[0] == "Steel"}
                                <div class="deck-identity__half deck-identity__half--left ink-steel">
                                    <svg width="30px" height="34px"><use href="images/filter-color-icons.svg#steel" /></svg>
                                </div>
                            {/if}
                            {#if deck.colors[1] == "Amethyst"}
                                <div class="deck-identity__half deck-identity__half--right ink-amethyst">
                                    <svg width="30px" height="34px"><use href="images/filter-color-icons.svg#amethyst" /></svg>
                                </div>
                            {:else if deck.colors[1] == "Amber"}
                                <div class="deck-identity__half deck-identity__half--right ink-amber">
                                    <svg width="30px" height="34px"><use href="images/filter-color-icons.svg#amber" /></svg>
                                </div>
                            {:else if deck.colors[1] == "Emerald"}
                                <div class="deck-identity__half deck-identity__half--right ink-emerald">
                                    <svg width="30px" height="34px"><use href="images/filter-color-icons.svg#emerald" /></svg>
                                </div>
                            {:else if deck.colors[1] == "Ruby"}
                                <div class="deck-identity__half deck-identity__half--right ink-ruby">
                                    <svg width="30px" height="34px"><use href="images/filter-color-icons.svg#ruby" /></svg>
                                </div>
                            {:else if deck.colors[1] == "Sapphire"}
                                <div class="deck-identity__half deck-identity__half--right ink-sapphire">
                                    <svg width="30px" height="34px"><use href="images/filter-color-icons.svg#sapphire" /></svg>
                                </div>
                            {:else if deck.colors[1] == "Steel"}
                                <div class="deck-identity__half deck-identity__half--right ink-steel">
                                    <svg width="30px" height="34px"><use href="images/filter-color-icons.svg#steel" /></svg>
                                </div>
                            {/if}
                        {/if}
                    </div>
                </div>
                <div class="deck-header__total">{deck.cardsCount}/60</div>
                <div class="deck-header__side deck-header__side--right">
                    <button class="button">
                        <img src="/images/icon-more.svg" alt="More Options" />
                    </button>
                </div>
            </div>
        </div>
        <div class="col__divider"></div>
        <div class="col__section">
            <div class="deck-stats">
                <div class="deck-graph">
                    <div class="deck-graph__bars">
                        {#each costs as cost}
                            {@const scale = costs.some(obj => obj.a > 40 || obj.b > 40) ? 1 : costs.some(obj => obj.a > 20 || obj.b > 20) ? 2 : 4}
                            <div class="bar">
                                <div class="bar__left" 
                                    class:ink-amber={deck.colors[0] == "Amber"}
                                    class:ink-amethyst={deck.colors[0] == "Amethyst"}
                                    class:ink-emerald={deck.colors[0] == "Emerald"}
                                    class:ink-ruby={deck.colors[0] == "Ruby"}
                                    class:ink-sapphire={deck.colors[0] == "Sapphire"}
                                    class:ink-steel={deck.colors[0] == "Steel"}
                                >
                                    <svg width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8 -0.00012207V5.00003H0V4.51752L8 -0.00012207Z" fill="currentColor"/>
                                    </svg>
                                    <div class="bar__fill" style="height: {cost.a * scale}px"></div>
                                </div>
                                <div class="bar__right" 
                                    class:ink-amber={deck.colors[1] == "Amber"}
                                    class:ink-amethyst={deck.colors[1] == "Amethyst"}
                                    class:ink-emerald={deck.colors[1] == "Emerald"}
                                    class:ink-ruby={deck.colors[1] == "Ruby"}
                                    class:ink-sapphire={deck.colors[1] == "Sapphire"}
                                    class:ink-steel={deck.colors[1] == "Steel"}
                                >
                                    <svg width="8" height="5" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M0 -0.00012207V5.00003H8V4.51752L0 -0.00012207Z" fill="currentColor"/>
                                    </svg>
                                    <div class="bar__fill" style="height: {cost.b * scale}px"></div>
                                </div>
                            </div>
                        {/each}
                    </div>
                    <div class="deck-graph__labels">
                        <div><span>1</span></div>
                        <div><span>2</span></div>
                        <div><span>3</span></div>
                        <div><span>4</span></div>
                        <div><span>5</span></div>
                        <div><span>6</span></div>
                        <div><span>7</span></div>
                        <div><span>8</span></div>
                        <div><span>9</span></div>
                        <div><span>10</span></div>
                    </div>
                </div>
                <div class="deck-stats__totals">
                    {#if deck.cards.length === 0}
                        <div class="deck-stats__counts">
                            <span>--</span>
                            <span>--</span>
                        </div>
                        <div class="deck-stats__counts">
                            <span>--</span>
                        </div>
                    {:else}
                        <div class="deck-stats__counts">
                            {#if amber.reduce((a,b) => a + b.number, 0)}<div class="deck-stats__color text-amber"><span>{amber.reduce((a,b) => a + b.number, 0)}</span> Amber</div>{/if}
                            {#if amethyst.reduce((a,b) => a + b.number, 0)}<div class="deck-stats__color text-amethyst"><span>{amethyst.reduce((a,b) => a + b.number, 0)}</span> Amethyst</div>{/if}
                            {#if emerald.reduce((a,b) => a + b.number, 0)}<div class="deck-stats__color text-emerald"><span>{emerald.reduce((a,b) => a + b.number, 0)}</span> Emerald</div>{/if}
                            {#if ruby.reduce((a,b) => a + b.number, 0)}<div class="deck-stats__color text-ruby"><span>{ruby.reduce((a,b) => a + b.number, 0)}</span> Ruby</div>{/if}
                            {#if sapphire.reduce((a,b) => a + b.number, 0)}<div class="deck-stats__color text-sapphire"><span>{sapphire.reduce((a,b) => a + b.number, 0)}</span> Sapphire</div>{/if}
                            {#if steel.reduce((a,b) => a + b.number, 0)}<div class="deck-stats__color text-steel"><span>{steel.reduce((a,b) => a + b.number, 0)}</span> Steel</div>{/if}
                        </div>
                        <div class="deck-stats__counts">
                            <div class="deck-stats__color text-grey"><span>{unink.reduce((a,b) => a + b.number, 0)}</span> Uninkable</div>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
        <div class="col__divider"></div>
        <div class="col__scroll-contain">
            {#if deck.cards.length === 0}
                <div class="grid-status grid-status--small" transition:fade={{duration: 200}}>No Cards Added</div>
            {/if}
            <div class="col__scroll" style="padding-right: {20 - scrollWidth}px">
                <div class="deck">
                    {#if characters.length !== 0}
                        <div class="deck__label" transition:slide={{duration: 200}}>Characters <span class="deck__label-sub">({characters.reduce((a,b) => a + b.number, 0)})</span></div>
                    {/if}
                    {#each characters as card (card.id)}
                        <CardAdded card={card} on:add={addCard(card.id)} on:remove={removeCard(card.id)} on:hoverEnter={showHover(card.data.images.full)} on:hoverLeave={hideHover} />
                    {/each}
                    {#if actions.length !== 0}
                        <div class="deck__label" transition:slide={{duration: 200}}>Actions <span class="deck__label-sub">({actions.reduce((a,b) => a + b.number, 0)})</span></div>
                    {/if}
                    {#each actions as card (card.id)}
                        <CardAdded card={card} on:add={addCard(card.id)} on:remove={removeCard(card.id)} on:hoverEnter={showHover(card.data.images.full)} on:hoverLeave={hideHover} />
                    {/each}
                    {#if items.length !== 0}
                        <div class="deck__label" transition:slide={{duration: 200}}>Items <span class="deck__label-sub">({items.reduce((a,b) => a + b.number, 0)})</span></div>
                    {/if}
                    {#each items as card (card.id)}
                        <CardAdded card={card} on:add={addCard(card.id)} on:remove={removeCard(card.id)} on:hoverEnter={showHover(card.data.images.full)} on:hoverLeave={hideHover} />
                    {/each}
                    {#if locations.length !== 0}
                        <div class="deck__label" transition:slide={{duration: 200}}>Locations <span class="deck__label-sub">({locations.reduce((a,b) => a + b.number, 0)})</span></div>
                    {/if}
                    {#each locations as card (card.id)}
                        <CardAdded card={card} on:add={addCard(card.id)} on:remove={removeCard(card.id)} on:hoverEnter={showHover(card.data.images.full)} on:hoverLeave={hideHover} />
                    {/each}
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .deck-stats {
        background: var(--Background-Dark);
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        padding: 10px;
        gap: 10px;
        color: var(--White);
    }

    .deck-graph {
        background: url('/images/background-zebra.svg');
        background-repeat: repeat-x;
    }

    .deck-graph__bars {
        height: 82px;
        display: flex;
        gap: 10px;
    }

    .bar {
        width: 17px;
        display: flex;
        gap: 1px;
        height: 85px;
        align-items: flex-end;
        color: var(--Background-Dark);
    }

    .bar__left, .bar__right {
        display: flex;
        flex-direction: column;
    }

    .bar__fill {
        background-color: currentColor;
        transition: height 200ms;
    }

    .deck-graph__labels {
        display: flex;
        gap: 10px;

        & > div {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 17px;
            height: 16px;
            line-height: 1;
            position: relative;

            & span {
                z-index: 1;
                font-size: 11px;
                line-height: 6px;
                height: 8px;
            }

            &::after {
                content: '';
                background: url('/images/label-cost.svg');
                width: 17px;
                height: 21px;
                position: absolute;
                top: -4px;
                left: 0;
                z-index: 0;
            }
        }
    }

    .deck-stats__totals {
        font-size: 12px;
        display: flex;
        justify-content: space-between;
        line-height: 1;
    }

    .deck-stats__counts {
        display: flex;
        gap: 10px;

        & span {
            color: var(--White);
            font-weight: bold;
        }
    }

    .hover-view {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2;
        background: rgba(227,202,168,0.8);
    }

    .hover-view__card {
        width: 300px;
    }

    .deck-header {
        display: flex;
    }

    .deck-header__side {
        width: 50px;
        display: flex;
    }

    .deck-header__side--right {
        justify-content: flex-end;
    }

    .deck-header__total {
        font-size: 20px;
        font-weight: bold;
        height: 30px;
        display: flex;
        flex: 1 0 0;
        align-items: center;
        justify-content: center;
    }

    .deck-identity {
        width: 30px;
        height: 30px;
        position: relative;

        &::before {
            content: '';
            width: 30px;
            height: 34px;
            top: -2px;
            position: absolute;
            background-image: url('/images/filter-blank.svg');
            background-repeat: no-repeat;
        }
    }

    .deck-identity__half {
        position: absolute;
        top: -2px;
        width: 14px;
        height: 34px;
        overflow: hidden;

        --Filter-Base: var(--Black);
        --Filter-Icon: currentColor;
        
        & svg {
            position: absolute;
        }
    }

    .deck-identity__half--left {
        left: 0;
        border-right: 1px solid var(--Black);
    }

    .deck-identity__half--right {
        right: 0;
        justify-content: flex-end;
        border-left: 1px solid var(--Black);

        & svg {
            right: 0;
        }
    }

    .deck-identity__empty {
        color: var(--Background-Base);
        font-weight: bold;
        font-size: 14px;
        width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
    }

    .deck {
        display: flex;
        flex-direction: column;
    }

    .deck__label {
        display: flex;
        height: 40px;
        justify-content: center;
        align-items: center;
        gap: 5px;
        font-size: 16px;
        font-weight: bold;
        align-self: stretch;
    }

    .deck__label-sub {
        font-weight: normal;
        color: var(--Text-Sub);
    }

    .app-contain {
        height: 100%;
        box-sizing: border-box;
        display: flex;
        gap: 20px;
    }

    .col {
        display: flex;
        flex: 1 0 0;
        flex-direction: column;
        padding: 5px;
        position: relative;
        box-sizing: border-box;
    }

    .col--right {
        min-width: 330px;
        flex: 0;
    }

    .col__section {
        padding: 15px 20px;
    }

    .col__scroll-contain {
        padding: 0;
        overflow: hidden;
        position: relative;
        display: flex;
        flex: 1 0 0;
    }

    .col__scroll {
        padding: 15px 20px;
        height: 100%;
        width: 100%;
        box-sizing: border-box;
        overflow-y: scroll;
        overflow-x: clip;
        overscroll-behavior: contain;
    }

    .col__scroll--grid {
        display: grid;
        grid-template-columns: repeat(auto-fill,minmax(18rem,1fr));
        grid-auto-rows: min-content;
        gap: 10px;
    }

    .col__divider {
        height: 1px;
        margin: 0 20px;
        position: relative;
        z-index: 3;

        &::before, &::after {
            content: '';
            position: absolute;
            top: -12px;
            height: 25px;
        }

        &::before {
            left: 0px;
            right: 0px;
            background-image: url('/images/divider-middle.svg'), url('/images/divider-line.svg');
            background-repeat: no-repeat, repeat;
            background-position: center;
        }

        &::after {
            left: -4px;
            right: -4px;
            background-image: url('/images/divider-end.svg'), url('/images/divider-end.svg');
            background-repeat: no-repeat, no-repeat;
            background-position: left center, right center;

        }
    }

    .grid-status {
        display: flex;
        flex: 1 0 0;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 30px;
        color: var(--Text-Sub);
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }

    .grid-status--small {
        font-size: 20px;
    }

    .filters {
        display: flex;
        gap: 15px;
    }

    .filters--modal {
        flex-direction: column;
        gap: 5px;
    }

    .filters__group {
        display: flex;
        gap: 5px;

        & input[type='checkbox'] {
            display: none;

            & + label {
                transition: transform 200ms;
            }

            &:not(:checked) + label {
                --Filter-Base: var(--Background-Dark);
                --Filter-Icon: var(--Gold);
            }

            &:disabled + label {
                --Filter-Base: var(--Border);
                --Filter-Icon: var(--Background-Base);
                cursor: default;
            }

            &:not(:disabled):hover + label {
                --Filter-Icon: currentColor;
            }

            &:active + label {
                transform: scale(0.95);
            }
        }
    }

    .filter-ink {
        padding: 0;
        border: none;
        background: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        height: 30px;
        width: 30px;

        --Filter-Base: var(--Black);
        --Filter-Icon: currentColor;
    }

    .filters__group--right {
        display: flex;
        flex: 1 0 0;
        justify-content: flex-end;
    }

    .filters__header {
        font-size: 16px;
        color: var(--Text-Sub);
    }

    .search-form {
        position: relative;
        display: flex;
    }

    .search-form__search-bar {
        border: 1px solid var(--Border);
        background: var(--Background-Base);
        background-image: url('/images/icon-search.svg');
        background-position: 6px center;
        background-repeat: no-repeat;
        border-radius: 999px;
        font: inherit;
        font-size: 14px;
        padding: 0 10px 0 30px;
        position: relative;

        &::placeholder {
            color: var(--Text-Sub);
        }

        &:active, &:focus-visible {
            outline: none;
        }
    }

    .search-form__search-clear {
        position: absolute;
        right: 0;
        display: flex;
        height: 30px;
        width: 30px;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        background: none;
        border: none;
    }

    .card {
        display: flex;
        transition: transform 200ms;
        cursor: pointer;
        position: relative;
        padding-top: 140%;
        height: 0;
        border-radius: 4.5% / 3.5%;
        background-image: url('/images/cardback.svg');
        background-repeat: no-repeat;
        background-size: cover;
        overflow: hidden;
        transform: translateZ(0);

        &:hover {
            transform: scale(1.05);
        }
    }

    .card__image {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 4.5% / 3.5%;
        top: 0;
        left: 0;
    }

    .pagination {
        display: flex;
        justify-content: space-between;
    }

    .pagination__buttons {
        display: flex;
        flex: 1 0 0;
        gap: 10px;
    }

    .pagination__buttons--right {
        justify-content: flex-end;
    }

    .pagination__stats {
        display: flex;
        flex: 1 0 0;
        gap: 10px;
        align-items: center;
        justify-content: center;
        color: var(--Text-Sub);
    }
</style>
