<script>
    import { onMount } from 'svelte';
    import { preload } from '../lib/preload.js';
    import { fade } from 'svelte/transition';

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
            action: true,
            character: true,
            item: true,
            location: true
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
        filteredCards = filteredCards
            .filter(x => 
                !filters.showType.action ? !x.type.includes("Action") : x.type.includes("Action") ||
                !filters.showType.character ? !x.type.includes("Character") : x.type.includes("Character") ||
                !filters.showType.item ? !x.type.includes("Item") : x.type.includes("Item") ||
                !filters.showType.location ? !x.type.includes("Location") : x.type.includes("Location")
            );

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
</script>

<div class="app-contain">
    <div class="col frame-full">
        <div class="col__section">
            <div class="filters">
                <div class="filters__group filters__group--ink">
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
                </div>
                <div class="filters__group">
                    <button class="button">
                        <img src="./images/icon-filter.svg" alt="Filters" />Filter
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
                    <form class="search-form" on:submit|preventDefault={filterCards} on:reset={clearSearch}>
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
            {#if !filteredCards}
                <!--Loading-->
            {:else}
                {#if filteredCards.length === 0}
                    <div class="grid-status">No Results</div>
                {:else}
                    {#key filteredCards}
                        <div class="col__scroll col__scroll--grid">
                            {#each filteredCards.slice(currentPage * filters.pageSize, currentPage * filters.pageSize + filters.pageSize) as card, i}
                                <div class="card">
                                    {#await preload(card.images.full)}
                                        <!--Loading-->
                                    {:then}
                                        <img class="card__image" src="{card.images.full}" alt="{card.fullName}" in:fade={{duration: 200}} />
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
            <div class="deck-total">0/60</div>
        </div>
        <div class="col__divider"></div>
        <div class="col__section">
            Deck Stats
        </div>
        <div class="col__divider"></div>
        <div class="col__scroll-contain">
            <div class="col__scroll">
                Deck List
            </div>
        </div>
    </div>
</div>

<style>
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
    }

    .col--right {
        min-width: 320px;
        flex: 0;
    }

    .col__section {
        padding: 15px;
    }

    .col__scroll-contain {
        padding: 0;
        overflow: hidden;
        position: relative;
        display: flex;
        flex: 1 0 0;
    }

    .col__scroll {
        padding: 15px;
        height: 100%;
        width: 100%;
        box-sizing: border-box;
        overflow-y: scroll;
    }

    .col__scroll--grid {
        display: grid;
        grid-template-columns: repeat(auto-fill,minmax(18rem,1fr));
        grid-auto-rows: min-content;
        gap: 10px;
    }

    .col__divider {
        height: 1px;
        margin: 0 15px;
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
    }

    .frame-full {
        position: relative;
        border-image: url('/images/frame-full.svg');
        border-image-slice: 60 60 60 60;
        border-image-width: 60px 60px 60px 60px;

        &::before, &::after {
            content: '';
            position: absolute;
            top: 50%;
            width: 12px;
            height: 24px;
            margin-top: -12px;
        }

        &::before {
            left: 0;
            background-image: url('/images/frame-full-left.svg');

        }

        &::after {
            right: 0;
            background-image: url('/images/frame-full-right.svg');

        }
    }

    .filters {
        display: flex;
        gap: 15px;
    }

    .filters__group {
        display: flex;
        gap: 10px;

        & input[type='checkbox'] {
            display: none;

            &:not(:checked) + label {
                --Filter-Base: var(--Background-Dark);
                --Filter-Icon: var(--Gold);
            }

            &:disabled + label {
                --Filter-Base: var(--Border);
                --Filter-Icon: var(--Background-Base);
                cursor: default;
            }
        }
    }

    .filters__group--ink {
        gap: 5px;
    }

    .filters__group--right {
        display: flex;
        flex: 1 0 0;
        justify-content: flex-end;
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

    .ink-amber { color: var(--Ink-Amber); }
    .ink-amethyst { color: var(--Ink-Amethyst); }
    .ink-emerald { color: var(--Ink-Emerald); }
    .ink-ruby { color: var(--Ink-Ruby); }
    .ink-sapphire { color: var(--Ink-Sapphire); }
    .ink-steel { color: var(--Ink-Steel); }

    .deck-total {
        font-size: 20px;
        font-weight: bold;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .card {
        display: flex;
        transition: transform 200ms;
        cursor: pointer;
        position: relative;
        padding-top: 140%;
        height: 0;
        border-radius: 4.5% / 3.5%;
        background: var(--Border);
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
        top: 0;
        left: 0;
    }

    .button {
        border-image: url('/images/background-button.svg');
        border-image-slice: 15;
        border-image-width: 15px;
        background: var(--Background-Base);
        padding: 0 10px;
        display: flex;
        height: 30px;
        font: inherit;
        font-weight: bold;
        font-size: 14px;
        color: var(--Text-Base);
        align-items: center;
        text-transform: uppercase;
        cursor: pointer;
        position: relative;
        gap: 5px;
        line-height: 30px;

        &::before {
            content: '';
            position: absolute;
            left: 50%;
            right: 50%;
            height: 34px;
            border-top: 1px solid var(--Border);
            border-bottom: 1px solid var(--Border);
            transition: left 200ms, right 200ms;
        }

        &:disabled {
            color: var(--Border);
            cursor: default;
        }

        &:hover {
            &::before {
                left: 5px;
                right: 5px;
            }
        }
    }

    .button--left {
        padding-left: 5px;
    }

    .button--right {
        padding-right: 5px;
    }

    .button--dropdown {
        background-image: url('/images/dropdown-arrow.svg');
        background-repeat: no-repeat;
        background-position: center right 10px;
        padding-right: 30px;
        appearance: none;

        &:focus-visible {
            outline: none;
        }
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
