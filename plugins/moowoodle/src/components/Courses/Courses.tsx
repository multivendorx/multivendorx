/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
import ShowProPopup from '../Popup/Popup';
import { applyFilters } from '@wordpress/hooks';
import {
	getApiLink,
	TableCard,
	NavigatorHeader,
	QueryProps,
	InfoItem,
	PopupUI,
	Container,
	Column,
} from 'zyra';

interface CourseRow {
	id?: number;
	moodle_course_id?: number;
	course_name?: string;
	moodle_url?: string;
	course_short_name?: string;
	category_name?: string;
	category_url?: string;
	date?: string;
	products?: Record<string, string>;
	enrolled_user?: number;
	view_users_url?: string;
	product_image?: string;
	product_name?: string;
	product_url?: string;
	status?: string;
}

const Course: React.FC = () => {
	const [openPopup, setopenPopup] = useState(false);
	const [rows, setRows] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [category, setCategory] = useState([]);
	const [error, setError] = useState<string | null>(null);
	const [rowIds, setRowIds] = useState<number[]>([]);
	let tableProps: any = {};

	// Fetch categories on mount
	useEffect(() => {
		axios({
			method: 'get',
			url: getApiLink(appLocalizer, 'courses'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: { options: true },
		})
			.then((response) => {
				setCategory(response.data.category || []);
			})
			.catch(() => {
				setError(__('Failed to load categories', 'moowoodle'));
			});
	}, []);

	// Define table headers
	const headers = {
		course_name: {
			label: __('Course', 'moowoodle'),
			render: (row: CourseRow) => (
				<InfoItem
					title={row.course_name}
					titleLink={row.moodle_url}
					avatar={{
						image: row.product_image,
						iconClass: 'subscription-courses',
					}}
				/>
			),
		},
		course_short_name: {
			label: __('Short name', 'moowoodle'),
		},
		category_name: {
			label: __('Category', 'moowoodle'),
		},
		date: {
			label: __('Course duration', 'moowoodle'),
		},
		products: {
			label: __('Product', 'moowoodle'),
			render: (row: CourseRow) => (
				<>
					{row.product_name ? (
						<>
							{row.product_name}
							<a
								target="_blank"
								rel="noreferrer"
								href={row.product_url}
								className="link-item edit-link"
							>
								{__('Edit product', 'moowoodle')}
							</a>
						</>
					) : (
						'-'
					)}
				</>
			),
		},
		enrolled_user: {
			label: __('Enrolled users', 'moowoodle'),
			render: (row: CourseRow) => (
				<>
					{row.enrolled_user || 0}
					<a
						target="_blank"
						rel="noreferrer"
						href={row.view_users_url}
						className="link-item edit-link"
					>
						{__('View users', 'moowoodle')}
					</a>
				</>
			),
		},
		action: {
			type: 'action',
			label: __('Action', 'moowoodle'),
			actions: [
				{
					label: __('Sync Course Data', 'moowoodle'),
					icon: 'refresh',
					onClick: (row) => {
						setopenPopup(true);
					},
				},
				{
					// Use a function that returns the label based on the row
					label: (row: CourseRow) => {
						return row?.product_name
							? __(
									'Sync Course Data & Update Product',
									'moowoodle'
								)
							: __('Create Product', 'moowoodle');
					},
					icon: (row: CourseRow) => {
						return row?.product_name
							? 'update-product'
							: 'add-product';
					},
					onClick: (row) => {
						setopenPopup(true);
					},
				},
			],
		},
	};

	// Define bulk actions
	const bulkActions = [
		{ label: __('Sync course', 'moowoodle'), value: 'sync_courses' },
		{ label: __('Create product', 'moowoodle'), value: 'create_product' },
		{ label: __('Update product', 'moowoodle'), value: 'update_product' },
	];

	// Define filters
	const filters = [
		{
			key: 'category',
			label: __('Category', 'moowoodle'),
			type: 'select',
			options: category,
		},
	];

	const doRefreshTableData = (query: QueryProps) => {
		setIsLoading(true);

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'courses'),
			headers: {
				'X-WP-Nonce': appLocalizer.nonce,
				withCredentials: true,
			},
			params: {
				page: query.paged || 1,
				row: query.per_page || 10,
				category: query.filter?.category || '',
				searchaction: query.searchAction || 'course',
				search: query.searchValue,
			},
		})
			.then((response) => {
				const items = response.data || [];
				const ids = items
					.filter((course: CourseRow) => course?.id != null)
					.map((course: CourseRow) => course.id);

				setRowIds(ids);
				setRows(items);
				setTotalRows(response.headers['x-wp-total'] || 0);
				setIsLoading(false);
			})
			.catch(() => {
				console.error('Failed to fetch courses');
				setError(__('Failed to load courses', 'moowoodle'));
				setRows([]);
				setTotalRows(0);
				setIsLoading(false);
			});
	};

	const defaultTableProps = {
		headers,
		rows,
		totalRows,
		isLoading,

		onQueryUpdate: doRefreshTableData,

		ids: rowIds,

		search: {
			placeholder: __('Search...', 'moowoodle'),
			options: [
				{ value: 'course', label: __('Course', 'moowoodle') },
				{ value: 'shortname', label: __('Short name', 'moowoodle') },
			],
		},

		filters: filters,

		bulkActions: bulkActions,

		onBulkActionApply: () => {
			setopenPopup(true);
		},
	};

	tableProps = applyFilters(
		'moowoodle_course_table_props',
		defaultTableProps
	);
	return (
		<>
			{openPopup && (
				<PopupUI
					position="lightbox"
					open={openPopup}
					onClose={() => setopenPopup(false)}
					width={31.25}
					height="auto"
				>
					<ShowProPopup />
				</PopupUI>
			)}
			<NavigatorHeader
				headerIcon="subscription-courses"
				headerDescription={__(
					'Comprehensive course data is displayed here, including linked products, enrollment numbers, and related details.',
					'moowoodle'
				)}
				headerTitle={__('Courses', 'moowoodle')}
			/>

			{error && (
				<div className="admin-notice-display-title error">
					<i className="admin-font icon-no"></i>
					{error}
				</div>
			)}
			<Container general>
				<Column>
					<TableCard {...tableProps} />
				</Column>
			</Container>
		</>
	);
};

export default Course;
