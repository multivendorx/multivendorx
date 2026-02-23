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
}

const StoreReview: React.FC<StoreReviewProps> = ({
	reviewsToShow,
	showImages,
	showAdminReply,
	sortOrder,
}) => {
	const [reviews, setReviews] = useState<Review[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		setLoading(true);

		axios
			.get(getApiLink(StoreInfo, 'review'), {
				headers: { 'X-WP-Nonce': StoreInfo.nonce },
				params: {
					page: 1,
					row: reviewsToShow,
					storeId: StoreInfo.storeDetails.storeId,
					orderBy: 'date_created',
					order: sortOrder,
					status: 'approved',
				},
			})
			.then((response) => {
				setReviews(Array.isArray(response.data) ? response.data : []);
			})
			.finally(() => setLoading(false));
	}, [reviewsToShow, sortOrder]);

	const renderStars = (rating: number) => {
		return Array.from({ length: 5 }).map((_, i) => (
			<i
				key={i}
				className={`dashicons ${i < rating
						? 'dashicons-star-filled'
						: 'dashicons-star-empty'
					}`}
			/>
		));
	};

	if (loading) {
		return <p>{__('Loading reviews…', 'multivendorx')}</p>;
	}

	if (!reviews.length) {
		return <p>{__('No reviews found.', 'multivendorx')}</p>;
	}

	return (
		<div className="multivendorx-review-list-wrapper">
			<h3>{__('Product Review', 'multivendorx')}</h3>
			{reviews.length > 0 ? (
				<ul className="multivendorx-review-list">
					{reviews.map((review) => (
						<li key={review.review_id} className="multivendorx-review-item">
							<div className="header">
								<div className="details-wrapper">
									<div className="avatar">
										{review.customer_name?.charAt(0) || 'U'}
									</div>
									<div className="name">{review.customer_name}</div>
									<span className="time">{review.date_created}</span>
								</div>
							</div>

							<div className="body">
								<div className="rating">
									<span className="stars">
										{renderStars(review.overall_rating)}
									</span>
									<span className="title">{review.review_title}</span>
								</div>

								<div className="content">{review.review_content}</div>
							</div>

							{showImages && review.images?.length ? (
								<div className="review-images">
									{review.images.map((img, i) => (
										<a
											key={i}
											href={img}
											target="_blank"
											rel="noopener noreferrer"
										>
											<img
												src={img}
												alt={__('Review Image', 'multivendorx')}
											/>
										</a>
									))}
								</div>
							) : null}

							{showAdminReply && review.reply && (
								<div className="multivendorx-review-reply">
									<strong>
										{__('Admin reply:', 'multivendorx')}
									</strong>
									<p>{review.reply}</p>
								</div>
							)}
						</li>
					))}
				</ul>
			) : (
				<p> {__('No reviews found.', 'multivendorx')}</p>
			)}
		</div>
	);
};

export default StoreReview;
