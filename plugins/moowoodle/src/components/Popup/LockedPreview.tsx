/* global appLocalizer */
import { useState, type ReactNode } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { PopupComponent } from '@zyra/components';
import ShowProPopup, { type ProFeature } from './Popup';
import './locked-preview.scss';

interface LockedPreviewProps {
	/** The page drawn with sample rows: the same zyra table the real page uses. */
	children: ReactNode;
	/** The page this is (title, description, icon); the card names it and the Pro popup lists it first. */
	feature: ProFeature;
}

/**
 * A Pro-only page while MooWoodle Pro isn't active: the real page drawn with sample rows, dimmed, inert and fading
 * out, with a card floating over it that says the page comes with Pro, the Upgrade button (opens the Pro popup) and a
 * pricing link. Ported from VuloCart's ModuleRequired + LockedPreview (Marketing → Pricing Rules), so both products
 * show a locked page alike.
 */
export function LockedPreview({ children, feature }: LockedPreviewProps) {
	const [open, setOpen] = useState(false);

	return (
		<div className="mw-locked">
			{/* `inert` keeps the sample's search and row actions out of tab order and clicks. Spread because these
			React typings predate the attribute. */}
			<div
				className="mw-locked-preview"
				aria-hidden="true"
				{...({ inert: '' } as Record<string, unknown>)}
			>
				{children}
			</div>

			<div className="mw-locked-overlay">
				<div className="mw-locked-card">
					<span className="admin-tag pro-tag">
						<i className="adminfont-pro-tag" aria-hidden="true" />
						{__('Pro', 'moowoodle')}
					</span>
					<h2>
						{sprintf(
							/* translators: %s: page title, e.g. "Cohorts". */
							__('%s comes with MooWoodle Pro', 'moowoodle'),
							feature.title
						)}
					</h2>
					<p>{feature.description}</p>
					<div className="mw-locked-actions">
						<button
							type="button"
							className="mw-locked-button"
							onClick={() => setOpen(true)}
						>
							{__('Upgrade to Pro', 'moowoodle')}
						</button>
						<a
							className="mw-locked-link"
							href={appLocalizer.shop_url}
							target="_blank"
							rel="noreferrer"
						>
							{__('See pricing', 'moowoodle')}
						</a>
					</div>
					<p className="mw-locked-note">
						<i className="adminfont-eye" aria-hidden="true" />
						{__(
							'A preview with sample data. Your own records show here once it is on.',
							'moowoodle'
						)}
					</p>
				</div>
			</div>

			{open && (
				<PopupComponent
					position="lightbox"
					open
					onClose={() => setOpen(false)}
					width={46}
					height="auto"
				>
					<ShowProPopup feature={feature} />
				</PopupComponent>
			)}
		</div>
	);
}

export default LockedPreview;
