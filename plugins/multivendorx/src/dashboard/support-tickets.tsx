/* global appLocalizer */
import React, { useState } from 'react';

import { __ } from '@wordpress/i18n';

import { TableRow } from '@/services/type';
import { TableCard } from 'zyra';

const SupportTickets: React.FC = () => {
	const [rows, setRows] = useState<TableRow[][]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [totalRows, setTotalRows] = useState<number>(0);
	const headers = [
		{ key: 'title', label: 'Title' },
		{ key: 'content', label: 'Content' },
		{ key: 'status', label: 'Status' },
		{ key: 'recipients', label: 'Recipients' },
		{ key: 'date', label: 'Date' }
	];
	return (
		<>
			<div className="page-title-wrapper">
				<div className="page-title">
					<div className="title">Support Tickets</div>
					<div className="des">
						Manage your store information and preferences
					</div>
				</div>
			</div>

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
