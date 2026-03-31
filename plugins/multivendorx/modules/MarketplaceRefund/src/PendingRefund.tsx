/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import {
	ButtonInputUI,
	FormGroup,
	FormGroupWrapper,
	getApiLink,
	PopupUI,
	QueryProps,
	TableCard,
	TableRow,
	TextAreaUI,
} from 'zyra';
import { getUrl, toWcIsoDate } from '../../../src/services/commonFunction';

interface OrderMeta {
	key: string;
	value: string;
}

interface RefundOrder {
	id: number;
	meta_data: OrderMeta[];
	refund_images: string[];
}

interface StoreOption {
	label: string;
	value: number;
}

interface StoreApi {
	id: number;
	store_name: string;
}

interface OrderRow extends RefundOrder {
	store_name?: string;
	total?: number;
	commission_amount?: number;
	date_created?: string;
}

const EMPTY_ORDER: RefundOrder = {
	id: 0,
	meta_data: [],
	refund_images: [],
};

const PendingRefund: React.FC<{ setCount?: (count: number) => void }> = ({
	setCount,
}) => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [store, setStore] = useState<StoreOption[]>([]);
	const [popupOpen, setPopupOpen] = useState(false);
	const [formData, setFormData] = useState({ content: '' });
	const [viewOrder, setViewOrder] = useState<RefundOrder>(EMPTY_ORDER);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		axios
			.get(getApiLink(appLocalizer, 'store'), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: { options: true },
			})
			.then((response) => {
				const options = (response.data || []).map(
					(store: StoreApi) => ({
						label: store.store_name,
						value: store.id,
					})
				);

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
		setViewOrder(EMPTY_ORDER);
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
				method: 'POST',
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
		} catch (err) {
			console.log(err);
		} finally {
			setIsSubmitting(false);
		}
	};

	const headers = {
		id: {
			label: __('Order', 'multivendorx'),
			isSortable: true,
			render: (row) => (
				<a
					href={getUrl(row.id, 'order')}
					target="_blank"
					rel="noopener noreferrer"
					className="link-item"
				>
					#{row.id}
				</a>
			),
		},
		store_name: {
			label: __('Store', 'multivendorx'),
			render: (row) => (
				<a
					href={getUrl(row.store_id, 'store', 'edit')}
					target="_blank"
					rel="noopener noreferrer"
					className="link-item"
				>
					{row.store_name}
				</a>
			),
		},
		total: {
			label: __('Amount', 'multivendorx'),
			type: 'currency',
		},
		commission_amount: {
			label: __('Commission', 'multivendorx'),
			type: 'currency',
		},
		reason: {
			label: __('Refund Reason', 'multivendorx'),
			render: (row: OrderRow) =>
				getMetaValue(
					row.meta_data,
					appLocalizer.order_meta.customer_refund_reason
				),
		},
		status: {
			label: __('Status', 'multivendorx'),
			type: 'status',
		},
		date_created: {
			label: __('Date', 'multivendorx'),
			isSortable: true,
			type: 'date',
		},
		action: {
			label: __('Action', 'multivendorx'),
			render: (row: any) => {
				return (
					<ButtonInputUI
						buttons={[
							{
								icon: 'preview',
								text: __('View Details', 'multivendorx'),
								color: 'purple',
								onClick: () => {
									window.open(
										getUrl(row.id, 'order'),
										'_blank'
									);
								},
							},
							{
								icon: 'close',
								text: __('Reject', 'multivendorx'),
								onClick: () => {
									setViewOrder(row);
									setPopupOpen(true);
								},
							},
						]}
					/>
				);
			},
		},
	};

	const filters = [
		{
			key: 'store_id',
			label: __('Stores', 'multivendorx'),
			type: 'select',
			options: store,
		},
		{
			key: 'created_at',
			label: __('Created Date', 'multivendorx'),
			type: 'date',
		},
	];

	const getMetaValue = (metaData: OrderMeta[], key: string): string => {
		const meta = metaData.find((m) => m.key === key);
		return meta ? meta.value : '';
	};

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
					orderby: 'date',
					order: query.order,
					meta_key: 'multivendorx_store_id',
					value: query?.filter?.store_id,
					after: query.filter?.created_at?.startDate
						? toWcIsoDate(
							query.filter.created_at.startDate,
							'start'
						)
						: undefined,
					before: query.filter?.created_at?.endDate
						? toWcIsoDate(query.filter.created_at.endDate, 'end')
						: undefined,
					status: 'refund-requested,refund-accepted',
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
				setCount?.(Number(response.headers['x-wp-total']) || 0);
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
					currencyPosition: appLocalizer.currency_position,
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
					description: __(
						'Review refund details before taking action.',
						'multivendorx'
					),
				}}
				footer={
					<ButtonInputUI
						buttons={[
							{
								icon: 'external-link',
								text: __(
									'View order to release funds',
									'multivendorx'
								),
								color: 'yellow-bg',
								onClick: () => {
									if (!viewOrder) {
										return;
									}
									window.open(
										`${appLocalizer.site_url.replace(/\/$/, '')}/wp-admin/post.php?post=${viewOrder.id}&action=edit`,
										'_blank'
									);
								},
								disabled: false,
								children: null,
								customStyle: {},
								style: {},
							},
							{
								icon: 'save',
								text: __('Reject', 'multivendorx'),
								onClick: () => {
									if (!viewOrder) {
										return;
									}
									handleSubmit(viewOrder.id);
								},
								disabled: isSubmitting,
								children: null,
								customStyle: {},
								style: {},
							},
						]}
					/>
				}
			>
				{viewOrder && (
					<FormGroupWrapper>
						<FormGroup label={__('Refund Reason', 'multivendorx')}>
							<div className="refund-reason-box">
								{getMetaValue(
									viewOrder.meta_data,
									appLocalizer.order_meta
										.customer_refund_reason
								)}
							</div>
						</FormGroup>
						<FormGroup
							label={__('Additional Information', 'multivendorx')}
						>
							<div className="refund-additional-info">
								{getMetaValue(
									viewOrder.meta_data,
									appLocalizer.order_meta
										.multivendorx_customer_refund_addi_info
								)}
							</div>
						</FormGroup>
						{viewOrder?.refund_images?.length > 0 && (
							<FormGroup
								label={
									viewOrder.refund_images.length === 1
										? 'Attachment'
										: 'Attachments'
								}
							>
								<div className="refund-attachment-list">
									{viewOrder.refund_images.map(
										(img, index) => (
											<a
												key={index}
												href={img}
												target="_blank"
												rel="noopener noreferrer"
												className="refund-attachment-item"
											>
												<div className="attachment-thumb">
													<img
														src={img}
														alt={__(
															'Refund attachment',
															'multivendorx'
														)}
													/>
												</div>
												<div className="attachment-name">
													{__(
														'Attachment',
														'multivendorx'
													)}{' '}
													{index + 1}
												</div>
											</a>
										)
									)}
								</div>
							</FormGroup>
						)}
						<FormGroup
							label={__('Reject Message', 'multivendorx')}
							htmlFor="content"
						>
							<TextAreaUI
								name="content"
								value={formData.content}
								onChange={(value: string) =>
									handleChange('content', value)
								}
								usePlainText={false}
								tinymceApiKey={
									appLocalizer.settings_databases_value[
									'overview'
									]['tinymce_api_section'] ?? ''
								}
							/>
						</FormGroup>
					</FormGroupWrapper>
				)}
			</PopupUI>
		</>
	);
};

export default PendingRefund;
