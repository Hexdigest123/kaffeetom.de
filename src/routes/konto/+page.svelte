<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { enhance } from '$app/forms';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { formatPrice } from '$lib/config';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();

	// Reuse status helpers from existing bestellung page
	function statusLabel(status: string): string {
		const key = `status_${status}` as keyof typeof m;
		const fn = m[key];
		if (typeof fn === 'function') return (fn as () => string)();
		return status;
	}

	function statusClass(status: string): string {
		switch (status) {
			case 'pending':
				return 'bg-amber-100 text-amber-700 border-amber-200';
			case 'paid':
				return 'bg-blue-100 text-blue-700 border-blue-200';
			case 'in_process':
				return 'bg-purple-100 text-purple-700 border-purple-200';
			case 'fulfilled':
				return 'bg-emerald-100 text-emerald-700 border-emerald-200';
			case 'shipped':
				return 'bg-teal-100 text-teal-700 border-teal-200';
			case 'cancelled':
				return 'bg-gray-100 text-gray-700 border-gray-200';
			case 'refunded':
				return 'bg-red-100 text-red-700 border-red-200';
			case 'cancellation_requested':
				return 'bg-orange-100 text-orange-700 border-orange-200';
			default:
				return 'bg-gray-100 text-gray-700 border-gray-200';
		}
	}

	function bookingStatusLabel(status: string): string {
		const labels: Record<string, string> = {
			pending: 'Ausstehend',
			confirmed: 'Bestätigt',
			completed: 'Abgeschlossen',
			cancelled: 'Storniert',
			rejected: 'Abgelehnt',
			no_show: 'Nicht erschienen'
		};
		return labels[status] ?? status;
	}

	function serviceLabel(type: string): string {
		const labels: Record<string, string> = {
			small_maintenance: 'Kleine Wartung',
			large_maintenance: 'Große Wartung'
		};
		return labels[type] ?? type;
	}

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: '2-digit'
		});
	}
</script>

<section class="bg-cream py-24 md:py-28">
	<div class="container mx-auto max-w-3xl px-4">
		<!-- Header row: greeting + logout -->
		<div class="mb-8 flex flex-wrap items-center justify-between gap-4">
			<h1 class="font-serif text-3xl font-bold text-primary md:text-4xl">
				{m.account_dashboard_title()}
			</h1>
			<form method="post" action="?/signOut" use:enhance>
				<button
					class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-red-300 hover:text-red-600"
				>
					{m.account_logout()}
				</button>
			</form>
		</div>

		<!-- Orders Section -->
		<div class="mb-8">
			<h2 class="mb-4 font-serif text-xl font-bold text-primary">
				{m.account_dashboard_orders()}
			</h2>
			{#if data.orders.length === 0}
				<div class="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
					<p class="text-sm text-gray-500">{m.account_dashboard_orders_empty()}</p>
				</div>
			{:else}
				<div class="space-y-3">
					{#each data.orders as order}
						<a
							href={localizeHref(`/konto/bestellungen/${order.orderNumber}`)}
							class="block rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-colors hover:border-primary/20"
						>
							<div class="flex flex-wrap items-center justify-between gap-3">
								<div>
									<p class="font-serif text-lg font-bold text-primary">{order.orderNumber}</p>
									<p class="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
								</div>
								<div class="flex items-center gap-3">
									<span class="font-serif text-sm font-bold text-gray-800"
										>{formatPrice(order.totalAmount)}</span
									>
									<span
										class="rounded-full border px-2.5 py-0.5 text-xs font-medium {statusClass(
											order.status
										)}"
									>
										{statusLabel(order.status)}
									</span>
								</div>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Bookings Section -->
		<div class="mb-8">
			<h2 class="mb-4 font-serif text-xl font-bold text-primary">
				{m.account_dashboard_bookings()}
			</h2>
			{#if data.bookings.length === 0}
				<div class="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
					<p class="text-sm text-gray-500">{m.account_dashboard_bookings_empty()}</p>
				</div>
			{:else}
				<div class="space-y-3">
					{#each data.bookings as booking}
						<div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
							<div class="flex flex-wrap items-center justify-between gap-3">
								<div>
									<p class="text-sm font-semibold text-gray-800">
										{serviceLabel(booking.serviceType)}
									</p>
									{#if booking.machineModel}
										<p class="text-xs text-gray-500">{booking.machineModel}</p>
									{/if}
								</div>
								<div class="text-right">
									<p class="text-sm text-gray-700">
										{booking.preferredDate}, {booking.preferredTimeSlot}
									</p>
									<span
										class="mt-1 inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600"
									>
										{bookingStatusLabel(booking.status)}
									</span>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Contacts Section -->
		<div>
			<h2 class="mb-4 font-serif text-xl font-bold text-primary">
				{m.account_dashboard_contacts()}
			</h2>
			{#if data.contacts.length === 0}
				<div class="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
					<p class="text-sm text-gray-500">{m.account_dashboard_contacts_empty()}</p>
				</div>
			{:else}
				<div class="space-y-3">
					{#each data.contacts as contact}
						<div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
							<div class="flex flex-wrap items-start justify-between gap-3">
								<div class="min-w-0 flex-1">
									<p class="text-sm font-semibold text-gray-800 capitalize">{contact.type}</p>
									{#if contact.message}
										<p class="mt-1 truncate text-xs text-gray-500">{contact.message}</p>
									{/if}
								</div>
								<p class="shrink-0 text-xs text-gray-400">{formatDate(contact.createdAt)}</p>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</section>
