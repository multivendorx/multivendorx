/* global appLocalizer */
import { useEffect, useState } from 'react';
import axios from 'axios';

export interface PluginStatusProduct {
	/** Substring matched against `/wp/v2/plugins`' `plugin` field (folder-slug portion) — e.g. `woocommerce-catalog-enquiry`. */
	slug: string;
	/** The install endpoint's own `slug` param, same string as above — kept separate since WP's install/activate/list endpoints don't all key off the same field name. */
	pluginFile: string;
}

export interface PluginStatusEntry {
	installed: boolean;
	active: boolean;
	busy: boolean;
}

interface WPPlugin {
	plugin?: string;
	status?: string;
}

/**
 * Real install/active status for a fixed list of sibling plugins, backed
 * by WordPress core's own `/wp/v2/plugins` REST endpoint — the same
 * endpoint and the same install call (`POST /wp/v2/plugins` with
 * `{slug, status: 'active'}`) the free multivendorx plugin's own
 * `AdminDashboard/DashboardTab.tsx` already uses in production for its
 * own "Extend your website" cross-sell card. `activate()` additionally
 * calls `PUT /wp/v2/plugins/{plugin}` — WP core's standard endpoint for
 * flipping an already-installed-but-inactive plugin active — which
 * DashboardTab.tsx never needed (its cross-sell only ever offers
 * Install), but this Dashboard's 3-state Install/Activate/Open
 * requirement does.
 *
 * No shared "is this plugin installed" PHP/JS helper exists anywhere in
 * this codebase (checked `Utill`, zyra's `packages/php`) — every
 * sibling plugin's own dashboard duplicates this same inline fetch, so
 * this hook does too rather than inventing a new shared abstraction for
 * a single call site.
 */
export function usePluginStatus(products: PluginStatusProduct[]) {
	const [status, setStatus] = useState<Record<string, PluginStatusEntry>>(
		() =>
			Object.fromEntries(
				products.map((product) => [
					product.slug,
					{ installed: false, active: false, busy: false },
				])
			)
	);

	const refetch = () => {
		axios
			.get<WPPlugin[]>(`${appLocalizer.apiUrl}/wp/v2/plugins`, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((response) => {
				const pluginList = response.data;
				setStatus((previous) =>
					Object.fromEntries(
						products.map((product) => {
							const match = pluginList.find((plugin) =>
								plugin.plugin?.includes(product.slug)
							);
							return [
								product.slug,
								{
									installed: !!match,
									active: match?.status === 'active',
									busy: previous[product.slug]?.busy ?? false,
								},
							];
						})
					)
				);
			})
			.catch(() => {
				// Leave status at its last-known (or initial, all-false)
				// state — same "fail quiet, don't block the rest of the
				// page" approach DashboardTab.tsx's own fetchPlugins takes.
			});
	};

	useEffect(refetch, []);

	const setBusy = (slug: string, busy: boolean) => {
		setStatus((previous) => ({
			...previous,
			[slug]: { ...previous[slug], busy },
		}));
	};

	const install = (slug: string) => {
		setBusy(slug, true);
		axios
			.post(
				`${appLocalizer.apiUrl}/wp/v2/plugins`,
				{ slug, status: 'active' },
				{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
			)
			.then(refetch)
			.finally(() => setBusy(slug, false));
	};

	const activate = (slug: string) => {
		const product = products.find((item) => item.slug === slug);
		if (!product) {
			return;
		}
		setBusy(slug, true);
		axios
			.put(
				`${appLocalizer.apiUrl}/wp/v2/plugins/${product.pluginFile}`,
				{ status: 'active' },
				{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
			)
			.then(refetch)
			.finally(() => setBusy(slug, false));
	};

	return { status, install, activate };
}
