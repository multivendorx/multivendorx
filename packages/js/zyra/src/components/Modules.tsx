import React, { useState, useMemo, useCallback } from 'react';
import { getApiLink, sendApiResponse } from '../utils/apiService';
import { useModules } from '../contexts/ModuleContext';
import SuccessNotice from './SuccessNotice';
import { MultiCheckBoxUI } from './MultiCheckbox';
import HeaderSearch from './HeaderSearch';
import { SelectInputUI } from './SelectInput';
import { PopupUI } from './Popup';
import '../styles/web/Modules.scss';

interface Module {
	id: string;
	name: string;
	desc?: string;
	icon: string;
	docLink?: string;
	videoLink?: string;
	reqPluging?: { name: string; slug: string; link: string }[];
	settingsLink?: string;
	proModule?: boolean;
	category?: string | string[];
	reloadOnChange?: boolean;
}

interface Separator {
	type: 'separator';
	id: string;
	label: string;
}

type ModuleItem = Module | Separator;

interface AppLocalizer {
	khali_dabba?: boolean;
	nonce: string;
	apiUrl: string;
	restUrl: string;
	active_plugins?: string[];
}

interface ModuleProps {
	modulesArray?: { category: boolean; modules: ModuleItem[] };
	apiLink: string;
	pluginName: string;
	appLocalizer: AppLocalizer;
	proPopupContent?: React.FC;
}

const isModule = (item: ModuleItem): item is Module =>
	!('type' in item);

const normalizeCategory = (category?: string | string[]) => {
	if (!category) return [];
	return Array.isArray(category) ? category : [category];
};

const Modules: React.FC<ModuleProps> = ({
	modulesArray = { category: false, modules: [] },
	appLocalizer,
	apiLink,
	pluginName,
	proPopupContent: ProPopupComponent
}) => {

	const { modules: activeModules, insertModule, removeModule } = useModules();

	const [popupOpen, setPopupOpen] = useState(false);
	const [successMsg, setSuccessMsg] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('All');
	const [selectedStatus, setSelectedStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
	const [searchQuery, setSearchQuery] = useState('');

	const moduleList = useMemo(
		() => modulesArray.modules.filter(isModule),
		[modulesArray.modules]
	);

	const categories = useMemo(() => {
		if (!modulesArray.category) return [];

		return [
			{ id: 'All', label: 'All' },
			...modulesArray.modules
				.filter((item): item is Separator => !isModule(item))
				.map(item => ({ id: item.id, label: item.label }))
		];
	}, [modulesArray]);

	const filteredModules = useMemo(() => {
		return moduleList.filter(module => {

			const moduleCategories = normalizeCategory(module.category);
			const isActive = activeModules.includes(module.id);

			const matchesCategory =
				selectedCategory === 'All' ||
				moduleCategories.includes(selectedCategory);

			const matchesStatus =
				selectedStatus === 'All' ||
				(selectedStatus === 'Active' && isActive) ||
				(selectedStatus === 'Inactive' && !isActive);

			const matchesSearch =
				!searchQuery ||
				module.name.toLowerCase().includes(searchQuery.toLowerCase());

			return matchesCategory && matchesStatus && matchesSearch;
		});
	}, [moduleList, selectedCategory, selectedStatus, searchQuery, activeModules]);

	const handleToggle = useCallback(
		async (checked: boolean, module: Module) => {

			// Pro module check
			if (module.proModule && !appLocalizer.khali_dabba) {
				setPopupOpen(true);
				return;
			}

			// Required plugin check
			if (
				module.reqPluging?.some(
					p => !appLocalizer.active_plugins?.includes(p.slug)
				)
			) {
				return;
			}

			const action = checked ? 'activate' : 'deactivate';
			checked
				? insertModule?.(module.id)
				: removeModule?.(module.id);

			try {
				await sendApiResponse(
					appLocalizer,
					getApiLink(appLocalizer, apiLink),
					{ id: module.id, action }
				);
				setSuccessMsg(`Module ${action}d`);

				if (module.reloadOnChange) {
					window.location.reload();
				}
			} catch {
				setSuccessMsg(`Failed to ${action} module`);
			}
			setTimeout(() => setSuccessMsg(''), 2000);
		},
		[
			appLocalizer,
			apiLink,
			insertModule,
			removeModule
		]
	);

	return (
		<>
			{/* Pro Popup */}
			{popupOpen && ProPopupComponent && (
				<PopupUI
					position="lightbox"
					open
					onClose={() => setPopupOpen(false)}
					width={31.25}
				>
					<ProPopupComponent />
				</PopupUI>
			)}

			{/* Success Notice */}
			{successMsg && (
				<SuccessNotice title="Success!" message={successMsg} />
			)}

			<div className="module-container">

				{/* Filters */}
				<div className="filter-wrapper">

					{categories.length > 1 && (
						<div className="category-filter">
							{categories.map(cat => (
								<span
									key={cat.id}
									className={`category-item ${
										selectedCategory === cat.id ? 'active' : ''
									}`}
									onClick={() => setSelectedCategory(cat.id)}
								>
									{cat.label}
								</span>
							))}
						</div>
					)}

					<div className="module-search">

						<HeaderSearch
							search={{ placeholder: 'Search modules...' }}
							onQueryUpdate={e =>
								setSearchQuery(e.searchValue)
							}
						/>

						<SelectInputUI
							options={[
								{ label: 'All', value: 'All' },
								{ label: 'Active', value: 'Active' },
								{ label: 'Inactive', value: 'Inactive' }
							]}
							value={selectedStatus}
							size="8rem"
							onChange={val =>
								setSelectedStatus(val.value as any)
							}
						/>
					</div>
				</div>

				{/* Module List */}
				<div className="module-option-row">
					{filteredModules.map(module => {

						const isActive = activeModules.includes(module.id);

						return (
							<div
								key={module.id}
								className="module-list-item"
							>
								<div className="module-body">
									<div className="icon">
										<i className={`font adminfont-${module.id}`} />
									</div>

									<div className="module-details">
										<div className="meta-name">
											{module.name}
										</div>

										{module.desc && (
											<p
												className="meta-description"
												dangerouslySetInnerHTML={{
													__html: module.desc
												}}
											/>
										)}
									</div>
								</div>

								<div className="module-footer">
									<div className="buttons">
										{module.docLink && (
											<a href={module.docLink} target="_blank" rel="noreferrer">
												<i className="adminfont-book" />
											</a>
										)}
										{module.videoLink && (
											<a href={module.videoLink} target="_blank" rel="noreferrer">
												<i className="adminfont-button-appearance" />
											</a>
										)}
										{module.settingsLink && (
											<a href={module.settingsLink}>
												<i className="adminfont-setting" />
											</a>
										)}
									</div>

									<MultiCheckBoxUI
										look="toggle"
										type="checkbox"
										value={isActive ? [module.id] : []}
										onChange={e =>
											handleToggle(e.length > 0, module)
										}
										options={[
											{ key: module.id, value: module.id }
										]}
									/>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</>
	);
};

export default Modules;