/**
 * External dependencies
 */
import React from 'react';
import { DialogContent, DialogContentText } from '@mui/material';

/**
 * Internal dependencies
 */
import '../styles/web/popupContent.scss';

// Types
export interface PopupProps {
	proUrl?: string;
	title?: string;
	messages?: string[];
	moduleName?: string;
	settings?: string;
	plugin?: string;
	moduleMessage?: string;
	moduleButton?: string;
	pluginDescription?: string;
	pluginMessage?: string;
	pluginButton?: string;
	SettingDescription?: string;
	SettingMessage?: string;
	pluginUrl?: string;
	modulePageUrl?: string;
}

const ProPopup: React.FC< PopupProps > = ( props ) => {
	const safeProUrl = props.proUrl || '#';

	return (
		<DialogContent>
			<DialogContentText>
				<div className="admin-module-dialog-content">
					<div className="admin-image-overlay">
						<div className="admin-overlay-content">
							{ props.messages && (
								<h1 className="banner-header">
									Unlock{ ' ' }
									<span className="banner-pro-tag">Pro</span>
								</h1>
							) }
							<div className="admin-banner-content">
								{ props.messages && (
									<>
										<strong>{ props.title }</strong>
										<p>&nbsp;</p>
										{ props.messages?.map(
											( message, index ) => (
												<p key={ index }>{ `${
													index + 1
												}. ${ message }` }</p>
											)
										) }
									</>
								) }
								{ props.moduleName && (
									<>
										<h2>{ props.moduleMessage }</h2>
										<a
											className="admin-go-pro-btn"
											href={ props.modulePageUrl }
										>
											{ props.moduleButton }
										</a>
									</>
								) }
							</div>
							{ props.messages && (
								<a
									className="admin-go-pro-btn"
									target="_blank"
									rel="noopener noreferrer"
									href={ safeProUrl }
								>
									Upgrade to Pro
								</a>
							) }

							{ props.settings && (
								<>
									<h2>{ props.SettingMessage }</h2>
									<p id="description">
										{ props.SettingDescription }
									</p>
								</>
							) }

							{ props.plugin && (
								<div>
									<h2>{ props.pluginMessage }</h2>
									<p id="description">
										{ props.pluginDescription }
									</p>
									<a
										className="admin-go-pro-btn"
										target="_blank"
										rel="noreferrer"
										href={ props.pluginUrl }
									>
										{ props.pluginButton }
									</a>
								</div>
							) }
						</div>
					</div>
				</div>
			</DialogContentText>
		</DialogContent>
	);
};

export default ProPopup;
