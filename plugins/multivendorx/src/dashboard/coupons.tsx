import React, { useState, useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import {
	AdminButton,
	BasicInput,
	CommonPopup,
	FormGroup,
	FormGroupWrapper,
	getApiLink,
	MultiCalendarInput,
	ProPopup,
	SelectInput,
	Table,
	TableCell,
	TextArea,
	ToggleSetting,
} from 'zyra';
import {
	ColumnDef,
	RowSelectionState,
	PaginationState,
} from '@tanstack/react-table';
import axios from 'axios';
import { formatCurrency, formatWcShortDate } from '../services/commonFunction';
import { Dialog } from '@mui/material';

type CouponRow = {
	id: number;
	code: string;
	discount_type: string;
	amount: string;
	usage_count: number;
	usage_limit?: number | null;
	date_expires?: string | null;
	description?: string;
	status?: string;
};

type FilterData = {
	searchAction?: string;
	searchField?: string;
	stock_status?: string;
	couponType?: string;
	categoryFilter?: string;
};

const COUPON_STATUS_LABELS: Record<string, string> = {
	all: __('All', 'multivendorx'),
	publish: __('Published', 'multivendorx'),
	draft: __('Draft', 'multivendorx'),
	pending: __('Pending', 'multivendorx'),
};

const discountOptions = [
	{ label: 'Percentage discount', value: 'percent' },
	{ label: 'Fixed cart discount', value: 'fixed_cart' },
	{ label: 'Fixed product discount', value: 'fixed_product' },
];

export interface RealtimeFilter {
	name: string;
	render: (
		updateFilter: (key: string, value: any) => void,
		filterValue: any
	) => ReactNode;
}
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
	const [validationErrors, setValidationErrors] = useState<{
		[key: string]: string;
	}>({});
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [selectedCoupon, setSelectedCoupon] = useState<{
		id: number;
		code: string;
	} | null>(null);
	const [dateFilter, setDateFilter] = useState<{
		start_date: Date;
		end_date: Date;
	}>({
		start_date: new Date(
			new Date().getFullYear(),
			new Date().getMonth() - 1,
			1
		),
		end_date: new Date(),
	});
	const bulkSelectRef = useRef<HTMLSelectElement>(null);
	// delete popup 
	const handleDeleteClick = (rowData: CouponRow) => {
		setSelectedCoupon({
			id: rowData.id,
			code: rowData.code,
		});
		setConfirmOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!selectedCoupon) return;

		try {
			await axios.delete(
				`${appLocalizer.apiUrl}/wc/v3/coupons/${selectedCoupon.id}`,
				{
					headers: {
						'X-WP-Nonce': appLocalizer.nonce,
					},
				}
			);

			// Refresh list
			requestData(
				pagination.pageSize,
				pagination.pageIndex + 1
			);
		} catch (err) {
			console.error('Failed to delete coupon', err);
		} finally {
			setConfirmOpen(false);
			setSelectedCoupon(null);
		}
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

	const [data, setData] = useState<CouponRow[]>([]);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [totalRows, setTotalRows] = useState<number>(0);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [AddCoupon, setAddCoupon] = useState(false);

	const [pageCount, setPageCount] = useState(0);
	const [activeTab, setActiveTab] = useState('general');

	const [couponTypeCounts, setCouponTypeCounts] = useState<
		{ key: string; name: string; count: number }[]
	>([]);
	const handleEditCoupon = async (couponId: number) => {
		try {
			const res = await axios.get(
				`${appLocalizer.apiUrl}/wc/v3/coupons/${couponId}`,
				{
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
				}
			);

			const coupon = res.data;

			setFormData({
				title: coupon.code,
				content: coupon.description || '',
				discount_type: coupon.discount_type,
				coupon_amount: coupon.amount,
				free_shipping: coupon.free_shipping ? 'yes' : 'no',
				expiry_date: formatDateForInput(coupon.date_expires), // <-- fix date
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

			setAddCoupon(true); // open popup
			setActiveTab('general'); // optional: start with general tab
		} catch (err) {
			console.error('Failed to fetch coupon details:', err);
			alert('Failed to fetch coupon details. Please try again.');
		}
	};

	const handleSave = async (status: 'draft' | 'publish') => {
		if (!validateForm()) {
			return; // Stop submission if errors exist
		}
		try {
			const payload: any = {
				code: formData.title,
				description: formData.content,
				discount_type: formData.discount_type,
				amount: formData.coupon_amount,
				individual_use: formData.individual_use === 'yes',
				exclude_sale_items: formData.exclude_sale_items === 'yes',
				free_shipping: formData.free_shipping === 'yes',
				minimum_amount: formData.minimum_amount || undefined,
				maximum_amount: formData.maximum_amount || undefined,
				usage_limit: formData.usage_limit || undefined,
				limit_usage_to_x_items:
					formData.limit_usage_to_x_items || undefined,
				usage_limit_per_user:
					formData.usage_limit_per_user || undefined,
				date_expires: formData.expiry_date || undefined,
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

			if (formData.id) {
				// Update existing coupon
				await axios.put(
					`${appLocalizer.apiUrl}/wc/v3/coupons/${formData.id}`,
					payload,
					{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
				);
			} else {
				// Create new coupon
				await axios.post(
					`${appLocalizer.apiUrl}/wc/v3/coupons`,
					payload,
					{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
				);
			}

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
				id: undefined,
			});

			// Reload list
			requestData(pagination.pageSize, pagination.pageIndex + 1);
		} catch (err) {
			console.error('Error saving coupon:', err);
		}
	};

	const tabs = [
		{
			id: 'general',
			label: __('General', 'multivendorx'),
			content: (
				<>
					<FormGroupWrapper>
						<FormGroup label={__('Discount type', 'multivendorx')} htmlFor="discount_type">
							<SelectInput
								name="discount_type"
								value={formData.discount_type}
								options={discountOptions}
								type="single-select"
								onChange={(val: any) =>
									setFormData({ ...formData, discount_type: val?.value || '' })
								}
							/>
							{validationErrors.discount_type && (
								<div className="invalid-massage">{validationErrors.discount_type}</div>
							)}
						</FormGroup>

						<FormGroup label={__('Coupon amount', 'multivendorx')} htmlFor="coupon_amount">
							<BasicInput
								type="number"
								name="coupon_amount"
								value={formData.coupon_amount}
								onChange={(e: any) =>
									setFormData({ ...formData, coupon_amount: e.target.value })
								}
							/>
						</FormGroup>

						<FormGroup label={__('Allow free shipping', 'multivendorx')} htmlFor="free_shipping">
							<ToggleSetting

								options={[
									{ key: 'yes', value: 'yes', label: __('Yes', 'multivendorx') },
									{ key: 'no', value: 'no', label: __('No', 'multivendorx') },
								]}
								value={formData.free_shipping}
								onChange={(val: any) => setFormData({ ...formData, free_shipping: val })}
							/>
						</FormGroup>

						<FormGroup label={__('Coupon expiry date', 'multivendorx')} htmlFor="expiry_date">
							<BasicInput
								type="date"
								name="expiry_date"
								value={formData.expiry_date}
								onChange={(e: any) => setFormData({ ...formData, expiry_date: e.target.value })}
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
							<BasicInput
								type="number"
								name="usage_limit"
								value={formData.usage_limit}
								onChange={(e: any) =>
									setFormData({ ...formData, usage_limit: e.target.value })
								}
							/>
						</FormGroup>

						<FormGroup label={__('Limit usage to X items', 'multivendorx')} htmlFor="limit_usage_to_x_items">
							<BasicInput
								type="number"
								name="limit_usage_to_x_items"
								value={formData.limit_usage_to_x_items}
								onChange={(e: any) =>
									setFormData({ ...formData, limit_usage_to_x_items: e.target.value })
								}
							/>
						</FormGroup>

						<FormGroup label={__('Usage limit per user', 'multivendorx')} htmlFor="usage_limit_per_user">
							<BasicInput
								type="number"
								name="usage_limit_per_user"
								value={formData.usage_limit_per_user}
								onChange={(e: any) =>
									setFormData({ ...formData, usage_limit_per_user: e.target.value })
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
							<BasicInput
								type="number"
								name="minimum_amount"
								value={formData.minimum_amount}
								onChange={(e: any) =>
									setFormData({ ...formData, minimum_amount: e.target.value })
								}
							/>
						</FormGroup>

						<FormGroup label={__('Maximum spend', 'multivendorx')} htmlFor="maximum_amount">
							<BasicInput
								type="number"
								name="maximum_amount"
								value={formData.maximum_amount}
								onChange={(e: any) =>
									setFormData({ ...formData, maximum_amount: e.target.value })
								}
							/>
						</FormGroup>

						<FormGroup label={__('Individual use only', 'multivendorx')} htmlFor="individual_use">
							<ToggleSetting

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
							<ToggleSetting

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
							<BasicInput
								type="text"
								name="customer_email"
								value={formData.customer_email}
								onChange={(e: any) =>
									setFormData({ ...formData, customer_email: e.target.value })
								}
							/>
						</FormGroup>
					</FormGroupWrapper>
				</>
			),
		},
	];

	const fetchCouponStatusCounts = async () => {
		try {
			const statuses = ['all', 'publish', 'draft', 'pending'];

			const counts = await Promise.all(
				statuses.map(async (status) => {
					const params: any = {
						meta_key: 'multivendorx_store_id',
						value: appLocalizer.store_id,
					};

					params.status = status === 'all' ? 'any' : status;

					const res = await axios.get(
						`${appLocalizer.apiUrl}/wc/v3/coupons`,
						{
							headers: { 'X-WP-Nonce': appLocalizer.nonce },
							params,
						}
					);

					const total = parseInt(res.headers['x-wp-total'] || '0');

					return {
						key: status,
						name: COUPON_STATUS_LABELS[status],
						count: total,
					};
				})
			);

			setCouponTypeCounts(
				counts.filter((c) => c.count > 0)
			);
		} catch (error) {
			console.error('Failed to fetch coupon status counts:', error);
		}
	};

	// Fetch data from backend.
	function requestData(
		rowsPerPage: number,
		currentPage: number,
		stockStatus?: string,
		searchField?: string,
		couponType?: string,
		categoryFilter?: string,
		startDate?: Date,
		endDate?: Date
	) {
		// Set default values if undefined
		stockStatus = stockStatus || '';
		searchField = searchField || '';
		couponType = couponType || '';
		categoryFilter = categoryFilter || 'any';
		startDate = startDate || new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
		endDate = endDate || new Date();

		setData(null);

		// Build the base parameters object
		const params: any = {
			status: categoryFilter,
			page: currentPage,
			row: rowsPerPage,
			meta_key: 'multivendorx_store_id',
			value: appLocalizer.store_id,
		};

		if (startDate && endDate) {
			params.after = startDate;
			params.before = endDate;
		}

		if (stockStatus) {
			params.stock_status = stockStatus;
		}

		if (searchField) {
			params.search = searchField;
		}
		if (couponType) {
			params.discount_type = couponType;
		}
		axios({
			method: 'GET',
			url: `${appLocalizer.apiUrl}/wc/v3/coupons`,
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: params, // Use the dynamically built params object
		})
			.then((response) => {
				const total = parseInt(response.headers['x-wp-total']);
				setTotalRows(total);
				setPageCount(Math.ceil(total / rowsPerPage));

				// Map WooCommerce coupon data to our table rows
				const formatted = response.data.map((coupon: any) => ({
					id: coupon.id,
					code: coupon.code,
					discount_type: coupon.discount_type,
					amount: coupon.amount,
					usage_count: coupon.usage_count,
					usage_limit: coupon.usage_limit,
					date_expires: coupon.date_expires,
					description: coupon.description,
					status: coupon.status, // usually 'publish', 'draft', or 'trash'
				}));
				setData(formatted);
				fetchCouponStatusCounts();
			})

			.catch(() => {
				setData([]);
				setTotalRows(0);
				setPageCount(0);
			});
	}

	// Handle pagination and filter changes
	const requestApiForData = (
		rowsPerPage: number,
		currentPage: number,
		filterData: FilterData
	) => {
		const date = filterData?.date || {
			start_date: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
			end_date: new Date(),
		};
		setDateFilter(date);
		requestData(
			rowsPerPage, // 1: rowsPerPage
			currentPage, // 2: currentPage
			filterData?.stock_status, // 4: stockStatus
			filterData?.searchField, // 5: searchField (Assuming filterData uses searchField for the search box value)
			filterData?.couponType,
			filterData?.categoryFilter, // 6: couponType
			date.start_date,
			date.end_date,
		);
	};
	const handleBulkAction = async () => {
		const action = bulkSelectRef.current?.value;
		const selectedIds = Object.keys(rowSelection)
			.map((key) => {
				const index = Number(key);
				return data && data[index] ? data[index].id : null;
			})
			.filter((id): id is number => id !== null);

		if (!selectedIds.length) {
			return;
		}

		if (!action) {
			return;
		}
		setData(null);

		try {
			if (action === 'delete') {
				await axios({
					method: 'POST', // WooCommerce bulk endpoint uses POST
					url: `${appLocalizer.apiUrl}/wc/v3/coupons/batch`,
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
					data: {
						delete: selectedIds, // array of product IDs to delete
					},
				});
			}

			// Refresh the data after action
			fetchCouponStatusCounts();
			requestData(pagination.pageSize, pagination.pageIndex + 1);
			setRowSelection({});
		} catch (err: unknown) {
			console.log(__(`Failed to perform bulk action ${err}`, 'multivendorx'));
		}
	};
	useEffect(() => {
		fetchCouponStatusCounts();
		const currentPage = pagination.pageIndex + 1;
		const rowsPerPage = pagination.pageSize;
		requestData(rowsPerPage, currentPage);
	}, [pagination]);

	const columns: ColumnDef<CouponRow>[] = [
		{
			id: 'select',
			header: ({ table }) => (
				<input
					type="checkbox"
					checked={table.getIsAllRowsSelected()}
					onChange={table.getToggleAllRowsSelectedHandler()}
				/>
			),
			cell: ({ row }) => (
				<input
					type="checkbox"
					checked={row.getIsSelected()}
					onChange={row.getToggleSelectedHandler()}
				/>
			),
		},
		{
			header: __('Coupon Code', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.code}>
					{row.original.code}
				</TableCell>
			),
		},
		{
			header: __('Coupon Type', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.discount_type}>
					{row.original.discount_type === 'percent'
						? 'Percentage discount'
						: row.original.discount_type === 'fixed_cart'
							? 'Fixed cart discount'
							: row.original.discount_type === 'fixed_product'
								? 'Fixed product discount'
								: '-'}
				</TableCell>
			),
		},
		{
			header: __('Amount', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.amount}>
					{formatCurrency(row.original.amount)}
				</TableCell>
			),
		},
		{
			header: __('Description', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell title={row.original.description || '-'}>
					{row.original.description || '-'}
				</TableCell>
			),
		},
		{
			header: __('Usage / Limit', 'multivendorx'),
			cell: ({ row }) => {
				const usageCount = row.original.usage_count ?? 0;
				const usageLimit =
					row.original.usage_limit && row.original.usage_limit > 0
						? row.original.usage_limit
						: '∞';
				return <TableCell>{`${usageCount} / ${usageLimit}`}</TableCell>;
			},
		},
		{
			id: 'date_expires',
			accessorKey: 'date_expires',
			enableSorting: true,
			header: __('Expiry Date', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell>
					{formatWcShortDate(row.original.date_expires)}
				</TableCell>
			),
		},
		{
			header: __('Status', 'multivendorx'),
			cell: ({ row }) => {
				const statusMap: Record<string, string> = {
					publish: 'Published',
					draft: 'Draft',
					pending: 'Pending',
					trash: 'Trash',
				};

				const displayStatus = statusMap[row.original.status] || row.original.status;

				return <TableCell type="status" status={displayStatus} />;
			},
		},
		{
			header: __('Action', 'multivendorx'),
			cell: ({ row }) => (
				<TableCell
					type="action-dropdown"
					rowData={row.original}
					header={{
						actions: [
							{
								label: __('Edit', 'multivendorx'),
								icon: 'adminfont-edit',
								onClick: (rowData: any) => {
									handleEditCoupon(rowData.id);
								},
							},
							{
								label: __('Delete', 'multivendorx'),
								icon: 'adminfont-delete delete',
								onClick: (rowData: CouponRow) => {
									handleDeleteClick(rowData);
								},
							}
						],
					}}
				/>
			),
		},
	];

	const searchFilter: RealtimeFilter[] = [
		{
			name: 'searchField',
			render: (updateFilter, filterValue) => (
				<div className="search-section">
					<input
						type="text"
						name="searchField"
						placeholder={__('Search', 'multivendorx')}
						value={filterValue || ''}
						onChange={(e) =>
							updateFilter(e.target.name, e.target.value)
						}
						className="basic-select"
					/>
					<i className="adminfont-search"></i>
				</div>
			),
		},
	];

	const realtimeFilter: RealtimeFilter[] = [
		{
			name: 'couponType',
			render: (
				updateFilter: (key: string, value: string) => void,
				filterValue: string | undefined
			) => (
				<div className="   group-field">
					<select
						name="couponType"
						onChange={(e) =>
							updateFilter(e.target.name, e.target.value)
						}
						value={filterValue || ''}
						className="basic-select"
					>
						<option value="">
							{__('All Types', 'multivendorx')}
						</option>
						<option value="percent">
							{__('Percentage Discount', 'multivendorx')}
						</option>
						<option value="fixed_cart">
							{__('Fixed Cart Discount', 'multivendorx')}
						</option>
						<option value="fixed_product">
							{__('Fixed Product Discount', 'multivendorx')}
						</option>
					</select>
				</div>
			),
		},
		{
			name: 'date',
			render: (updateFilter) => (
				<MultiCalendarInput
					value={{
						startDate: dateFilter.start_date,
						endDate: dateFilter.end_date,
					}}
					onChange={(range: { startDate: Date; endDate: Date }) => {
						const next = {
							start_date: range.startDate,
							end_date: range.endDate,
						};

						setDateFilter(next);
						updateFilter('date', next);
					}}
				/>
			),
		},
	];
	const BulkAction: React.FC = () => (
		<div className="action">
			<i className="adminfont-form"></i>
			<select
				name="action"
				ref={bulkSelectRef}
				onChange={handleBulkAction}
			>
				<option value="">{__('Bulk actions')}</option>
				<option value="delete">{__('Delete', 'multivendorx')}</option>
			</select>
		</div>
	);
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
				<CommonPopup
					open={AddCoupon}
					onClose={() => setAddCoupon(false)}
					width="31.25rem"
					height="100%"
					header={{
						icon: 'coupon',
						title: __('Add Coupon', 'multivendorx'),
						description: __(
							'Set code, discount, and usage limits, then activate.',
							'multivendorx'
						),
					}}
					footer={
						<AdminButton
							buttons={[
								{
									icon: 'contact-form',
									text: __('Draft', 'multivendorx'),
									className: 'red',
									onClick: () => handleSave('draft'),
								},
								{
									icon: 'save',
									text: __('Publish', 'multivendorx'),
									className: 'purple-bg',
									onClick: () => handleSave('publish'),
								},
							]}
						/>
					}

				>
					<>
						<FormGroupWrapper>
							<FormGroup label={__('Coupon code', 'multivendorx')} htmlFor="title">
								<BasicInput
									type="text"
									name="title"

									value={formData.title}
									generate={true}
									onChange={(e: any) =>
										setFormData({
											...formData,
											title: e.target.value,
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
								<TextArea
									name="content"
									rowNumber={6}
									value={formData.content}
									onChange={(e: any) =>
										setFormData({
											...formData,
											content: e.target.value,
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
				</CommonPopup>
			)}
			<Dialog
				open={confirmOpen}
				onClose={() => setConfirmOpen(false)}
			>
				<ProPopup
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
			</Dialog>

			<Table
				data={data}
				columns={columns as ColumnDef<Record<string, any>, any>[]}
				rowSelection={rowSelection}
				onRowSelectionChange={setRowSelection}
				defaultRowsPerPage={10}
				pageCount={pageCount}
				pagination={pagination}
				onPaginationChange={setPagination}
				realtimeFilter={realtimeFilter}
				perPageOption={[10, 25, 50]}
				handlePagination={requestApiForData}
				totalCounts={totalRows}
				categoryFilter={couponTypeCounts}
				searchFilter={searchFilter}
				bulkActionComp={() => <BulkAction />}
			/>
		</>
	);
};

export default AllCoupon;
