/* global appLocalizer */
import type { ReactNode } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import LockedPreview from './LockedPreview';
import type { ProFeature } from './Popup';

interface ListGateProps {
	/** The page (title, description, icon); the Pro card names it and the Pro popup lists it first. */
	feature: ProFeature;
	/** The module the page belongs to: its id (as in `appLocalizer.active_modules`) and its name. */
	module: { id: string; name: string };
	/** The page drawn with sample rows, shown dimmed behind every card. */
	sample: ReactNode;
	/** True when the module is on but the site has no records of this kind yet (see useNoRecordsYet). */
	isEmpty: boolean;
	/** What the "none yet" card says, and the next steps it offers. */
	empty: {
		heading: string;
		description: string;
		actions: ReactNode;
		note: string;
	};
	/** The real page. */
	children: ReactNode;
}

/**
 * The four states of a CatalogX Pro list screen (Quotation Requests, Wholesale Users, Rules, Enquiry Messages), each
 * drawn the same way:
 * - without Pro: the page with sample rows behind the "comes with CatalogX Pro" card;
 * - with Pro but its module off: the same preview, with a card that links to the module;
 * - module on, nothing yet: the same preview, with what to do to get the first record;
 * - otherwise: the real page.
 */
export function ListGate({
	feature,
	module,
	sample,
	isEmpty,
	empty,
	children,
}: ListGateProps) {
	if (!appLocalizer.khali_dabba) {
		return <LockedPreview feature={feature}>{sample}</LockedPreview>;
	}

	if (!(appLocalizer.active_modules ?? []).includes(module.id)) {
		return (
			<LockedPreview
				feature={{
					...feature,
					description: sprintf(
						/* translators: %s: module name, e.g. "Wholesale". */
						__(
							'This page belongs to the %s module, which is switched off. Turn it on under Settings → Modules.',
							'catalogx'
						),
						module.name
					),
				}}
				heading={sprintf(
					/* translators: %s: module name, e.g. "Wholesale". */
					__('Turn on %s', 'catalogx'),
					module.name
				)}
				actions={
					<a
						className="cx-locked-button"
						href={`#&tab=settings&subtab=modules&module=${module.id}`}
					>
						{__('Open Modules', 'catalogx')}
					</a>
				}
				note={__(
					'A preview with sample data. Your own records show here once the module is on.',
					'catalogx'
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
