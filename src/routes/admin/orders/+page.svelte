<script lang="ts">
	import { formatPrice, orderStatusLabels, fulfillmentTypeLabels } from '$lib/config';

	let { data } = $props();

	function formatDate(iso: string): string {
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
		<div>
			<h2 class="font-serif text-3xl text-primary">Bestellungen</h2>
			<p class="mt-1 text-sm text-gray-500">Status filtern und Detailansicht öffnen.</p>
		</div>

		<div class="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
			<form method="GET" class="flex flex-wrap items-end gap-3">
				<label class="space-y-1 text-sm">
					<span class="text-gray-600">Status</span>
					<select
						name="status"
						class="min-w-56 rounded-lg border border-gray-200 px-3 py-2 focus:border-primary focus:ring-0"
					>
						<option value="">Alle</option>
						{#each data.orderStatuses as status}
							<option value={status} selected={status === data.selectedStatus}
								>{orderStatusLabels[status] ?? status}</option
							>
						{/each}
					</select>
				</label>
				<button
					type="submit"
					class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
				>
					Filtern
				</button>
			</form>
		</div>

		<div class="rounded-xl border border-gray-100 bg-white shadow-sm">
			<div class="overflow-x-auto">
				<table class="min-w-full text-sm">
					<thead class="bg-gray-50 text-left text-xs text-gray-500 uppercase">
						<tr>
							<th class="px-4 py-3">Bestellnummer</th>
							<th class="px-4 py-3">Kunde</th>
							<th class="px-4 py-3">Status</th>
							<th class="px-4 py-3">Typ</th>
							<th class="px-4 py-3">Summe</th>
							<th class="px-4 py-3">Erstellt</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#if data.orders.length === 0}
							<tr>
								<td colspan="6" class="px-4 py-6 text-center text-gray-500">
									Keine Bestellungen gefunden.
								</td>
							</tr>
						{:else}
							{#each data.orders as order}
								<tr class="cursor-pointer hover:bg-gray-50">
									<td class="px-4 py-3">
										<a
											href={`/admin/orders/${order.id}`}
											class="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 font-mono text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
										>
											{order.orderNumber}
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-3.5 w-3.5"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												stroke-width="2"
											>
												<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
											</svg>
										</a>
									</td>
									<td class="px-4 py-3 text-gray-700">{order.customerName}</td>
									<td class="px-4 py-3 text-gray-700"
										>{orderStatusLabels[order.status] ?? order.status}</td
									>
									<td class="px-4 py-3 text-gray-700"
										>{fulfillmentTypeLabels[order.fulfillmentType] ?? order.fulfillmentType}</td
									>
									<td class="px-4 py-3 text-gray-700">{formatPrice(order.totalAmount)}</td>
									<td class="px-4 py-3 text-gray-500">{formatDate(order.createdAt)}</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</section>
