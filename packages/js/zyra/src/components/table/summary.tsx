import React from 'react';

export interface TableSummaryItem {
	label: string;
	value: React.ReactNode;
}

export interface TableSummaryProps {
	data: TableSummaryItem[];
}

/**
 * Displays summarized table data on a single line.
 */
const TableSummary: React.FC<TableSummaryProps> = ({ data }) => {
	return (
		<ul className="table-summary" role="complementary">
			{data.map(({ label, value }, i) => (
				<li className="table-summary-item" key={i}>
					<span className="table-summary-value">{value}</span>
					<span className="table-summary-label">{label}</span>
				</li>
			))}
		</ul>
	);
};

export default TableSummary;
