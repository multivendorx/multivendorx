/* global vuloformDeactivateLocalizer */
import React, { useEffect, useRef, useState } from 'react';
import { PopupComponent } from '@zyra/components';
import '../Popup/locked-preview.scss';

/**
 * Intercepts VuloForm's own "Deactivate" link on the Plugins screen with a confirmation popup,
 * since deactivating it silently breaks Notifima's frontend subscription form. Styled the same
 * way as the Pro "comes with Notifima Pro" card (`LockedPreview.tsx`'s `.nf-locked-*` classes),
 * not zyra's default (left-aligned, red-tinted) popup chrome.
 */
const DeactivateConfirmPopup: React.FC = () => {
	const [open, setOpen] = useState(false);
	const linkRef = useRef<HTMLAnchorElement | null>(null);

	useEffect(() => {
		const row = document.querySelector(
			`tr[data-plugin="${vuloformDeactivateLocalizer.plugin_file}"]`
		);
		const link = row?.querySelector<HTMLAnchorElement>('.deactivate a');

		if (!link) {
			return;
		}

		linkRef.current = link;

		const onClick = (event: Event) => {
			event.preventDefault();
			setOpen(true);
		};

		link.addEventListener('click', onClick);

		return () => {
			link.removeEventListener('click', onClick);
		};
	}, []);

	return (
		<PopupComponent
			position="lightbox"
			open={open}
			onClose={() => setOpen(false)}
			width={27.5}
			height="auto"
		>
			<div
				className="nf-locked-card"
				>
				<span className="nf-locked-icon" aria-hidden="true">
					<i className="adminfont-error" />
				</span>
				<h2>{vuloformDeactivateLocalizer.title}</h2>
				<p>{vuloformDeactivateLocalizer.description}</p>
				<p>{vuloformDeactivateLocalizer.question}</p>
				<div className="nf-locked-actions">
					<a
						className="nf-locked-link"
						role="button"
						tabIndex={0}
						onClick={() => setOpen(false)}
						onKeyDown={(event) => {
							if ('Enter' === event.key || ' ' === event.key) {
								setOpen(false);
							}
						}}
					>
						{vuloformDeactivateLocalizer.cancel}
					</a>
					<button
						type="button"
						className="nf-locked-button"
						onClick={() => {
							if (linkRef.current) {
								window.location.href = linkRef.current.href;
							}
						}}
					>
						{vuloformDeactivateLocalizer.confirm}
					</button>
				</div>
			</div>
		</PopupComponent>
	);
};

export default DeactivateConfirmPopup;
