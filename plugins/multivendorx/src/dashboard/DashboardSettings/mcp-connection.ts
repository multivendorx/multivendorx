import { __ } from '@wordpress/i18n';

export default {
	id: 'mcp-connection',
	priority: 90,
	headerTitle: __('Connect MCP', 'multivendorx'),
	headerDescription: __(
		'Generate your own credential to connect an MCP client (such as Claude) to your store data.',
		'multivendorx'
	),
	headerIcon: 'link',
	modal: [],
};
