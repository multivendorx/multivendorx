/* global StoreInfo */
import { __ } from '@wordpress/i18n';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { getApiLink } from 'zyra';

interface StoreReviewProps {
	reviewsToShow: number;
	showImages: boolean;
	showAdminReply: boolean;
	sortOrder: string;
}

interface Review {
	review_id: number;
	customer_name: string;
	review_title: string;
	review_content: string;
	overall_rating: number;
	reply?: string;
	date_created: string;
	images?: string[];
	avatar_url?: string;
	product_name?: string;
	product_url?: string;
}

const StoreReview: React.FC<StoreReviewProps> = ({
	reviewsToShow,
	showImages,
	sortOrder,
}) => {
	const [reviews, setReviews] = useState<Review[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [expandedReviews, setExpandedReviews] = useState<
		Record<number, boolean>
	>({});

	useEffect(() => {
		setLoading(true);

		axios
			.get(getApiLink(StoreInfo, 'review'), {
				headers: { 'X-WP-Nonce': StoreInfo.nonce },
				params: {
					page: 1,
					row: reviewsToShow,
					store_id: StoreInfo.storeDetails.storeId,
					status: 'approved',
				},
			})
			.then((response) => {
				setReviews(Array.isArray(response.data) ? response.data : []);
			})
			.finally(() => setLoading(false));
	}, [reviewsToShow, sortOrder]);

	const toggleReview = (reviewId: number) => {
		setExpandedReviews((prev) => ({
			...prev,
			[reviewId]: !prev[reviewId],
		}));
	};

	const truncateContent = (content: string, maxLength: number = 150) => {
		if (content.length <= maxLength) {
			return content;
		}
		return content.substring(0, maxLength) + '...';
	};

	if (loading) {
		return <p>{__('Loading reviews…', 'multivendorx')}</p>;
	}

	// Only render the block if there are reviews
	if (reviews.length === 0) {
		return null;
	}

	return (
		<div className="multivendorx-review-list-wrapper woocommerce">
			<h3>{__('Store Review', 'multivendorx')}</h3>
			<div id="reviews" className="woocommerce-Reviews">
				<div id="comments">
					<ul className="wc-block-review-list wc-block-components-review-list">
						{reviews.map((review) => {
							const isExpanded =
								expandedReviews[review.review_id] || false;
							const maxLength = 20;
							const shouldTruncate =
								review.review_content.length > maxLength;
							const displayContent = isExpanded
								? review.review_content
								: truncateContent(
										review.review_content,
										maxLength
									);

							return (
								<li
									key={review.review_id}
									className="wc-block-review-list-item__item wc-block-components-review-list-item__item wc-block-components-review-list-item__item--has-image"
									aria-hidden="false"
								>
									<div className="wc-block-review-list-item__info wc-block-components-review-list-item__info">
										<div className="wc-block-review-list-item__image wc-block-components-review-list-item__image">
											<img
												aria-hidden="true"
												alt=""
												src={
													review.avatar_url ||
													StoreInfo.default_user_avatar
												}
											/>
										</div>

										<div className="wc-block-review-list-item__meta wc-block-components-review-list-item__meta">
											<div
												id={`review-${review.review_id}`}
												aria-label={`${review.review_title || 'Review'} Rated ${review.overall_rating?.toFixed(1)} out of 5`}
												className="wc-block-review-list-item__rating wc-block-components-review-list-item__rating"
											>
												<div
													aria-hidden="true"
													className={`wc-block-review-list-item__rating__stars wc-block-components-review-list-item__rating__stars wc-block-review-list-item__rating__stars--${Math.round(review.overall_rating)}`}
													role="img"
												>
													<span
														style={{
															width: `${(review.overall_rating / 5) * 100}%`,
														}}
													>
														{__(
															'Rated ',
															'multivendorx'
														)}
														<strong className="rating">
															{review.overall_rating?.toFixed(
																1
															)}
														</strong>
														{__(
															' out of 5',
															'multivendorx'
														)}
													</span>
												</div>
											</div>

											{review.product_name && (
												<div className="wc-block-review-list-item__product wc-block-components-review-list-item__product">
													<a
														href={
															review.product_url ||
															'#'
														}
														aria-labelledby={`review-${review.review_id}`}
													>
														{review.product_name}
													</a>
												</div>
											)}

											<div className="wc-block-review-list-item__author wc-block-components-review-list-item__author">
												{review.customer_name}
											</div>

											<time
												className="wc-block-review-list-item__published-date wc-block-components-review-list-item__published-date"
												dateTime={review.date_created}
											>
												{new Date(
													review.date_created
												).toLocaleDateString('en-US', {
													year: 'numeric',
													month: 'long',
													day: 'numeric',
												})}
											</time>
										</div>
									</div>

									<div className="wc-block-review-list-item__text wc-block-components-review-list-item__text">
										<div>
											<div>
												{review.review_title && (
													<h4 className="woocommerce-review__title">
														{review.review_title}
													</h4>
												)}

												<div className="review-content-wrapper">
													<p>{displayContent}</p>
													{shouldTruncate && (
														<span
															onClick={() =>
																toggleReview(
																	review.review_id
																)
															}
															className="read-more-button"
														>
															{isExpanded
																? __(
																		'Read less',
																		'multivendorx'
																	)
																: __(
																		'Read more',
																		'multivendorx'
																	)}
														</span>
													)}
												</div>

												{showImages &&
													review.images?.length >
														0 && (
														<div className="review-images">
															{review.images.map(
																(
																	img,
																	index
																) => (
																	<a
																		key={
																			index
																		}
																		href={
																			img
																		}
																		target="_blank"
																		rel="noopener noreferrer"
																	>
																		<img
																			src={
																				img
																			}
																			alt={__(
																				'Review Image',
																				'multivendorx'
																			)}
																			style={{
																				maxWidth:
																					'100px',
																				margin: '5px',
																			}}
																		/>
																	</a>
																)
															)}
														</div>
													)}
											</div>
										</div>
									</div>
								</li>
							);
						})}
					</ul>
				</div>
			</div>
		</div>
	);
};

export default StoreReview;
