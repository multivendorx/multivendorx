import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	AdminButtonUI,
	Column,
	Container,
	FormGroup,
	FormGroupWrapper,
	getApiLink,
	PopupUI,
	TableCard,
	TextAreaUI,
} from 'zyra';
import { formatCurrency, toWcIsoDate, truncateText } from '../../services/commonFunction';
import { QueryProps, TableRow } from '@/services/type';

interface StoreRow {
	id: number;
	store_name: string;
	store_id?: string;
	amount: string;
	commission_amount: string;
	date: string;
	status: string;
	currency_symbol: string;
	reason?: string;
	refund_images?: string[];
	refund_products?: number[];
	addi_info?: string;
}

interface Props {
	onUpdated?: () => void;
}

const PendingRefund: React.FC<Props> = ({ onUpdated }) => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [store, setStore] = useState<any[]>([]);
	const [popupOpen, setPopupOpen] = useState(false);
	const [formData, setFormData] = useState({ content: '' });
	const [viewOrder, setViewOrder] = useState<StoreRow | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		axios
			.get(getApiLink(appLocalizer, 'store'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
			})
			.then((response) => {
				const options =
					(response.data || []).map((store: any) => ({
						label: store.store_name,
						value: store.id,
					}));

				setStore(options);
				setIsLoading(false);
			})
			.catch(() => {
				setStore([]);
				setIsLoading(false);
			});
	}, []);

	const handleCloseForm = () => {
		setPopupOpen(false);
		setViewOrder(null);
		setFormData({ content: '' });
	};

	const handleChange = (key: string, value: string) => {
		setFormData({ ...formData, [key]: value });
	};

	const handleSubmit = async (orderId: number) => {
		if (isSubmitting) {
			return;
		}

		setIsSubmitting(true);

		try {
			//Add order note
			await axios({
				method: 'POST',
				url: `${appLocalizer.apiUrl}/wc/v3/orders/${orderId}/notes`,
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				data: {
					note: formData.content,
					customer_note: false,
				},
			});

			//Update order status + meta
			await axios({
				method: 'PUT',
				url: `${appLocalizer.apiUrl}/wc/v3/orders/${orderId}`,
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				data: {
					status: 'processing',
					meta_data: [
						{
							key: '_customer_refund_order',
							value: 'refund_rejected',
						},
					],
				},
			});

			handleCloseForm();
			doRefreshTableData({});
			onUpdated?.();
		} catch (err) {
			console.log(err)
		} finally {
			setIsSubmitting(false);
		}
	};

	const headers = {
		id: {
			label: __('Order', 'multivendorx'),
		},
		store_name: {
			label: __('Store', 'multivendorx'),
		},
		amount: {
			label: __('Amount', 'multivendorx'),
			type: 'currency'

		},
		commission_amount: {
			label: __('Commission', 'multivendorx'),
			type: 'currency'
		},
		reason: {
			label: __('Refund Reason', 'multivendorx'),
			render: (row: any) => {
				getMetaValue(
					row.meta_data,
					appLocalizer.order_meta.customer_refund_reason
				) || ''
			},
		},
		date_created: {
			label: __('Date', 'multivendorx'),
			isSortable: true,
			type: 'date'
		},
		action: {
			type: 'action',
			label: 'Action',
			actions: [
				{
					label: __('View Details', 'multivendorx'),
					icon: 'preview',
					onClick: (row) => {
						setViewOrder(row);
						setPopupOpen(true);
					},
				},
				{
					label: __('Reject', 'multivendorx'),
					icon: 'close',
					onClick: (row) => {
						handleSubmit(row.id);
					},
				},
			],
		},
	};


	const filters = [
		{
			key: 'store_id',
			label: 'Stores',
			type: 'select',
			options: store,
		},
		{
			key: 'created_at',
			label: 'Created Date',
			type: 'date',
		},
	];

	const getMetaValue = (metaData: any[], key: string) =>
		metaData.find((m: any) => m.key === key)?.value;

	const doRefreshTableData = (query: QueryProps) => {
		setIsLoading(true);

		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/orders`, {
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
				params: {
					page: query.paged,
					per_page: query.per_page,
					search: query.searchValue,
					orderby: query.orderby,
					order: query.order,
					meta_key: 'multivendorx_store_id',
					value: query?.filter?.store_id,
					after: query.filter?.created_at?.startDate
						? toWcIsoDate(query.filter.created_at.startDate, 'start')
						: undefined,
					before: query.filter?.created_at?.endDate
						? toWcIsoDate(query.filter.created_at.endDate, 'end')
						: undefined,
					status: 'refund-requested',
				},
			})
			.then((response) => {
				const orders = Array.isArray(response.data)
					? response.data
					: [];

				// 🔹 Row IDs
				const ids = orders.map((o) => o.id);
				setRowIds(ids);

				setRows(orders);
				setTotalRows(Number(response.headers['x-wp-total']) || 0);
				setIsLoading(false);
			})
			.catch((error) => {
				console.error('Order fetch failed:', error);
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
			});
	};

	return (
		<>
			<Container general>
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
						currency={{
							currencySymbol: appLocalizer.currency_symbol,
							priceDecimals: appLocalizer.price_decimals,
							decimalSeparator: appLocalizer.decimal_separator,
							thousandSeparator: appLocalizer.thousand_separator,
							currencyPosition: appLocalizer.currency_position
						}}
					/>
					<PopupUI
						open={popupOpen}
						onClose={handleCloseForm}
						width={40}
						height="80%"
						header={{
							icon: 'announcement',
							title: __('Refund Request Details', 'multivendorx'),
							description: __('Review refund details before taking action.', 'multivendorx'),
						}}
						footer={
							<AdminButtonUI
								buttons={[
									{
										icon: 'external-link',
										text: __('View order to release funds', 'multivendorx'),
										color: 'yellow-bg',
										onClick: () => {
											if (!viewOrder) return;
											window.open(
												`${appLocalizer.site_url.replace(/\/$/, '')}/wp-admin/post.php?post=${viewOrder.id}&action=edit`,
												'_blank'
											);
										},
									},
									{
										icon: 'save',
										text: __('Reject', 'multivendorx'),
										onClick: () => {
											if (!viewOrder) return;
											handleSubmit(viewOrder.id);
										},
										disabled: isSubmitting,
									},
								]}
							/>
						}
					>
						<FormGroupWrapper>
							<FormGroup label={__('Refund Reason', 'multivendorx')}>
								<div className="refund-reason-box">
									{viewOrder?.reason || '-'}
								</div>
							</FormGroup>
							<FormGroup label={__('Additional Information', 'multivendorx')}>
								<div className="refund-additional-info">
									{viewOrder?.addi_info || '-'}
								</div>
							</FormGroup>
							{viewOrder?.refund_images?.length > 0 && (
								<FormGroup label={viewOrder.refund_images.length === 1 ? 'Attachment' : 'Attachments'}>
									<div className="refund-attachment-list">
										{viewOrder.refund_images.map((img, index) => (
											<a
												key={index}
												href={img}
												target="_blank"
												rel="noopener noreferrer"
												className="refund-attachment-item"
											>
												<div className="attachment-thumb">
													<img src={img} alt={__('Refund attachment', 'multivendorx')} />
												</div>
												<div className="attachment-name">
													{__('Attachment', 'multivendorx')} {index + 1}
												</div>
											</a>
										))}
									</div>
								</FormGroup>
							)}
							<FormGroup label={__('Reject Message', 'multivendorx')} htmlFor="content">
								<TextAreaUI
									name="content"
									value={formData.content}
									onChange={(value: string) => handleChange('content', value)}
									usePlainText={false}
									tinymceApiKey={
										appLocalizer.settings_databases_value[
										'overview'
										]['tinymce_api_section'] ?? ''
									}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</PopupUI>
				</Column>
			</Container>
		</>
	);
};

export default PendingRefund;
