/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { PopupComponent } from '@zyra/components';
import ShowProPopup from '../Popup/Popup';
import './license-panel.scss';

/** One input of the license form, named exactly as the old License page printed it. */
interface LicenseField {
	name: string;
	label: string;
	value: string;
}

/** What MooWoodle Pro passes in `appLocalizer.pro_data.license` (LicenseManager::get_settings_form_data()). */
interface LicenseFormData {
	is_active: boolean;
	is_staging: boolean;
	title: string;
	action_url: string;
	hidden: Record<string, string>;
	fields: LicenseField[];
	strings: {
		activate: string;
		deactivate: string;
		status: string;
		activated: string;
		deactivated: string;
		staging_notice: string;
	};
}

/** The section-card frame every settings tab is drawn in (styles/design-system.scss). */
const Card: React.FC<{
	icon: string;
	title: string;
	desc: string;
	children: React.ReactNode;
}> = ({ icon, title, desc, children }) => (
	<div className="settings-section-group mw-license">
		<div className="settings-left-section">
			<div className="divider-section">
				<div className="title-wrapper">
					<span className="typography-title">
						<i className={`adminfont-${icon}`} aria-hidden="true" />
						<span>{title}</span>
					</span>
				</div>
				<span className="typography-desc">{desc}</span>
			</div>
		</div>
		<div className="settings-right-section">{children}</div>
	</div>
);

/** A settings row: label and help on the left, the control on the right. */
const Row: React.FC<{
	label: string;
	htmlFor?: string;
	children: React.ReactNode;
}> = ({ label, htmlFor, children }) => (
	<div className="form-group row">
		<div className="settings-form-label">
			<label className="typography-title" htmlFor={htmlFor}>
				{label}
			</label>
		</div>
		<div className="settings-input-content">{children}</div>
	</div>
);

/** Without MooWoodle Pro: what the tab is for, and the way to get Pro. */
const GetPro: React.FC = () => {
	const [open, setOpen] = useState(false);

	return (
		<Card
			icon="lock"
			title={__('MooWoodle Pro license', 'moowoodle')}
			desc={__(
				'Install MooWoodle Pro to activate its license here.',
				'moowoodle'
			)}
		>
			<Row label={__('License', 'moowoodle')}>
				<button
					type="button"
					className="admin-btn btn-purple-bg"
					onClick={() => setOpen(true)}
				>
					<i className="adminfont-pro-tag" aria-hidden="true" />
					{__('Upgrade to Pro', 'moowoodle')}
				</button>
			</Row>
			{open && (
				<PopupComponent
					position="lightbox"
					open
					onClose={() => setOpen(false)}
					width={46}
					height="auto"
				>
					<ShowProPopup />
				</PopupComponent>
			)}
		</Card>
	);
};

/**
 * Settings → License: the MooWoodle Pro license form, moved here from Pro's old License submenu.
 *
 * It is the old Settings API form, field for field (same option group, nonce, field names and values), submitted
 * natively to options.php: the license is activated or deactivated by the same callbacks as before, and options.php
 * redirects back to this tab, where Pro's activation notice reports the result at the top of the page.
 */
const LicensePanel: React.FC = () => {
	const form = appLocalizer.pro_data?.license as LicenseFormData | undefined;

	// options.php adds `settings-updated=true` when it redirects back; drop it so a reload doesn't keep it around.
	useEffect(() => {
		const url = new URL(window.location.href);

		if (url.searchParams.has('settings-updated')) {
			url.searchParams.delete('settings-updated');
			window.history.replaceState(null, '', url.toString());
		}
	}, []);

	if (!form || !form.action_url) {
		return <GetPro />;
	}

	const { strings } = form;

	return (
		<form method="post" action={form.action_url}>
			{Object.entries(form.hidden).map(([name, value]) => (
				<input key={name} type="hidden" name={name} value={value} />
			))}

			<Card
				icon="lock"
				title={form.title}
				desc={
					form.is_active
						? __(
								'Pro features are active on this site. Deactivate to free this activation for another site.',
								'moowoodle'
							)
						: __(
								'Enter the API key from your account to unlock the Pro features on this site.',
								'moowoodle'
							)
				}
			>
				<Row label={strings.status}>
					<span
						className={`mw-license-status ${form.is_active ? 'is-active' : 'is-inactive'}`}
					>
						{form.is_active
							? strings.activated
							: strings.deactivated}
					</span>
				</Row>

				{form.fields.map((field, index) => (
					<Row
						key={field.name}
						label={field.label}
						htmlFor={`mw-license-field-${index}`}
					>
						<div className="input-wrapper">
							<input
								id={`mw-license-field-${index}`}
								className="basic-input"
								type="text"
								name={field.name}
								defaultValue={field.value}
								// The key is only replaced while deactivated; an active license is deactivated as is.
								readOnly={form.is_active || form.is_staging}
								autoComplete="off"
								spellCheck={false}
							/>
						</div>
					</Row>
				))}

				{/* On a staging site the old page offered no button; Pro's own notice at the top of the page says why. */}
				{!form.is_staging && (
					<Row label="">
						<button
							type="submit"
							className={`admin-btn ${form.is_active ? 'btn-purple' : 'btn-purple-bg'}`}
						>
							{form.is_active
								? strings.deactivate
								: strings.activate}
						</button>
					</Row>
				)}
			</Card>
		</form>
	);
};

export default LicensePanel;
