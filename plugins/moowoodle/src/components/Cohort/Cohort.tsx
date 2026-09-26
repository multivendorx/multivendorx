import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';

import {
	ColumnComponent,
	ContainerComponent,
	InformationItemComponent,
	PopupComponent,
	NavigatorHeaderComponent,
} from '@zyra/components';
import { TableCard } from '@zyra/table';
import ShowProPopup from '../Popup/Popup';
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
}

const Cohort: React.FC = () => {
	const [openPopup, setopenPopup] = useState(false);

	let tableProps: any = {};

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
					onClick: (row) => {
						setopenPopup(true);
					},
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
					onClick: (row) => {
						setopenPopup(true);
					},
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

	tableProps = applyFilters(
		'moowoodle_cohort_table_props',
		defaultTableProps
	);

	const handleTableWrapperClick = () => {
		if (!appLocalizer.khali_dabba) {
			setopenPopup(true);
		}
	};

	return (
		<>
			{openPopup && (
				<PopupComponent
					position="lightbox"
					open={openPopup}
					onClose={() => setopenPopup(false)}
					width={31.25}
					height="auto"
				>
					<ShowProPopup />
				</PopupComponent>
			)}

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
					<div className="demo-wrapper" onClick={handleTableWrapperClick}>
						{!appLocalizer.khali_dabba && (
							<div className="watermark">{__('This is sample Data', 'moowoodle')}</div>
						)}
						<TableCard {...tableProps} />
					</div>
				</ColumnComponent>
			</ContainerComponent>
		</>
	);
};

export default Cohort;
