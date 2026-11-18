/* global appLocalizer */
import React from 'react';
import { __ } from '@wordpress/i18n';

import {
	ColumnComponent,
	ContainerComponent,
	InformationItemComponent,
	NavigatorHeaderComponent,
} from '@zyra/components';
import { TableCard } from '@zyra/table';
import LockedPreview from '../Popup/LockedPreview';
import useNoRecordsYet from '../Popup/useNoRecordsYet';
import { applyFilters } from '@wordpress/hooks';
import { dummyCohorts } from './CohortUtil';

export interface CohortRow {
	id?: number;
	moodle_cohort_id?: number;
	cohort_name?: string;
	product_name?: string;
	product_url?: string;
	enrolled_user?: number;
	view_users_url?: string;
	product_image?: string;
	status?: string;
	date?: string;
	products?: Record<string, unknown>;
}

/** No-op handler for the sample rows' actions: LockedPreview makes the sample inert. */
const noop = () => undefined;

/** The sample rows drawn behind the unlock card: a few, as the preview fades out below them. */
const SAMPLE_ROWS = dummyCohorts.slice(0, 4);

const Cohort: React.FC = () => {
	// Define table headers
	const headers = {
		cohort_name: {
			label: __('Cohorts', 'moowoodle'),
			render: (row: CohortRow) => (
				<InformationItemComponent
					title={row.cohort_name}
					titleLink={row.product_url}
					width="75%"
					avatar={{ iconClass: 'cohort' }}
					badges={[
						{
							className: 'blue',
							text: `${row.enrolled_user || 0} Enrolled users`,
						},
					]}
					descriptions={[
						{
							icon: 'single-product',
							label: __('Product', 'moowoodle'),
							value: row.product_name || '-',
						},
						{
							icon: 'calendar',
							label: __('Last sync', 'moowoodle'),
							value: row.date || '-',
						},
					]}
				/>
			),
		},

		action: {
			type: 'action',
			label: __('Action', 'moowoodle'),

			actions: [
				{
					label: __('Sync Cohort Data', 'moowoodle'),
					icon: 'refresh',
					onClick: noop,
				},

				{
					label: (row: CohortRow) => {
						return row?.products && Object.keys(row.products).length
							? __(
									'Sync Cohort Data & Update Product',
									'moowoodle'
								)
							: __('Create Product', 'moowoodle');
					},

					icon: (row: CohortRow) => {
						return row?.products && Object.keys(row.products).length
							? 'update-product'
							: 'add-product';
					},
					onClick: noop,
				},
			],
		},
	};

	const defaultTableProps = {
		headers,
		hideHeader: true,
		rows: dummyCohorts,
		totalRows: dummyCohorts.length,
		search: {
			placeholder: __('Search...', 'moowoodle'),
		},
	};

	const { props: tableProps, hasNoRecords } = useNoRecordsYet(
		applyFilters(
			'moowoodle_cohort_table_props',
			defaultTableProps
		) as typeof defaultTableProps
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
				headerIcon="cohort"
				headerDescription={__(
					'Cohort information is presented with associated products and student enrollments to support administrative actions.',
					'moowoodle'
				)}
				headerTitle={__('Cohorts', 'moowoodle')}
			/>
			<ContainerComponent general>
				<ColumnComponent>
					{appLocalizer.khali_dabba ? (
						hasNoRecords ? (
							<LockedPreview
								feature={{
									title: __('Cohorts', 'moowoodle'),
									description: __(
										'Cohorts come from your Moodle™ site. Sync them to list every cohort here, link it to a product and enroll the whole cohort in one purchase.',
										'moowoodle'
									),
									icon: 'cohort',
								}}
								heading={__(
									'No cohorts synced yet',
									'moowoodle'
								)}
								actions={
									<>
										<a
											className="mw-locked-button"
											href="#&tab=synchronization&subtab=synchronize-cohort"
										>
											{__('Sync cohorts', 'moowoodle')}
										</a>
										<a
											className="mw-locked-link"
											href="#&tab=settings&subtab=connection-access"
										>
											{__('Connect Moodle™', 'moowoodle')}
										</a>
									</>
								}
								note={__(
									'A preview with sample cohorts. Yours show here after the first sync.',
									'moowoodle'
								)}
							>
								{sampleTable}
							</LockedPreview>
						) : (
							<TableCard {...tableProps} />
						)
					) : (
						<LockedPreview
							feature={{
								title: __('Cohorts', 'moowoodle'),
								description: __(
									'Sync Moodle™ cohorts, link them to products and enroll whole cohorts in one purchase.',
									'moowoodle'
								),
								icon: 'cohort',
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

export default Cohort;
