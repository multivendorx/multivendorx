/* global appLocalizer */
import axios from 'axios';

/**
 * One count request of a queue screen (Approval Queue, Customers, Compliance): a tab's badge number.
 * Modules add their own through the screen's `multivendorx_*_api_configs` filter.
 */
export interface QueueCountConfig {
	/** The tab id the count belongs to. */
	id: string;
	url: string;
	method?: string;
	params?: Record<string, unknown>;
	/** Response header holding the count (default `x-wp-total`). */
	header?: string;
	/** Reads the count from the response instead of a header. */
	transform?: (response: unknown) => number;
	/**
	 * The module the request belongs to. Skipped while that module is off: its REST route or order status
	 * isn't registered then, so the request could only fail (404, or 400 for an unknown order status).
	 */
	module?: string;
}

/**
 * Fetches every count of a queue screen and reports each one; a request that fails counts as 0.
 *
 * @param configs  The screen's count requests, after its filter.
 * @param setCount Receives each tab id and its count.
 */
export const fetchQueueCounts = (
	configs: QueueCountConfig[],
	setCount: (id: string, count: number) => void
): void => {
	const activeModules: string[] = appLocalizer.active_modules || [];

	configs
		.filter(
			(config) => !config.module || activeModules.includes(config.module)
		)
		.forEach((config) => {
			axios({
				method: config.method || 'GET',
				url: config.url,
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: config.params || {},
			})
				.then((response) => {
					setCount(
						config.id,
						config.transform
							? config.transform(response)
							: Number(
									response.headers[
										config.header || 'x-wp-total'
									]
								) || 0
					);
				})
				.catch(() => setCount(config.id, 0));
		});
};
