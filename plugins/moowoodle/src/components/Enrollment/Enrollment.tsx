/* global appLocalizer */
import React, { useState, useEffect } from 'react';

import {
	ColumnComponent,
	ContainerComponent,
	InformationItemComponent,
	PopupComponent,
	NavigatorHeaderComponent,
} from '@zyra/components';
import { CategoryCount, QueryProps, TableCard } from '@zyra/table';
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
			width: "65%",
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
					<InformationItemComponent
						title={title}
						avatar={{
							iconClass: 'document',
						}}
						badges={[
							{
								text: row.status,
								className: `badge-${row.status}`,
							},
						]}
						descriptions={[
							{
								icon: 'calendar',
								label: __('Enrollment Date', 'moowoodle'),
								value: row.enrollment_date,
							},
							{
								icon: 'person',
								label: __('Student', 'moowoodle'),
								value: row.customer_name,
							},
						]}
					/>
				);
			},
		},
		action: {
			type: 'action',
			label: __('Action', 'moowoodle'),
			actions: [
				{	
					type: 'button',
					label: (row: EnrollmentRow) => {
						return row.status === 'enrolled'
							? __('Unenroll Now', 'moowoodle')
							: __('Enroll Now', 'moowoodle');
					},
					onClick: (row: EnrollmentRow) => {
						setOpenPopup(true);
					},
					color: 'text-purple',
					icon: 'classroom-enrollment',
				},
			],
		},
	};

	const defaultTableProps = {
		headers,
		hideHeader: true,		
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
				<PopupComponent
					position="lightbox"
					open={openPopup}
					onClose={() => setOpenPopup(false)}
					width={31.25}
					height="auto"
				>
					<ShowProPopup />
				</PopupComponent>
			)}
			<NavigatorHeaderComponent
				headerIcon="form"
				headerTitle={__('All Enrollments', 'moowoodle')}
				headerDescription={__(
					'Enrollment records are presented, showing students, their courses, enrollment dates, and current status.',
					'moowoodle'
				)}
			/>
			<ContainerComponent general>
				<ColumnComponent>
					<div className="demo-wrapper" onClick={handleTableWrapperClick}>
						{!appLocalizer.khali_dabba && (
							<div className="watermark">{__('This is sample Data', 'moowoodle')}</div>
						)}
						<TableCard {...tableProps} />
						{tableProps.popup}
					</div>
				</ColumnComponent>
			</ContainerComponent>
		</>
	);
};

export default Enrollment;
