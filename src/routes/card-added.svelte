<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

    import { slide, fade } from 'svelte/transition';

    const add = () => dispatch('add');
    const remove = () => dispatch('remove');

    const hoverEnter = () => dispatch('hoverEnter');
    const hoverLeave = () => dispatch('hoverLeave');

    export let card;
    export let prices;

    const cardColors = (card.data.inks ? card.data.inks : [card.data.ink]).sort();
    
    let colorClass;

    if (cardColors.length > 1) {
        colorClass = 'text-'+cardColors.join('-');
    } else {
        colorClass = 'text-'+cardColors[0];
    }
</script>


<!-- svelte-ignore a11y-mouse-events-have-key-events a11y-no-static-element-interactions -->
<div class="card-added-contain" on:mouseover={hoverEnter} on:mouseleave={hoverLeave} transition:slide={{duration: 200}}>
    <div class="card-added" id="card-{card.id}" transition:fade={{duration: 200}}>
        <div class="card-added__cost" class:card-added__cost--ink={card.data.inkwell} class:card-added__cost--noink={!card.data.inkwell}>
            {card.data.cost}
        </div>
        <div class="card-added__name">
            <div class="card-added__base-name"><span class={colorClass}>{card.data.name}</span></div>
            <div class="card-added__subtitle">
                {#if card.data.version}
                    {card.data.version}
                {/if}
            </div>
        </div>
        {#if card.data.prices.usd && prices}
            <div class="price">
                <span class="text-Emerald">&#36;</span>
                {card.data.prices.usd.toFixed(2)}
            </div>
        {/if}
        <div class="card-added__add-remove">
            <button on:click={remove}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 8H15L13 10H3L5 8Z" fill="currentColor"/>
                </svg>
            </button>
            <div class="card-added__count">{card.number}<span class="card-added__x">X</span></div>
            <button on:click={add} disabled={card.number == 4}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M10 8V4H8V8H5L3 10H8V14H10V10H13L15 8H10Z" fill="currentColor" />
                </svg>
            </button>
        </div>
    </div>
</div>

<style>
    .card-added-contain {
        padding-bottom: 1px;
    }

    .card-added {
        display: flex;
        align-items: center;
        height: 40px;
        background: var(--Background-Dark);
        color: var(--Background-Base);
        border-radius: 999px;
        gap: 5px;
    }

    .card-added__cost {
        display: flex;
        width: 40px;
        height: 40px;
        justify-content: center;
        align-items: center;
        flex-shrink: 0;
        color: var(--White);
        font-size: 14px;
        font-weight: 500;
        line-height: 1;
    }

    .card-added__cost--ink {
        background-image: url('/images/inkwell--ink.svg');
    }

    .card-added__cost--noink {
        background-image: url('/images/inkwell--noink.svg');
    }

    .card-added__name {
        display: flex;
        flex: 1 0 0;
        min-width: 100px;
        flex-direction: column;
        justify-content: center;
        line-height: 1;
    }

    .card-added__base-name {
        text-transform: uppercase;
        font-weight: bold;
        font-size: 14px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        letter-spacing: 0.02em;
    }

    .card-added__subtitle {
        display: flex;
        gap: 3px;
        font-size: 12px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }

    .card-added__count {
        color: var(--White);
        display: flex;
        width: 20px;
        height: 24px;
        justify-content: center;
        font-size: 18px;
        font-weight: bold;
        align-items: center;
        line-height: 1;
        gap: 2px;
    }

    .card-added__x {
        color: var(--Text-Grey);
        font-size: 10px;
    }

    .card-added__add-remove {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 8px 8px 8px 0;
        gap: 2px;

        & button {
            display: flex;
            width: 24px;
            height: 24px;
            padding: 0;
            justify-content: center;
            align-items: center;
            color: var(--Gold);
            background: none;
            border-radius: 999px;
            border: 1px solid currentColor;
            cursor: pointer;
            transition: transform 200ms;
            transform: translateZ(0);

            &:disabled {
                opacity: 0.35;
                cursor: default;
            }

            &:not(:disabled):active {
                transform: scale(0.95);
            }
        }
    }
</style>