<script lang="ts">
	import { enhance } from '$app/forms';
	import { locations, serviceTypeLabels, bookingStatusLabels } from '$lib/config';

	let { data, form } = $props();

	const locationMap = Object.fromEntries(locations.map((location) => [location.id, location.name]));

	function locationLabel(id: number): string {
		const key = String(id);
		return locationMap[key] ?? key;
	}

	function serviceLabel(id: string): string {
		return serviceTypeLabels[id] ?? id;
	}

	function statusLabel(status: string): string {
		return bookingStatusLabels[status] ?? status;
	}

	function statusBadgeClass(status: string): string {
		switch (status) {
			case 'pending':
				return 'bg-amber-100 text-amber-800';
			case 'confirmed':
				return 'bg-blue-100 text-blue-800';
			case 'completed':
				return 'bg-emerald-100 text-emerald-800';
			case 'cancelled':
				return 'bg-gray-100 text-gray-600';
			case 'rejected':
				return 'bg-red-100 text-red-800';
			case 'no_show':
				return 'bg-orange-100 text-orange-800';
			default:
				return 'bg-gray-100 text-gray-600';
		}
	}
</script>

<section class="bg-gray-50 px-4 py-8 sm:px-6">
	<div class="mx-auto max-w-7xl space-y-6">
		<div>
			<h2 class="font-serif text-3xl text-primary">Service-Termine</h2>
			<p class="mt-1 text-sm text-gray-500">
				Termine bestätigen, ablehnen, abschließen oder stornieren.
			</p>
		</div>

		{#if form?.error}
			<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
				{form.error}
			</div>
		{/if}

		<div class="rounded-xl border border-gray-100 bg-white shadow-sm">
			<div class="overflow-x-auto">
				<table class="min-w-full text-sm">
					<thead class="bg-gray-50 text-left text-xs text-gray-500 uppercase">
						<tr>
							<th class="px-4 py-3">Kunde</th>
							<th class="px-4 py-3">Service</th>
							<th class="px-4 py-3">Standort</th>
							<th class="px-4 py-3">Datum</th>
							<th class="px-4 py-3">Zeitfenster</th>
							<th class="px-4 py-3">Status</th>
							<th class="px-4 py-3">Aktionen</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#if data.bookings.length === 0}
							<tr>
								<td colspan="7" class="px-4 py-6 text-center text-gray-500">
									Keine Buchungen gefunden.
								</td>
							</tr>
						{:else}
							{#each data.bookings as booking}
								<tr>
									<td class="px-4 py-3 font-medium text-gray-900">{booking.customerName}</td>
									<td class="px-4 py-3 text-gray-700">{serviceLabel(booking.serviceType)}</td>
									<td class="px-4 py-3 text-gray-700">{locationLabel(booking.locationId)}</td>
									<td class="px-4 py-3 text-gray-700">{booking.preferredDate}</td>
									<td class="px-4 py-3 text-gray-700">{booking.preferredTimeSlot}</td>
									<td class="px-4 py-3">
										<span
											class="inline-block rounded-full px-2.5 py-1 text-xs font-medium {statusBadgeClass(
												booking.status
											)}"
										>
											{statusLabel(booking.status)}
										</span>
									</td>
									<td class="px-4 py-3">
										<div class="flex gap-2">
											{#if booking.status === 'pending'}
												<form method="POST" action="?/confirm" use:enhance>
													<input type="hidden" name="id" value={booking.id} />
													<button
														type="submit"
														class="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
													>
														Bestätigen
													</button>
												</form>
												<form method="POST" action="?/reject" use:enhance>
													<input type="hidden" name="id" value={booking.id} />
													<button
														type="submit"
														class="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
													>
														Ablehnen
													</button>
												</form>
											{:else if booking.status === 'confirmed'}
												<form method="POST" action="?/markCompleted" use:enhance>
													<input type="hidden" name="id" value={booking.id} />
													<button
														type="submit"
														class="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
													>
														Abschließen
													</button>
												</form>
												<form method="POST" action="?/cancel" use:enhance>
													<input type="hidden" name="id" value={booking.id} />
													<button
														type="submit"
														class="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
													>
														Stornieren
													</button>
												</form>
											{:else}
												<span class="text-xs text-gray-400">—</span>
											{/if}
										</div>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</section>
