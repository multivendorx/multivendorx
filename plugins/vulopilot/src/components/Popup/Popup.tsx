/* global appLocalizer */
import React from 'react';
import { ButtonInput } from '@zyra/inputs';
import { __, sprintf } from '@wordpress/i18n';
import '../Popup/Popup.scss';

interface PopupProps {
	moduleName?: string;
	plugin?: string;
}

const formatModuleName = (name: string): string => {
	return name
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
};

/**
 * The 6 real vulopilot-pro modules — same ids/copy as
 * ../Modules/index.ts's catalog (Automation, SecurityMonitoring,
 * WooCommerceAi, AdvancedReports, OneClickFix, GeoInsights per the
 * plugin's own readme.txt) — kept in sync with that file rather than
 * invented separately, since this is the same feature list, just rendered
 * as an upgrade pitch instead of a toggle grid.
 */
const proPopupContent = {
	messages: [
		{
			icon: 'automation',
			text: __('Automation', 'vulopilot'),
			des: __(
				'AI Automation Workflows and Scheduled Website Scans — trigger→action rules plus recurring wp-cron scanning, not just on-demand scans.',
				'vulopilot'
			),
		},
		{
			icon: 'security-monitoring',
			text: __('Security Monitoring', 'vulopilot'),
			des: __(
				'Checks for an admin account named "admin" and anonymous REST API user-enumeration exposure.',
				'vulopilot'
			),
		},
		{
			icon: 'woo-commerce-ai',
			text: __('WooCommerce AI', 'vulopilot'),
			des: __(
				'AI Product Optimization and Bulk AI Optimization — rewrites product titles, generates descriptions/FAQ/schema, and suggests cross-sell/upsell/bundles.',
				'vulopilot'
			),
		},
		{
			icon: 'advanced-reports',
			text: __('Advanced Reports', 'vulopilot'),
			des: __(
				'Recurring, emailed report schedules, a custom report builder, and historical site-health trend data.',
				'vulopilot'
			),
		},
		{
			icon: 'one-click-fix',
			text: __('One-Click AI Fixes', 'vulopilot'),
			des: __(
				'Adds a "Fix this" action to findings that have a matching AI action — propose and approve a fix without leaving the Dashboard.',
				'vulopilot'
			),
		},
		{
			icon: 'globe',
			text: __('GEO Insights', 'vulopilot'),
			des: __(
				'Per-post AI scoring for AI-search-engine discoverability — entity coverage, question coverage, answer completeness, and AI suggestions.',
				'vulopilot'
			),
		},
	],
};

const ShowProPopup: React.FC<PopupProps> = (props) => {
	if (props.plugin) {
		return (
			<div className="popup-wrapper">
				<div className="popup-header">
					<i className={`adminfont-${props.plugin}`} />
				</div>
				<div className="popup-body">
					<div className="module-name">
						{sprintf(
							/* translators: %s: Plugin name. */
							__('Plugin Required: %s', 'vulopilot'),
							props.plugin
						)}
					</div>
					<div className="module-desc">
						{sprintf(
							__(
								'This feature requires the "%s" plugin to be active.',
								'vulopilot'
							),
							props.plugin
						)}
					</div>
					<ButtonInput
						position="center"
						buttons={[
							{
								icon: 'eye',
								text: __('Activate Plugin', 'vulopilot'),
								onClick: () => {
									window.open(
										`${appLocalizer.admin_url.replace(/admin\.php.*/, '')}plugins.php`,
										'_blank'
									);
								},
							},
						]}
					/>
				</div>
			</div>
		);
	}

	if (props.moduleName) {
		return (
			<div className="popup-wrapper">
				<div className="popup-header">
					<i className={`adminfont-${props.moduleName}`} />
				</div>
				<div className="popup-body">
					<div className="module-name">
						{sprintf(
							/* translators: %s: Module name. */
							__('Activate %s', 'vulopilot'),
							formatModuleName(props.moduleName)
						)}
					</div>
					<div className="module-desc">
						{sprintf(
							/* translators: %s: Module name. */
							__(
								'This feature is currently unavailable. To activate it, please enable the %s module.',
								'vulopilot'
							),
							formatModuleName(props.moduleName)
						)}
					</div>
					<ButtonInput
						position="center"
						buttons={[
							{
								icon: 'eye',
								text: __('Enable Now', 'vulopilot'),
								onClick: () => {
									window.open(
										`${appLocalizer.admin_url}#&tab=modules&module=${props.moduleName}`
									);
								},
							},
						]}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="popup-wrapper">
			<div className="top-section">
				<div className="heading">
					{__(
						'Unlock the full VuloPilot toolkit',
						'vulopilot'
					)}
				</div>
				<div className="description">
					{__(
						'Automated fixes, scheduled scans, security monitoring, and WooCommerce AI — on top of everything Free already does.',
						'vulopilot'
					)}
				</div>
				<a
					className="admin-btn"
					href={appLocalizer.shop_url}
					target="_blank"
					rel="noreferrer"
				>
					{__('Upgrade to Pro', 'vulopilot')}
					<i className="adminfont-arrow-right arrow-icon"></i>
				</a>
			</div>
			<div className="popup-details">
				<div className="heading-text">
					{__('What Pro adds', 'vulopilot')}
				</div>
				<ul>
					{proPopupContent.messages.map((message, index) => (
						<li key={index}>
							<div className="title">
								<i className={`adminfont-${message.icon}`} />
								{message.text}
							</div>
							<div className="desc">{message.des}</div>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default ShowProPopup;
