/* global appLocalizer */
import { useCallback, useEffect, useState } from 'react';
import { getApiResponse, getApiLink } from '@zyra/core';
import { __ } from '@wordpress/i18n';

export interface ApiListResult<T> {
	data: T[];
	total: number;
	isLoading: boolean;
	error: string | null;
	refetch: () => void;
}

type ListResponse<T> = T[] | { data?: T[]; total?: number };

/**
 * Fetches a VuloPilot REST list endpoint (`vulopilot/v1/{endpoint}`) and
 * tracks loading/error/empty state. Every list page (Health, SEO, GEO,
 * WooCommerce, Automation, Reports, AI Assistant, Activity, and
 * Dashboard's own widgets) needs the same fetch → loading → error →
 * empty-or-populated shape, so it lives here once instead of being
 * re-implemented per page.
 *
 * @param endpoint REST resource path relative to the vulopilot/v1 namespace, e.g. 'findings'.
 * @param params   Optional query params (category filters, pagination, etc).
 */
export const useApiList = <T = Record<string, unknown>>(
	endpoint: string,
	params: Record<string, string | number | undefined> = {}
): ApiListResult<T> => {
	const [data, setData] = useState<T[]>([]);
	const [total, setTotal] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [reloadToken, setReloadToken] = useState(0);

	const query = Object.entries(params)
		.filter(([, value]) => value !== undefined && value !== '')
		.map(
			([key, value]) => `${key}=${encodeURIComponent(String(value))}`
		)
		.join('&');

	useEffect(() => {
		let cancelled = false;
		setIsLoading(true);
		setError(null);

		const url =
			getApiLink(appLocalizer, endpoint) + (query ? `?${query}` : '');

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
					return;
				}

				const list = Array.isArray(response)
					? response
					: (response.data ?? []);

				setData(list);
				setTotal(
					Array.isArray(response)
						? list.length
						: (response.total ?? list.length)
				);
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

	return { data, total, isLoading, error, refetch };
};
