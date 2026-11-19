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
	/**
	 * A free page with nothing in it yet (e.g. Subscribers before the first signup) passes its own heading and actions
	 * instead of the Pro ones. Leave both out for a Pro-only page.
	 */
	heading?: string;
	actions?: ReactNode;
	/** The card's footer line; defaults to the Pro one ("…once it is on"). */
	note?: string;
}

/**
 * A Pro-only page while Notifima Pro isn't active: the real page drawn with sample rows, dimmed, inert and fading
 * out, with a card floating over it that says the page comes with Pro, the Upgrade button (opens the Pro popup) and a
 * pricing link. Ported from VuloCart's ModuleRequired + LockedPreview (Marketing → Pricing Rules), so both products
 * show a locked page alike.
 *
 * With `heading` and `actions` it is the same preview for a free page that is still empty: that page's own heading and
 * next steps, without the Pro tag.
 */
export function LockedPreview({
	children,
	feature,
	heading,
	actions,
	note,
}: LockedPreviewProps) {
	const [open, setOpen] = useState(false);
	const isPro = !actions;

	return (
		<div className="nf-locked">
			{/* `inert` keeps the sample's search and row actions out of tab order and clicks. Spread because these
			React typings predate the attribute. */}
			<div
				className="nf-locked-preview"
				aria-hidden="true"
				{...({ inert: '' } as Record<string, unknown>)}
			>
				{children}
			</div>

			<div className="nf-locked-overlay">
				<div className="nf-locked-card">
					{isPro ? (
						<span className="admin-tag pro-tag">
							<i
								className="adminfont-pro-tag"
								aria-hidden="true"
							/>
							{__('Pro', 'notifima')}
						</span>
					) : (
						<span className="nf-locked-icon" aria-hidden="true">
							<i
								className={`adminfont-${feature.icon ?? 'info'}`}
							/>
						</span>
					)}
					<h2>
						{heading ??
							sprintf(
								/* translators: %s: page title, e.g. "Subscribers". */
								__('%s comes with Notifima Pro', 'notifima'),
								feature.title
							)}
					</h2>
					<p>{feature.description}</p>
					<div className="nf-locked-actions">
						{actions ?? (
							<>
								<button
									type="button"
									className="nf-locked-button"
									onClick={() => setOpen(true)}
								>
									{__('Upgrade to Pro', 'notifima')}
								</button>
								<a
									className="nf-locked-link"
									href={appLocalizer.pro_url}
									target="_blank"
									rel="noreferrer"
								>
									{__('See pricing', 'notifima')}
								</a>
							</>
						)}
					</div>
					<p className="nf-locked-note">
						<i className="adminfont-eye" aria-hidden="true" />
						{note ??
							__(
								'A preview with sample data. Your own records show here once it is on.',
								'notifima'
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
