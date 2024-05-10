<script>
    import { onMount } from 'svelte';
    
    onMount(async () => {
        // Test fetch
        const response = await fetch('https://api.lorcast.com/v0');
        const data = await response.json();

        console.log(data);
    });

</script>


<div>
    This is a test page.
</div>

<style>
</style>