/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink } from '@zyra/core';

import { ButtonInput, TextAreaInput } from '@zyra/inputs';
import {
	FormGroupWrapperComponent,
	FormGroupComponent,
	PopupComponent,
	NavigatorHeaderComponent,
} from '@zyra/components';
import { TableCard, TableRow, QueryProps, CategoryCount } from '@zyra/table';

import {
	formatDate,
	formatLocalDate,
	formatStatusLabel,
} from '@/services/commonFunction';

type Review = {
	id: number;
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

const StoreReview: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [categoryCounts, setCategoryCounts] = useState<
		CategoryCount[] | null
	>(null);
	const [selectedReview, setSelectedReview] = useState<Review | null>(null);
	const [replyText, setReplyText] = useState<string>('');

	// 🔹 Handle reply saving
	const handleSaveReply = async () => {
		if (!selectedReview) {
			return;
		}
		try {
			await axios
				.post(
					getApiLink(appLocalizer, `reviews/${selectedReview.id}`),
					{
						reply: replyText,
						status: selectedReview.status,
					},
					{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
				)
				.then(() => {
					doRefreshTableData({});
				});

			setSelectedReview(null);
			setReplyText('');
		} catch {
			alert(__('Failed to save reply', 'multivendorx'));
		} finally {
			// setSaving(false);
		}
	};

	const fetchReviewById = (id: number) => {
		axios
			.get(getApiLink(appLocalizer, `reviews/${id}`), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((response) => {
				const item = response.data;
				if (item) {
					setSelectedReview(item);
					setReplyText(item.reply || '');
				}
			})
			.catch(() => {
				alert(__('Failed to fetch review data', 'multivendorx'));
			});
	};

	const headers = {
		customer_name: {
			label: __('Customer', 'multivendorx'),
			type: 'info',
			iconKey: 'info_icon',
			descriptionKey: 'info_descriptions',
			badgesKey: 'info_badges',
		},
		action: {
			label: __('Action', 'multivendorx'),
			type: 'action',
			actions: [
				{
					label: __('Reply / Edit', 'multivendorx'),
					icon: 'edit',
					onClick: (row) => fetchReviewById(row.id),
				},
			],
		},
	};

	const infoRows = rows.map((row: any) => {
		const rating = Math.round(row.overall_rating || 0);
		return {
			...row,
			info_icon: 'person',
			info_descriptions: [
				{
					label: __('Rating', 'multivendorx'),
					value: (
						<span className="review">
							{[...Array(rating)].map((_, i) => (
								<i
									key={`filled-${i}`}
									className="star-icon adminfont-star"
								/>
							))}
							{[...Array(5 - rating)].map((_, i) => (
								<i
									key={`empty-${i}`}
									className="star-icon adminfont-star-o"
								/>
							))}
						</span>
					),
				},
				{
					label: __('Review', 'multivendorx'),
					icon: 'store-review',
					value: row.review_title || '—',
				},
				{
					label: __('Details', 'multivendorx'),
					icon: 'text',
					value: row.review_content || '—',
				},
			],
			info_badges: [
				{
					text: formatStatusLabel(row.status),
					color: `badge-${row.status}`,
				},
				{ text: formatDate(row.date_created), color: 'gray' },
			],
		};
	});

	const filters = [
		{
			key: 'rating',
			label: __('Select Rating', 'multivendorx'),
			type: 'select',
			options: [
				{ label: __('All', 'multivendorx'), value: '' },
				{ label: __('5 Stars & Up', 'multivendorx'), value: '5' },
				{ label: __('4 Stars & Up', 'multivendorx'), value: '4' },
				{ label: __('3 Stars & Up', 'multivendorx'), value: '3' },
				{ label: __('2 Stars & Up', 'multivendorx'), value: '2' },
				{ label: __('1 Stars & Up', 'multivendorx'), value: '1' },
			],
		},
		{
			key: 'created_at',
			label: __('Created Date', 'multivendorx'),
			type: 'date',
		},
	];
	const doRefreshTableData = (query: QueryProps) => {
		setIsLoading(true);

		axios
			.get(getApiLink(appLocalizer, 'reviews'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: query.paged || 1,
					row: query.per_page || 10,
					status:
						query.categoryFilter === 'all'
							? ''
							: query.categoryFilter,
					search_value: query.searchValue || '',
					store_id: appLocalizer.store_id,
					start_date: query.filter?.created_at?.startDate
						? formatLocalDate(query.filter.created_at.startDate)
						: '',
					end_date: query.filter?.created_at?.endDate
						? formatLocalDate(query.filter.created_at.endDate)
						: '',
					overall_rating: query?.filter?.rating,
					order_by: query.orderby,
					order: query.order,
				},
			})
			.then((response) => {
				const items = response.data || [];
				const ids = items
					.filter((item) => item?.id != null)
					.map((item) => item.id);

				setRowIds(ids);

				setRows(items);

				setCategoryCounts([
					{
						value: 'all',
						label: __('All', 'multivendorx'),
						count: Number(response.headers['x-wp-total']) || 0,
					},
					{
						value: 'approved',
						label: __('Approved', 'multivendorx'),
						count:
							Number(response.headers['x-wp-status-approved']) ||
							0,
					},
					{
						value: 'pending',
						label: __('Pending', 'multivendorx'),
						count:
							Number(response.headers['x-wp-status-pending']) ||
							0,
					},
					{
						value: 'rejected',
						label: __('Rejected', 'multivendorx'),
						count:
							Number(response.headers['x-wp-status-rejected']) ||
							0,
					},
				]);

				setTotalRows(Number(response.headers['x-wp-total']) || 0);
				setIsLoading(false);
			})
			.catch(() => {
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
			});
	};

	return (
		<>
			<NavigatorHeaderComponent
				headerTitle={__('Store Review', 'multivendorx')}
				headerDescription={__(
					'See all customer reviews and ratings submitted for your store in one centralized list.',
					'multivendorx'
				)}
			/>

			<TableCard
				headers={headers}
				variant="transparent"
				rows={infoRows}
				totalRows={totalRows}
				isLoading={isLoading}
				onQueryUpdate={doRefreshTableData}
				ids={rowIds}
				categoryCounts={categoryCounts}
				search={{}}
				filters={filters}
				format={appLocalizer.date_format}
			/>
			{selectedReview && (
				<PopupComponent
					open={!!selectedReview}
					onClose={() => setSelectedReview(null)}
					width={31.25}
					height="70%"
					header={{
						icon: 'store-review',
						title: `${__('Reply to Review', 'multivendorx')} – ${selectedReview?.store_name}`,
						description: __(
							'View customer reviews and respond to feedback to build trust with shoppers.',
							'multivendorx'
						),
					}}
					footer={
						<ButtonInput
							buttons={[
								{
									icon: 'close',
									text: __('Cancel', 'multivendorx'),
									color: 'red',
									onClick: () => setSelectedReview(null),
								},
								{
									icon: 'save',
									text: __('Save', 'multivendorx'),
									onClick: handleSaveReply,
								},
							]}
						/>
					}
				>
					<>
						<div className="review-popup-wrapper">
							<div className="customer-wrapper">
								<div className="avatar">
									<i className="item-icon adminfont-person"></i>
								</div>
								<div className="name-wrapper">
									<div
										className="name"
										dangerouslySetInnerHTML={{
											__html: selectedReview.review_title,
										}}
									></div>

									<div className="rating-wrapper">
										{[
											...Array(
												Math.round(
													selectedReview.overall_rating ||
														0
												)
											),
										].map((_, i) => (
											<i
												key={`filled-${i}`}
												className="star-icon adminfont-star"
											></i>
										))}

										{[
											...Array(
												5 -
													Math.round(
														selectedReview.overall_rating ||
															0
													)
											),
										].map((_, i) => (
											<i
												key={`empty-${i}`}
												className="star-icon adminfont-star-o"
											></i>
										))}

										<div className="date">
											{new Date(
												selectedReview.date_created
											).toLocaleDateString('en-GB', {
												day: '2-digit',
												month: 'short',
												year: 'numeric',
											})}
										</div>
									</div>
								</div>
							</div>

							<div className="review">
								{selectedReview.review_content}
							</div>
						</div>

						<FormGroupWrapperComponent>
							<FormGroupComponent
								label={__(
									'Respond to customer',
									'multivendorx'
								)}
								htmlFor="reply"
							>
								<TextAreaInput
									name="reply"
									inputClass="input-text"
									value={replyText}
									onChange={(value) => setReplyText(value)}
									usePlainText={true}
								/>
							</FormGroupComponent>
						</FormGroupWrapperComponent>
					</>
				</PopupComponent>
			)}
		</>
	);
};

export default StoreReview;
