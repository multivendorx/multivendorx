/**
 * External dependencies
 */
import React from 'react';
import DialogContent from '@mui/material/DialogContent';

/**
 * Internal dependencies
 */
import DialogContentText from '@mui/material/DialogContentText';
import '../styles/web/popupContent.scss';

// Types
export interface ModulePopupProps {
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

const ModulePopup: React.FC<ModulePopupProps> = ({
	moduleName,
	settings,
	plugin,
	moduleMessage,
	moduleButton,
	pluginDescription,
	SettingMessage,
	pluginMessage,
	pluginButton,
	SettingDescription,
	pluginUrl,
	modulePageUrl,
}) => {
	return (
		<DialogContent>
			<DialogContentText>
				<div className="admin-module-dialog-content">
					<div className="admin-image-overlay">
						<div className="admin-overlay-content">
							<div className="admin-banner-content">
								{moduleName && (
									<>
										<h2>{moduleMessage}</h2>
										<a
											className="admin-go-pro-btn"
											href={modulePageUrl}
										>
											{moduleButton}
										</a>
									</>
								)}
							</div>

							{settings && (
								<>
									<h2>{SettingMessage}</h2>
									<p id="description">{SettingDescription}</p>
								</>
							)}

							{plugin && (
								<div>
									<h2>{pluginMessage}</h2>
									<p id="description">{pluginDescription}</p>
									<a
										className="admin-go-pro-btn"
										target="_blank"
										rel="noreferrer"
										href={pluginUrl}
									>
										{pluginButton}
									</a>
								</div>
							)}
						</div>
					</div>
				</div>
			</DialogContentText>
		</DialogContent>
	);
};

export default ModulePopup;
