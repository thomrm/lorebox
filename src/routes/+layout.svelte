<script>
    import '../lib/base.css';
    import '../lib/colors.css';
    import { onMount } from 'svelte';
    import { inject } from '@vercel/analytics';
 
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