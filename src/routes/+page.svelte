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
        sortAsc: false,
        pageSize: 30
    }
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

    $: filterCards = async () => {
        // Sort by Cost - TEMPORARY
        filteredCards = cards.sort((a, b) => {
            return (a.cost - b.cost) || (a.baseName.localeCompare(b.baseName));
        });

        // Filter Colors
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

        colorCount = Object.values(filters.color).filter(item => item === true).length;

        console.log(filteredCards);
        console.log(colorCount);
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
                    <button class="button button--dropdown"><span>Show All</span></button>
                    <button class="button button--dropdown">Sorted by Name</button>
                    <button class="button button--dropdown">Ascending</button>
                </div>
                <div class="filters__group filters__group--right">
                    <input class="filters__search-bar" type="search" placeholder="Search..." />
                </div>
            </div>
        </div>
        <div class="col__divider"></div>
        <div class="col__scroll-contain">
            <div class="col__scroll col__scroll--grid">
                {#if !filteredCards}
                    <!--Loading-->
                {:else}
                    {#each filteredCards.slice(0,30) as card, i}
                        <div class="card">
                            {#await preload(card.images.full)}
                                <!--Loading-->
                            {:then}
                                <img class="card__image" src="{card.images.full}" alt="{card.fullName}" in:fade={{duration: 200}} />
                            {/await}
                        </div>
                    {/each}
                {/if}
            </div>
        </div>
        <div class="col__divider"></div>
        <div class="col__section">
            <div class="pagination-contain">
                <button class="button button--left"><img src="images/arrow-left.svg" alt="left arrow" />Previous Page</button>
                <button class="button button--right">Next Page<img src="images/arrow-right.svg" alt="right arrow" /></button>
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
        grid-template-columns: repeat(auto-fill,minmax(16rem,1fr));
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

    .filters__search-bar {
        border: 1px solid var(--Border);
        background: var(--Background-Base);
        background-image: url('/images/icon-search.svg');
        background-position: 6px center;
        background-repeat: no-repeat;
        border-radius: 999px;
        font: inherit;
        padding: 0 10px 0 30px;
        position: relative;

        &::placeholder {
            color: var(--Text-Sub);
        }

        &:active, &:focus-visible {
            outline: none;
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
        border-radius: 4.5% / 3.5%;
        background: var(--Border);
        overflow: hidden;

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
        font-size: 13px;
        line-height: 30px;
        color: var(--Text-Base);
        align-items: center;
        text-transform: uppercase;
        cursor: pointer;
        position: relative;
        gap: 5px;

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
        &::after {
            content: '';
            width: 12px;
            height: 30px;
            background-image: url('/images/dropdown-arrow.svg');
        }
    }

    .pagination-contain {
        display: flex;
        justify-content: space-between;
    }
</style>
