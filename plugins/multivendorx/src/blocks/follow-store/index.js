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

registerBlockType('multivendorx/follow-store', {
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
				<div className="multivendorx-follow-store"></div>
			</div>
		);
	},
});

document.addEventListener('DOMContentLoaded', () => {
	const activeModules = StoreInfo?.activeModules || [];

	document
		.querySelectorAll('.multivendorx-follow-store')
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