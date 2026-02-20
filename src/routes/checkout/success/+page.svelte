<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { untrack } from 'svelte';
	import { cart } from '$lib/stores/cart.svelte';

	let { data } = $props();

	$effect(() => {
		untrack(() => cart.clear());
	});
</script>

<section class="bg-cream py-28 md:py-32">
	<div class="container mx-auto max-w-2xl px-4">
		<div class="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-md md:p-10">
			<div
				class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-8 w-8"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M5 13l4 4L19 7"
					/>
				</svg>
			</div>

			<h1 class="font-serif text-3xl font-bold text-primary md:text-4xl">
				{m.order_success_title()}
			</h1>
			<p class="mx-auto mt-3 max-w-xl text-gray-700">
				{m.order_success_text()}
			</p>

			{#if data.orderNumber}
				<div class="mx-auto mt-6 max-w-sm rounded-xl border border-gray-100 bg-cream/50 p-4">
					<p class="text-sm text-gray-500">Bestellnummer</p>
					<p class="mt-1 font-serif text-2xl font-bold text-primary">{data.orderNumber}</p>
				</div>

				<a
					href="/bestellung?id={data.orderNumber}"
					class="mt-5 inline-flex rounded-lg border border-primary/20 bg-white px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
				>
					{m.order_status_lookup()}
				</a>
			{/if}

			<div class="mt-4">
				<a
					href="/"
					class="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
				>
					{m.nav_home()}
				</a>
			</div>
		</div>
	</div>
</section>
