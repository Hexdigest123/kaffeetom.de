<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { cart } from '$lib/stores/cart.svelte';
	import { locations, formatPrice } from '$lib/config';

	type FulfillmentType = 'pickup' | 'shipping';

	let fulfillmentType = $state<FulfillmentType>('pickup');
	let locationId = $state(locations[0].id);
	let customerName = $state('');
	let customerPhone = $state('');
	let customerEmail = $state('');
	let street = $state('');
	let city = $state('');
	let zip = $state('');
	let notes = $state('');
	let isSubmitting = $state(false);
	let submitError = $state('');
	let shopDisabled = $state(false);
	let shippingCost = $state(0);
	let shippingFree = $state(false);
	let shippingFreeThreshold = $state(20000);

	$effect(() => {
		fetch('/api/store-status')
			.then((r) => r.json())
			.then((data: { open: boolean; shopEnabled: boolean }) => {
				shopDisabled = !data.shopEnabled;
			})
			.catch(() => {});
	});

	$effect(() => {
		if (fulfillmentType === 'shipping' && cart.totalPrice > 0) {
			fetch(`/api/shipping?subtotal=${cart.totalPrice}`)
				.then((r) => r.json())
				.then((data: { cost: number; isFree: boolean; freeThreshold: number }) => {
					shippingCost = data.cost;
					shippingFree = data.isFree;
					shippingFreeThreshold = data.freeThreshold;
				})
				.catch(() => {});
		} else {
			shippingCost = 0;
			shippingFree = false;
		}
	});

	const totalWithShipping = $derived(
		cart.totalPrice + (fulfillmentType === 'shipping' ? shippingCost : 0)
	);

	async function handleCheckout(event: SubmitEvent) {
		event.preventDefault();
		if (cart.isEmpty || isSubmitting) return;

		submitError = '';
		isSubmitting = true;

		try {
			const response = await fetch('/api/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					items: cart.items.map((i) => ({
						productId: i.productId,
						quantity: i.quantity
					})),
					fulfillmentType,
					locationId: fulfillmentType === 'pickup' ? locationId : undefined,
					customerName,
					customerPhone,
					customerEmail: customerEmail || undefined,
					shippingAddress: fulfillmentType === 'shipping' ? { street, city, zip } : undefined,
					notes: notes || undefined
				})
			});

			const data = await response.json();
			if (data.url) {
				window.location.href = data.url;
				return;
			}

			submitError = data.message ?? 'Checkout konnte nicht gestartet werden.';
		} catch {
			submitError = 'Checkout konnte nicht gestartet werden. Bitte versuchen Sie es erneut.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<section class="min-h-screen bg-cream py-24 md:py-28">
	<div class="container mx-auto px-4">
		<h1 class="mb-8 text-center font-serif text-3xl font-bold text-primary md:mb-10 md:text-4xl">
			{m.checkout_title()}
		</h1>

		{#if shopDisabled}
			<div
				class="mx-auto mb-6 max-w-xl rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center shadow-sm"
			>
				<p class="font-serif text-lg font-bold text-gray-700">
					Online-Bestellungen sind derzeit nicht verfügbar
				</p>
				<p class="mt-2 text-sm text-gray-500">Bitte besuchen Sie uns vor Ort.</p>
				<a
					href="/"
					class="mt-4 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
				>
					{m.back()}
				</a>
			</div>
		{:else if cart.isEmpty}
			<div
				class="mx-auto max-w-xl rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm"
			>
				<p class="text-gray-700">{m.cart_empty()}</p>
				<a
					href="/verkauf"
					class="mt-6 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
				>
					{m.hero_cta()}
				</a>
			</div>
		{:else}
			<div class="grid gap-6 lg:grid-cols-2">
				<div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-7">
					<div class="mb-4 flex items-center justify-between">
						<h2 class="font-serif text-2xl font-bold text-primary">
							{m.cart_title()}
						</h2>
						<a
							href="/verkauf"
							class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:border-primary hover:text-primary"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15 19l-7-7 7-7"
								/>
							</svg>
							{m.back()}
						</a>
					</div>

					<div class="space-y-3">
						{#each cart.items as item, index}
							<div class="rounded-lg border border-gray-100 bg-cream/50 p-3">
								<div class="flex items-start gap-3">
									<img src={item.image} alt={item.name} class="h-16 w-16 rounded-md object-cover" />
									<div class="min-w-0 flex-1">
										<p class="text-sm font-semibold text-gray-900">{item.name}</p>
										<p class="text-sm font-semibold text-primary">
											{formatPrice(item.price * item.quantity)}
										</p>
									</div>
								</div>
								<div class="mt-2 flex items-center justify-between">
									<div class="flex items-center gap-1">
										<button
											type="button"
											onclick={() => cart.updateQuantity(index, item.quantity - 1)}
											class="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition-colors hover:border-primary hover:text-primary"
											aria-label="Decrease quantity"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-3.5 w-3.5"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M20 12H4"
												/>
											</svg>
										</button>
										<span class="w-8 text-center text-sm font-semibold text-gray-800"
											>{item.quantity}</span
										>
										<button
											type="button"
											onclick={() => cart.updateQuantity(index, item.quantity + 1)}
											class="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition-colors hover:border-primary hover:text-primary"
											aria-label="Increase quantity"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-3.5 w-3.5"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M12 4v16m8-8H4"
												/>
											</svg>
										</button>
									</div>
									<button
										type="button"
										onclick={() => cart.removeItem(index)}
										class="text-xs text-red-500 transition-colors hover:text-red-700"
									>
										{m.cart_remove()}
									</button>
								</div>
							</div>
						{/each}
					</div>

					<div class="mt-5 space-y-2 border-t border-gray-100 pt-4">
						<div class="flex items-center justify-between">
							<span class="text-sm text-gray-600">Zwischensumme</span>
							<span class="text-sm font-semibold text-gray-800">{formatPrice(cart.totalPrice)}</span
							>
						</div>
						{#if fulfillmentType === 'shipping'}
							<div class="flex items-center justify-between">
								<span class="text-sm text-gray-600">{m.checkout_shipping()}</span>
								<span class="text-sm font-semibold text-gray-800">
									{shippingFree ? 'Kostenlos' : formatPrice(shippingCost)}
								</span>
							</div>
							{#if !shippingFree}
								<p class="text-xs text-copper">
									{m.checkout_free_shipping({ threshold: formatPrice(shippingFreeThreshold) })}
								</p>
							{/if}
						{/if}
						<div class="flex items-center justify-between pt-2">
							<span class="font-semibold text-gray-600">{m.cart_total()}</span>
							<span class="font-serif text-2xl font-bold text-primary"
								>{formatPrice(totalWithShipping)}</span
							>
						</div>
					</div>
				</div>

				<form
					class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-7"
					onsubmit={handleCheckout}
				>
					<h2 class="mb-4 font-serif text-2xl font-bold text-primary">Bestelldetails</h2>

					<fieldset class="mb-4">
						<legend class="mb-2 text-sm font-semibold text-gray-700">
							Abholung oder Versand
						</legend>
						<div class="grid grid-cols-2 gap-2">
							<button
								type="button"
								onclick={() => (fulfillmentType = 'pickup')}
								class="rounded-lg border px-3 py-2 text-sm font-semibold transition-colors {fulfillmentType ===
								'pickup'
									? 'border-primary bg-primary text-white'
									: 'border-gray-200 bg-white text-gray-700 hover:border-primary/40'}"
							>
								{m.checkout_pickup()}
							</button>
							<button
								type="button"
								onclick={() => (fulfillmentType = 'shipping')}
								class="rounded-lg border px-3 py-2 text-sm font-semibold transition-colors {fulfillmentType ===
								'shipping'
									? 'border-primary bg-primary text-white'
									: 'border-gray-200 bg-white text-gray-700 hover:border-primary/40'}"
							>
								{m.checkout_shipping()}
							</button>
						</div>
					</fieldset>

					{#if fulfillmentType === 'pickup'}
						<div class="mb-4">
							<label for="location" class="mb-2 block text-sm font-semibold text-gray-700">
								{m.checkout_select_store()}
							</label>
							<select
								id="location"
								bind:value={locationId}
								class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-primary focus:ring-0"
							>
								{#each locations as loc}
									<option value={loc.id}>{loc.name} — {loc.address}, {loc.zip} {loc.city}</option>
								{/each}
							</select>
						</div>
					{/if}

					{#if fulfillmentType === 'shipping'}
						<div class="mb-4">
							<label for="street" class="mb-2 block text-sm font-semibold text-gray-700">
								{m.checkout_address()}
							</label>
							<input
								id="street"
								type="text"
								bind:value={street}
								required
								placeholder="Straße und Hausnummer"
								class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-primary focus:ring-0"
							/>
						</div>
						<div class="mb-4 grid grid-cols-2 gap-3">
							<div>
								<label for="zip" class="mb-2 block text-sm font-semibold text-gray-700">
									{m.checkout_zip()}
								</label>
								<input
									id="zip"
									type="text"
									bind:value={zip}
									required
									placeholder="PLZ"
									class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-primary focus:ring-0"
								/>
							</div>
							<div>
								<label for="city" class="mb-2 block text-sm font-semibold text-gray-700">
									{m.checkout_city()}
								</label>
								<input
									id="city"
									type="text"
									bind:value={city}
									required
									placeholder="Stadt"
									class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-primary focus:ring-0"
								/>
							</div>
						</div>
					{/if}

					<div class="mb-4">
						<label for="name" class="mb-2 block text-sm font-semibold text-gray-700">
							{m.checkout_name()}
						</label>
						<input
							id="name"
							type="text"
							bind:value={customerName}
							required
							class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-primary focus:ring-0"
						/>
					</div>

					<div class="mb-4">
						<label for="phone" class="mb-2 block text-sm font-semibold text-gray-700">
							{m.checkout_phone()}
						</label>
						<input
							id="phone"
							type="tel"
							bind:value={customerPhone}
							required
							class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-primary focus:ring-0"
						/>
					</div>

					<div class="mb-4">
						<label for="email" class="mb-2 block text-sm font-semibold text-gray-700">
							{m.checkout_email()}
						</label>
						<input
							id="email"
							type="email"
							bind:value={customerEmail}
							class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-primary focus:ring-0"
						/>
					</div>

					<div class="mb-5">
						<label for="notes" class="mb-2 block text-sm font-semibold text-gray-700">
							{m.checkout_notes()}
						</label>
						<textarea
							id="notes"
							bind:value={notes}
							rows="3"
							class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-primary focus:ring-0"
						></textarea>
					</div>

					<div class="mb-4 flex items-center justify-between rounded-lg bg-cream/50 px-3 py-2">
						<span class="text-sm text-gray-600">{m.cart_total()}</span>
						<span class="font-serif text-xl font-bold text-primary"
							>{formatPrice(totalWithShipping)}</span
						>
					</div>

					{#if submitError}
						<p class="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
							{submitError}
						</p>
					{/if}

					<p class="mb-3 text-xs text-gray-500">
						{m.price_incl_tax()}
					</p>

					<button
						type="submit"
						disabled={isSubmitting}
						class="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
					>
						{isSubmitting ? m.loading() : m.checkout_pay()}
					</button>
				</form>
			</div>
		{/if}
	</div>
</section>
