/* global appLocalizer */
import React, { useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { getApiLink } from '@zyra/core';
import { FormGroupWrapperComponent, PopupComponent } from '@zyra/components';
import { ButtonInput, TextAreaInput } from '@zyra/inputs';
import { TableCard, QueryProps } from '@zyra/table';

import { formatDate, formatLocalDate, getUrl } from '@/services/commonFunction';
import ListGate from '../Popup/ListGate';
import useNoRecordsYet from '../Popup/useNoRecordsYet';
import { SAMPLE_PENDING_STORES } from '../Popup/sampleRows';

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

		const statusValue = action === 'active' ? 'approve' : '';
		if (!statusValue) {
			return;
		}

		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `stores/${storeId}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: { status: statusValue, approval_queue: true },
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
			url: getApiLink(appLocalizer, `stores/${rejectStoreId}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: {
				status: 'rejected',
				reject_note: rejectReason || '', // allow empty reason
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
			type: 'info',
			iconKey: 'info_icon',
			titleLinkKey: 'info_link',
			descriptionKey: 'info_descriptions',
			badgesKey: 'info_badges',
		},
		action: {
			key: 'action',
			type: 'action',
			label: __('Action', 'multivendorx'),
			actions: [
				{
					label: __('View', 'multivendorx'),
					icon: 'eye',
					onClick: (row) => {
						window.location.assign(getUrl(row.id, 'store', 'edit'));
					},
				},
				{
					label: __('Approve', 'multivendorx'),
					icon: 'check',
					onClick: (row) => {
						handleSingleAction('active', row.id);
					},
				},
				{
					label: __('Reject', 'multivendorx'),
					icon: 'close',
					onClick: (row) => {
						handleSingleAction('declined', row.id);
					},
				},
			],
		},
	};

	const doRefreshTableData = (query: QueryProps) => {
		setIsLoading(true);

		axios
			.get(getApiLink(appLocalizer, 'stores'), {
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

	/** A record as a table row; the sample rows go through it too, so they look like real ones. */
	const toInfoRow = (row: any) => ({
		...row,
		info_icon: 'store-inventory',
		info_link: getUrl(row.id, 'store', 'edit'),
		info_descriptions: row.description
			? [
					{
						label: __('About', 'multivendorx'),
						icon: 'text',
						value: String(row.description)
							.replace(/<[^>]*>/g, '')
							.trim()
							.slice(0, 60),
					},
				]
			: [],
		info_badges: [{ text: formatDate(row.applied_on), color: 'blue' }],
	});
	const infoRows = rows.map(toInfoRow);

	const sampleRowsData = SAMPLE_PENDING_STORES;
	const { props: gatedProps, hasNoRecords } = useNoRecordsYet({
		rows: infoRows,
		isLoading,
		onQueryUpdate: doRefreshTableData,
	});

	return (
		<>
			<ListGate
				feature={{
					title: __('Stores awaiting approval', 'multivendorx'),
					description: '',
					icon: 'storefront',
				}}
				sample={
					<TableCard
						headers={headers}
						variant="transparent"
						search={{
							placeholder: __('Search stores…', 'multivendorx'),
						}}
						filters={filters}
						format={appLocalizer.date_format}
						rows={sampleRowsData.map(toInfoRow)}
						totalRows={sampleRowsData.length}
					/>
				}
				isEmpty={hasNoRecords}
				empty={{
					heading: __(
						'No stores waiting for approval',
						'multivendorx'
					),
					description: __(
						'When registration needs your approval, each new store waits here until you approve or reject it.',
						'multivendorx'
					),
					actions: (
						<>
							<a
								className="mvx-locked-button"
								href={'#&tab=settings&subtab=registration'}
							>
								{__('Registration settings', 'multivendorx')}
							</a>
							<a
								className="mvx-locked-link"
								href={'#&tab=stores'}
							>
								{__('View all stores', 'multivendorx')}
							</a>
						</>
					),
					note: __(
						'A preview with sample stores. New applications show here.',
						'multivendorx'
					),
				}}
			>
				<TableCard
					headers={headers}
					variant="transparent"
					rows={infoRows}
					totalRows={totalRows}
					isLoading={isLoading}
					onQueryUpdate={gatedProps.onQueryUpdate}
					ids={rowIds}
					search={{
						placeholder: __('Search stores…', 'multivendorx'),
					}}
					filters={filters}
					format={appLocalizer.date_format}
				/>
			</ListGate>

			{/* Reject Popup */}
			{rejectPopupOpen && (
				<PopupComponent
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
						<ButtonInput
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
						<FormGroupWrapperComponent>
							<TextAreaInput
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
						</FormGroupWrapperComponent>
					</>
				</PopupComponent>
			)}
		</>
	);
};

export default PendingStores;
