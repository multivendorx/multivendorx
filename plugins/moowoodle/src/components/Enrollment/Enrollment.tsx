/* global appLocalizer */
import React from 'react';

import {
	ColumnComponent,
	ContainerComponent,
	InformationItemComponent,
	NavigatorHeaderComponent,
} from '@zyra/components';
import { TableCard } from '@zyra/table';
import { __ } from '@wordpress/i18n';
import LockedPreview from '../Popup/LockedPreview';
import useNoRecordsYet from '../Popup/useNoRecordsYet';
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

/** No-op handler for the sample rows' actions: LockedPreview makes the sample inert. */
const noop = () => undefined;

/** The sample rows drawn behind the unlock card: a few, as the preview fades out below them. */
const SAMPLE_ROWS = dummyEnrollments.slice(0, 4);

const Enrollment: React.FC = () => {
	// Define table headers
	const headers = {
		learning_unit: {
			label: __('Learning Unit', 'moowoodle'),
			width: '50%',
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
						title={row.customer_name}
						avatar={{
							iconClass: 'person',
						}}
						badges={[
							{
								text: row.status,
								className: `badge-${row.status}`,
							},
						]}
						descriptions={[
							{
								icon: 'subscription-courses',
								label: __('Course', 'moowoodle'),
								value: title,
							},
						]}
					/>
				);
			},
		},
		enrollment_date: {
			label: __('Date', 'moowoodle'),
			render: (row: EnrollmentRow) => {
				return (
					<>
						<div className="table-details">
							<span className="label">
								{__('Enrollment Date', 'moowoodle')}
							</span>
							{row.enrollment_date || '-'}
						</div>
					</>
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
					onClick: noop,
					color: (row: EnrollmentRow) => {
						return row.status === 'enrolled'
							? __('text-red', 'moowoodle')
							: __('text-purple', 'moowoodle');
					},
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

	const { props: tableProps, hasNoRecords } = useNoRecordsYet(
		applyFilters(
			'moowoodle_enrollment_table_props',
			defaultTableProps
			// MooWoodle Pro's props add the confirm dialog it renders beside the table.
		) as typeof defaultTableProps & { popup?: React.ReactNode }
	);

	/** The sample rows behind a card: for the Pro card (Pro off) and the "none yet" card (Pro on, nothing yet). */
	const sampleTable = (
		// The plugin's own sample rows, not the filtered props: MooWoodle Pro may be installed without a license, and
		// its filter would swap the samples for real (empty) data.
		<TableCard
			{...defaultTableProps}
			rows={SAMPLE_ROWS}
			totalRows={SAMPLE_ROWS.length}
		/>
	);
	return (
		<>
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
					{appLocalizer.khali_dabba ? (
						hasNoRecords ? (
							<LockedPreview
								feature={{
									title: __('Enrollments', 'moowoodle'),
									description: __(
										'A student is enrolled in Moodle™ when they buy a course product. Link your courses to products, and every enrollment shows here.',
										'moowoodle'
									),
									icon: 'classroom-enrollment',
								}}
								heading={__('No enrollments yet', 'moowoodle')}
								actions={
									<>
										<a
											className="mw-locked-button"
											href="#&tab=courses"
										>
											{__('Go to courses', 'moowoodle')}
										</a>
										<a
											className="mw-locked-link"
											href="#&tab=settings&subtab=course-enrollment"
										>
											{__(
												'Enrollment settings',
												'moowoodle'
											)}
										</a>
									</>
								}
								note={__(
									'A preview with sample enrollments. Yours show here after the first purchase.',
									'moowoodle'
								)}
							>
								{sampleTable}
							</LockedPreview>
						) : (
							<>
								<TableCard {...tableProps} />
								{tableProps.popup}
							</>
						)
					) : (
						<LockedPreview
							feature={{
								title: __('Enrollments', 'moowoodle'),
								description: __(
									'Every student enrollment in one place: enroll or unenroll students, by course, group or cohort.',
									'moowoodle'
								),
								icon: 'classroom-enrollment',
							}}
						>
							{sampleTable}
						</LockedPreview>
					)}
				</ColumnComponent>
			</ContainerComponent>
		</>
	);
};

export default Enrollment;
