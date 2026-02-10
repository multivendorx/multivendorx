import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import { 
	AdminButtonUI,
	Column,
	CommonPopup,
	Container,
	FormGroup,
	FormGroupWrapper,
	getApiLink,
	TableCard,
	TextArea,
} from 'zyra';
import { formatCurrency, formatWcShortDate, toWcIsoDate, truncateText } from '../../services/commonFunction';
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
	const [orderMap, setOrderMap] = useState<Record<number, StoreRow>>({});

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

	const handleChange = (e: any) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
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
			fetchData({});
			onUpdated?.();
		} catch (err) {
			console.log(err)
		} finally {
			setIsSubmitting(false);
		}
	};

	const headers = [
		{ key: 'order', label: __('Order', 'multivendorx') },
		{ key: 'store', label: __('Store', 'multivendorx') },
		{ key: 'amount', label: __('Amount', 'multivendorx') },
		{ key: 'commission', label: __('Commission', 'multivendorx') },
		{ key: 'reason', label: __('Refund Reason', 'multivendorx') },
		{ key: 'date', label: __('Date', 'multivendorx'), isSortable: true, },
		{
			key: 'action',
			type: 'action',
			label: 'Action',
			actions: [
				{
					label: __('View Details', 'multivendorx'),
					icon: 'preview',
					onClick: (id: number) => {
						const order = orderMap[id];
						console.log(order)
						if (!order) return;

						setViewOrder(order);
						setPopupOpen(true);
					},
				},
				{
					label: __('Reject', 'multivendorx'),
					icon: 'close',
					onClick: (id: number) => {
						handleSubmit(id);
					},
				},
			],
		},
	];

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

	const fetchData = (query: QueryProps) => {
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

				const orderById: Record<number, StoreRow> = {};

				// 🔹 Normalize API response + build order map
				const normalizedOrders: StoreRow[] = orders.map((order: any) => {
					const metaData = order.meta_data || [];

					const normalized: StoreRow = {
						id: order.id,
						store_id: getMetaValue(metaData, 'multivendorx_store_id'),
						store_name: order.store_name || '-',
						amount: order.total,
						commission_amount: order.commission_amount,
						date: order.date_created,
						status: order.status,
						currency_symbol: order.currency_symbol,

						reason:
							getMetaValue(
								metaData,
								appLocalizer.order_meta.customer_refund_reason
							) || '',

						addi_info:
							getMetaValue(
								metaData,
								appLocalizer.order_meta.customer_refund_addi_info
							) || '',

						refund_images:
							getMetaValue(
								metaData,
								appLocalizer.order_meta.customer_refund_product_imgs
							) || [],

						refund_products:
							getMetaValue(
								metaData,
								appLocalizer.order_meta.customer_refund_product
							) || [],
					};

					// ✅ critical for View Details
					orderById[normalized.id] = normalized;

					return normalized;
				});

				// 🔹 Save map for action handlers
				setOrderMap(orderById);

				// 🔹 Row IDs
				const ids = normalizedOrders.map((o) => o.id);
				setRowIds(ids);

				// 🔹 Table rows
				const mappedRows: TableRow[][] = normalizedOrders.map((order) => [
					{
						type: 'card',
						value: order.id,
						display: order.id,
						data: {
							name: `# ${order.id}`,
							link: `${appLocalizer.site_url.replace(
								/\/$/,
								''
							)}/wp-admin/post.php?post=${order.id}&action=edit`,
						},
					},
					{
						type: 'card',
						value: order.store_id,
						display: order.store_name,
						data: {
							name: order.store_name,
							link: `${window.location.origin}/wp-admin/admin.php?page=multivendorx#&tab=stores&edit/${order.store_id}/&subtab=store-overview`,
						},
					},
					{
						display: formatCurrency(order.amount),
						value: order.amount,
					},
					{
						display: order.commission_amount
							? formatCurrency(order.commission_amount)
							: '-',
						value: order.commission_amount,
					},
					{
						display: truncateText(order.reason, 30),
						value: order.reason,
					},
					{
						display: order.date
							? formatWcShortDate(order.date)
							: '-',
						value: order.date,
					},
				]);

				setRows(mappedRows);
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
						onQueryUpdate={fetchData}
						ids={rowIds}
						search={{}}
						filters={filters}
					/>
					<CommonPopup
						open={popupOpen}
						onClose={handleCloseForm}
						width="40rem"
						height="80%"
						header={{
							icon: 'announcement',
							title: __('Refund Request Details', 'multivendorx'),
							description: __('Review refund details before taking action.', 'multivendorx'),
							onClose: handleCloseForm,
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
								<TextArea
									name="content"
									value={formData.content}
									onChange={handleChange}
									usePlainText={false}
									tinymceApiKey={
										appLocalizer.settings_databases_value[
										'overview'
										]['tinymce_api_section'] ?? ''
									}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</CommonPopup>
				</Column>
			</Container>
		</>
	);
};

export default PendingRefund;
