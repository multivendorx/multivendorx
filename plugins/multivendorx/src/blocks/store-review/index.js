import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	useBlockProps,
	BlockControls,
	AlignmentToolbar,
} from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	ToggleControl,
	SelectControl,
	ToolbarGroup,
} from '@wordpress/components';
import StoreReview from './StoreReview';
import { render } from '@wordpress/element';
import { BrowserRouter } from 'react-router-dom';

registerBlockType('multivendorx/store-review', {
	attributes: {
		reviewsToShow: {
			type: 'number',
			default: 3,
		},
		showImages: {
			type: 'boolean',
			default: true,
		},
		showAdminReply: {
			type: 'boolean',
			default: true,
		},
		sortOrder: {
			type: 'string',
			default: 'DESC',
		},
	},

	edit: ({ attributes, setAttributes }) => {
		const { reviewsToShow, showImages, showAdminReply, sortOrder } =
			attributes;

		const blockProps = useBlockProps();

		const StarFilled = () => (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				width="20"
				height="20"
			>
				<path
					d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
					fill="#f0b849"
				/>
			</svg>
		);

		const StarEmpty = () => (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				width="20"
				height="20"
			>
				<path
					d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
					fill="#ddd"
				/>
			</svg>
		);

		const reviewData = {
			avatar: 'B',
			name: 'Jone',
			time: '1 day ago',
			rating: 4,
			title: 'Great Store',
			content: 'The quality is excellent and delivery was fast.',
			images: ['#', '#'],
			adminReply: 'Thank you for your valuable feedback!',
		};

		const renderStars = (rating, isEditor = true) => {
			const stars = [];
			for (let i = 1; i <= 5; i++) {
				if (isEditor) {
					stars.push(
						i <= rating ? (
							<StarFilled key={i} />
						) : (
							<StarEmpty key={i} />
						)
					);
				}
			}
			return stars;
		};

		return (
			<>
				<BlockControls>
					<ToolbarGroup>
						<AlignmentToolbar />
					</ToolbarGroup>
				</BlockControls>

				<InspectorControls>
					<PanelBody title={__('Review Settings')} initialOpen={true}>
						<RangeControl
							label={__('Number of Reviews to Show')}
							value={reviewsToShow}
							onChange={(value) =>
								setAttributes({ reviewsToShow: value })
							}
							min={1}
							max={10}
						/>

						<SelectControl
							label={__('Sort Order')}
							value={sortOrder}
							options={[
								{ label: __('Newest First', 'multivendorx'), value: 'DESC' },
								{ label: __('Oldest First', 'multivendorx'), value: 'ASC' },
							]}
							onChange={(value) =>
								setAttributes({ sortOrder: value })
							}
						/>

						<ToggleControl
							label={__('Show Images')}
							checked={showImages}
							onChange={() =>
								setAttributes({ showImages: !showImages })
							}
						/>

						<ToggleControl
							label={__('Show Admin Replies')}
							checked={showAdminReply}
							onChange={() =>
								setAttributes({
									showAdminReply: !showAdminReply,
								})
							}
						/>
					</PanelBody>
				</InspectorControls>

				<div {...blockProps}>
					<ul className="multivendorx-review-list">
						<li className="multivendorx-review-item">
							<div className="header">
								<div className="details-wrapper">
									<div className="avatar">{reviewData.avatar}</div>
									<div className="name">{reviewData.name}</div>
									<span className="time">{reviewData.time}</span>
								</div>
							</div>

							<div className="body">
								<div className="rating">
									<span className="stars">
										{renderStars(reviewData.rating, true)}
									</span>
									<span className="title">{reviewData.title}</span>
								</div>

								<div className="content">{reviewData.content}</div>
							</div>

							{showImages && reviewData.images.length > 0 && (
								<div className="review-images">
									{reviewData.images.map((image, index) => (
										<a
											key={index}
											href={image}
											target="_blank"
											rel="noopener noreferrer"
										>
											<img src={image} alt={__('Review Image', 'multivendorx')} />
										</a>
									))}
								</div>
							)}

							{showAdminReply && reviewData.adminReply && (
								<div className="multivendorx-review-reply">
									<strong>{__('Admin reply:', 'multivendorx')}</strong>
									<p>{reviewData.adminReply}</p>
								</div>
							)}
						</li>
					</ul>
				</div>
			</>
		);
	},

	save: ({ attributes }) => {
		const { reviewsToShow, showImages, showAdminReply, sortOrder } =
			attributes;
		const blockProps = useBlockProps.save();

		return (
			<div
				{...blockProps}
				className="multivendorx-review-list"
				data-reviews-to-show={reviewsToShow}
				data-show-images={showImages}
				data-show-admin-reply={showAdminReply}
				data-sort-order={sortOrder}
			/>
		);
	},
});

document.addEventListener('DOMContentLoaded', () => {
	const activeModules = StoreInfo.activeModules;

	if (!activeModules.includes('store-review')) {
		return;
	}

	document.querySelectorAll('.multivendorx-review-list').forEach((el) => {
		const { reviewsToShow, showImages, showAdminReply, sortOrder } =
			el.dataset;

		const props = {
			reviewsToShow: Number(reviewsToShow),
			showImages: showImages === 'true',
			showAdminReply: showAdminReply === 'true',
			sortOrder,
		};

		render(
			<BrowserRouter>
				<StoreReview {...props} />
			</BrowserRouter>,
			el
		);
	});
});
