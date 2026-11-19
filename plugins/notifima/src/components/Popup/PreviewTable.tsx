/* global appLocalizer */
import type { ComponentProps, ReactNode } from 'react';
import { applyFilters } from '@wordpress/hooks';
import { TableCard } from '@zyra/table';
import LockedPreview from './LockedPreview';
import useNoRecordsYet from './useNoRecordsYet';
import type { ProFeature } from './Popup';

type TableProps = ComponentProps<typeof TableCard>;

interface PreviewTableProps {
	/** The table this screen draws on its own: headers, filters, search and its sample rows. */
	defaultTableProps: TableProps;
	/** The filter Notifima Pro hooks to swap the samples for real data and actions. */
	filterHook: string;
	/** The few sample rows drawn behind a preview card. */
	sampleRows: TableProps['rows'];
	/** What the page offers, on the Pro card shown while Notifima Pro isn't active. */
	proFeature: ProFeature;
	/** The card shown with Pro active but nothing to list yet: what will show here and the next steps. */
	empty: {
		feature: ProFeature;
		heading: string;
		actions: ReactNode;
		note: string;
	};
}

/**
 * A list screen's table, or a preview of it. Without Notifima Pro: sample rows behind the Pro card. With Pro but no
 * records yet: sample rows behind the screen's own next steps. Otherwise: the table Pro's filter fills with real data.
 *
 * The samples always use the screen's own props, not the filtered ones: Notifima Pro may be installed without a
 * license, and its filter would swap the samples for real (empty) data.
 */
const PreviewTable = ({
	defaultTableProps,
	filterHook,
	sampleRows,
	proFeature,
	empty,
}: PreviewTableProps) => {
	// Always called, so Pro's filter (a React hook) runs on every render in the same order.
	const { props: tableProps, hasNoRecords } = useNoRecordsYet(
		applyFilters(filterHook, defaultTableProps) as TableProps
	);

	const sampleTable = (
		<TableCard
			{...defaultTableProps}
			rows={sampleRows}
			totalRows={sampleRows?.length ?? 0}
		/>
	);

	if (!appLocalizer.khali_dabba) {
		return <LockedPreview feature={proFeature}>{sampleTable}</LockedPreview>;
	}

	if (hasNoRecords) {
		return (
			<LockedPreview
				feature={empty.feature}
				heading={empty.heading}
				actions={empty.actions}
				note={empty.note}
			>
				{sampleTable}
			</LockedPreview>
		);
	}

	return <TableCard {...tableProps} />;
};

export default PreviewTable;
