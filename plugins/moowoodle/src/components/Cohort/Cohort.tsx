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
	const [rows, setRows] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const [error, setError] = useState<string | null>(null);
	const [rowIds, setRowIds] = useState<number[]>([]);

	// Bulk action
	const handleBulkAction = (
		action: string,
		selectedIds: number[]
	) => {
		if (!appLocalizer.khali_dabba) {
			setopenPopup(true);
			return;
		}

		applyFilters(
			'moowoodle_cohort_bulk_action',
			null,
			{
				action,
				selectedIds,
				rows,
				setError,
				setIsLoading,
				doRefreshTableData,
			}
		);
	};

	// Handle single row action
	const handleSingleAction = (
		actionName: string,
		cohortId: number,
		moodleCohortId: number
	) => {
		if (!appLocalizer.khali_dabba) {
			setopenPopup(true);
			return;
		}

		applyFilters(
			'moowoodle_cohort_single_action',
			null,
			{
				actionName,
				cohortId,
				moodleCohortId,
				setError,
				setIsLoading,
				doRefreshTableData,
			}
		);
	};

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

	const bulkActions = [
		{ label: __('Sync cohort', 'moowoodle'), value: 'sync_cohort' },
		{
			label: __('Create product', 'moowoodle'),
			value: 'create_product',
		},
		{
			label: __('Update product', 'moowoodle'),
			value: 'update_product',
		},
	];

	const doRefreshTableData = (
		query: QueryProps
	) => {
		if (!appLocalizer.khali_dabba) {
			setRows(dummyCohorts)
			setopenPopup(true);
			setRowIds(
				dummyCohorts.map(
					(item) => item.id || 0
				)
			);

			setTotalRows(
				dummyCohorts.length
			);

			return;
		}

		applyFilters(
			'moowoodle_cohort_refresh_table',
			null,
			{
				query,
				setRows,
				setRowIds,
				setTotalRows,
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
				headerIcon="cohort"
				headerDescription={__(
					'Cohort information is presented with associated products and student enrollments to support administrative actions.',
					'moowoodle'
				)}
				headerTitle={__('Cohorts', 'moowoodle')}
			/>
			<TableCard
				headers={headers}
				rows={rows}
				totalRows={totalRows}
				isLoading={isLoading}
				onQueryUpdate={doRefreshTableData}
				ids={rowIds}
				search={{
					placeholder: __('Search...', 'moowoodle'),
				}}
				bulkActions={bulkActions}
				onBulkActionApply={(action: string, selectedIds: number[]) => {
					handleBulkAction(action, selectedIds);
				}}
			/>
		</>
	);
};

export default Cohort;
