/**
 * External dependencies
 */
import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';

/**
 * Internal dependencies
 */
import Popoup from './Popup';
import { getApiLink, sendApiResponse } from '../utils/apiService';
import '../styles/web/Modules.scss';

// Types
interface Module {
	id: string;
	name: string;
	desc: string;
	icon: string;
	doc_link: string;
	settings_link: string;
	pro_module?: boolean;
}

interface ModuleProps {
	insertModule?: ( moduleId: string ) => void;
	removeModule?: ( moduleId: string ) => void;
	modulesArray?: Module[];
	appLocalizer: Record< string, any >; // Allows any structure
}

const Modules: React.FC< ModuleProps > = ( {
	insertModule = () => {},
	removeModule = () => {},
	modulesArray = [],
	appLocalizer,
} ) => {
	const [ modelOpen, setModelOpen ] = useState< boolean >( false );
	const [ successMsg, setSuccessMsg ] = useState< string >( '' );

	const isModuleAvailable = ( moduleId: string ): boolean => {
		const module = modulesArray.find(
			( moduleData ) => moduleData.id === moduleId
		);
		return module?.pro_module ? appLocalizer.khali_dabba ?? false : true;
	};

	const handleOnChange = async (
		event: React.ChangeEvent< HTMLInputElement >,
		moduleId: string
	) => {
		if ( ! isModuleAvailable( moduleId ) ) {
			setModelOpen( true );
			return;
		}

		const action = event.target.checked ? 'activate' : 'deactivate';
		if ( action === 'activate' ) {
			insertModule?.( moduleId );
		} else {
			removeModule?.( moduleId );
		}

		await sendApiResponse(
			appLocalizer,
			getApiLink( appLocalizer, 'modules' ),
			{ id: moduleId, action }
		);
		setSuccessMsg( 'Module activated' );
		setTimeout( () => setSuccessMsg( '' ), 2000 );
	};

	return (
		<div className="module-container">
			<Dialog
				className="admin-module-popup"
				open={ modelOpen }
				onClose={ () => setModelOpen( false ) }
			>
				<span
					className="admin-font adminlib-cross"
					role="button"
					tabIndex={ 0 }
					onClick={ () => setModelOpen( false ) }
				></span>
				<Popoup />
			</Dialog>

			{ successMsg && (
				<div className="admin-notice-display-title">
					<i className="admin-font adminlib-icon-yes"></i>
					{ successMsg }
				</div>
			) }

			<div className="tab-name">
				<h2>Modules</h2>
			</div>
			<div className="module-option-row">
				{ modulesArray.map( ( module ) => (
					<div className="module-list-item" key={ module.id }>
						{ module.pro_module && ! appLocalizer.khali_dabba && (
							<span className="admin-pro-tag">Pro</span>
						) }
						<div className="module-icon">
							<i className={ `font ${ module.icon }` }></i>
						</div>
						<div className="card-meta">
							<div className="meta-name">{ module.name }</div>
							<p
								className="meta-description"
								dangerouslySetInnerHTML={ {
									__html: module.desc,
								} }
							></p>
						</div>
						<div className="card-footer">
							<div className="card-support">
								<a
									href={ module.doc_link }
									className="admin-btn btn-purple card-support-btn"
								>
									Docs
								</a>
								<a
									href={ module.settings_link }
									className="admin-btn btn-purple card-support-btn"
								>
									Setting
								</a>
							</div>
							<div
								className="toggle-checkbox"
								data-showcase-tour={ `${ module.id }-showcase-tour` }
							>
								<input
									type="checkbox"
									className="woo-toggle-checkbox"
									id={ `toggle-switch-${ module.id }` }
									onChange={ ( e ) =>
										handleOnChange( e, module.id )
									}
								/>
								{ /* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
								<label
									htmlFor={ `toggle-switch-${ module.id }` }
									className="toggle-switch-is_hide_cart_checkout"
								></label>
							</div>
						</div>
					</div>
				) ) }
			</div>
		</div>
	);
};

export default Modules;
