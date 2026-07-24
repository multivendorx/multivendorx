/* global appLocalizer */
import React from 'react';
import { __ } from '@wordpress/i18n';
import { getApiLink, sendApiResponse } from '@zyra/core';
import {
	CardComponent,
	ModuleGuardComponent,
	NoticeManager,
} from '@zyra/components';
import { TableCard, TableRow } from '@zyra/table';
import { useApiList } from '../services/useApiList';

export interface Finding extends TableRow {
	id: number;
	title: string;
	severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
	category: string;
	status: 'open' | 'resolved' | 'ignored' | 'snoozed';
	created_at: string;
}

interface FindingsTableProps {
	title: string;
	description?: string;
	/** Restricts the list to one finding category (e.g. 'seo', 'geo', 'woocommerce'). Omit to show every category (Health). */
	category?: string;
}

/**
 * Shared findings list — the Health, SEO, GEO, and WooCommerce pages are
 * all "vulopilot_scan_findings filtered to a category" (DATABASE.md), so
 * this one component serves all four rather than duplicating the same
 * table/filter/state wiring four times.
 */
const FindingsTable: React.FC<FindingsTableProps> = ({
	title,
	description,
	category,
}) => {
	const { data, total, isLoading, error, refetch } = useApiList<Finding>(
		'findings',
		{
			category,
			per_page: 10,
		}
	);

	const handleSetStatus = (
		row: Record<string, unknown> | undefined,
		status: 'resolved' | 'ignored' | 'open',
		successMessage: string
	) => {
		if (!row) {
			return;
		}

		sendApiResponse(
			appLocalizer,
			getApiLink(appLocalizer, `findings/${row.id}`),
			{ status }
		).then((response) => {
			if (response) {
				NoticeManager.add({
					uniqueKey: `finding-${status}-${row.id}`,
					type: 'success',
					position: 'notice',
					message: successMessage,
				});
				refetch();
			} else {
				NoticeManager.add({
					uniqueKey: `finding-${status}-failed-${row.id}`,
					type: 'error',
					position: 'notice',
					message: __(
						'Could not update this finding. Please try again.',
						'vulopilot'
					),
				});
			}
		});
	};

	const handleResolve = (row?: Record<string, unknown>) =>
		handleSetStatus(
			row,
			'resolved',
			__('Finding marked as resolved.', 'vulopilot')
		);

	const handleIgnore = (row?: Record<string, unknown>) =>
		handleSetStatus(row, 'ignored', __('Finding ignored.', 'vulopilot'));

	const handleReopen = (row?: Record<string, unknown>) =>
		handleSetStatus(row, 'open', __('Finding reopened.', 'vulopilot'));

	if (error) {
		return (
			<CardComponent title={title}>
				<ModuleGuardComponent
					icon="warning"
					title={__('Could not load findings', 'vulopilot')}
					desc={error}
					buttonText={__('Retry', 'vulopilot')}
					onButtonClick={refetch}
				/>
			</CardComponent>
		);
	}

	const headers: Record<string, any> = {
		title: {
			label: __('Finding', 'vulopilot'),
			isSortable: true,
		},
		...(category
			? {}
			: {
					category: {
						label: __('Category', 'vulopilot'),
					},
				}),
		severity: {
			label: __('Severity', 'vulopilot'),
			type: 'badge',
			statusClass: (row: Finding) => `severity-${row.severity}`,
		},
		status: {
			label: __('Status', 'vulopilot'),
			type: 'badge',
			statusClass: (row: Finding) => `status-${row.status}`,
		},
		created_at: {
			label: __('Detected', 'vulopilot'),
			type: 'date',
			isSortable: true,
			defaultSort: true,
			defaultOrder: 'desc',
		},
		actions: {
			label: __('Actions', 'vulopilot'),
			type: 'action',
			actions: [
				{
					label: (row?: Record<string, unknown>) =>
						row?.status === 'open'
							? __('Mark resolved', 'vulopilot')
							: __('Resolved', 'vulopilot'),
					icon: 'yes',
					onClick: handleResolve,
				},
				{
					label: (row?: Record<string, unknown>) =>
						row?.status === 'ignored'
							? __('Ignored', 'vulopilot')
							: __('Ignore', 'vulopilot'),
					icon: 'hidden',
					onClick: handleIgnore,
				},
				{
					label: __('Reopen', 'vulopilot'),
					icon: 'controls-repeat',
					onClick: handleReopen,
				},
			],
		},
	};

	return (
		<TableCard
			title={title}
			headers={headers}
			rows={data}
			ids={data.map((row) => row.id)}
			totalRows={total}
			isLoading={isLoading}
			emptyMessage={
				description ||
				__('No findings here yet — nothing to report.', 'vulopilot')
			}
			filters={[
				{
					key: 'severity',
					label: __('Severity', 'vulopilot'),
					type: 'select',
					size: 10,
					options: [
						{ label: __('Critical', 'vulopilot'), value: 'critical' },
						{ label: __('High', 'vulopilot'), value: 'high' },
						{ label: __('Medium', 'vulopilot'), value: 'medium' },
						{ label: __('Low', 'vulopilot'), value: 'low' },
						{ label: __('Info', 'vulopilot'), value: 'info' },
					],
				},
				{
					key: 'status',
					label: __('Status', 'vulopilot'),
					type: 'select',
					size: 10,
					options: [
						{ label: __('Open', 'vulopilot'), value: 'open' },
						{ label: __('Resolved', 'vulopilot'), value: 'resolved' },
						{ label: __('Ignored', 'vulopilot'), value: 'ignored' },
						{ label: __('Snoozed', 'vulopilot'), value: 'snoozed' },
					],
				},
			]}
		/>
	);
};

export default FindingsTable;
