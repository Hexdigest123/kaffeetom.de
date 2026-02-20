<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import Hero from '$lib/components/Hero.svelte';
	import { locations, serviceTypes, formatPrice } from '$lib/config';

	let selectedLocation = $state(locations[0].id);
	let selectedService = $state(serviceTypes[0].id);
	let selectedDate = $state('');
	let selectedTime = $state('');
	let customerName = $state('');
	let customerEmail = $state('');
	let customerPhone = $state('');
	let machineModel = $state('');
	let notes = $state('');
	let loading = $state(false);
	let success = $state(false);
	let errorMsg = $state('');
	let availableSlots = $state<string[]>([]);

	// Machine model autocomplete
	let machineResults = $state<
		{ id: number; name: string; nameEn: string | null; modelSeries: string | null }[]
	>([]);
	let isMachineSearchOpen = $state(false);
	let machineSearchTimeout: ReturnType<typeof setTimeout> | undefined;

	const locale = $derived(getLocale());

	const msg: Record<string, () => string> = {};
	for (const [key, fn] of Object.entries(m)) {
		if (typeof fn === 'function') {
			msg[key] = fn as () => string;
		}
	}

	function getServiceName(svc: (typeof serviceTypes)[number]): string {
		return msg[svc.nameKey]?.() ?? svc.nameKey;
	}

	function getServiceDesc(svc: (typeof serviceTypes)[number]): string {
		return msg[svc.descriptionKey]?.() ?? svc.descriptionKey;
	}

	async function fetchSlots() {
		if (!selectedDate || !selectedLocation) {
			availableSlots = [];
			return;
		}
		try {
			const res = await fetch(
				`/api/booking/slots?locationId=${selectedLocation}&date=${selectedDate}`
			);
			const data = await res.json();
			availableSlots = data.slots ?? [];
		} catch {
			availableSlots = [];
		}
		selectedTime = '';
	}

	function handleDateChange() {
		fetchSlots();
	}

	function handleLocationChange() {
		fetchSlots();
	}

	function handleMachineSearch() {
		clearTimeout(machineSearchTimeout);
		const q = machineModel.trim();
		if (q.length < 2) {
			machineResults = [];
			isMachineSearchOpen = false;
			return;
		}
		machineSearchTimeout = setTimeout(async () => {
			try {
				const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
				const data = await res.json();
				machineResults = data.results ?? [];
				isMachineSearchOpen = machineResults.length > 0;
			} catch {
				machineResults = [];
				isMachineSearchOpen = false;
			}
		}, 250);
	}

	function selectMachine(result: { name: string; nameEn: string | null }) {
		machineModel = locale === 'en' && result.nameEn ? result.nameEn : result.name;
		machineResults = [];
		isMachineSearchOpen = false;
	}

	function closeMachineSearch() {
		setTimeout(() => {
			isMachineSearchOpen = false;
		}, 150);
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		loading = true;
		errorMsg = '';

		try {
			const res = await fetch('/api/booking', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					locationId: selectedLocation,
					serviceType: selectedService,
					preferredDate: selectedDate,
					preferredTimeSlot: selectedTime,
					customerName,
					customerEmail,
					customerPhone,
					machineModel,
					notes
				})
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error ?? 'Booking failed');
			}

			success = true;
		} catch (err) {
			errorMsg = err instanceof Error ? err.message : m.error();
		} finally {
			loading = false;
		}
	}

	const today = new Date().toISOString().split('T')[0];
</script>

<Hero title={m.repair_title()} subtitle={m.repair_subtitle()} />

<section class="mx-auto max-w-6xl px-4 py-12 md:py-16">
	<div class="mb-10 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
		<p class="font-body text-sm font-bold text-primary">{m.repair_only_jura()}</p>
		<p class="mt-1 font-body text-sm text-gray-600">{m.repair_from_price()}</p>
	</div>

	<div class="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2">
		{#each serviceTypes as svc}
			<div class="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
				<div class="mb-3 flex items-center justify-between">
					<h3 class="font-display text-xl font-bold text-coffee">{getServiceName(svc)}</h3>
					<span class="font-display text-xl font-bold text-primary">{formatPrice(svc.price)}</span>
				</div>
				<p class="mb-3 font-body text-sm text-gray-600">{getServiceDesc(svc)}</p>
				<p class="font-body text-xs text-copper">
					{msg[`service_${svc.id === 'small_maintenance' ? 'small' : 'large'}_interval`]?.() ?? ''}
				</p>
			</div>
		{/each}
	</div>

	<div class="mx-auto max-w-2xl">
		<h2 class="mb-8 text-center font-display text-2xl font-bold text-coffee">
			{m.repair_book_title()}
		</h2>

		{#if success}
			<div class="rounded-xl bg-success/10 p-8 text-center">
				<p class="font-display text-xl font-bold text-success">{m.booking_received()}</p>
				<p class="mt-2 font-body text-sm text-gray-600">{m.booking_pending_info()}</p>
			</div>
		{:else}
			<form
				onsubmit={handleSubmit}
				class="space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
			>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label
							for="bookingLocation"
							class="mb-1 block font-body text-sm font-medium text-gray-700"
						>
							{m.booking_location()}
						</label>
						<select
							id="bookingLocation"
							bind:value={selectedLocation}
							onchange={handleLocationChange}
							class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-body text-sm"
						>
							{#each locations as loc}
								<option value={loc.id}>{loc.name}</option>
							{/each}
						</select>
					</div>
					<div>
						<label
							for="bookingService"
							class="mb-1 block font-body text-sm font-medium text-gray-700"
						>
							{m.booking_service()}
						</label>
						<select
							id="bookingService"
							bind:value={selectedService}
							class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-body text-sm"
						>
							{#each serviceTypes as svc}
								<option value={svc.id}>{getServiceName(svc)} — {formatPrice(svc.price)}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label for="bookingDate" class="mb-1 block font-body text-sm font-medium text-gray-700">
							{m.booking_date()}
						</label>
						<input
							type="date"
							id="bookingDate"
							bind:value={selectedDate}
							onchange={handleDateChange}
							min={today}
							required
							class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-body text-sm"
						/>
					</div>
					<div>
						<label for="bookingTime" class="mb-1 block font-body text-sm font-medium text-gray-700">
							{m.booking_time()}
						</label>
						<select
							id="bookingTime"
							bind:value={selectedTime}
							required
							disabled={availableSlots.length === 0}
							class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-body text-sm disabled:cursor-not-allowed disabled:opacity-50"
						>
							{#if availableSlots.length === 0}
								<option value=""
									>{selectedDate ? 'Keine Termine verfugbar' : 'Bitte Datum wahlen'}</option
								>
							{:else}
								<option value="">{m.booking_time()}</option>
								{#each availableSlots as slot}
									<option value={slot}>{slot}</option>
								{/each}
							{/if}
						</select>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label for="bookingName" class="mb-1 block font-body text-sm font-medium text-gray-700">
							{m.checkout_name()} <span class="text-primary">*</span>
						</label>
						<input
							type="text"
							id="bookingName"
							bind:value={customerName}
							required
							class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-body text-sm"
						/>
					</div>
					<div>
						<label
							for="bookingPhone"
							class="mb-1 block font-body text-sm font-medium text-gray-700"
						>
							{m.form_phone()} <span class="text-primary">*</span>
						</label>
						<input
							type="tel"
							id="bookingPhone"
							bind:value={customerPhone}
							required
							class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-body text-sm"
						/>
					</div>
				</div>

				<div>
					<label for="bookingEmail" class="mb-1 block font-body text-sm font-medium text-gray-700">
						{m.form_email()} <span class="text-primary">*</span>
					</label>
					<input
						type="email"
						id="bookingEmail"
						bind:value={customerEmail}
						required
						class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-body text-sm"
					/>
				</div>

				<div class="relative">
					<label
						for="bookingMachine"
						class="mb-1 block font-body text-sm font-medium text-gray-700"
					>
						{m.booking_machine()}
					</label>
					<input
						type="text"
						id="bookingMachine"
						bind:value={machineModel}
						oninput={handleMachineSearch}
						onfocusout={closeMachineSearch}
						placeholder="z.B. Jura E8"
						autocomplete="off"
						class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-body text-sm"
					/>
					{#if isMachineSearchOpen}
						<ul
							class="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
						>
							{#each machineResults as result}
								<li>
									<button
										type="button"
										class="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-primary/5"
										onmousedown={() => selectMachine(result)}
									>
										<span class="font-medium text-gray-900">
											{locale === 'en' && result.nameEn ? result.nameEn : result.name}
										</span>
										{#if result.modelSeries}
											<span class="rounded bg-coffee/10 px-1.5 py-0.5 text-xs text-coffee">
												{result.modelSeries}
											</span>
										{/if}
									</button>
								</li>
							{/each}
						</ul>
					{/if}
				</div>

				<div>
					<label for="bookingNotes" class="mb-1 block font-body text-sm font-medium text-gray-700">
						{m.booking_notes()}
					</label>
					<textarea
						id="bookingNotes"
						bind:value={notes}
						rows="3"
						class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-body text-sm"
					></textarea>
				</div>

				{#if errorMsg}
					<div class="rounded-lg bg-danger/10 px-4 py-3 font-body text-sm text-danger">
						{errorMsg}
					</div>
				{/if}

				<button
					type="submit"
					disabled={loading}
					class="w-full rounded-lg bg-primary px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
				>
					{#if loading}{m.loading()}{:else}{m.booking_submit()}{/if}
				</button>
			</form>
		{/if}
	</div>
</section>
