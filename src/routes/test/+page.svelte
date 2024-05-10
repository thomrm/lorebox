<script>
    import { onMount } from 'svelte';

    let apiString = 'https://api.lorcast.com/v0/cards/search?q=rarity:common%20OR%20uncommon%20OR%20rare%20OR%20super_rare%20OR%20legendary';
    
    onMount(async () => {
        // Test fetch
        const response = await fetch(apiString, {
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();

        console.log(data);
    });

</script>


<div>
    This is a test page.
</div>

<style>
</style>