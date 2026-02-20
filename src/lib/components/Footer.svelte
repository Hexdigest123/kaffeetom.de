<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import { locations, businessInfo, socialLinks, dayNames, isLocationOpenNow } from '$lib/config';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';

	const currentYear = new Date().getFullYear();

	function formatHours(hours: { open: string; close: string }[] | null): string {
		if (!hours) return getLocale() === 'de' ? 'Geschlossen' : 'Closed';
		return hours.map((h) => `${h.open} – ${h.close}`).join(', ');
	}

	function getDayName(day: string): string {
		const locale = getLocale();
		const entry = dayNames[day];
		if (!entry) return day;
		return locale === 'en' ? entry.en : entry.de;
	}

	const dayOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
</script>

<footer class="relative overflow-hidden bg-coffee text-white">
	<div class="mx-auto max-w-6xl px-4 py-16 md:py-24">
		<h2 class="mb-12 text-center font-display text-3xl font-bold text-white md:text-4xl">
			{m.footer_find_us()}
		</h2>

		<div class="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 md:gap-8">
			{#each locations as location}
				{@const isOpen = isLocationOpenNow(location)}
				<div
					class="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/10"
				>
					<div class="mb-4 flex items-center justify-between">
						<h3 class="font-display text-xl font-bold text-copper">{location.name}</h3>
						<span
							class="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium {isOpen
								? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
								: 'border-red-400/30 bg-red-500/10 text-red-300'}"
						>
							<span class="h-1.5 w-1.5 rounded-full {isOpen ? 'bg-emerald-400' : 'bg-red-400'}"
							></span>
							{isOpen ? m.location_open_now() : m.location_closed_now()}
						</span>
					</div>

					<div class="mb-4 flex items-start gap-3">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mt-0.5 h-5 w-5 shrink-0 text-copper"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
							/>
						</svg>
						<div>
							<p class="font-body text-sm text-white/90">{location.address}</p>
							<p class="font-body text-sm text-white/90">
								{location.zip}
								{location.city}
							</p>
							<a
								href={location.googleMapsUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="mt-1 inline-block font-body text-xs text-copper transition-colors hover:text-copper-light"
							>
								{m.footer_maps_hint()}
							</a>
						</div>
					</div>

					<div class="mb-4 flex items-center gap-3">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5 shrink-0 text-copper"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
							/>
						</svg>
						<a
							href="tel:{location.phone.replace(/[\s/]/g, '')}"
							class="font-body text-sm text-white/90 transition-colors hover:text-copper"
						>
							{location.phone}
						</a>
					</div>

					<div class="mb-4 flex items-center gap-3">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5 shrink-0 text-copper"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path
								d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
							/>
						</svg>
						<a
							href="https://wa.me/{location.whatsapp}"
							target="_blank"
							rel="noopener noreferrer"
							class="font-body text-sm text-white/90 transition-colors hover:text-copper"
						>
							WhatsApp
						</a>
					</div>

					<div>
						<h4 class="mb-2 font-body text-xs font-semibold tracking-wider text-copper uppercase">
							{m.footer_hours()}
						</h4>
						<div class="space-y-1">
							{#each dayOrder as day}
								<div class="flex justify-between font-body text-xs text-white/70">
									<span>{getDayName(day)}</span>
									<span
										>{formatHours(
											location.openingHours[day] as { open: string; close: string }[] | null
										)}</span
									>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-12 flex justify-center gap-4">
			<a
				href={businessInfo.facebookUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="group inline-flex items-center gap-3 rounded-lg bg-white/10 px-4 py-2.5 text-white transition-all hover:bg-white/20"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="currentColor"
				>
					<path
						d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
					/>
				</svg>
				<span class="font-body text-sm font-medium">Facebook</span>
			</a>
			<a
				href={businessInfo.youtubeUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="group inline-flex items-center gap-3 rounded-lg bg-white/10 px-4 py-2.5 text-white transition-all hover:bg-white/20"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="currentColor"
				>
					<path
						d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
					/>
				</svg>
				<span class="font-body text-sm font-medium">YouTube</span>
			</a>
		</div>
	</div>

	<div class="border-t border-white/10 bg-black/10 backdrop-blur-sm">
		<div
			class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 md:flex-row"
		>
			<p class="text-sm font-light text-white/50">
				{m.footer_copyright({ year: String(currentYear) })}
			</p>

			<div class="flex items-center gap-4">
				<a
					href={localizeHref('/agb')}
					class="py-1 text-sm font-light text-white/50 transition-colors hover:text-copper"
				>
					{m.footer_agb()}
				</a>
				<a
					href={localizeHref('/impressum')}
					class="py-1 text-sm font-light text-white/50 transition-colors hover:text-copper"
				>
					{m.footer_impressum()}
				</a>
				<a
					href={localizeHref('/datenschutz')}
					class="py-1 text-sm font-light text-white/50 transition-colors hover:text-copper"
				>
					{m.footer_datenschutz()}
				</a>
			</div>
		</div>
	</div>
</footer>
