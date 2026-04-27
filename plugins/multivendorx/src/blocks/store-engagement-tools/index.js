/* global StoreInfo */
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import FollowStore from './FollowStore';
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';

// Icons
const FollowIcon = () => (
	<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
		<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
	</svg>
);

const ChatIcon = () => (
	<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
		<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
	</svg>
);

const SupportIcon = () => (
	<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
		<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10" />
	</svg>
);

registerBlockType('multivendorx/store-engagement-tools', {
	edit: () => {
		const blockProps = useBlockProps({
			className:
				'multivendorx-store-engagement-tools wc-store-engagement-tools',
			style: {
				display: 'flex',
				gap: '15px',
				alignItems: 'center',
				justifyContent: 'center',
			},
		});

		const ButtonStyle = {
			display: 'flex',
			gap: '0.5rem',
			alignItems: 'center',
		};

		return (
			<div {...blockProps}>
				<button
					style={ButtonStyle}
					className="wp-block-button__link has-border-color has-accent-1-border-color wp-element-button"
				>
					<FollowIcon />
					{__('Follow Store', 'multivendorx')}
				</button>

				<button
					style={ButtonStyle}
					className="wp-block-button__link has-border-color has-accent-1-border-color wp-element-button"
				>
					<ChatIcon />
					{__('Live Chat', 'multivendorx')}
				</button>

				<button
					style={ButtonStyle}
					className="wp-block-button__link has-border-color has-accent-1-border-color wp-element-button"
				>
					<SupportIcon />
					{__('Support', 'multivendorx')}
				</button>
			</div>
		);
	},

	save: () => {
		const blockProps = useBlockProps.save({
			className:
				'multivendorx-store-engagement-tools wc-store-engagement-tools',
		});

		return (
			<div {...blockProps}>
				<div className="multivendorx-store-engagement-root"></div>
			</div>
		);
	},
});

document.addEventListener('DOMContentLoaded', () => {
	const activeModules = StoreInfo?.activeModules || [];

	document
		.querySelectorAll('.multivendorx-store-engagement-root')
		.forEach((root) => {
			const container = document.createElement('div');
			container.className = 'multivendorx-follow-wrapper';
			root.appendChild(container);

			if (activeModules.includes('follow-store')) {
				render(
					<BrowserRouter>
						<FollowStore />
					</BrowserRouter>,
					container
				);
			}
		});
});