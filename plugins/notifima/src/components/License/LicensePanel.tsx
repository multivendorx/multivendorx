/* global appLocalizer */
import React, { useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import ProPitch from './ProPitch';
import './license-panel.scss';

/** The section-card frame every settings tab is drawn in (styles/design-system.scss). */
const Card: React.FC<{
	icon: string;
	title: string;
	desc: string;
	children: React.ReactNode;
}> = ({ icon, title, desc, children }) => (
	<div className="settings-section-group nf-license">
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

/**
 * Settings → License: the Notifima Pro license form, moved here from Pro's old License submenu.
 *
 * It is the old Settings API form, field for field (same option group, nonce, field names and values), submitted
 * natively to options.php: the license is activated or deactivated by the same callbacks as before, and options.php
 * redirects back to this tab, where Pro's activation notice reports the result at the top of the page.
 */
const LicensePanel: React.FC = () => {
	// PHP sends an empty array (not an object) for users who can't manage the license, or without Notifima Pro.
	const license = appLocalizer.pro_data?.license;
	const form =
		license && !Array.isArray(license) ? license : undefined;

	// options.php adds `settings-updated=true` when it redirects back; drop it so a reload doesn't keep it around.
	useEffect(() => {
		const url = new URL(window.location.href);

		if (url.searchParams.has('settings-updated')) {
			url.searchParams.delete('settings-updated');
			window.history.replaceState(null, '', url.toString());
		}
	}, []);

	if (!form || !form.action_url) {
		// Without Notifima Pro there is no form to fill in: say what Pro adds, what it costs, and how to install it.
		return <ProPitch />;
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
								'notifima'
							)
						: __(
								'Enter the API key from your account to unlock the Pro features on this site.',
								'notifima'
							)
				}
			>
				<Row label={strings.status}>
					<span
						className={`nf-license-status ${form.is_active ? 'is-active' : 'is-inactive'}`}
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
						htmlFor={`nf-license-field-${index}`}
					>
						<div className="input-wrapper">
							<input
								id={`nf-license-field-${index}`}
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
