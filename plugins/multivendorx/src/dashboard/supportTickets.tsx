/* global appLocalizer */
import React, { useState } from 'react';

import { __ } from '@wordpress/i18n';

import { TableRow } from '@/services/type';
import { NavigatorHeader, TableCard } from 'zyra';

const SupportTickets: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const headers = {
		title: {
			label: __('Title', 'multivendorx'),
		},

		content: {
			label: __('Content', 'multivendorx'),
		},

		status: {
			label: __('Status', 'multivendorx'),
		},

		recipients: {
			label: __('Recipients', 'multivendorx'),
		},

		date: {
			label: __('Date', 'multivendorx'),
			type: 'date',
		},
	};
	return (
		<>
			<NavigatorHeader
				headerTitle="Support Tickets"
				headerDescription="Manage your store information and preferences"
			/>

			<TableCard
				headers={headers}
				rows={rows}
				totalRows={totalRows}
				isLoading={isLoading}
			/>
		</>
	);
};

export default SupportTickets;
