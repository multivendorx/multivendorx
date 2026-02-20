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
	AdminButtonUI,
	TextAreaUI,
	PopupUI,
} from 'zyra';

import { formatLocalDate } from '@/services/commonFunction';
import { QueryProps, TableRow } from '@/services/type';

const PendingStores: React.FC<{ onUpdated?: () => void }> = ({ onUpdated }) => {
	const [rows, setRows] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [rejectPopupOpen, setRejectPopupOpen] = useState(false);
	const [rejectReason, setRejectReason] = useState('');
	const [rejectStoreId, setRejectStoreId] = useState<number | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false); // prevent multiple submissions

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
			method: 'PUT',
			url: getApiLink(appLocalizer, `store/${storeId}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: { status: statusValue },
		})
			.then(() => {
				doRefreshTableData({});
				onUpdated?.();
			})
			.catch(console.error);
	};

	const submitReject = () => {
		if (!rejectStoreId || isSubmitting) {
			return;
		}

		setIsSubmitting(true);

		axios({
			method: 'PUT',
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
				onUpdated?.();
			})
			.catch(console.error)
			.finally(() => setIsSubmitting(false));
	};

	const filters = [
		{
			key: 'created_at',
			label: 'Created Date',
			type: 'date',
		},
	];

	const headers = {
		store_name: {
			label: __('Store', 'multivendorx'),
		},
		email: {
			label: __('Email', 'multivendorx'),
		},
		applied_on: {
			label: __('Applied On', 'multivendorx'),
			sortable: true,
			type: 'date',
		},
		action: {
			label: __('Action', 'multivendorx'),
			type: 'action',
			actions: [
				{
					label: __('Approve', 'multivendorx'),
					icon: 'check',
					onClick: (row: any) => handleSingleAction('active', row.id),
				},
				{
					label: __('Reject', 'multivendorx'),
					icon: 'close',
					onClick: (row: any) =>
						handleSingleAction('declined', row.id),
				},
			],
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
				console.log('api', items);
				// Extract IDs for selection
				const ids = items
					.filter((item: any) => item?.id != null)
					.map((item: any) => item.id);
				setRowIds(ids);

				setRows(items);
				// setTotalRows(Number(response.headers['x-wp-status-pending']) || 0);
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
			<Container>
				<Column>
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
				</Column>
			</Container>

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
						<AdminButtonUI
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
