import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	BlockControls,
	AlignmentToolbar,
} from '@wordpress/block-editor';
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';
import StoreQuickInfo from './StoreQuickInfo';

registerBlockType('multivendorx/store-quick-info', {
	edit: ({ attributes, setAttributes }) => {
		const blockProps = useBlockProps({
			className: 'multivendorx-store-quick-info-block',
			style: {
				display: 'flex',
				alignItems: 'center',
				gap: '0.5rem',
			},
		});

		return (
			<>
				<BlockControls>
					<AlignmentToolbar
						value={attributes.align}
						onChange={(nextAlign) => {
							setAttributes({ align: nextAlign });
						}}
					/>
				</BlockControls>

				<div {...blockProps}>
					<div className="store-card">
						<div className="store-header">
							<div className="store-avatar">
								<img
									src="https://via.placeholder.com/80"
									alt="Vendor Avatar"
								/>
							</div>
							<div className="store-info">
								<h3 className="store-name">{__('Store1', 'multivendorx')}</h3>
								<p className="store-email">{__('store@test.com', 'multivendorx')}</p>
								<div className="store-rating">
									<span className="stars">{__('★★★★★', 'multivendorx')}</span>
									<span className="rating-number">4.8</span>
								</div>
							</div>

							<div className="store-stats">
								<div className="stat-item">
									<div className="stat-number">5</div>
									<div className="stat-label">{__('Products', 'multivendorx')}</div>
								</div>
								<div className="stat-item">
									<div className="stat-number">4.8</div>
									<div className="stat-label">{__('Rating', 'multivendorx')}</div>
								</div>
								<div className="stat-item">
									<div className="stat-number">127</div>
									<div className="stat-label">{__('Sales', 'multivendorx')}</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</>
		);
	},

	save: () => {
		return <div className="" id="multivendorx-store-quick-info"></div>;
	},
});
document.addEventListener('DOMContentLoaded', () => {
	const el = document.getElementById('multivendorx-store-quick-info');

	if (!el) {
		return;
	}

	render(
		<BrowserRouter>
			<StoreQuickInfo />
		</BrowserRouter>,
		el
	);
});
