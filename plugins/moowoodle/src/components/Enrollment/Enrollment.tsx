import React, { useState, useEffect } from 'react';
import { CategoryCount, InfoItem, NavigatorHeader, PopupUI, QueryProps, TableCard } from 'zyra';
import { __ } from '@wordpress/i18n';
import ShowProPopup from '../Popup/Popup';
import '../common.scss';
import { applyFilters } from '@wordpress/hooks';
import { dummyEnrollments } from './EnrollmentUtil';

interface EnrollmentRow {
	id?: number;
	course_name?: string;
	group_name?: string;
	cohort_name?: string;
	customer_url?: string;
	customer_name?: string;
	category_name?: string;
	status?: string;
	enrollment_date?: string;
	customer_img?: string;
	course_image?: string;
	order_id?: number;
	course_id?: number;
	group_id?: number;
	cohort_id?: number;
	customer_id?: number;
	customer_email?: string;
	learners_hub_id?: string;
}

const Enrollment: React.FC = () => {
	const [openPopup, setopenPopup] = useState(false);
	const [rows, setRows] = useState<EnrollmentRow[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [categoryCounts, setCategoryCounts] = useState<
		CategoryCount[] | null
	>(null);
	const [courses, setCourses] = useState([]);
	const [cohorts, setCohorts] = useState([]);
	const [groups, setGroups] = useState([]);
	const [error, setError] = useState<string | null>(null);
	const [rowIds, setRowIds] = useState<number[]>([]);

	useEffect(() => {

		/**
		 * FREE VERSION
		 */
		if (!appLocalizer.khali_dabba) {

			setCourses([
				{
					value: 'react',
					label: 'React Masterclass',
				},
			]);

			setGroups([
				{
					value: 'frontend',
					label: 'Frontend Group',
				},
			]);

			setCohorts([
				{
					value: 'cohort-a',
					label: 'Cohort A',
				},
			]);

			return;
		}

		/**
		 * PRO VERSION
		 */
		applyFilters(
			'moowoodle_enrollment_load_filters',
			null,
			{
				setCourses,
				setGroups,
				setCohorts,
				setError,
			}
		);

	}, []);

	const handleSingleAction = (
		row: EnrollmentRow
	) => {

		if (!appLocalizer.khali_dabba) {
			setopenPopup(true);
			return;
		}

		applyFilters(
			'moowoodle_enrollment_single_action',
			null,
			{
				row,
				setError,
				setIsLoading,
				doRefreshTableData,
			}
		);
	};

	// Define table headers
	const headers = {
		learning_unit: {
			label: __('Learning Unit', 'moowoodle'),
			render: (row: EnrollmentRow) => {
				let imageUrl = '';
				let title = '';

				if (row.course_name) {
					imageUrl = row.course_image || '';
					title = row.course_name;
				} else if (row.group_name) {
					title = row.group_name;
				} else if (row.cohort_name) {
					title = row.cohort_name;
				}

				return (
					<InfoItem
						title={title}
						avatar={{
							image: imageUrl,
							iconClass: 'learning',
						}}
					/>
				);
			},
		},
		student: {
			label: __('Student', 'moowoodle'),
			render: (row: EnrollmentRow) => (
				<InfoItem
					title={row.customer_name || '-'}
					avatar={{
						image: row.customer_img,
						iconClass: 'person',
					}}
				/>
			),
		},
		enrollment_date: {
			label: __('Enrollment Date', 'moowoodle'),
			type: 'date',
		},
		status: {
			label: __('Status', 'moowoodle'),
			type: 'status',
			statusClass: (row) => `${row.status}`
		},
		action: {
			type: 'action',
			label: __('Action', 'moowoodle'),
			actions: [
				{
					label: (row: EnrollmentRow) => {
						return row.status === 'enrolled'
							? __('Unenroll Now', 'moowoodle')
							: __('Enroll Now', 'moowoodle');
					},
					onClick: (row: EnrollmentRow) => {
						handleSingleAction(row);
					},
					icon: 'classroom-enrollment'
				},
			],
		},
	};

	const filters = [
		{
			key: 'course',
			label: __('Courses', 'moowoodle'),
			type: 'select',
			options: courses,
		},
		{
			key: 'group',
			label: __('Groups', 'moowoodle'),
			type: 'select',
			options: groups,
		},
		{
			key: 'cohort',
			label: __('Cohorts', 'moowoodle'),
			type: 'select',
			options: cohorts,
		},
		{
			key: 'status',
			label: __('Status', 'moowoodle'),
			type: 'select',
			options: [
				{ value: '', label: __('All Status', 'moowoodle') },
				{ value: 'enrolled', label: __('Enrolled', 'moowoodle') },
				{
					value: 'unenrolled',
					label: __('Unenrolled', 'moowoodle'),
				},
			],
		},
		{
			key: 'created_at',
			label: __('Created Date', 'moowoodle'),
			type: 'date',
		},
	];

	const doRefreshTableData = (
		query: QueryProps
	) => {

		/**
		 * FREE VERSION
		 */
		if (!appLocalizer.khali_dabba) {

			setRows(dummyEnrollments);

			setRowIds(
				dummyEnrollments.map(
					(item) => item.id || 0
				)
			);

			setTotalRows(
				dummyEnrollments.length
			);

			setCategoryCounts([
				{
					value: 'all',
					label: __('All', 'moowoodle'),
					count:
						dummyEnrollments.length,
				},
				{
					value: 'enrolled',
					label: __('Enrolled', 'moowoodle'),
					count: 1,
				},
				{
					value: 'unenrolled',
					label: __('Unenrolled', 'moowoodle'),
					count: 1,
				},
			]);
			setopenPopup(true)
			return;
		}

		/**
		 * PRO VERSION
		 */
		applyFilters(
			'moowoodle_enrollment_refresh_table',
			null,
			{
				query,
				setRows,
				setRowIds,
				setTotalRows,
				setCategoryCounts,
				setError,
				setIsLoading,
			}
		);
	};

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
				headerIcon="form"
				headerTitle={__('All Enrollments', 'moowoodle')}
				headerDescription={__(
					'Enrollment records are presented, showing students, their courses, enrollment dates, and current status.',
					'moowoodle'
				)}
			/>
			<TableCard
				headers={headers}
				rows={rows}
				totalRows={totalRows}
				isLoading={isLoading}
				onQueryUpdate={doRefreshTableData}
				ids={rowIds}
				categoryCounts={categoryCounts}
				search={{
					options: [
						{
							value: 'name',
							label: __('Name', 'moowoodle'),
						},
						{
							value: 'email',
							label: __('Email', 'moowoodle'),
						},
					],
					placeholder: __('Search by...', 'moowoodle'),
				}}
				filters={filters}
				format={appLocalizer.date_format}
			/>
		</>
	);
};

export default Enrollment;
