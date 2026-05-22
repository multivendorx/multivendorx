/* global appLocalizer */
import React, { useState, useEffect } from 'react';
import {
	CategoryCount,
	Column,
	Container,
	InfoItem,
	NavigatorHeader,
	PopupUI,
	QueryProps,
	TableCard,
} from 'zyra';
import { __ } from '@wordpress/i18n';
import ShowProPopup from '../Popup/Popup';
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
	learners_hub_id?: number;
}

const Enrollment: React.FC = () => {
	const [openPopup, setOpenPopup] = useState(false);
	let tableProps: any = {};

	// Define table headers
	const headers = {
		learning_unit: {
			label: __('Learning Unit', 'moowoodle'),
			render: (row: EnrollmentRow) => {
				let title = '';

				if (row.course_name) {
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
							iconClass: 'document',
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
			statusClass: (row) => `${row.status}`,
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
						setOpenPopup(true);
					},
					icon: 'classroom-enrollment',
				},
			],
		},
	};

	const defaultTableProps = {
		headers,
		rows: dummyEnrollments,
		totalRows: dummyEnrollments.length,
		search: {
			placeholder: __('Search...', 'moowoodle'),
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
		},
	};

	tableProps = applyFilters(
		'moowoodle_enrollment_table_props',
		defaultTableProps
	);
	const handleTableWrapperClick = () => {
		if (!appLocalizer.khali_dabba) {
			setOpenPopup(true);
		}
	};
	return (
		<>
			{openPopup && (
				<PopupUI
					position="lightbox"
					open={openPopup}
					onClose={() => setOpenPopup(false)}
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
			<Container general>
				<Column>
					<div onClick={handleTableWrapperClick}>
						<TableCard {...tableProps} />
						{tableProps.popup}
					</div>
				</Column>
			</Container>
		</>
	);
};

export default Enrollment;
