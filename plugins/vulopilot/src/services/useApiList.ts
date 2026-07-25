/* global appLocalizer */
import { useCallback, useEffect, useState } from 'react';
import { getApiResponse, getApiLink } from '@zyra/core';
import { __ } from '@wordpress/i18n';
import type { CategoryCount } from '@zyra/table';

export interface ApiListResult<T> {
	data: T[];
	total: number;
	/**
	 * `[{value: 'all', label, count}, ...]` — only populated when a
	 * `categoryFilter` config is passed in; empty otherwise. Pass straight
	 * through to TableCard's `categoryCounts` prop to render its status-count
	 * pill bar.
	 */
	categoryCounts: CategoryCount[];
	isLoading: boolean;
	error: string | null;
	refetch: () => void;
	/**
	 * Pass straight through to TableCard's `onQueryUpdate` prop — TableCard
	 * owns its own `{ paged, per_page, filter, ... }` state internally
	 * (zyra's TableCard.tsx) and only ever hands it back out via this
	 * callback. Without wiring it here, clicking a page number or a filter
	 * only updates TableCard's own pagination UI; the underlying `rows`
	 * prop (this hook's `data`) never changes, since nothing tells this
	 * hook a new page/filter was requested.
	 */
	// Base no-unused-vars doesn't understand TS function-type parameter
	// positions (no runtime binding to "use"); @typescript-eslint/no-unused-vars
	// already handles this correctly.
	// eslint-disable-next-line no-unused-vars
	onQueryUpdate: (query: TableCardQuery) => void;
}

/**
 * The subset of zyra TableCard's internal query state this hook forwards
 * to the REST request. `languageFilter` isn't read (no vulopilot list
 * endpoint has that dimension). `searchValue`/`categoryFilter`/`orderby`/
 * `order` ARE read — every AbstractRepository-backed list endpoint now
 * supports `search`, a status-count-driven category filter, and sorting.
 */
interface TableCardQuery {
	paged?: number | string;
	per_page?: number | string;
	filter?: Record<string, string | string[]>;
	searchValue?: string;
	categoryFilter?: string;
	orderby?: string;
	order?: string;
}

/**
 * A status-like categorical dimension a list page wants surfaced as a
 * TableCard status-count pill bar (Findings' status, Automation's status,
 * Activity's actor_type, etc.) — `options` excludes "All", which this hook
 * always prepends itself. The REST param this maps `categoryFilter` onto,
 * and the response field its counts are read from, are both `key`
 * (`${key}_counts` in the response body) — see each controller's
 * `get_items()` for the matching backend half of this contract.
 */
export interface CategoryFilterConfig {
	key: string;
	options: { label: string; value: string }[];
}

type ListResponse<T> = T[] | { data?: T[]; total?: number; [key: string]: unknown };

/**
 * Fetches a VuloPilot REST list endpoint (`vulopilot/v1/{endpoint}`) and
 * tracks loading/error/empty state. Every list page (Health, SEO, GEO,
 * WooCommerce, Automation, Reports, AI Assistant, Activity, and
 * Dashboard's own widgets) needs the same fetch → loading → error →
 * empty-or-populated shape, so it lives here once instead of being
 * re-implemented per page.
 *
 * @param endpoint       REST resource path relative to the vulopilot/v1 namespace, e.g. 'findings'.
 * @param params         Optional static query params (e.g. a fixed category for a
 *                       category-scoped page). Pagination/per-page/select-filter
 *                       params are owned by TableCard itself — see onQueryUpdate.
 * @param categoryFilter Optional status-count pill bar config — see CategoryFilterConfig.
 */
export const useApiList = <T = Record<string, unknown>>(
	endpoint: string,
	params: Record<string, string | number | undefined> = {},
	categoryFilter?: CategoryFilterConfig
): ApiListResult<T> => {
	const [data, setData] = useState<T[]>([]);
	const [total, setTotal] = useState(0);
	const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [reloadToken, setReloadToken] = useState(0);
	// Matches TableCard's own initial `{ paged: 1, per_page: 10 }` state
	// (zyra's TableCard.tsx) — TableCard doesn't accept an initial per_page
	// override from props, so seeding anything else here would just cause
	// a mismatched first fetch followed by an immediate refetch once
	// TableCard's own mount-time onQueryUpdate call corrects it.
	const [tableQuery, setTableQuery] = useState<TableCardQuery>({
		paged: 1,
		per_page: 10,
	});

	const onQueryUpdate = useCallback((query: TableCardQuery) => {
		setTableQuery(query);
	}, []);

	const mergedParams: Record<string, string | number | undefined> = {
		...params,
		page: tableQuery.paged,
		per_page: tableQuery.per_page,
		search: tableQuery.searchValue,
		orderby: tableQuery.orderby,
		order: tableQuery.order,
		...(categoryFilter && tableQuery.categoryFilter !== 'all'
			? { [categoryFilter.key]: tableQuery.categoryFilter }
			: {}),
		...tableQuery.filter,
	};

	const query = Object.entries(mergedParams)
		.filter(([, value]) => value !== undefined && value !== '')
		.map(
			([key, value]) => `${key}=${encodeURIComponent(String(value))}`
		)
		.join('&');

	useEffect(() => {
		let cancelled = false;
		setIsLoading(true);
		setError(null);

		// getApiLink() already returns a URL containing its own `?` on
		// sites with plain permalinks (rest_url() resolves to
		// `index.php?rest_route=/…`) — appending another `?` here instead
		// of `&` would fold `per_page=5` etc. into the *value* of the
		// rest_route query var itself (`rest_route=/vulopilot/v1/reports?per_page=5`),
		// which WordPress can't match to any registered route and 404s.
		// Pretty-permalink sites (`/wp-json/…`, no `?` yet) still get a
		// real `?`.
		const baseUrl = getApiLink(appLocalizer, endpoint);
		const separator = baseUrl.includes('?') ? '&' : '?';
		const url = baseUrl + (query ? `${separator}${query}` : '');

		getApiResponse<ListResponse<T>>(url, {
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		})
			.then((response) => {
				if (cancelled) {
					return;
				}

				if (!response) {
					setError(
						__(
							'Something went wrong while loading this data.',
							'vulopilot'
						)
					);
					setData([]);
					setTotal(0);
					setCategoryCounts([]);
					return;
				}

				const list = Array.isArray(response)
					? response
					: (response.data ?? []);
				const rowTotal = Array.isArray(response)
					? list.length
					: (response.total ?? list.length);

				setData(list);
				setTotal(rowTotal);

				if (categoryFilter && !Array.isArray(response)) {
					const counts =
						(response[`${categoryFilter.key}_counts`] as Record<
							string,
							number
						>) ?? {};

					setCategoryCounts([
						{
							value: 'all',
							label: __('All', 'vulopilot'),
							count: rowTotal,
						},
						...categoryFilter.options.map((option) => ({
							value: option.value,
							label: option.label,
							count: counts[option.value] ?? 0,
						})),
					]);
				}
			})
			.finally(() => {
				if (!cancelled) {
					setIsLoading(false);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [endpoint, query, reloadToken]);

	const refetch = useCallback(() => setReloadToken((n) => n + 1), []);

	return {
		data,
		total,
		categoryCounts,
		isLoading,
		error,
		refetch,
		onQueryUpdate,
	};
};
