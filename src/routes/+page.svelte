<script>
    import { onMount } from 'svelte';
    import { fade, slide, fly } from 'svelte/transition';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';

    import { preload } from '$lib/preload.js';

    import Modal from './modal-view.svelte';
    import CardAdded from './card-added.svelte';

    let cards = null;
    let grid;
    
    onMount(async () => {
        // Data provided by Lorcast API
        const response = await fetch('/data/allCards.json');
        const data = await response.json();
        cards = data.results;

        // Read URL and add cards to deck
        const queryD = $page.url.searchParams.get('d') ? $page.url.searchParams.get('d') : "";
        if (queryD) {
            queryD.match(/.{6}/g).forEach(function(x) {
                addCard(bigID(x.slice(1, 6)), parseInt(x[0]));
            });
        }

        filterCards();
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

    // FILTERING AND SORTING CARDS

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
        showSet: {
            set1: false,
            set2: false,
            set3: false,
            set4: false
        },
        sortType: "ink cost",
        sortAsc: true,
        pageSize: 60
    }
    let showPrices = true;
    let searchTerm = null;
    let currentPage = 0;
    let colorCount;
    let filterCount;
    let totalCards;
    let totalPages;

    $: filterCards = async (reset) => {
        // Force a page reset - used for clearing search term
        currentPage = reset ? 0 : currentPage;
        totalCards = reset ? null : totalCards;

        // Sort cards
        if (filters.sortType === 'ink cost') {
            filteredCards = cards.sort((a, b) => {
                return (filters.sortAsc ? a.cost - b.cost : b.cost - a.cost) || (a.name.localeCompare(b.name));
            });
        }
        if (filters.sortType === 'name') {
            filteredCards = cards.sort((a, b) => {
                return (filters.sortAsc ? 1 : -1) * (a.name.localeCompare(b.name));
            });
        }
        if (filters.sortType === 'rarity') {
            filteredCards = cards.sort(rarityCompare);
        }
        if (filters.sortType === 'price') {
            filteredCards = cards.sort((a, b) => {
                return (filters.sortAsc ? a.prices.usd - b.prices.usd : b.prices.usd - a.prices.usd) || (a.name.localeCompare(b.name));
            });
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

        // Filter set
        if (filters.showSet.set1 == true || filters.showSet.set2 == true || filters.showSet.set3 == true || filters.showSet.set4 == true) {
            filteredCards = filteredCards
                .filter(x => !filters.showSet.set1 ? !x.set.code.includes("1") : true)
                .filter(x => !filters.showSet.set2 ? !x.set.code.includes("2") : true)
                .filter(x => !filters.showSet.set3 ? !x.set.code.includes("3") : true)
                .filter(x => !filters.showSet.set4 ? !x.set.code.includes("4") : true);
        }

        // Filter color
        filteredCards = filteredCards.filter(function(x) {
            if (filters.color.amber || filters.color.amethyst || filters.color.emerald || filters.color.ruby || filters.color.sapphire || filters.color.steel) {
                return (filters.color.amber ? x.ink.includes("Amber") : '') ||
                    (filters.color.amethyst ? x.ink.includes("Amethyst") : '') ||
                    (filters.color.emerald ? x.ink.includes("Emerald") : '') ||
                    (filters.color.ruby ? x.ink.includes("Ruby") : '') ||
                    (filters.color.sapphire ? x.ink.includes("Sapphire") : '') ||
                    (filters.color.steel ? x.ink.includes("Steel") : '');
            } else if (colorLock && deck.colors) {
                return (deck.colors.includes("Amber") ? x.ink.includes("Amber") : '') ||
                    (deck.colors.includes("Amethyst") ? x.ink.includes("Amethyst") : '') ||
                    (deck.colors.includes("Emerald") ? x.ink.includes("Emerald") : '') ||
                    (deck.colors.includes("Ruby") ? x.ink.includes("Ruby") : '') ||
                    (deck.colors.includes("Sapphire") ? x.ink.includes("Sapphire") : '') ||
                    (deck.colors.includes("Steel") ? x.ink.includes("Steel") : '');
            } else {
                return x;
            }
        });

        // Filter displayed cards by search term
        filteredCards = searchTerm ? filteredCards.filter(function(x) {
            let name = x.name ? x.name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
            let version = x.version ? x.version.toLowerCase().includes(searchTerm.toLowerCase()) : false;
            let text = x.text ? x.text.toLowerCase().includes(searchTerm.toLowerCase()) : false;
            let classifications = x.classifications ? x.classifications.find((y) => y.toLowerCase().includes(searchTerm.toLowerCase())) : false;

            return name || version || text || classifications;
        }) : filteredCards;

        // Update number of colors selected
        colorCount = Object.values(filters.color).filter(x => x === true).length;

        // Update number of filters selected
        filterCount = Object.values(filters.showType).filter(x => x === true).length + Object.values(filters.showInk).filter(x => x === true).length + Object.values(filters.showSet).filter(x => x === true).length;

        // Set card and page totals
        totalPages = Math.ceil(filteredCards.length / filters.pageSize);
        totalCards = totalCards ? totalCards : filteredCards.length;

        console.log(filteredCards);
    }

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
        filters.showSet.set1 = false;
        filters.showSet.set2 = false;
        filters.showSet.set3 = false;
        filters.showSet.set4 = false;

        // Reset displayed cards
        filterCards(true);
    }

    // Rarity compare for sorting
    const rarityCompare = (a, b) => {
        let aVal = 
            a.rarity === "Common" ? 1 : null || 
            a.rarity === "Uncommon" ? 2 : null ||
            a.rarity === "Rare" ? 3 : null ||
            a.rarity === "Super_rare" ? 4 : null ||
            a.rarity === "Legendary" ? 5 : null;
        let bVal = 
            b.rarity === "Common" ? 1 : null || 
            b.rarity === "Uncommon" ? 2 : null ||
            b.rarity === "Rare" ? 3 : null ||
            b.rarity === "Super_rare" ? 4 : null ||
            b.rarity === "Legendary" ? 5 : null;

        if ( aVal < bVal ) {
            return filters.sortAsc ? -1 : 1;
        }
        if ( aVal > bVal ) {
            return filters.sortAsc ? 1 : -1;
        }
        return (a.name.localeCompare(b.name));
    }

    // DECK CREATION

    let deck = {
        colors: [],
        cardsCount: 0,
        cards: [],
        price: 0
    };
    let colorLock = false;

    const addCard = (cardID, num) => {
        let addNum = num ? num : 1;

        if (deck.cards.find(x => x.id === cardID)) {
            deck.cards.find(x => x.id === cardID).number = Math.min(deck.cards.find(x => x.id === cardID).number + addNum, 4);
        } else {
            // Add new card
            deck.cards.push({
                id: cardID,
                data: cards.filter(x => x.id == cardID)[0],
                number: Math.min(addNum, 4)
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

    const setCard = (cardID, num) => {
        let setNum = num ? Math.min(Math.max(parseInt(num), 0), 4) : 0;

        if (deck.cards.find(x => x.id === cardID)) {
            if (setNum > 0) {
                // Set card number
                deck.cards.find(x => x.id === cardID).number = setNum;
            } else {
                // Remove card
                deck.cards = deck.cards.filter(x => x.id !== cardID);

                // Clear hover
                hoverCard = null;
            }
        } else {
            if (setNum > 0) {
                // Add new card
                deck.cards.push({
                    id: cardID,
                    data: cards.filter(x => x.id == cardID)[0],
                    number: setNum
                });
            } else {
                // Do nothing
            }
        }

        updateDeck();
    }

    const updateDeck = () => {
        // Update deck colors
        deck.colors = [];
        if (deck.cards.some(x => x.data.ink == "Amber")) { deck.colors.push("Amber"); }
        if (deck.cards.some(x => x.data.ink == "Amethyst")) { deck.colors.push("Amethyst"); }
        if (deck.cards.some(x => x.data.ink == "Emerald")) { deck.colors.push("Emerald"); }
        if (deck.cards.some(x => x.data.ink == "Ruby")) { deck.colors.push("Ruby"); }
        if (deck.cards.some(x => x.data.ink == "Sapphire")) { deck.colors.push("Sapphire"); }
        if (deck.cards.some(x => x.data.ink == "Steel")) { deck.colors.push("Steel"); }

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

        // Update price of deck
        deck.price = 0;
        deck.cards.forEach(function(x) {
            deck.price = deck.price + (x.number * (x.data.prices.usd ? x.data.prices.usd : 0));
        });

        // Update URL
        updateURLParams();

        //console.log(deck);
    }

    // Clear added cards and deck colors
    const resetDeck = () => {
        deck = {
            colors: [],
            cardsCount: 0,
            cards: [],
            price: 0
        };
        colorCount = 0;
        colorLock = false;
        filters.color = {
            amber: false,
            amethyst: false,
            emerald: false,
            ruby: false,
            sapphire: false,
            steel: false
        }

        // Update URL
        updateURLParams();

        filterCards(true);
    }

    // Update URL params with added/removed cards
    const updateURLParams = async () => {
        if (deck.cards.length > 0) {
            let string = deck.cards.map(function({id, number}) {
                return String(number)+String(smallID(id));
            }).join('');
            goto('?d='+string);
        } else {
            goto('?');
        }
    }

    // Small ID creation for URL params
    const smallID = (cardID) => {
        let card = cards.filter(x => x.id == cardID)[0];
        let set = card.set.code.padStart(2,'0');
        let id = card.collector_number.padStart(3,'0');

        return set+id;
    }

    // Sort cards in deck by type
    $: characters = deck.cards.filter(x => x.data.type.includes('Character')).sort((a, b) => { return (a.data.cost - b.data.cost) || (a.data.name.localeCompare(b.data.name)); });
    $: actions = deck.cards.filter(x => x.data.type.includes('Action')).sort((a, b) => { return (a.data.cost - b.data.cost) || (a.data.name.localeCompare(b.data.name)); });
    $: items = deck.cards.filter(x => x.data.type.includes('Item')).sort((a, b) => { return (a.data.cost - b.data.cost) || (a.data.name.localeCompare(b.data.name)); });
    $: locations = deck.cards.filter(x => x.data.type.includes('Location')).sort((a, b) => { return (a.data.cost - b.data.cost) || (a.data.name.localeCompare(b.data.name)); });

    // Sort cards in deck by color
    $: amber = deck.cards.filter(x => x.data.ink == 'Amber');
    $: amethyst = deck.cards.filter(x => x.data.ink == 'Amethyst');
    $: emerald = deck.cards.filter(x => x.data.ink == 'Emerald');
    $: ruby = deck.cards.filter(x => x.data.ink == 'Ruby');
    $: sapphire = deck.cards.filter(x => x.data.ink == 'Sapphire');
    $: steel = deck.cards.filter(x => x.data.ink == 'Steel');
    $: unink = deck.cards.filter(x => !x.data.inkwell);

    // Count costs for each color
    $: costs = Array.from({ length: 10 }, (_, i) => {
        const cost = (i + 1).toString();
        return {
            a: deck.cards.filter(x => x.data.ink == deck.colors[0] && x.data.cost == cost).reduce((a, b) => a + b.number, 0),
            b: deck.cards.filter(x => x.data.ink == deck.colors[1] && x.data.cost == cost).reduce((a, b) => a + b.number, 0)
        };
    });

    // OTHER THINGS

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

    // Show deck for small screens
    let showDeck = false;
    $: innerWidth = 0;

    // Scroll element to top
    const scrollToTop = async (node) => {
        node.scroll({ top: 0, behavior: 'instant' });
    }

    // Get scrollbar width
    let scrollOffset;
    let scrollClient;
    $: scrollWidth = scrollOffset - scrollClient;

    // Dropdowns
    let showFilterDropdown = false;
    let showMoreDropdown = false;

    const dropdownFocusLoss = ({ relatedTarget, currentTarget }) => {
        if (relatedTarget instanceof HTMLElement && currentTarget.contains(relatedTarget)) return;
        showFilterDropdown = false;
        showMoreDropdown = false;
    }

    // Modals
    let showFilterModal = false;
    let showAboutModal = false;
</script>

<svelte:head>
	<title>Lorebox</title>
    <meta name="description" content="A Lorcana Deck Builder.">
</svelte:head>

<svelte:window bind:innerWidth />

<Modal bind:showAboutModal>
    <div class="about-contain">
        <div class="col__section">
            <h1>About Lorebox</h1>
        </div>
        <div class="col__divider"></div>
        <div class="col__section">
            <p>Lorebox uses trademarks and/or copyrights associated with Disney Lorcana TCG, used under <a href="https://cdn.ravensburger.com/lorcana/community-code-en">Ravensburger's Community Code Policy</a>. We are expressly prohibited from charging you to use or access this content. Lorebox is not published, endorsed, or specifically approved by Disney or Ravensburger. For more information about Disney Lorcana TCG, visit <a href="https://www.disneylorcana.com/en-US/">https://www.disneylorcana.com/en-US/</a>.</p>
        </div>
        <div class="col__divider"></div>
        <div class="col__section">
            <p>Lorebox is built and maintained by <a href="http://thomasrm.com">ThomRM</a>.<br /> Data is provided by <a href="https://lorcast.com/docs/api">Lorcast</a>.</p>
        </div>
        <div class="col__divider"></div>
    </div>
</Modal>

<Modal bind:showFilterModal>
    {#if innerWidth <= 760}
        <div class="col__section">
            <div class="filters">
                {#if innerWidth <= 560}
                    <fieldset class="filters__group" disabled={colorLock}>
                        <input type="checkbox" id="filter-amber--modal" name="Amber" bind:checked={filters.color.amber} disabled={(colorCount == 2 && !filters.color.amber) ? true : false} on:change={filterCards} />
                        <label class="filter-ink ink-amber" for="filter-amber--modal">
                            <svg width="30px" height="34px"><use href="images/filter-color-icons.svg#amber" /></svg>
                        </label>
                        <input type="checkbox" id="filter-amethyst--modal" name="Amethyst" bind:checked={filters.color.amethyst} disabled={(colorCount == 2 && !filters.color.amethyst) ? true : false} on:change={filterCards} />
                        <label class="filter-ink ink-amethyst" for="filter-amethyst--modal">
                            <svg width="30px" height="34px"><use href="images/filter-color-icons.svg#amethyst" /></svg>
                        </label>
                        <input type="checkbox" id="filter-emerald--modal" name="Emerald" bind:checked={filters.color.emerald} disabled={(colorCount == 2 && !filters.color.emerald) ? true : false} on:change={filterCards} />
                        <label class="filter-ink ink-emerald" for="filter-emerald--modal">
                            <svg width="30px" height="34px"><use href="images/filter-color-icons.svg#emerald" /></svg>
                        </label>
                        <input type="checkbox" id="filter-ruby--modal" name="Ruby" bind:checked={filters.color.ruby} disabled={(colorCount == 2 && !filters.color.ruby) ? true : false} on:change={filterCards} />
                        <label class="filter-ink ink-ruby" for="filter-ruby--modal">
                            <svg width="30px" height="34px"><use href="images/filter-color-icons.svg#ruby" /></svg>
                        </label>
                        <input type="checkbox" id="filter-sapphire--modal" name="Sapphire" bind:checked={filters.color.sapphire} disabled={(colorCount == 2 && !filters.color.sapphire) ? true : false} on:change={filterCards} />
                        <label class="filter-ink ink-sapphire" for="filter-sapphire--modal">
                            <svg width="30px" height="34px"><use href="images/filter-color-icons.svg#sapphire" /></svg>
                        </label>
                        <input type="checkbox" id="filter-steel--modal" name="Steel" bind:checked={filters.color.steel} disabled={(colorCount == 2 && !filters.color.steel) ? true : false} on:change={filterCards} />
                        <label class="filter-ink ink-steel" for="filter-steel--modal">
                            <svg width="30px" height="34px"><use href="images/filter-color-icons.svg#steel" /></svg>
                        </label>
                    </fieldset>
                {/if}
                <div class="filters__group">
                    <div class="dropdown-contain" on:focusout={dropdownFocusLoss}>
                        <button class="button button--dropdown" aria-label="Sort" on:click={() => showFilterDropdown = !showFilterDropdown}>
                            Sort By {filters.sortType}
                        </button>
                        {#if showFilterDropdown}
                            <ul class="dropdown-menu dropdown-menu--left" transition:fly={{duration: 200, y: -5}}>
                                <li><button class="dropdown-menu__item" on:click={() => {filters.sortType = "name"; filterCards(); showFilterDropdown = false; }}>Name</button></li>
                                <li><button class="dropdown-menu__item" on:click={() => {filters.sortType = "ink cost"; filterCards(); showFilterDropdown = false; }}>Ink Cost</button></li>
                                <li><button class="dropdown-menu__item" on:click={() => {filters.sortType = "rarity"; filterCards(); showFilterDropdown = false; }}>Rarity</button></li>
                                {#if showPrices}<li><button class="dropdown-menu__item" on:click={() => {filters.sortType = "price"; filterCards(); showFilterDropdown = false; }}>Price</button></li>{/if}
                            </ul>
                        {/if}
                    </div>
                    <input type="checkbox" id="sort-direction--modal" bind:checked={filters.sortAsc} on:change={filterCards} />
                    <label class="button button--2state" class:show-state2={!filters.sortAsc} for="sort-direction--modal">
                        <span class="state1"><img src="/images/icon-sortAsc.svg" alt="Ascending" />Asc</span>
                        <span class="state2"><img src="/images/icon-sortDesc.svg" alt="Descending" />Desc</span>
                    </label>
                </div>
            </div>
        </div>
        <div class="col__divider"></div>
    {/if}
    <div class="col__section">
        <div class="filters filters--modal">
            <div class="filters__header">Card Types</div>
            <div class="filters__group filters__group--wrap">
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
            <div class="filters__group filters__group--wrap">
                <input type="checkbox" class="checkbox" id="filter-ink" name="Inkable" bind:checked={filters.showInk.ink} on:change={filterCards} />
                <label class="checkbox-item" for="filter-ink">Inkable</label>
                <input type="checkbox" class="checkbox" id="filter-unink" name="Uninkable" bind:checked={filters.showInk.unink} on:change={filterCards} />
                <label class="checkbox-item" for="filter-unink">Uninkable</label>
            </div>
        </div>
    </div>
    <div class="col__divider"></div>
    <div class="col__section">
        <div class="filters filters--modal">
            <div class="filters__header">Set</div>
            <div class="filters__group filters__group--wrap">
                <input type="checkbox" class="checkbox" id="filter-set1" name="Set 1" bind:checked={filters.showSet.set1} on:change={filterCards} />
                <label class="checkbox-item" for="filter-set1">The First Chapter (Set 1)</label>
                <input type="checkbox" class="checkbox" id="filter-set2" name="Set 2" bind:checked={filters.showSet.set2} on:change={filterCards} />
                <label class="checkbox-item" for="filter-set2">Rise of the Floodborn (Set 2)</label>
                <input type="checkbox" class="checkbox" id="filter-set3" name="Set 3" bind:checked={filters.showSet.set3} on:change={filterCards} />
                <label class="checkbox-item" for="filter-set3">Into the Inklands (Set 3)</label>
                <input type="checkbox" class="checkbox" id="filter-set4" name="Set 4" bind:checked={filters.showSet.set4} on:change={filterCards} />
                <label class="checkbox-item" for="filter-set4">Ursula's Return (Set 4) <span class="new-pill">New!</span></label>
            </div>
        </div>
    </div>
    <div class="col__divider"></div>

    <button class="button" slot="action" on:click={resetFilters}>Reset All</button>
</Modal>

<div class="app-contain" class:app-contain--show-deck={showDeck} class:app-contain--hide-deck={!showDeck}>
    <div class="col frame-full">
        {#if innerWidth <= 960}
            <button class="view-change view-change--right" on:click={() => (showDeck = true)}>
                <img src="/images/icon-deck.svg" alt="View Deck" />
            </button>
        {/if}
        <div class="col__section">
            <div class="filters">
                {#if innerWidth > 560}
                    <fieldset class="filters__group">
                        <input type="checkbox" id="filter-amber" name="Amber" bind:checked={filters.color.amber} disabled={(deck.colors.length == 2 && !deck.colors.includes("Amber")) ? true : false} on:change={filterCards} />
                        <label class="filter-ink ink-amber" for="filter-amber">
                            <svg width="30px" height="34px"><use href="images/filter-color-icons.svg#amber" /></svg>
                        </label>
                        <input type="checkbox" id="filter-amethyst" name="Amethyst" bind:checked={filters.color.amethyst} disabled={(deck.colors.length == 2 && !deck.colors.includes("Amethyst")) ? true : false} on:change={filterCards} />
                        <label class="filter-ink ink-amethyst" for="filter-amethyst">
                            <svg width="30px" height="34px"><use href="images/filter-color-icons.svg#amethyst" /></svg>
                        </label>
                        <input type="checkbox" id="filter-emerald" name="Emerald" bind:checked={filters.color.emerald} disabled={(deck.colors.length == 2 && !deck.colors.includes("Emerald")) ? true : false} on:change={filterCards} />
                        <label class="filter-ink ink-emerald" for="filter-emerald">
                            <svg width="30px" height="34px"><use href="images/filter-color-icons.svg#emerald" /></svg>
                        </label>
                        <input type="checkbox" id="filter-ruby" name="Ruby" bind:checked={filters.color.ruby} disabled={(deck.colors.length == 2 && !deck.colors.includes("Ruby")) ? true : false} on:change={filterCards} />
                        <label class="filter-ink ink-ruby" for="filter-ruby">
                            <svg width="30px" height="34px"><use href="images/filter-color-icons.svg#ruby" /></svg>
                        </label>
                        <input type="checkbox" id="filter-sapphire" name="Sapphire" bind:checked={filters.color.sapphire} disabled={(deck.colors.length == 2 && !deck.colors.includes("Sapphire")) ? true : false} on:change={filterCards} />
                        <label class="filter-ink ink-sapphire" for="filter-sapphire">
                            <svg width="30px" height="34px"><use href="images/filter-color-icons.svg#sapphire" /></svg>
                        </label>
                        <input type="checkbox" id="filter-steel" name="Steel" bind:checked={filters.color.steel} disabled={(deck.colors.length == 2 && !deck.colors.includes("Steel")) ? true : false} on:change={filterCards} />
                        <label class="filter-ink ink-steel" for="filter-steel">
                            <svg width="30px" height="34px"><use href="images/filter-color-icons.svg#steel" /></svg>
                        </label>
                    </fieldset>
                {/if}
                <div class="filters__group filters__group--fill">
                    <div class="filters__group" style:width={innerWidth > 760 ? '290px' : 'auto'}>
                        <button class="button" on:click={() => (showFilterModal = true)}>
                            <img src="/images/icon-filter.svg" alt="Filters for cards" />Filters {#if filterCount > 0}({filterCount}){/if}
                        </button>
                        {#if innerWidth > 760}
                            <div class="dropdown-contain" on:focusout={dropdownFocusLoss}>
                                <button class="button button--dropdown" aria-label="Sort" on:click={() => showFilterDropdown = !showFilterDropdown}>
                                    Sort By {filters.sortType}
                                </button>
                                {#if showFilterDropdown}
                                    <ul class="dropdown-menu dropdown-menu--left" transition:fly={{duration: 200, y: -5}}>
                                        <li><button class="dropdown-menu__item" on:click={() => {filters.sortType = "name"; filterCards(); showFilterDropdown = false; }}>Name</button></li>
                                        <li><button class="dropdown-menu__item" on:click={() => {filters.sortType = "ink cost"; filterCards(); showFilterDropdown = false; }}>Ink Cost</button></li>
                                        <li><button class="dropdown-menu__item" on:click={() => {filters.sortType = "rarity"; filterCards(); showFilterDropdown = false; }}>Rarity</button></li>
                                        {#if showPrices}<li><button class="dropdown-menu__item" on:click={() => {filters.sortType = "price"; filterCards(); showFilterDropdown = false; }}>Price</button></li>{/if}
                                    </ul>
                                {/if}
                            </div>
                            <input type="checkbox" id="sort-direction" bind:checked={filters.sortAsc} on:change={filterCards} />
                            <label class="button button--2state" class:show-state2={!filters.sortAsc} for="sort-direction">
                                <span class="state1"><img src="/images/icon-sortAsc.svg" alt="Ascending" />Asc</span>
                                <span class="state2"><img src="/images/icon-sortDesc.svg" alt="Descending" />Desc</span>
                            </label>
                        {/if}
                    </div>
                    <div class="filters__group">
                        <form id="search-form" class="search-form" on:submit|preventDefault={filterCards} on:reset={clearSearch}>
                            <input class="search-form__search-bar" id="card-search" type="text" placeholder="Search..."  bind:value={searchTerm} on:change={filterCards} />
                            {#if searchTerm}
                                <button type="reset" class="search-form__search-clear">
                                    <img src="/images/icon-clear.svg" alt="Clear Search" />
                                </button>
                            {/if}
                        </form> 
                    </div>
                </div>
            </div>
        </div>
        <div class="col__divider"></div>
        <div class="col__scroll-contain">
            {#if hoverCard}
                <button class="hover-view" transition:fade={{duration: 200}} on:click={hideHover} on:mouseleave={hideHover}>
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
            {#if !filteredCards}
                <!--Loading-->
            {:else}
                {#if filteredCards.length === 0}
                    <div class="grid-status">No Results</div>
                {:else}
                    {#key filteredCards}
                        <div class="col__scroll col__scroll--grid" bind:this={grid} style="padding-right: {20 - scrollWidth}px">
                            {#each filteredCards.slice(currentPage * filters.pageSize, currentPage * filters.pageSize + filters.pageSize) as card (card.id)}
                                {@const added = deck.cards.find(x => x.id === card.id) ? deck.cards.find(x => x.id === card.id).number : 0}
                                <div class="card">
                                    <div class="card__image-contain card__image-contain--interactive">
                                        {#await preload(card.image_uris.digital.normal ? card.image_uris.digital.normal : card.image_uris.digital.large)}
                                            <!--Loading-->
                                        {:then}
                                            <div in:fade={{duration: 200}}>
                                                <button class="card__view" on:click={showHover(card.image_uris.digital.large, (card.layout == 'landscape' ? true : false))}>
                                                    <img src="/images/icon-view.svg" alt="View Card" />
                                                </button>
                                                <button class="card__image" on:click={addCard(card.id, 1)}>
                                                    <img src="{card.image_uris.digital.normal ? card.image_uris.digital.normal : card.image_uris.digital.large}" alt="{card.name}" />
                                                </button>
                                                {#if showPrices}
                                                    <div class="card__price">
                                                        <div class="price">
                                                            <span class="text-emerald">&#36;</span>
                                                            <span>
                                                                {#if card.prices.usd}
                                                                    {card.prices.usd.toFixed(2)}
                                                                {:else}
                                                                    --
                                                                {/if}
                                                            </span>
                                                        </div>
                                                    </div>
                                                {/if}
                                            </div>
                                        {/await}
                                    </div>
                                    <div class="card__copies">
                                        <button class="card__copy" class:card__copy--added={added > 0} on:click={setCard(card.id, 1)}>
                                            <img src="/images/copy-added--yes.svg" alt="Copy" />
                                        </button>
                                        <button class="card__copy" class:card__copy--added={added > 1} on:click={setCard(card.id, 2)}>
                                            <img src="/images/copy-added--yes.svg" alt="Copy" />
                                        </button>
                                        <button class="card__copy" class:card__copy--added={added > 2} on:click={setCard(card.id, 3)}>
                                            <img src="/images/copy-added--yes.svg" alt="Copy" />
                                        </button>
                                        <button class="card__copy" class:card__copy--added={added > 3} on:click={setCard(card.id, 4)}>
                                            <img src="/images/copy-added--yes.svg" alt="Copy" />
                                        </button>
                                    </div>
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
                    <button class="button button--left" disabled={currentPage == 0 ? true : false} on:click={() => {currentPage--; scrollToTop(grid);}}>
                        <img src="images/arrow-left.svg" alt="left arrow" />
                        <div class="button__label">Previous<span class="xsmall-hide">&nbsp;Page</span></div>
                    </button>
                </div>

                {#if filteredCards}
                    <div class="pagination__stats">
                        <span class="xsmall-hide">
                            Page {currentPage + 1}
                        </span>
                        <span class="xsmall-hide bullet">&#10022;</span>
                        <span>
                            {totalCards ? (currentPage * filters.pageSize + 1) + " - " + (Math.min((currentPage + 1) * filters.pageSize, totalCards)) + " of " : ""}
                            {totalCards}
                        </span>
                        <!-- <span class="xsmall-hide">
                             {totalCards == 1 ? "Result" : "Results"}
                        </span> -->
                    </div>
                {/if}

                <div class="pagination__buttons pagination__buttons--right">
                    <button class="button button--right" disabled={currentPage == totalPages - 1 || totalPages == 0 || !totalPages ? true : false} on:click={() => {currentPage++; scrollToTop(grid);}}>
                        <div class="button__label">Next<span class="xsmall-hide">&nbsp;Page</span></div>
                        <img src="images/arrow-right.svg" alt="right arrow" />
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div class="col col--right frame-full">
        {#if innerWidth <= 960}
            <button class="view-change view-change--left" on:click={() => (showDeck = false)}>
                <img src="/images/icon-catalog.svg" alt="View Deck" />
            </button>
        {/if}
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
                    <div class="dropdown-contain" on:focusout={dropdownFocusLoss}>
                        <button class="button" aria-label="Sort" on:click={() => showMoreDropdown = !showMoreDropdown}>
                            <img src="/images/icon-more.svg" alt="Options Menu" />
                        </button>
                        {#if showMoreDropdown}
                            <ul class="dropdown-menu dropdown-menu--right" transition:fly={{duration: 200, y: -5}}>
                                <li><a href="/view/{$page.url.searchParams.get('d')}" class="dropdown-menu__item" class:dropdown-menu__item--disabled={deck.cards.length === 0}>View Deck</a></li>
                                <li><button class="dropdown-menu__item" class:dropdown-menu__item--disabled={deck.cards.length === 0} on:click={resetDeck}>Clear Deck</button></li>
                                <li><button class="dropdown-menu__item" on:click={() => (showPrices = !showPrices)}>{#if showPrices}Hide{:else}Show{/if} Prices</button></li>
                                <li><button class="dropdown-menu__item" on:click={() => (showAboutModal = true)}>About Lorebox</button></li>
                            </ul>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
        <div class="col__divider"></div>
        <div class="col__section">
            <div class="deck-stats">
                <div class="deck-graph">
                    <div class="deck-graph__bars">
                        {#each costs as cost}
                            {@const scale =     costs.some(obj => obj.a > 40 || obj.b > 40) ? 1 : 
                                                costs.some(obj => obj.a > 20 || obj.b > 20) ? 2 : 
                                                costs.some(obj => obj.a > 10 || obj.b > 10) ? 4 : 8}
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
                            <div class="deck-stats__color text-grey"><span>{unink.reduce((a,b) => a + b.number, 0)}</span> Uninkable</div>
                        </div>
                        {#if showPrices}
                            <div class="deck-stats__counts">
                                <div class="price"><span class="text-emerald">&#36;</span>{deck.price.toFixed(2)}</div>
                            </div>
                        {/if}
                    {/if}
                </div>
            </div>
        </div>
        <div class="col__divider"></div>
        <div class="col__scroll-contain">
            {#if deck.cards.length === 0}
                <div class="grid-status grid-status--small" transition:fade={{duration: 200}}>No Cards Added</div>
            {/if}
            <div class="col__scroll" bind:offsetWidth={scrollOffset} bind:clientWidth={scrollClient} style="padding-right: {20 - scrollWidth}px">
                <div class="deck">
                    <div class="deck__section">
                        {#if characters.length !== 0}
                            <div class="deck__label" transition:slide={{duration: 200}}>
                                <div transition:fade={{duration: 200}}>Characters <span class="deck__label-sub">({characters.reduce((a,b) => a + b.number, 0)})</span></div>
                            </div>
                        {/if}
                        {#each characters as card (card.id)}
                            <CardAdded card={card} prices={showPrices} on:add={addCard(card.id), 1} on:remove={removeCard(card.id)} on:hoverEnter={showHover(card.data.image_uris.digital.large, (card.data.layout == 'landscape' ? true : false))} on:hoverLeave={hideHover} />
                        {/each}
                    </div>
                    <div class="deck__section">
                        {#if actions.length !== 0}
                            <div class="deck__label" transition:slide={{duration: 200}}>
                                <div transition:fade={{duration: 200}}>Actions <span class="deck__label-sub">({actions.reduce((a,b) => a + b.number, 0)})</span></div>
                            </div>
                        {/if}
                        {#each actions as card (card.id)}
                            <CardAdded card={card} prices={showPrices} on:add={addCard(card.id), 1} on:remove={removeCard(card.id)} on:hoverEnter={showHover(card.data.image_uris.digital.large, (card.data.layout == 'landscape' ? true : false))} on:hoverLeave={hideHover} />
                        {/each}
                    </div>
                    <div class="deck__section">
                        {#if items.length !== 0}
                            <div class="deck__label" transition:slide={{duration: 200}}>
                                <div transition:fade={{duration: 200}}>Items <span class="deck__label-sub">({items.reduce((a,b) => a + b.number, 0)})</span></div>
                            </div>
                        {/if}
                        {#each items as card (card.id)}
                            <CardAdded card={card} prices={showPrices} on:add={addCard(card.id), 1} on:remove={removeCard(card.id)} on:hoverEnter={showHover(card.data.image_uris.digital.large, (card.data.layout == 'landscape' ? true : false))} on:hoverLeave={hideHover} />
                        {/each}
                    </div>
                    <div class="deck__section">
                        {#if locations.length !== 0}
                            <div class="deck__label" transition:slide={{duration: 200}}>
                                <div transition:fade={{duration: 200}}>Locations <span class="deck__label-sub">({locations.reduce((a,b) => a + b.number, 0)})</span></div>
                            </div>
                        {/if}
                        {#each locations as card (card.id)}
                            <CardAdded card={card} prices={showPrices} on:add={addCard(card.id), 1} on:remove={removeCard(card.id)} on:hoverEnter={showHover(card.data.image_uris.digital.large, (card.data.layout == 'landscape' ? true : false))} on:hoverLeave={hideHover} />
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .new-pill {
        display: flex;
        height: 18px;
        justify-content: center;
        align-items: center;
        border-radius: 999px;
        background: var(--Background-Color);
        color: var(--White);
        padding: 0 8px;
        font-size: 9px;
        font-weight: bold;
    }

    .about-contain {
        & h1 {
            font-size: 30px;
            font-family: inherit;
            padding: 10px 0;
            text-align: center;
            color: var(--Black);
        }

        & p {
            line-height: 1.5;
            padding: 10px 0;
        }

        & a {
            color: var(--Text-Link);
            white-space: nowrap;
        }
    }

    .view-change {
        width: 50px;
        height: 100px;
        position: absolute;
        top: 50%;
        margin-top: -50px;
        z-index: 3;
        border: none;
        outline: none;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .view-change--right {
        background: url('/images/view-change--right.svg');
        right: 0;
    }

    .view-change--left {
        background: url('/images/view-change--left.svg');
        left: 0;
    }

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
        justify-content: space-between;
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
        justify-content: space-between;

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
    }

    .deck-stats__color {
        & span:first-child {
            color: var(--White);
            font-weight: bold;
        }
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

    .deck {
        column-count: 1;
        column-gap: 20px;
    }

    .deck__section {
        display: flex;
        flex-direction: column;
        page-break-inside: avoid;
        break-inside: avoid;
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
        gap: var(--Page-Gutters);
        padding: var(--Page-Gutters);
        overflow-x: clip;
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
        flex-wrap: wrap;
        justify-content: center;
        flex: 1;
    }

    .filters--modal {
        flex-direction: column;
        gap: 5px;
    }

    .filters__group {
        display: flex;
        gap: 5px;
        flex-shrink: 0;

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

    .filters__group--wrap {
        flex-wrap: wrap;
    }

    .filter-ink {
        display: flex;
        align-items: center;
        height: 30px;
        width: 30px;
        cursor: pointer;

        --Filter-Base: var(--Black);
        --Filter-Icon: currentColor;
    }

    .filters__group--fill {
        display: flex;
        flex-shrink: 0;
        flex-grow: 1;
        justify-content: space-between;
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
        font-size: 16px;
        padding: 0 10px 0 30px;
        position: relative;
        height: 30px;
        box-sizing: border-box;

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

    :root {
        --Hover-Width: 340px;
        --Page-Gutters: 20px;
        --Grid-Gutters: 5px;
    }

    .xsmall-hide { display: flex; }

    @keyframes -global-show-deck {
        0% { transform: translateX(0); }
        100% { transform: translateX(calc(-100vw + 10px)); }
    }

    @keyframes -global-hide-deck {
        0% { transform: translateX(calc(-100vw + 10px)); }
        100% { transform: translateX(0); }
    }

    @media screen and (max-width: 1160px) {
        :root {
            --Hover-Width: 320px;
        }

        .col__scroll--grid {
            grid-template-columns: repeat(auto-fill,minmax(16.5rem,1fr));
        }
    }

    @media screen and (max-width: 960px) {
        :root {
            --Hover-Width: 300px;
            --Page-Gutters: 10px;
        }

        .col {
            min-width: calc(100vw - 20px);
        }

        .app-contain--show-deck .col {
            animation-name: show-deck;
            animation-duration: 300ms;
            animation-fill-mode: forwards;
            animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
        }

        .app-contain--hide-deck .col {
            animation-name: hide-deck;
            animation-duration: 300ms;
            animation-fill-mode: forwards;
            animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
        }

        .deck {
            column-count: 2;
        }
    }

    @media screen and (max-width: 760px) {
        :root {
            --Hover-Width: 280px;
        }

        .col__scroll--grid {
            grid-template-columns: repeat(auto-fill,minmax(15rem,1fr));
        }
    }

    @media screen and (max-width: 560px) {
        @keyframes -global-show-deck {
            0% { transform: translateX(0); }
            100% { transform: translateX(calc(-100vw + 5px)); }
        }

        @keyframes -global-hide-deck {
            0% { transform: translateX(calc(-100vw + 5px)); }
            100% { transform: translateX(0); }
        }

        :root {
            --Hover-Width: 260px;
            --Page-Gutters: 5px;
        }

        .col {
            min-width: calc(100vw - 10px);
        }

        .deck {
            column-count: 1;
        }

        .col__scroll--grid {
            grid-template-columns: repeat(3,1fr);
        }

        .xsmall-hide { display: none; }
    }
</style>
