// External dependencies
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Internal dependencies
import { getApiLink } from '../utils/apiService';
import '../styles/web/Log.scss';
import { FieldComponent } from './types';
import { AdminButtonUI } from './UI/AdminButton';

interface AppLocalizer {
    nonce: string;
    tab_name: string;
    apiUrl: string;
    restUrl: string;
    [key: string]: string | number | boolean;
}

// Types
interface LogProps {
    apiLink: string;
    downloadFileName: string;
    appLocalizer: AppLocalizer;
    downloadBtnText?: string;
    copyBtnText?: string;
    deleteBtnText?: string;
}

export const LogUI: React.FC<LogProps> = ({
    apiLink,
    downloadFileName,
    appLocalizer,
    downloadBtnText = 'Download',
    copyBtnText = 'Copy',
    deleteBtnText = 'Delete',
}) => {
    const [logData, setLogData] = useState<string[]>([]);
    const [copied, setCopied] = useState<boolean>(false);
    const apiConfig = {
        url: getApiLink(appLocalizer, apiLink),
        method: 'GET',
        headers: { 'X-WP-Nonce': appLocalizer.nonce },
    };
    const logRegex = /^([^:]+:[^:]+:[^:]+):(.*)$/;

    useEffect(() => {
        axios({
            ...apiConfig,
            params: {
                logcount: 100,
            },
        }).then((response) => {
            setLogData(response.data);
        });
    }, [apiLink, appLocalizer]);

    const handleDownloadLog = (
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        event.preventDefault();
        const fileName = downloadFileName;
        axios({
            ...apiConfig,
            params: {
                action: 'download',
                file: fileName,
            },
            responseType: 'blob',
        })
            .then((response) => {
                const blob = new Blob([response.data], {
                    type: response.headers['content-type'],
                });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch((error) =>
                console.error('Error downloading file:', error)
            );
    };

    const handleClearLog = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        axios({
            ...apiConfig,
            params: {
                logcount: 100,
                action: 'clear',
            },
        }).then(() => {
            setLogData([]);
        });
    };

    const handleCopyToClipboard = (
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        event.preventDefault();
        const logText = logData
            .map((log) => {
                const match = log.match(logRegex);
                return match
                    ? `${match[1].trim()} : ${match[2].trim()}`
                    : log;
            })
            .join('\n');

        navigator.clipboard
            .writeText(logText)
            .then(() => setCopied(true))
            .catch((error) => {
                setCopied(false);

                console.error('Error copying logs to clipboard:', error);
            });

        setTimeout(() => setCopied(false), 10000);
    };

    return (
        <div className="section-log-container">
            <div className="buttons-wrapper">
                <AdminButtonUI
                    position="left"
                    buttons={[
                        {
                            icon: 'import',
                            text: downloadBtnText,
                            color: 'purple',
                            onClick: (e) => {
                                handleDownloadLog?.(e);
                            },
                        },
                    ]}
                />
                <AdminButtonUI
                    position="left"
                    buttons={[
                        {
                            icon: 'delete',
                            text: deleteBtnText,
                            color: 'purple',
                            onClick: (e) => {
                                handleClearLog?.(e);
                            },
                        },
                    ]}
                />
            </div>
            <div className="log-container-wrapper">
                <div className="wrapper-header">
                    <p className="log-viewer-text">
                        {appLocalizer.tab_name} - log viewer
                    </p>
                    <AdminButtonUI
                        position="left"
                        buttons={[
                            {
                                icon: 'copy',
                                text: copyBtnText,
                                color: 'purple',
                                onClick: (e) => {
                                    handleCopyToClipboard?.(e);
                                },
                                children: (
                                    <span
                                        className={!copied ? 'tooltip' : 'tooltip tool-clip'}
                                    >
                                        {!copied ? (
                                            'Copy to clipboard'
                                        ) : (
                                            <i className="adminfont-success-notification"></i>
                                        )}
                                        {!copied ? '' : 'Copied'}
                                    </span>
                                ),
                            },
                        ]}
                    />
                </div>
                <div className="wrapper-body">
                    {logData.map((log, index) => {
                        const match = log.match(logRegex);
                        if (match) {
                            return (
                                <div className="log-row" key={index}>
                                    <span className="log-creation-date">
                                        {match[1].trim()} :
                                    </span>
                                    <span className="log-details">
                                        {match[2].trim()}
                                    </span>
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>
            </div>
        </div>
    );
};

const Log: FieldComponent = {
    render: ({ field, value, onChange, canAccess, appLocalizer }) => (
        <LogUI
            appLocalizer={appLocalizer}
            apiLink={String(field.apiLink)}
            downloadFileName={String(field.fileName)}
            downloadBtnText={field.downloadBtnText}
            copyBtnText={field.copyBtnText}
            deleteBtnText={field.deleteBtnText}
        />
    ),

    validate: (field, value) => {
        return null;
    },

};
export default Log;
