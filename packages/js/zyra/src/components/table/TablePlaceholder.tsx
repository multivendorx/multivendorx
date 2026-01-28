import React from 'react';
import { TableHeader, QueryProps } from './types';
import Table from './table';
import Skeleton from '../UI/Skeleton';

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
			display: <Skeleton width={"100%"} />,
		}))
	);

	return (
		<Table
			ariaHidden={true}
			headers={headers}
			rows={rows}
			rowHeader={typeof rowHeader === 'number' ? rowHeader : 0}
			query={query}
			caption={caption}
		/>
	);
};

export default TablePlaceholder;
