<script>
	export let showFilterModal;

	let dialog;

	$: if (dialog && showFilterModal) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog bind:this={dialog} on:close={() => (showFilterModal = false)} on:click|self={() => dialog.close()}>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="modal-content frame-full" on:click|stopPropagation>
		<slot />

		<div class="col__section">
			<div class="actions-split">
				<slot name="action" />
				<button class="button" on:click={() => dialog.close()}>Close</button>
			</div>
		</div>
	</div>
</dialog>

<style>
	dialog {
		width: 600px;
		border-radius: 12px;
		border: none;
		padding: 10px;
		background: var(--Background-Base);
	}

	dialog::backdrop {
		background: rgba(7, 10, 44, 0.9);
	}

	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}

	.modal-content {
		padding: 5px;
		min-height: 120px;
	}

	.col__section {
		padding: 15px;
	}

	.actions-split {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}
</style>