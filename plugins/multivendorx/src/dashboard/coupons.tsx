import React, { useState, useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import {
	AdminButtonUI,
	BasicInputUI,
	FormGroup,
	FormGroupWrapper,
	PopupUI,
	SelectInputUI,
	TextAreaUI,
	ToggleSettingUI,
	TableCard,
} from 'zyra';

import axios from 'axios';
import Popup from '../components/Popup/Popup';
import { categoryCounts, QueryProps, TableRow } from '@/services/type';

const COUPON_STATUS_MAP: Record<string, string> = {
	all: __('All', 'multivendorx'),
	publish: __('Published', 'multivendorx'),
	draft: __('Draft', 'multivendorx'),
	pending: __('Pending', 'multivendorx'),
};
const discountOptions = [
	{ label: 'Percentage discount', value: 'percent' },
	// { label: 'Fixed cart discount', value: 'fixed_cart' },
	{ label: 'Fixed product discount', value: 'fixed_product' },
];


const formatDateForInput = (dateString?: string | null) => {
	if (!dateString) {
		return '';
	}
	const date = new Date(dateString);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

const AllCoupon: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [rowIds, setRowIds] = useState<number[]>([]);
	const [categoryCounts, setCategoryCounts] = useState<
		categoryCounts[] | null
	>(null);

	const [validationErrors, setValidationErrors] = useState<{
		[key: string]: string;
	}>({});
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [selectedCoupon, setSelectedCoupon] = useState<{id: number;} | null>(null);


	const handleConfirmDelete = () => {
		if (!selectedCoupon) return;

		axios
			.delete(
				`${appLocalizer.apiUrl}/wc/v3/coupons/${selectedCoupon.id}`,
				{
					headers: {
						'X-WP-Nonce': appLocalizer.nonce,
					},
				}
			)
			.then(() => {
				fetchData({});
			})
			.catch((err) => {
				console.error('Error deleting coupon:', err);
			})
			.finally(() => {
				setConfirmOpen(false);
				setSelectedCoupon(null);
			});
	};

	const validateForm = () => {
		const errors: { [key: string]: string } = {};

		if (!formData.title.trim()) {
			errors.title = __('Coupon code is required', 'multivendorx');
		}

		if (!formData.discount_type.trim()) {
			errors.discount_type = __(
				'Discount type is required',
				'multivendorx'
			);
		}

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const defaultFormData = {
		title: '',
		content: '',
		discount_type: '',
		coupon_amount: '',
		free_shipping: 'no',
		expiry_date: '',
		usage_limit: '',
		limit_usage_to_x_items: '',
		usage_limit_per_user: '',
		minimum_amount: '',
		maximum_amount: '',
		individual_use: 'no',
		exclude_sale_items: 'no',
		product_ids: [],
		exclude_product_ids: [],
		product_categories: [],
		exclude_product_categories: [],
		customer_email: '',
		id: undefined,
	};

	const [formData, setFormData] = useState<any>({
		title: '',
		content: '',
		discount_type: '',
		coupon_amount: '',
		free_shipping: 'no',
		expiry_date: '',
		usage_limit: '',
		limit_usage_to_x_items: '',
		usage_limit_per_user: '',
		minimum_amount: '',
		maximum_amount: '',
		individual_use: 'no',
		exclude_sale_items: 'no',
		product_ids: [],
		exclude_product_ids: [],
		product_categories: [],
		exclude_product_categories: [],
		customer_email: '',
	});

	const [AddCoupon, setAddCoupon] = useState(false);

	const [activeTab, setActiveTab] = useState('general');


	const handleEditCoupon = (couponId: number) => {
		axios
			.get(
				`${appLocalizer.apiUrl}/wc/v3/coupons/${couponId}`,
				{
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
				}
			)
			.then((res) => {
				const coupon = res.data;

				setFormData({
					title: coupon.code,
					content: coupon.description || '',
					discount_type: coupon.discount_type,
					coupon_amount: coupon.amount,
					free_shipping: coupon.free_shipping ? 'yes' : 'no',
					expiry_date: formatDateForInput(coupon.date_expires),
					usage_limit: coupon.usage_limit || '',
					limit_usage_to_x_items: coupon.limit_usage_to_x_items || '',
					usage_limit_per_user: coupon.usage_limit_per_user || '',
					minimum_amount: coupon.minimum_amount || '',
					maximum_amount: coupon.maximum_amount || '',
					individual_use: coupon.individual_use ? 'yes' : 'no',
					exclude_sale_items: coupon.exclude_sale_items ? 'yes' : 'no',
					product_ids: coupon.product_ids || [],
					exclude_product_ids: coupon.excluded_product_ids || [],
					product_categories: coupon.product_categories || [],
					exclude_product_categories:
						coupon.excluded_product_categories || [],
					customer_email: (coupon.email_restrictions || []).join(','),
					id: coupon.id,
				});

				setAddCoupon(true);
				setActiveTab('general');
			})
			.catch(() => {
				alert('Failed to fetch coupon details. Please try again.');
			});
	};

	const handleSave = (status: 'draft' | 'publish') => {
		if (!validateForm()) {
			return; // Stop submission if errors exist
		}

		const payload: any = {
			code: formData.title,
			description: formData.content,
			discount_type: formData.discount_type,
			amount: formData.coupon_amount,
			individual_use: formData.individual_use === 'yes',
			exclude_sale_items: formData.exclude_sale_items === 'yes',
			free_shipping: formData.free_shipping === 'yes',
			minimum_amount: formData.minimum_amount || '',
			maximum_amount: formData.maximum_amount || '',
			usage_limit: formData.usage_limit || '',
			limit_usage_to_x_items: formData.limit_usage_to_x_items || '',
			usage_limit_per_user: formData.usage_limit_per_user || '',
			date_expires: formData.expiry_date || '',
			email_restrictions: formData.customer_email
				? formData.customer_email.split(',')
				: [],
			product_ids: formData.product_ids || [],
			excluded_product_ids: formData.exclude_product_ids || [],
			product_categories: formData.product_categories || [],
			excluded_product_categories:
				formData.exclude_product_categories || [],
			status: status,
			meta_data: [
				{
					key: 'multivendorx_store_id',
					value: appLocalizer.store_id,
				},
			],
		};

		const request = formData.id
			? axios.put(
				`${appLocalizer.apiUrl}/wc/v3/coupons/${formData.id}`,
				payload,
				{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
			)
			: axios.post(
				`${appLocalizer.apiUrl}/wc/v3/coupons`,
				payload,
				{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
			);

		request
			.then(() => {
				// Close popup & reset form
				setAddCoupon(false);
				setFormData({
					title: '',
					content: '',
					discount_type: '',
					coupon_amount: '',
					free_shipping: 'no',
					expiry_date: '',
					usage_limit: '',
					limit_usage_to_x_items: '',
					usage_limit_per_user: '',
					minimum_amount: '',
					maximum_amount: '',
					individual_use: 'no',
					exclude_sale_items: 'no',
					product_ids: [],
					exclude_product_ids: [],
					product_categories: [],
					exclude_product_categories: [],
					customer_email: '',
					id: '',
				});
				fetchData({});
			})
			.catch((err) => {
				console.error('Error saving coupon:', err);
			});
	};

	const tabs = [
		{
			id: 'general',
			label: __('General', 'multivendorx'),
			content: (
				<>
					<FormGroupWrapper>
						<FormGroup label={__('Discount type', 'multivendorx')} htmlFor="discount_type">
							<SelectInputUI
								name="discount_type"
								value={formData.discount_type}
								options={discountOptions}
								onChange={(value) =>
									setFormData({ ...formData, discount_type: value || '' })
								}
							/>
							{validationErrors.discount_type && (
								<div className="invalid-massage">{validationErrors.discount_type}</div>
							)}
						</FormGroup>

						<FormGroup label={__('Coupon amount', 'multivendorx')} htmlFor="coupon_amount">
							<BasicInputUI
								type="number"
								name="coupon_amount"
								value={formData.coupon_amount}
								onChange={(value) =>
									setFormData({ ...formData, coupon_amount: value })
								}
							/>
						</FormGroup>

						<FormGroup label={__('Allow free shipping', 'multivendorx')} htmlFor="free_shipping">
							<ToggleSettingUI
								options={[
									{ key: 'yes', value: 'yes', label: __('Yes', 'multivendorx') },
									{ key: 'no', value: 'no', label: __('No', 'multivendorx') },
								]}
								value={formData.free_shipping}
								onChange={(val: any) => setFormData({ ...formData, free_shipping: val })}
							/>
						</FormGroup>

						<FormGroup label={__('Coupon expiry date', 'multivendorx')} htmlFor="expiry_date">
							<BasicInputUI
								type="date"
								name="expiry_date"
								value={formData.expiry_date}
								onChange={(value) => setFormData({ ...formData, expiry_date: value })}
							/>
						</FormGroup>
					</FormGroupWrapper>

				</>
			),
		},
		{
			id: 'limits',
			label: __('Usage Limits', 'multivendorx'),
			content: (
				<>
					<FormGroupWrapper>
						<FormGroup label={__('Usage limit per coupon', 'multivendorx')} htmlFor="usage_limit">
							<BasicInputUI
								type="number"
								name="usage_limit"
								value={formData.usage_limit}
								onChange={(value) =>
									setFormData({ ...formData, usage_limit: value })
								}
							/>
						</FormGroup>

						<FormGroup label={__('Limit usage to X items', 'multivendorx')} htmlFor="limit_usage_to_x_items">
							<BasicInputUI
								type="number"
								name="limit_usage_to_x_items"
								value={formData.limit_usage_to_x_items}
								onChange={(value) =>
									setFormData({ ...formData, limit_usage_to_x_items: value })
								}
							/>
						</FormGroup>

						<FormGroup label={__('Usage limit per user', 'multivendorx')} htmlFor="usage_limit_per_user">
							<BasicInputUI
								type="number"
								name="usage_limit_per_user"
								value={formData.usage_limit_per_user}
								onChange={(value) =>
									setFormData({ ...formData, usage_limit_per_user: value })
								}
							/>
						</FormGroup>
					</FormGroupWrapper>

				</>
			),
		},
		{
			id: 'restriction',
			label: __('Usage Restriction', 'multivendorx'),
			content: (
				<>
					<FormGroupWrapper>
						<FormGroup label={__('Minimum spend', 'multivendorx')} htmlFor="minimum_amount">
							<BasicInputUI
								type="number"
								name="minimum_amount"
								value={formData.minimum_amount}
								onChange={(value) =>
									setFormData({ ...formData, minimum_amount: value })
								}
							/>
						</FormGroup>

						<FormGroup label={__('Maximum spend', 'multivendorx')} htmlFor="maximum_amount">
							<BasicInputUI
								type="number"
								name="maximum_amount"
								value={formData.maximum_amount}
								onChange={(value) =>
									setFormData({ ...formData, maximum_amount: value })
								}
							/>
						</FormGroup>

						<FormGroup label={__('Individual use only', 'multivendorx')} htmlFor="individual_use">
							<ToggleSettingUI
								options={[
									{ key: 'yes', value: 'yes', label: __('Yes', 'multivendorx') },
									{ key: 'no', value: 'no', label: __('No', 'multivendorx') },
								]}
								value={formData.individual_use}
								onChange={(val: any) =>
									setFormData({ ...formData, individual_use: val })
								}
							/>
						</FormGroup>

						<FormGroup label={__('Exclude sale items', 'multivendorx')} htmlFor="exclude_sale_items">
							<ToggleSettingUI
								options={[
									{ key: 'yes', value: 'yes', label: __('Yes', 'multivendorx') },
									{ key: 'no', value: 'no', label: __('No', 'multivendorx') },
								]}
								value={formData.exclude_sale_items}
								onChange={(val: any) =>
									setFormData({ ...formData, exclude_sale_items: val })
								}
							/>
						</FormGroup>

						<FormGroup label={__('Allowed emails', 'multivendorx')} htmlFor="customer_email">
							<BasicInputUI
								type="text"
								name="customer_email"
								value={formData.customer_email}
								onChange={(value) =>
									setFormData({ ...formData, customer_email: value })
								}
							/>
						</FormGroup>
					</FormGroupWrapper>
				</>
			),
		},
	];

	const fetchCouponStatusCounts = () => {
		const requests = Object.keys(COUPON_STATUS_MAP).map((status) => {
			const params: any = {
				meta_key: 'multivendorx_store_id',
				value: appLocalizer.store_id,
				status: status === 'all' ? 'any' : status,
			};

			return axios
				.get(`${appLocalizer.apiUrl}/wc/v3/coupons`, {
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
					params,
				})
				.then((res) => {
					const total = parseInt(res.headers['x-wp-total'] || '0');

					return {
						value: status,
						label: COUPON_STATUS_MAP[status],
						count: total,
					};
				});
		});

		Promise.allSettled(requests)
			.then((results) => {
				const counts = results
					.filter(
						(result): result is PromiseFulfilledResult<any> =>
							result.status === 'fulfilled'
					)
					.map((result) => result.value);

				setCategoryCounts(counts);
			})
			.catch((error) => {
				console.error('Error fetching coupon status counts:', error);
			});
	};

	const handleBulkAction = (action: string, selectedIds: []) => {
		if (!selectedIds.length) {
			return;
		}

		if (!action) {
			return;
		}

		if (action === 'delete') {
			axios
				.post(
					`${appLocalizer.apiUrl}/wc/v3/coupons/batch`,
					{
						delete: selectedIds,
					},
					{
						headers: { 'X-WP-Nonce': appLocalizer.nonce },
					}
				)
				.then(() => {
					// Refresh the data after action
					fetchCouponStatusCounts();
					fetchData({});
				})
				.catch((err: unknown) => {
					console.error('Error performing bulk coupon action:', err);
				});
		}
	};


	useEffect(() => {
		fetchCouponStatusCounts();
	}, []);

	const bulkActions = [
		{ label: 'Delete', value: 'delete' },
	];

	const headers = [
		{ key: 'code', label: 'Coupon Code' },
		{ key: 'discount_type', label: 'Coupon Type' },
		{ key: 'amount', label: 'Amount' },
		{ key: 'description', label: 'Description' },
		{ key: 'usage_limit', label: 'Usage / Limit' },
		{ key: 'date_expires', label: 'Expiry Date' },
		{ key: 'status', label: 'Status' },
		{
			key: 'action',
			type: 'action',
			label: 'Action',
			actions: [
				{
					label: __('Edit', 'multivendorx'),
					icon: 'edit',
					onClick: (id: number) => handleEditCoupon(id),
				},
				{
					label: __('Delete', 'multivendorx'),
					icon: 'delete',
					onClick: (id: number) => {
						setSelectedCoupon({ id: id });
						setConfirmOpen(true);
					},
					className: 'danger',
				},
			],
		},
	];

	const fetchData = (query: QueryProps) => {
		setIsLoading(true);
		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/coupons`, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					page: query.paged || 1,
					row: query.per_page || 10,
					status: query.categoryFilter || '',
					search: query.searchValue || '',
					// after: query.filter?.created_at?.startDate
					// 	? formatLocalDate(query.filter.created_at.startDate)
					// 	: '',
					// before: query.filter?.created_at?.endDate
					// 	? formatLocalDate(query.filter.created_at.endDate)
					// 	: '',
					discount_type: query.filter?.couponType,
					meta_key: 'multivendorx_store_id',
					value: appLocalizer.store_id,
				},
			})
			.then((response) => {
				const items = response.data || [];
				const ids = items
					.filter((item) => item?.id != null)
					.map((item) => item.id);

				setRowIds(ids);
				const mappedRows: any[][] = items.map((item: any) => [
					{ display: item.code, value: item.code },
					{
						display: item.discount_type,
						value: item.discount_type,
					},
					{ display: item.amount, value: item.amount },
					{ display: item.usage_count, value: item.usage_count },
					{ display: item.usage_limit, value: item.usage_limit },
					{ display: item.date_expires, value: item.date_expires },
					{ display: item.description, value: item.description },
					{ display: item.status, value: item.status },
				]);
				setRows(mappedRows);
				setTotalRows(Number(response.headers['x-wp-total']) || 0);
				setIsLoading(false);
			})
			.catch(() => {
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
			});
	};

	const filters = [
		{
			key: 'couponType',
			label: 'Status',
			type: 'select',
			options: [
				{ label: 'Percentage Discount', value: 'percent' },
				{ label: 'Fixed Cart Discount', value: 'fixed_cart' },
				{ label: 'Fixed Product Discount', value: 'fixed_product' },
			],
		},
		{
			key: 'created_at',
			label: 'Created Date',
			type: 'date',
		}
	];

	return (
		<>
			<div className="page-title-wrapper">
				<div className="page-title">
					<div className="title">{__('Coupons', 'multivendorx')}</div>
					<div className="des">
						{__(
							'Manage your store information and preferences',
							'multivendorx'
						)}
					</div>
				</div>

				<div className="button-wrapper">
					<div
						className="admin-btn btn-purple-bg"
						onClick={() => {
							setFormData({ ...defaultFormData }); // reset form
							setActiveTab('general'); // start with General tab
							setAddCoupon(true); // open popup
						}}
					>
						<i className="adminfont-plus"></i>
						{__('Add New', 'multivendorx')}
					</div>
				</div>
			</div>

			{AddCoupon && (
				<PopupUI
					open={AddCoupon}
					onClose={() => setAddCoupon(false)}
					width={31.25}
					header={{
						icon: 'coupon',
						title: __('Add Coupon', 'multivendorx'),
						description: __(
							'Set code, discount, and usage limits, then activate.',
							'multivendorx'
						),
					}}
					footer={
						<AdminButtonUI
							buttons={[
								{
									icon: 'contact-form',
									text: __('Draft', 'multivendorx'),
									color: 'red',
									onClick: () => handleSave('draft'),
								},
								{
									icon: 'save',
									text: __('Publish', 'multivendorx'),
									onClick: () => handleSave('publish'),
								},
							]}
						/>
					}
				>
					<>
						<FormGroupWrapper>
							<FormGroup label={__('Coupon code', 'multivendorx')} htmlFor="title">
								<BasicInputUI
									type="text"
									name="title"
									value={formData.title}
									generate={true}
									onChange={(value) =>
										setFormData({
											...formData,
											title: value,
										})
									}
								/>
								{validationErrors.title && (
									<div className="invalid-massage">
										{validationErrors.title}
									</div>
								)}
							</FormGroup>

							<FormGroup label={__('Description (optional)', 'multivendorx')} htmlFor="title">
								<TextAreaUI
									name="content"
									rowNumber={6}
									value={formData.content}
									onChange={(value) =>
										setFormData({
											...formData,
											content:value,
										})
									}
								/>
							</FormGroup>
						</FormGroupWrapper>
						{/* Tabs */}
						<div className="tab-titles">
							{tabs.map((tab) => (
								<div
									key={tab.id}
									className={`title ${activeTab === tab.id ? 'active' : ''
										}`}
									onClick={() => setActiveTab(tab.id)}
								>
									<h2>{__(tab.label, 'multivendorx')}</h2>
								</div>
							))}
						</div>

						{/* Tab Content */}
						<div className="tab-content">
							{tabs.map(
								(tab) =>
									activeTab === tab.id && (
										<div key={tab.id} className="tab-panel">
											{tab.content}
										</div>
									)
							)}
						</div>
					</>
				</PopupUI>
			)}

			<PopupUI
				position="lightbox"
				open={confirmOpen}
				onClose={() => setConfirmOpen(false)}
				width={31.25}
			>
				<Popup
					confirmMode
					title={__('Are you sure?', 'multivendorx')}
					confirmMessage={
						selectedCoupon
							? __(
								`Are you sure you want to delete coupon "${selectedCoupon.code}"?`,
								'multivendorx'
							)
							: ''
					}
					confirmYesText={__('Delete', 'multivendorx')}
					confirmNoText={__('Cancel', 'multivendorx')}
					onConfirm={handleConfirmDelete}
					onCancel={() => {
						setConfirmOpen(false);
						setSelectedCoupon(null);
					}}
				/>
			</PopupUI>
			<PopupUI
				position="lightbox"
				open={confirmOpen}
				onClose={() => {
					setConfirmOpen(false);
					setSelectedCoupon(null);
				}}
				showBackdrop={true}
				header={{
					icon: 'warning',
					title: __('Are you sure?', 'multivendorx'),
					showCloseButton: true
				}}
				footer={
					<AdminButtonUI
						buttons={[
							{
								icon: 'close',
								text: __('Cancel', 'multivendorx'),
								color: 'red',
								onClick: () => {
									setConfirmOpen(false);
									setSelectedCoupon(null);
								},
							},
							{
								icon: 'cross',
								text: __('Delete', 'multivendorx'),
								onClick: handleConfirmDelete,
							},
						]}
					/>
				}
			>
				<p>
					{__('Are you sure you want to delete this coupon?', 'multivendorx')}
				</p>
			</PopupUI>
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
				bulkActions={bulkActions}
				onBulkActionApply={(action: string, selectedIds: []) => {
					handleBulkAction(action, selectedIds)
				}}
				format={appLocalizer.date_format}
			/>
		</>
	);
};

export default AllCoupon;
