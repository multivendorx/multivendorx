/* global appLocalizer */
import type { ReactNode } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { useModules } from '@zyra/core';
import LockedPreview from './LockedPreview';
import type { ProFeature } from './Popup';

interface ListGateProps {
	/** The page (title, description, icon); the Pro card names it and the Pro popup lists it first. */
	feature: ProFeature;
	/** True for a table that comes with MultiVendorX Pro. */
	pro?: boolean;
	/** The module the table belongs to, if any: its id (as in Modules) and its name. */
	module?: { id: string; name: string };
	/** The table drawn with sample rows, shown dimmed behind every card. */
	sample: ReactNode;
	/** True when the site has no records of this kind yet (see useNoRecordsYet). */
	isEmpty: boolean;
	/** What the "none yet" card says, and the next steps it offers. */
	empty: {
		heading: string;
		description: string;
		actions: ReactNode;
		note: string;
	};
	/** The real table. */
	children: ReactNode;
}

/**
 * The states of a MultiVendorX list table, each drawn the same way as in Notifima, MooWoodle and CatalogX:
 * - a Pro table without MultiVendorX Pro: the table with sample rows behind the "comes with MultiVendorX Pro" card;
 * - its module off: the same preview, with a card that links to the module;
 * - nothing yet: the same preview, with what to do to get the first record;
 * - otherwise: the real table.
 *
 * A search or filter with no match is not "nothing yet": useNoRecordsYet only counts the plain first page, so that
 * stays zyra's normal empty table.
 */
export function ListGate({
	feature,
	pro = false,
	module,
	sample,
	isEmpty,
	empty,
	children,
}: ListGateProps) {
	const { modules } = useModules();

	if (pro && !appLocalizer.khali_dabba) {
		return <LockedPreview feature={feature}>{sample}</LockedPreview>;
	}

	if (module && !modules.includes(module.id)) {
		return (
			<LockedPreview
				feature={{
					...feature,
					description: sprintf(
						/* translators: %s: module name, e.g. "Marketplace Refund". */
						__(
							'This list belongs to the %s module, which is switched off. Turn it on under Modules.',
							'multivendorx'
						),
						module.name
					),
				}}
				heading={sprintf(
					/* translators: %s: module name, e.g. "Marketplace Refund". */
					__('Turn on %s', 'multivendorx'),
					module.name
				)}
				actions={
					<a
						className="mvx-locked-button"
						href={`${appLocalizer.admin_dashboard_url}#&tab=settings&subtab=modules&module=${module.id}`}
					>
						{__('Open Modules', 'multivendorx')}
					</a>
				}
				note={__(
					'A preview with sample data. Your own records show here once the module is on.',
					'multivendorx'
				)}
			>
				{sample}
			</LockedPreview>
		);
	}

	if (isEmpty) {
		return (
			<LockedPreview
				feature={{ ...feature, description: empty.description }}
				heading={empty.heading}
				actions={empty.actions}
				note={empty.note}
			>
				{sample}
			</LockedPreview>
		);
	}

	return <>{children}</>;
}

export default ListGate;
