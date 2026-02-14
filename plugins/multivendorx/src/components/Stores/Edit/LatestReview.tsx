/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { Table, TableCell, getApiLink } from 'zyra';
import { ColumnDef } from '@tanstack/react-table';

type Review = {
	review_id: number;
	store_id: number;
	customer_id: number;
	customer_name: string;
	order_id: number;
	overall_rating: number;
	review_title: string;
	review_content: string;
	status: string;
	reported: number;
	reply: string;
	reply_date: string;
	date_created: string;
	date_modified: string;
	review_images: string[];
	time_ago: string;
	store_name?: string;
};

interface LatestReviewProps {
	store_id?: number;
}

const LatestReview: React.FC<LatestReviewProps> = ({ store_id }) => {
	const [data, setData] = useState<Review[]>([]);

	useEffect(() => {
		if (store_id) {
			requestData(3, 1, store_id);
		}
	}, [store_id]);

	// Fetch data from backend.
	function requestData(
		rowsPerPage = 3,
		currentPage = 1,
		store_id?: number,
		orderBy = 'date_created',
		order = 'desc'
	) {
		setData([]);
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'review'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				page: currentPage,
				row: rowsPerPage,
				store_id,
				orderBy,
				order,
			},
		})
			.then((response) => {
				const items = response.data.items || [];
				setData(items);
			})
			.catch(() => {
				setData([]);
			});
	}

	// Table Columns
	const columns: ColumnDef<Review>[] = [
		{
			id: 'customer',
			header: __('Customer', 'multivendorx'),
			cell: ({ row }) => {
				const { customer_id, customer_name } = row.original;
				const editLink = `${window.location.origin}/wp-admin/user-edit.php?user_id=${customer_id}`;

				return (
					<TableCell title={customer_name || '-'}>
						{customer_id ? (
							<a
								href={editLink}
								target="_blank"
								rel="noreferrer"
								className="customer-link"
							>
								{customer_name}
							</a>
						) : (
							__('-', 'multivendorx')
						)}
					</TableCell>
				);
			},
		},
		{
			id: 'rating-details',
			header: __('Details', 'multivendorx'),
			cell: ({ row }) => {
				const rating = row.original.overall_rating ?? 0;
				const content = row.original.review_content || '';
				const shortText =
					content.length > 40
						? content.substring(0, 40) + '...'
						: content;
				return (
					<TableCell title={rating.toString()}>
						<div className="rating-details-wrapper">
							<div className="title-wrapper">
								<div className="rating-wrapper">
									{rating > 0 ? (
										<>
											{[...Array(Math.round(rating))].map(
												(_, i) => (
													<i
														key={`filled-${i}`}
														className="star-icon adminfont-star"
													></i>
												)
											)}
											{[
												...Array(
													5 - Math.round(rating)
												),
											].map((_, i) => (
												<i
													key={`empty-${i}`}
													className="star-icon adminfont-star-o"
												></i>
											))}
										</>
									) : (
										__('-', 'multivendorx')
									)}
								</div>
								<div className="title">
									{row.original.review_title ||
										__('-', 'multivendorx')}
								</div>
							</div>

							<div className="review">
								{shortText || __('-', 'multivendorx')}
							</div>
						</div>
					</TableCell>
				);
			},
		},
		{
			header: __('Date', 'multivendorx'),
			cell: ({ row }) => {
				const rawDate = row.original.date_created;
				const formattedDate = rawDate
					? new Intl.DateTimeFormat('en-US', {
							month: 'short',
							day: 'numeric',
							year: 'numeric',
						}).format(new Date(rawDate))
					: __('-', 'multivendorx');
				return (
					<TableCell title={formattedDate}>{formattedDate}</TableCell>
				);
			},
		},
	];

	return (
		<Table
			data={data || []}
			columns={columns as ColumnDef<Record<string, any>, any>[]}
		/>
	);
};

export default LatestReview;
