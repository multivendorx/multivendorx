import React, { useState } from 'react';
import '../common.scss';
import { __ } from '@wordpress/i18n';
import { InfoItem, NavigatorHeader, PopupUI, QueryProps, TableCard } from 'zyra';
import ShowProPopup from '../Popup/Popup';
import { applyFilters } from '@wordpress/hooks';
import { dummyCohorts } from './CohortUtill';

export interface CohortRow {
	id?: number;
	moodle_cohort_id?: number;
	cohort_name?: string;
	products?: Record<string, string>;
	enrolled_user?: number;
	view_users_url?: string;
	product_image?: string;
	status?: string;
}

const Cohort: React.FC = () => {
	const [openPopup, setopenPopup] = useState(false);
	// Define table headers
	const headers = {
		cohort_name: {
			label: __('Cohorts', 'moowoodle'),
			render: (row: CohortRow) => (
				<InfoItem
					title={row.cohort_name}
					avatar={{
						image: row.product_image,
						iconClass: 'cohort',
					}}
				/>
			),
		},
		products: {
			label: __('Product', 'moowoodle'),
			render: (row: CohortRow) => (
				<>
					{row.products && Object.keys(row.products).length
						? Object.entries(row.products).map(
							([name, url], index) => (
								<>
									{name}
									<a
										target="_blank"
										rel="noreferrer"
										href={url}
										className="link-item edit-link"
									>
										{__(
											'Edit product',
											'moowoodle'
										)}
									</a>
								</>
							)
						)
						: '-'}
				</>
			),
		},
		enrolled_user: {
			label: __('Enrolled users', 'moowoodle'),
			render: (row: CohortRow) => (
				<>
					{row.enrolled_user || 0}
					{row.view_users_url && (
						<a
							target="_blank"
							rel="noreferrer"
							href={row.view_users_url}
							className="link-item edit-link"
						>
							{__('View users', 'moowoodle')}
						</a>
					)}
				</>
			),
		},
		action: {
			type: 'action',
			label: __('Action', 'moowoodle'),
			actions: [
				{
					label: __('Sync Cohort Data', 'moowoodle'),
					icon: 'refresh',
					onClick: (row: CohortRow) => {
						handleSingleAction(
							'sync_cohort',
							row.id!,
							row.moodle_cohort_id!
						);
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
					onClick: (row: CohortRow) => {
						handleSingleAction(
							row.products && Object.keys(row.products).length
								? 'update_product'
								: 'create_product',
							row.id!,
							row.moodle_cohort_id!
						);
					},
				},
			],
		},
	};

	const defaultTableProps = {
		headers,
		rows: dummyCohorts,
		totalRows: dummyCohorts.length,
		search: {
			placeholder: __('Search...', 'moowoodle'),
		},
	};

	const tableProps = applyFilters(
		'moowoodle_cohort_table_props',
		defaultTableProps,
		{
			setopenPopup,
		}
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
				headerIcon="cohort"
				headerDescription={__(
					'Cohort information is presented with associated products and student enrollments to support administrative actions.',
					'moowoodle'
				)}
				headerTitle={__('Cohorts', 'moowoodle')}
			/>

			<TableCard {...tableProps} />
		</>
	);
};

export default Cohort;
