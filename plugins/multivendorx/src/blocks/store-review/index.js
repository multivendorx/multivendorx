/* global StoreInfo */
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
								{
									label: __('Newest First', 'multivendorx'),
									value: 'DESC',
								},
								{
									label: __('Oldest First', 'multivendorx'),
									value: 'ASC',
								},
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
					<ul className="wc-block-review-list wc-block-components-review-list">
						{/* Review 1 - New Product */}
						<li
							className="wc-block-review-list-item__item wc-block-components-review-list-item__item wc-block-components-review-list-item__item--has-image"
							aria-hidden="false"
						>
							<div className="wc-block-review-list-item__info wc-block-components-review-list-item__info">
								<div className="wc-block-review-list-item__image wc-block-components-review-list-item__image">
									<img
										aria-hidden="true"
										alt=""
										src="https://secure.gravatar.com/avatar/be3221a6fac131657111728b4d912a877ec158b123d5db3afef3bd8a59784ece?s=96&d=mm&r=g"
									/>
								</div>

								<div className="wc-block-review-list-item__meta wc-block-components-review-list-item__meta">
									<div
										id="review-1"
										aria-label={__(
											'new product Rated 4 out of 5',
											'multivendorx'
										)}
										className="wc-block-review-list-item__rating wc-block-components-review-list-item__rating"
									>
										<div
											aria-hidden="true"
											className="wc-block-review-list-item__rating__stars wc-block-components-review-list-item__rating__stars wc-block-review-list-item__rating__stars--4"
											role="img"
										>
											<span style={{ width: '80%' }}>
												{__('Rated', 'multivendorx')}{' '}
												<strong className="rating">
													4
												</strong>{' '}
												{__('out of 5', 'multivendorx')}
											</span>
										</div>
									</div>

									<div className="wc-block-review-list-item__product wc-block-components-review-list-item__product">
										<a
											href="http://localhost:8889/product/new-product/"
											aria-labelledby="review-1"
										>
											{__('new product', 'multivendorx')}
										</a>
									</div>

									<div className="wc-block-review-list-item__author wc-block-components-review-list-item__author">
										{__('admin', 'multivendorx')}
									</div>

									<time
										className="wc-block-review-list-item__published-date wc-block-components-review-list-item__published-date"
										dateTime="2026-03-05T13:47:31"
									>
										{__('March 5, 2026', 'multivendorx')}
									</time>
								</div>
							</div>

							<div className="wc-block-review-list-item__text wc-block-components-review-list-item__text">
								<div>
									<div>
										<p>{__('dd', 'multivendorx')}</p>
									</div>
								</div>
							</div>
						</li>

						{/* Review 2 - Hat */}
						<li
							className="wc-block-review-list-item__item wc-block-components-review-list-item__item wc-block-components-review-list-item__item--has-image"
							aria-hidden="false"
						>
							<div className="wc-block-review-list-item__info wc-block-components-review-list-item__info">
								<div className="wc-block-review-list-item__image wc-block-components-review-list-item__image">
									<img
										aria-hidden="true"
										alt=""
										src="https://secure.gravatar.com/avatar/be3221a6fac131657111728b4d912a877ec158b123d5db3afef3bd8a59784ece?s=96&d=mm&r=g"
									/>
								</div>

								<div className="wc-block-review-list-item__meta wc-block-components-review-list-item__meta">
									<div
										id="review-2"
										aria-label={__(
											'Hat Rated 4 out of 5',
											'multivendorx'
										)}
										className="wc-block-review-list-item__rating wc-block-components-review-list-item__rating"
									>
										<div
											aria-hidden="true"
											className="wc-block-review-list-item__rating__stars wc-block-components-review-list-item__rating__stars wc-block-review-list-item__rating__stars--4"
											role="img"
										>
											<span style={{ width: '80%' }}>
												{__('Rated', 'multivendorx')}{' '}
												<strong className="rating">
													4
												</strong>{' '}
												{__('out of 5', 'multivendorx')}
											</span>
										</div>
									</div>

									<div className="wc-block-review-list-item__product wc-block-components-review-list-item__product">
										<a
											href="http://localhost:8889/product/hat/"
											aria-labelledby="review-2"
										>
											{__('Hat', 'multivendorx')}
										</a>
									</div>

									<div className="wc-block-review-list-item__author wc-block-components-review-list-item__author">
										{__('admin', 'multivendorx')}
									</div>

									<time
										className="wc-block-review-list-item__published-date wc-block-components-review-list-item__published-date"
										dateTime="2026-03-02T13:52:43"
									>
										{__('March 2, 2026', 'multivendorx')}
									</time>
								</div>
							</div>

							<div className="wc-block-review-list-item__text wc-block-components-review-list-item__text">
								<div>
									<div>
										<p>{__('dgdggdd', 'multivendorx')}</p>
									</div>
								</div>
							</div>
						</li>

						{/* Review 3 - T-shirt (New Static Review) */}
						<li
							className="wc-block-review-list-item__item wc-block-components-review-list-item__item wc-block-components-review-list-item__item--has-image"
							aria-hidden="false"
						>
							<div className="wc-block-review-list-item__info wc-block-components-review-list-item__info">
								<div className="wc-block-review-list-item__image wc-block-components-review-list-item__image">
									<img
										aria-hidden="true"
										alt=""
										src="https://secure.gravatar.com/avatar/1b8d7f9e3a2c4d5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0?s=96&d=mm&r=g"
									/>
								</div>

								<div className="wc-block-review-list-item__meta wc-block-components-review-list-item__meta">
									<div
										id="review-3"
										aria-label={__(
											'T-shirt Rated 5 out of 5',
											'multivendorx'
										)}
										className="wc-block-review-list-item__rating wc-block-components-review-list-item__rating"
									>
										<div
											aria-hidden="true"
											className="wc-block-review-list-item__rating__stars wc-block-components-review-list-item__rating__stars wc-block-review-list-item__rating__stars--5"
											role="img"
										>
											<span style={{ width: '100%' }}>
												{__('Rated', 'multivendorx')}{' '}
												<strong className="rating">
													5
												</strong>{' '}
												{__('out of 5', 'multivendorx')}
											</span>
										</div>
									</div>

									<div className="wc-block-review-list-item__product wc-block-components-review-list-item__product">
										<a aria-labelledby="review-3">
											{__('T-shirt', 'multivendorx')}
										</a>
									</div>

									<div className="wc-block-review-list-item__author wc-block-components-review-list-item__author">
										{__('johndoe', 'multivendorx')}
									</div>

									<time
										className="wc-block-review-list-item__published-date wc-block-components-review-list-item__published-date"
										dateTime="2026-03-10T09:15:22"
									>
										{__('March 10, 2026', 'multivendorx')}
									</time>
								</div>
							</div>

							<div className="wc-block-review-list-item__text wc-block-components-review-list-item__text">
								<div>
									<div>
										<p>
											{__(
												'Great quality t-shirt, fits perfectly and the material is super comfortable! Highly recommended.',
												'multivendorx'
											)}
										</p>
									</div>
								</div>
							</div>
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
