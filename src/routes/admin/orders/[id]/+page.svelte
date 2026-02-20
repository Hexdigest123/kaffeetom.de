<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatPrice, orderStatusLabels } from '$lib/config';

	let { data, form } = $props();

	let selectedAction = $state('markInProcess');
	let showRefundModal = $state(false);

	const actionOptions = [
		{ value: 'markInProcess', label: 'In Bearbeitung setzen' },
		{ value: 'markFulfilled', label: 'Als abgeschlossen markieren' },
		{ value: 'markShipped', label: 'Als versendet markieren' },
		{ value: 'markCancelled', label: 'Stornieren' }
	];

	const refundableStatuses = [
		'paid',
		'in_process',
		'fulfilled',
		'shipped',
		'cancellation_requested'
	];
	const canRefund = $derived(
		refundableStatuses.includes(data.order.status) && !!data.order.stripePaymentIntentId
	);

	function formatDate(iso: string | null): string {
		if (!iso) return '-';
		return new Date(iso).toLocaleString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<section class="bg-gray-50 px-4 py-8 sm:px-6">
	<div class="mx-auto max-w-7xl space-y-6">
		<div class="flex items-center justify-between gap-4">
			<div>
				<h2 class="font-serif text-3xl text-primary">Bestellung {data.order.orderNumber}</h2>
				<p class="mt-1 text-sm text-gray-500">Status aktualisieren und Positionen prüfen.</p>
			</div>
			<a
				href="/admin/orders"
				class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-primary hover:text-primary"
			>
				Zur Liste
			</a>
		</div>

		{#if form?.error}
			<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
				{form.error}
			</div>
		{/if}

		<div class="grid gap-6 lg:grid-cols-3">
			<div class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
				<h3 class="font-serif text-xl text-primary">Bestelldaten</h3>
				<div class="mt-4 grid gap-3 sm:grid-cols-2">
					<div>
						<p class="text-xs tracking-wide text-gray-500 uppercase">Kunde</p>
						<p class="text-sm text-gray-800">{data.order.customerName}</p>
					</div>
					<div>
						<p class="text-xs tracking-wide text-gray-500 uppercase">Status</p>
						<p class="text-sm text-gray-800">
							{orderStatusLabels[data.order.status] ?? data.order.status}
						</p>
					</div>
					<div>
						<p class="text-xs tracking-wide text-gray-500 uppercase">Erstellt</p>
						<p class="text-sm text-gray-800">{formatDate(data.order.createdAt)}</p>
					</div>
					<div>
						<p class="text-xs tracking-wide text-gray-500 uppercase">Bezahlt</p>
						<p class="text-sm text-gray-800">{formatDate(data.order.paidAt)}</p>
					</div>
					<div>
						<p class="text-xs tracking-wide text-gray-500 uppercase">Erfüllt</p>
						<p class="text-sm text-gray-800">{formatDate(data.order.fulfilledAt)}</p>
					</div>
					<div>
						<p class="text-xs tracking-wide text-gray-500 uppercase">Versendet</p>
						<p class="text-sm text-gray-800">{formatDate(data.order.shippedAt)}</p>
					</div>
					<div>
						<p class="text-xs tracking-wide text-gray-500 uppercase">Versandkosten</p>
						<p class="text-sm text-gray-800">{formatPrice(data.order.shippingCost)}</p>
					</div>
					<div>
						<p class="text-xs tracking-wide text-gray-500 uppercase">Gesamtbetrag</p>
						<p class="text-sm font-semibold text-gray-900">{formatPrice(data.order.totalAmount)}</p>
					</div>
				</div>
			</div>

			<div class="space-y-4">
				<div class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
					<h3 class="font-serif text-xl text-primary">Status setzen</h3>
					{#if data.order.status === 'refunded'}
						<div class="mt-4">
							<div
								class="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fill-rule="evenodd"
										d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
										clip-rule="evenodd"
									/>
								</svg>
								Erstattet (endgültig)
							</div>
						</div>
					{:else}
						<form method="POST" action={`?/${selectedAction}`} use:enhance class="mt-4 space-y-3">
							<input type="hidden" name="orderId" value={data.order.id} />
							<select
								bind:value={selectedAction}
								class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-0"
							>
								{#each actionOptions as option}
									<option value={option.value}>{option.label}</option>
								{/each}
							</select>
							<button
								type="submit"
								class="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
							>
								Status aktualisieren
							</button>
						</form>
					{/if}
				</div>

				{#if canRefund}
					<div class="rounded-xl border border-red-200 bg-white p-5 shadow-sm">
						<h3 class="font-serif text-xl text-red-700">Erstattung</h3>
						<p class="mt-2 text-sm text-gray-600">
							Zahlung über Stripe erstatten. Dieser Vorgang kann nicht rückgängig gemacht werden.
						</p>
						<button
							type="button"
							onclick={() => (showRefundModal = true)}
							class="mt-3 w-full rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
						>
							Erstattung durchführen
						</button>
					</div>
				{/if}
			</div>
		</div>

		<div class="rounded-xl border border-gray-100 bg-white shadow-sm">
			<div class="border-b border-gray-100 px-5 py-4">
				<h3 class="font-serif text-xl text-primary">Artikel</h3>
			</div>
			<div class="overflow-x-auto">
				<table class="min-w-full text-sm">
					<thead class="bg-gray-50 text-left text-xs text-gray-500 uppercase">
						<tr>
							<th class="px-4 py-3">Produkt</th>
							<th class="px-4 py-3">Menge</th>
							<th class="px-4 py-3">Einzelpreis</th>
							<th class="px-4 py-3">Summe</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#if data.items.length === 0}
							<tr>
								<td colspan="4" class="px-4 py-6 text-center text-gray-500">
									Keine Artikel gefunden.
								</td>
							</tr>
						{:else}
							{#each data.items as item}
								<tr>
									<td class="px-4 py-3 font-medium text-gray-900">{item.productName}</td>
									<td class="px-4 py-3 text-gray-700">{item.quantity}</td>
									<td class="px-4 py-3 text-gray-700">{formatPrice(item.unitPrice)}</td>
									<td class="px-4 py-3 text-gray-700"
										>{formatPrice(item.unitPrice * item.quantity)}</td
									>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</section>

{#if showRefundModal}
	<div
		class="fixed inset-0 z-[80] flex items-center justify-center"
		role="dialog"
		aria-modal="true"
		aria-label="Erstattung bestätigen"
	>
		<button
			class="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
			onclick={() => (showRefundModal = false)}
			aria-label="Schließen"
		></button>
		<div class="relative z-10 mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
			<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 text-red-600"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
					/>
				</svg>
			</div>
			<h3 class="mb-1 font-serif text-lg font-bold text-gray-900">Erstattung bestätigen</h3>
			<p class="mb-4 text-sm text-gray-600">
				Bestellung <span class="font-semibold">{data.order.orderNumber}</span> von
				<span class="font-semibold">{data.order.customerName}</span> über
				<span class="font-semibold text-red-700">{formatPrice(data.order.totalAmount)}</span>
				erstatten? Die Zahlung wird über Stripe zurückgebucht und kann nicht rückgängig gemacht werden.
			</p>
			<div class="flex gap-2">
				<button
					onclick={() => (showRefundModal = false)}
					class="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
				>
					Abbrechen
				</button>
				<form
					method="POST"
					action="?/refund"
					use:enhance={() => {
						return async ({ update }) => {
							await update();
							showRefundModal = false;
						};
					}}
					class="flex-1"
				>
					<input type="hidden" name="orderId" value={data.order.id} />
					<button
						type="submit"
						class="w-full rounded-lg bg-red-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
					>
						Erstatten
					</button>
				</form>
			</div>
		</div>
	</div>
{/if}
