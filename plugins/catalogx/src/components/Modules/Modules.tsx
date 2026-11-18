/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { NoticeManager, PopupComponent } from '@zyra/components';
import { getApiLink, sendApiResponse, useModules } from '@zyra/core';
import { getModuleData } from '../../services/templateService';
import ShowProPopup from '../Popup/Popup';
import './modules.scss';

/** One module, as listed in ./index.ts. */
interface ModuleEntry {
	id: string;
	name: string;
	desc?: string;
	icon?: string;
	docLink?: string;
	settingsLink?: string;
	proModule?: boolean;
}

/** The section-card frame every settings tab is drawn in (styles/design-system.scss). */
const Card: React.FC<{
	icon: string;
	title: string;
	desc: string;
	aside?: React.ReactNode;
	children: React.ReactNode;
}> = ({ icon, title, desc, aside, children }) => (
	<div className="settings-section-group cx-modules">
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
			{aside && <div className="cx-modules-aside">{aside}</div>}
		</div>
		<ul className="cx-modules-list">{children}</ul>
	</div>
);

/**
 * Settings → Modules: the CatalogX features, one row each, turned on and off in place. It saves exactly as zyra's
 * module grid did (the `modules` endpoint, the shared module store, the context-reload flag), so the settings menu,
 * the pages and the setup tour react the same way; only the look follows the other settings cards.
 */
const PluginModules: React.FC = () => {
	const { modules, insertModule, removeModule } = useModules();
	const [saving, setSaving] = useState<string>('');
	const [proPopupOpen, setProPopupOpen] = useState(false);
	const [highlighted, setHighlighted] = useState<string>('');

	const allModules = (getModuleData()?.modules ?? []) as ModuleEntry[];
	const isPro = !!appLocalizer.khali_dabba;
	const freeModules = allModules.filter((module) => !module.proModule);
	const proModules = allModules.filter((module) => module.proModule);
	const activeCount = allModules.filter((module) =>
		modules.includes(module.id)
	).length;

	// A search result or a link with `&module=<id>` scrolls to that module and marks it until the next click.
	useEffect(() => {
		const target = new URLSearchParams(
			window.location.hash.replace(/^#&?/, '')
		).get('module');

		if (!target) {
			return;
		}

		const timer = window.setTimeout(() => {
			document
				.getElementById(`cx-module-${target}`)
				?.scrollIntoView({ behavior: 'smooth', block: 'center' });
			setHighlighted(target);
		}, 150);
		const clear = () => setHighlighted('');

		document.addEventListener('pointerdown', clear, { once: true });

		return () => {
			window.clearTimeout(timer);
			document.removeEventListener('pointerdown', clear);
		};
	}, []);

	const toggle = async (module: ModuleEntry) => {
		if (saving) {
			return;
		}

		if (module.proModule && !isPro) {
			setProPopupOpen(true);
			return;
		}

		const activating = !modules.includes(module.id);

		// Optimistic, as before: the menu and pages update at once, and roll back if the save fails.
		if (activating) {
			insertModule(module.id);
		} else {
			removeModule(module.id);
		}

		setSaving(module.id);

		try {
			localStorage.setItem('force_catalogx_context_reload', 'true');
		} catch {
			// Storage blocked: the next page load refetches the modules anyway.
		}

		const response = await sendApiResponse<{ success?: boolean }>(
			appLocalizer,
			getApiLink(appLocalizer, 'modules'),
			{ id: module.id, action: activating ? 'activate' : 'deactivate' }
		);

		setSaving('');

		if (response?.success) {
			NoticeManager.add({
				title: activating
					? __('Module turned on', 'catalogx')
					: __('Module turned off', 'catalogx'),
				message: module.name,
				type: 'success',
				position: 'float',
			});
			return;
		}

		if (activating) {
			removeModule(module.id);
		} else {
			insertModule(module.id);
		}

		NoticeManager.add({
			title: __('Could not save', 'catalogx'),
			message: sprintf(
				/* translators: %s: module name. */
				__('%s was not changed. Please try again.', 'catalogx'),
				module.name
			),
			type: 'error',
			position: 'float',
		});
	};

	const renderRow = (module: ModuleEntry) => {
		const isActive = modules.includes(module.id);
		const isLocked = !!module.proModule && !isPro;
		const switchId = `cx-module-switch-${module.id}`;

		return (
			<li
				key={module.id}
				id={`cx-module-${module.id}`}
				className={[
					'cx-module',
					isActive ? 'is-active' : '',
					isLocked ? 'is-locked' : '',
					highlighted === module.id ? 'is-highlighted' : '',
				]
					.filter(Boolean)
					.join(' ')}
			>
				<span className="cx-module-icon" aria-hidden="true">
					<i className={`adminfont-${module.icon || 'module'}`} />
				</span>

				<div className="cx-module-text">
					<div className="cx-module-name">
						<label htmlFor={switchId}>{module.name}</label>
						{isLocked && (
							<span className="admin-tag pro-tag">
								<i className="adminfont-lock" aria-hidden="true" />
								{__('Pro', 'catalogx')}
							</span>
						)}
					</div>
					{module.desc && <p className="cx-module-desc">{module.desc}</p>}
					<div className="cx-module-links">
						{isActive && module.settingsLink && (
							<a href={module.settingsLink}>
								<i className="adminfont-setting" aria-hidden="true" />
								{__('Settings', 'catalogx')}
							</a>
						)}
						{module.docLink && (
							<a href={module.docLink} target="_blank" rel="noreferrer">
								<i className="adminfont-document" aria-hidden="true" />
								{__('Docs', 'catalogx')}
								<span className="screen-reader-text">
									{__('(opens in a new tab)', 'catalogx')}
								</span>
							</a>
						)}
					</div>
				</div>

				<div className="cx-module-control" data-tour={`${module.id}-showcase-tour`}>
					{isLocked ? (
						<button
							type="button"
							id={switchId}
							className="admin-btn btn-purple"
							onClick={() => setProPopupOpen(true)}
						>
							{__('Unlock', 'catalogx')}
						</button>
					) : (
						<button
							type="button"
							id={switchId}
							role="switch"
							aria-checked={isActive}
							aria-busy={saving === module.id}
							disabled={!!saving && saving !== module.id}
							className="cx-switch"
							onClick={() => toggle(module)}
						>
							<span className="cx-switch-track" aria-hidden="true">
								<span className="cx-switch-thumb" />
							</span>
							<span className="cx-switch-label">
								{isActive ? __('On', 'catalogx') : __('Off', 'catalogx')}
							</span>
						</button>
					)}
				</div>
			</li>
		);
	};

	return (
		<>
			<Card
				icon="module"
				title={__('Included with CatalogX', 'catalogx')}
				desc={sprintf(
					/* translators: 1: modules turned on, 2: all modules. */
					__(
						'Turn on only what your store uses. A module’s settings and pages appear once it is on. %1$d of %2$d on.',
						'catalogx'
					),
					activeCount,
					allModules.length
				)}
			>
				{freeModules.map(renderRow)}
			</Card>

			{proModules.length > 0 && (
				<Card
					icon="lock"
					title={__('CatalogX Pro', 'catalogx')}
					desc={
						isPro
							? __('Your Pro license is active, so these modules are yours to use.', 'catalogx')
							: __('Hide prices, sell wholesale and price by rules. These come with CatalogX Pro.', 'catalogx')
					}
					aside={
						!isPro && (
							<a
								className="admin-btn btn-purple-bg"
								href={appLocalizer.pro_url}
								target="_blank"
								rel="noreferrer"
							>
								{__('Get CatalogX Pro', 'catalogx')}
							</a>
						)
					}
				>
					{proModules.map(renderRow)}
				</Card>
			)}

			{proPopupOpen && (
				<PopupComponent
					position="lightbox"
					open
					onClose={() => setProPopupOpen(false)}
					width={46}
					height="auto"
				>
					<ShowProPopup />
				</PopupComponent>
			)}
		</>
	);
};

export default PluginModules;
