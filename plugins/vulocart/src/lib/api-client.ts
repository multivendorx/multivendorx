import axios from 'axios';

/* global vulocartLocalizer */

/**
 * Thin axios wrapper for VuloCart's own `vulocart/v1` REST namespace —
 * same X-WP-Nonce convention every other plugin's frontend uses
 * (react-frontend.md / security.md), just against vulocartLocalizer
 * instead of appLocalizer. `apiUrl` (REST root) + `restUrl` (namespace)
 * are composed here the same way zyra's own `getApiLink()` does, since
 * both now read from the same two localizer fields (global.d.ts).
 */
export const apiClient = axios.create( {
	baseURL: `${ vulocartLocalizer.apiUrl }/${ vulocartLocalizer.restUrl }`,
	headers: {
		'X-WP-Nonce': vulocartLocalizer.nonce,
	},
} );
