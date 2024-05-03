<script>
    import '../lib/base.css';
    import '../lib/colors.css';
    import { onMount } from 'svelte';
 
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
        scrollbar-color: var(--Border) var(--Background-Base);
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