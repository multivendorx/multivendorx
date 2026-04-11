/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	getApiLink,
	FormGroupWrapper,
	Container,
	Column,
	TableCard,
	ButtonInputUI,
	TextAreaUI,
	PopupUI,
	QueryProps,
	InfoItem,
} from 'zyra';

import { formatLocalDate } from '@/services/commonFunction';

const PendingStores: React.FC<object> = () => {
	const [rows, setRows] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [rejectPopupOpen, setRejectPopupOpen] = useState(false);
	const [rejectReason, setRejectReason] = useState('');
	const [rejectStoreId, setRejectStoreId] = useState<number | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSingleAction = (action: string, storeId: number) => {
		if (!storeId) {
			return;
		}

		if (action === 'declined') {
			setRejectStoreId(storeId);
			setRejectPopupOpen(true);
			return;
		}

		const statusValue = action === 'active' ? 'active' : '';
		if (!statusValue) {
			return;
		}

		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `store/${storeId}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: { status: statusValue },
		})
			.then(() => {
				doRefreshTableData({});
			})
			.catch(console.error);
	};

	const submitReject = () => {
		if (!rejectStoreId || isSubmitting) {
			return;
		}

		setIsSubmitting(true);

		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `store/${rejectStoreId}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: {
				status: 'rejected',
				_reject_note: rejectReason || '', // allow empty reason
			},
		})
			.then(() => {
				setRejectPopupOpen(false);
				setRejectReason('');
				setRejectStoreId(null);
				doRefreshTableData({});
			})
			.catch(console.error)
			.finally(() => setIsSubmitting(false));
	};

	const filters = [
		{
			key: 'created_at',
			label: __('Created Date', 'multivendorx'),
			type: 'date',
		},
	];

	const headers = {
		store_name: {
			label: __('Store', 'multivendorx'),
			render: (row) => (
				<InfoItem
					title={row.store_name}
					avatar={{
						iconClass: 'store-inventory',
					}}
				/>
			),
		},
		applied_on: {
			label: __('Applied On', 'multivendorx'),
			sortable: true,
			type: 'date',
		},
		action: {
			label: __('Action', 'multivendorx'),
			render: (row) => {
				return (
					<ButtonInputUI
						buttons={[
							{
								icon: 'check',
								text: __('Active', 'multivendorx'),
								color: 'purple',
								onClick: () => {
									handleSingleAction('active', row.id);
								},
							},
							{
								icon: 'close',
								text: __('Declined', 'multivendorx'),
								color: 'red',
								onClick: () =>
									handleSingleAction('declined', row.id),
							},
						]}
					/>
				);
			},
		},
	};

	const doRefreshTableData = (query: QueryProps) => {
		setIsLoading(true);

		axios
			.get(getApiLink(appLocalizer, 'store'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: query.paged || 1,
					row: query.per_page || 10,
					status: 'pending',
					start_date: query.filter?.created_at?.startDate
						? formatLocalDate(query.filter.created_at.startDate)
						: '',
					end_date: query.filter?.created_at?.endDate
						? formatLocalDate(query.filter.created_at.endDate)
						: '',
				},
			})
			.then((response) => {
				const items = response.data || [];
				// Extract IDs for selection
				const ids = items
					.filter((item) => item?.id != null)
					.map((item) => item.id);
				setRowIds(ids);

				setRows(items);
				const count = Number(response.headers['x-wp-total']) || 0;
				setTotalRows(count);
				window.multivendorxStore?.setCount('stores', count);
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
		<TableCard
			headers={headers}
			rows={rows}
			totalRows={totalRows}
			isLoading={isLoading}
			onQueryUpdate={doRefreshTableData}
			ids={rowIds}
			search={{}}
			filters={filters}
			format={appLocalizer.date_format}
		/>

			{/* Reject Popup */}
			{rejectPopupOpen && (
				<PopupUI
					open={rejectPopupOpen}
					onClose={() => {
						setRejectPopupOpen(false);
						setRejectReason('');
					}}
					width={31.25}
					header={{
						icon: 'cart',
						title: __('Reason', 'multivendorx'),
					}}
					footer={
						<ButtonInputUI
							buttons={[
								{
									icon: 'close',
									text: __('Cancel', 'multivendorx'),
									color: 'red',
									onClick: () => {
										setRejectPopupOpen(false);
										setRejectReason('');
									},
								},
								{
									icon: 'permanently-rejected',
									text: __('Reject', 'multivendorx'),
									color: 'red-bg',
									onClick: () => submitReject(),
								},
							]}
						/>
					}
				>
					<>
						<FormGroupWrapper>
							<TextAreaUI
								name="reject_reason"
								value={rejectReason}
								onChange={(value: string) =>
									setRejectReason(value)
								}
								placeholder={__(
									'Enter reason for rejecting this store...',
									'multivendorx'
								)}
								rows={4}
							/>
						</FormGroupWrapper>
					</>
				</PopupUI>
			)}
		</>
	);
};

export default PendingStores;
