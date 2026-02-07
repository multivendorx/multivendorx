/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	CommonPopup,
	getApiLink,
	AdminButton,
	FormGroupWrapper,
	FormGroup,
	TextArea,
} from 'zyra';

import { formatLocalDate, formatWcShortDate } from '@/services/commonFunction';
import { categoryCounts, QueryProps, TableRow } from '@/services/type';

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

const StoreReview: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [categoryCounts, setCategoryCounts] = useState<
		categoryCounts[] | null
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
				.put(
					getApiLink(
						appLocalizer,
						`review/${selectedReview.review_id}`
					),
					{
						reply: replyText,
						status: selectedReview.status,
					},
					{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
				)
				.then(() => {
					fetchData({});
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
			.get(getApiLink(appLocalizer, `review/${id}`), {
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
			})
	};

	const headers = [
		{ key: 'customer', label: __('Customer', 'multivendorx') },
		{ key: 'details', label: __('Details', 'multivendorx'), type: 'card' },
		{ key: 'status', label: __('Status', 'multivendorx'), type: 'status' },
		{ key: 'date_created', label: __('Date', 'multivendorx'), sortable: true },
		{
			key: 'action',
			label: __('Action', 'multivendorx'),
			type: 'action',
			actions: [
				{
					label: __('Reply / Edit', 'multivendorx'),
					icon: 'edit',
					onClick: (id: number) => fetchReviewById(id),
				},
			],
		},
	];

	const filters = [
		{
			key: 'rating',
			label: 'Status',
			type: 'select',
			options: [
				{ label: 'All', value: '' },
				{ label: '5 Stars & Up', value: '5' },
				{ label: '4 Stars & Up', value: '4' },
				{ label: '3 Stars & Up', value: '3' },
				{ label: '2 Stars & Up', value: '2' },
				{ label: '1 Stars & Up', value: '1' },
			],
		},
		{
			key: 'created_at',
			label: 'Created Date',
			type: 'date',
		},
	];

	const fetchData = (query: QueryProps) => {
		setIsLoading(true);

		axios
			.get(getApiLink(appLocalizer, 'review'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: query.paged || 1,
					row: query.per_page || 10,
					status: query.categoryFilter || '',
					searchValue: query.searchValue || '',
					storeId: appLocalizer.store_id,
					startDate: query.filter?.created_at?.startDate
						? formatLocalDate(query.filter.created_at.startDate)
						: '',
					endDate: query.filter?.created_at?.endDate
						? formatLocalDate(query.filter.created_at.endDate)
						: '',
					overallRating: query?.filter?.rating,
					orderBy: query.orderby,
					order: query.order,
				},
			})
			.then((response) => {
				const items = response.data || [];
				const ids = items
					.filter((item: any) => item?.review_id != null)
					.map((item: any) => item.review_id);

				setRowIds(ids);

				const mappedRows: any[][] = items.map((item: any) => [
					{
						value: item.customer_id,
						display: item.customer_name || '-',
						type: 'card',
						data: {
							name: item.customer_name,
							link: item.customer_id
								? `${window.location.origin}/wp-admin/user-edit.php?user_id=${item.customer_id}`
								: null,
						},
					},
					{
						type: 'card',
						value: item.id,
						display: item.id || '-',
						data: {
							name: item.overall_rating || 0,
							description: item.review_title || '-',
							subDescription: item.review_content || '',
						},
					},
					{
						value: item.status,
						display: item.status,
					},
					{
						value: item.date_created,
						display: formatWcShortDate(item.date_created),
					}
				]);

				setRows(mappedRows);

				setCategoryCounts([
					{
						value: 'all',
						label: 'All',
						count: Number(response.headers['x-wp-total']) || 0,
					},
					{
						value: 'approved',
						label: 'Approved',
						count: Number(response.headers['x-wp-status-approved']) || 0,
					},
					{
						value: 'pending',
						label: 'Pending',
						count: Number(response.headers['x-wp-status-pending']) || 0,
					},
					{
						value: 'rejected',
						label: 'Rejected',
						count: Number(response.headers['x-wp-status-rejected']) || 0,
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
			<div className="page-title-wrapper">
				<div className="page-title">
					<div className="title">{__('Store Review', 'multivendorx')}</div>
					<div className="des">
						{__('See all customer reviews and ratings submitted for your store in one centralized list.', 'multivendorx')}
					</div>
				</div>
			</div>
			<TableCard
				headers={headers}
				rows={rows}
				totalRows={totalRows}
				isLoading={isLoading}
				onQueryUpdate={fetchData}
				ids={rowIds}
				categoryCounts={categoryCounts}
				search={{}}
				filters={filters}
			/>
			{selectedReview && (
				<CommonPopup
					open={!!selectedReview}
					onClose={() => setSelectedReview(null)}
					width="31.25rem"
					height="70%"
					header={{
						icon: 'store-review',
						title: `${__('Reply to Review', 'multivendorx')} – ${selectedReview?.store_name}`,
						description: __(
							'Publish important news, updates, or alerts that appear directly in store dashboards, ensuring sellers never miss critical information.',
							'multivendorx'
						),
					}}
					footer={
						<AdminButton
							buttons={[
								{
									icon: 'close',
									text: __('Cancel', 'multivendorx'),
									className: 'red',
									onClick: () => setSelectedReview(null),
								},
								{
									icon: 'save',
									text: __('Save', 'multivendorx'),
									className: 'purple-bg',
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
								{selectedReview && (
									<div className="name-wrapper">
										<div
											className="name"
											dangerouslySetInnerHTML={{
												__html: selectedReview.review_title,
											}}
										></div>

										<div className="rating-wrapper">
											{[...Array(Math.round(selectedReview.overall_rating || 0))].map(
												(_, i) => (
													<i
														key={`filled-${i}`}
														className="star-icon adminfont-star"
													></i>
												)
											)}

											{[
												...Array(
													5 - Math.round(selectedReview.overall_rating || 0)
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
												).toLocaleDateString(
													'en-GB',
													{
														day: '2-digit',
														month: 'short',
														year: 'numeric',
													}
												)}
											</div>
										</div>
									</div>
								)}
							</div>

							<div className="review">
								{selectedReview.review_content}
							</div>
						</div>

						<FormGroupWrapper>
							<FormGroup
								label={__('Respond to customer', 'multivendorx')}
								htmlFor="reply"
							>
								<TextArea
									name="reply"
									inputClass="input-text"
									value={replyText}
									onChange={(e) => setReplyText(e.target.value)}
									usePlainText={true}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</>
				</CommonPopup>
			)}
		</>
	);
};

export default StoreReview;
