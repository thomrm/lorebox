<script>
    import '../lib/base.css';
    import '../lib/colors.css';
    import '../lib/cards.css';
    import { onMount } from 'svelte';
    import { dev } from '$app/environment';
    import { inject } from '@vercel/analytics';
 
    inject({ mode: dev ? 'development' : 'production' });

    let ready = false;

    onMount(() => {
        ready = true;
    });
</script>

{#if ready}
    <div class="content-contain">
        <slot />
    </div>
{/if}

<style>
    :root {
        font-size: 10px;
        font-family: 'Barlow Condensed', Sans-Serif;
        background-color: var(--Background-Base);
        scrollbar-color: var(--Border) transparent;
    }

    .content-contain {
        display: flex;
        flex-direction: column;
        width: 100vw;
        height: 100dvh;
        box-sizing: border-box;
        font-size: 1.4rem;
    }
</style>