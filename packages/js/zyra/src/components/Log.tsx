/**
 * External dependencies
 */
import React, { useEffect, useState } from "react";
import axios from "axios";

/**
 * Internal dependencies
 */
import { getApiLink } from "./apiService";
import "../styles/web/Log.scss";

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
            method: "GET",
            headers: { "X-WP-Nonce": appLocalizer.nonce },
            params: {
                logcount: 100,
            },
        } ).then( ( response ) => {
            setLogData( response.data );
        } );
    }, [] );

    const handleDownloadLog = (
        event: React.MouseEvent< HTMLButtonElement >
    ) => {
        event.preventDefault();
        const fileName = downloadFileName;
        axios( {
            url: getApiLink( appLocalizer, apiLink ),
            method: "GET",
            headers: { "X-WP-Nonce": appLocalizer.nonce },
            params: {
                action: "download",
                file: fileName,
            },
            responseType: "blob",
        } )
            .then( ( response ) => {
                const blob = new Blob( [ response.data ], {
                    type: response.headers[ "content-type" ],
                } );
                const url = window.URL.createObjectURL( blob );
                const link = document.createElement( "a" );
                link.href = url;
                link.setAttribute( "download", fileName );
                document.body.appendChild( link );
                link.click();
                document.body.removeChild( link );
            } )
            .catch( ( error ) =>
                console.error( "Error downloading file:", error )
            );
    };

    const handleClearLog = ( event: React.MouseEvent< HTMLButtonElement > ) => {
        event.preventDefault();
        axios( {
            url: getApiLink( appLocalizer, apiLink ),
            method: "GET",
            headers: { "X-WP-Nonce": appLocalizer.nonce },
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
            .join( "\n" );

        navigator.clipboard
            .writeText( logText )
            .then( () => setCopied( true ) )
            .catch( ( error ) => {
                setCopied( false );
                console.error( "Error copying logs to clipboard:", error );
            } );

        setTimeout( () => setCopied( false ), 10000 );
    };

    return (
        <div className="section-log-container">
            <div className="button-section">
                <button
                    onClick={ handleDownloadLog }
                    className="btn-purple download-btn"
                >
                    Download
                </button>
                <button
                    className="btn-purple button-clear"
                    onClick={ handleClearLog }
                >
                    <span className="text">Clear</span>
                    <i className="adminLib-close"></i>
                </button>
            </div>
            <div className="log-container-wrapper">
                <div className="wrapper-header">
                    <p className="log-viewer-text">
                        { appLocalizer.tab_name } - log viewer
                    </p>
                    <div className="click-to-copy">
                        <button
                            className="copy-btn"
                            onClick={ handleCopyToClipboard }
                        >
                            <i className="adminLib-vendor-form-copy"></i>
                            <span
                                className={
                                    ! copied ? "tooltip tool-clip" : "tooltip"
                                }
                            >
                                { ! copied ? (
                                    "Copy to clipboard"
                                ) : (
                                    <i className="adminLib-success-notification"></i>
                                ) }
                                { ! copied ? "" : "Copied" }
                            </span>
                        </button>
                    </div>
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
