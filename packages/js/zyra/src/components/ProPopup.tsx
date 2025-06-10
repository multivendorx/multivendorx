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
export interface ProPopupProps {
	proUrl?: string;
	title?: string;
	messages?: string[];
}

const ProPopup: React.FC<ProPopupProps> = (props) => {
	const safeProUrl = props.proUrl || '#';

	return (
		<DialogContent>
			<DialogContentText>
				<div className="admin-module-dialog-content">
					<div className="admin-image-overlay">
						<div className="admin-overlay-content">
							<h1 className="banner-header">
								Unlock{' '}
								<span className="banner-pro-tag">Pro</span>
							</h1>
							<div className="admin-banner-content">
								<strong>{props.title}</strong>
								<p>&nbsp;</p>
								{props.messages?.map((message, index) => (
									<p
										key={index}
									>{`${index + 1}. ${message}`}</p>
								))}
							</div>
							<a
								className="admin-go-pro-btn"
								target="_blank"
								rel="noopener noreferrer"
								href={safeProUrl}
							>
								Upgrade to Pro
							</a>
						</div>
					</div>
				</div>
			</DialogContentText>
		</DialogContent>
	);
};

export default ProPopup;
