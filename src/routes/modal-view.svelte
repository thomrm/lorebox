<script>
	export let showFilterModal;
	export let showAboutModal;

	let dialog;

	$: if (dialog && showFilterModal || dialog && showAboutModal) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog bind:this={dialog} on:close={() => {showFilterModal = false; showAboutModal = false}} on:click|self={() => dialog.close()}>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="modal-content frame-full" on:click|stopPropagation>
		<slot />

		<div class="col__section">
			<div class="actions-split">
				<button class="button" on:click={() => dialog.close()}>Close</button>
				<slot name="action" />
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
		max-width: calc(100% - 2em - 10px);
	}

	dialog::backdrop {
		background: rgba(7, 10, 44, 0.9);
	}

	dialog[open] {
		animation: animate-modal 200ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	dialog[open]::backdrop {
		animation: animate-backdrop 200ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	@keyframes animate-modal {
		from {
			transform: scale(0.90);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	@keyframes animate-backdrop {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
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
		flex-direction: row-reverse;
		justify-content: space-between;
	}
</style>