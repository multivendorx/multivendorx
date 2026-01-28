import React from 'react';
import { TableHeader, QueryProps } from './types';
import Table from './table';
import './table.scss';

interface TablePlaceholderProps {
	/** Query parameters */
	query?: QueryProps;
	/** Caption for the table */
	caption: string;
	/** Number of placeholder rows */
	numberOfRows?: number;
	/** Which column should be the row header, defaults to 0 */
	rowHeader?: number | false;
	/** Table headers */
	headers: TableHeader[];
}

/**
 * TablePlaceholder behaves like Table but displays placeholder boxes instead of data.
 */
const TablePlaceholder: React.FC<TablePlaceholderProps> = ({
	query,
	caption,
	headers,
	numberOfRows = 5,
	rowHeader,
}) => {
	// Create placeholder rows
	const rows = Array.from({ length: numberOfRows }).map(() =>
		headers.map(() => ({
			display: <span className="is-placeholder" />,
		}))
	);

	return (
		<Table
			ariaHidden={true}
			className="is-loading"
			headers={headers}
			rows={rows}
			rowHeader={typeof rowHeader === 'number' ? rowHeader : 0}
			query={query}
			caption={caption}
		/>
	);
};

export default TablePlaceholder;
