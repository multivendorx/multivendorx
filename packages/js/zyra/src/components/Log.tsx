/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import axios from 'axios';

/**
 * Internal dependencies
 */
import { getApiLink } from '../utils/apiService';
import '../styles/web/Log.scss';

// Types
export interface LogProps {
	apiLink: string;
	downloadFileName: string;
	appLocalizer: Record< string, any >; // Allows any structure
}

const Log: React.FC< LogProps > = ( {
	apiLink,
	downloadFileName,
	appLocalizer,
} ) => {
	const [ logData, setLogData ] = useState< string[] >( [] );
	const [ copied, setCopied ] = useState< boolean >( false );

	useEffect( () => {
		axios( {
			url: getApiLink( appLocalizer, apiLink ),
			method: 'GET',
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				logcount: 100,
			},
		} ).then( ( response ) => {
			setLogData( response.data );
		} );
	}, [ apiLink, appLocalizer ] );

	const handleDownloadLog = (
		event: React.MouseEvent< HTMLButtonElement >
	) => {
		event.preventDefault();
		const fileName = downloadFileName;
		axios( {
			url: getApiLink( appLocalizer, apiLink ),
			method: 'GET',
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				action: 'download',
				file: fileName,
			},
			responseType: 'blob',
		} )
			.then( ( response ) => {
				const blob = new Blob( [ response.data ], {
					type: response.headers[ 'content-type' ],
				} );
				const url = window.URL.createObjectURL( blob );
				const link = document.createElement( 'a' );
				link.href = url;
				link.setAttribute( 'download', fileName );
				document.body.appendChild( link );
				link.click();
				document.body.removeChild( link );
			} )
			.catch( ( error ) =>
				// eslint-disable-next-line no-console
				console.error( 'Error downloading file:', error )
			);
	};

	const handleClearLog = ( event: React.MouseEvent< HTMLButtonElement > ) => {
		event.preventDefault();
		axios( {
			url: getApiLink( appLocalizer, apiLink ),
			method: 'GET',
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				logcount: 100,
				clear: true,
			},
		} ).then( () => {
			setLogData( [] );
		} );
	};

	const handleCopyToClipboard = (
		event: React.MouseEvent< HTMLButtonElement >
	) => {
		event.preventDefault();
		const logText = logData
			.map( ( log ) => {
				const regex = /^([^:]+:[^:]+:[^:]+):(.*)$/;
				const match = log.match( regex );
				return match
					? `${ match[ 1 ].trim() } : ${ match[ 2 ].trim() }`
					: log;
			} )
			.join( '\n' );

		navigator.clipboard
			.writeText( logText )
			.then( () => setCopied( true ) )
			.catch( ( error ) => {
				setCopied( false );
				// eslint-disable-next-line no-console
				console.error( 'Error copying logs to clipboard:', error );
			} );

		setTimeout( () => setCopied( false ), 10000 );
	};

	return (
		<div className="section-log-container">
			<div className="button-section">
				<button
					onClick={ handleDownloadLog }
					className="admin-btn btn-purple download-btn"
				>
					Download
				</button>
				<button
					className="admin-btn btn-red"
					onClick={ handleClearLog }
				>
					<span className="text">Clear</span>
					<i className="adminlib-close"></i>
				</button>
			</div>
			<div className="log-container-wrapper">
				<div className="wrapper-header">
					<p className="log-viewer-text">
						{ appLocalizer.tab_name } - log viewer
					</p>
					<button
						className="copy-btn"
						onClick={ handleCopyToClipboard }
					>
						<i className="adminlib-vendor-form-copy"></i>
						<span
							className={
								! copied ? 'tooltip' : 'tooltip tool-clip'
							}
						>
							{ ! copied ? (
								'Copy to clipboard'
							) : (
								<i className="adminlib-success-notification"></i>
							) }
							{ ! copied ? '' : 'Copied' }
						</span>
					</button>
				</div>
				<div className="wrapper-body">
					{ logData.map( ( log, index ) => {
						const regex = /^([^:]+:[^:]+:[^:]+):(.*)$/;
						const match = log.match( regex );
						if ( match ) {
							return (
								<div className="log-row" key={ index }>
									<span className="log-creation-date">
										{ match[ 1 ].trim() } :
									</span>
									<span className="log-details">
										{ match[ 2 ].trim() }
									</span>
								</div>
							);
						}
						return null;
					} ) }
				</div>
			</div>
		</div>
	);
};

export default Log;
