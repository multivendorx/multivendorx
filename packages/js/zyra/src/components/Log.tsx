// External dependencies
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Internal dependencies
import { getApiLink } from '../utils/apiService';
import '../styles/web/Log.scss';
import { FieldComponent, ZyraVariable } from './fieldUtils';
import { ButtonInputUI } from './ButtonInput';
import { CopyToClipboardUI } from './UI/CopyToClipboard';

// Types
interface LogProps {
    apiLink: string;
    downloadFileName: string;
    downloadBtnText?: string;
    copyBtnText?: string;
    deleteBtnText?: string;
}

export const LogUI: React.FC<LogProps> = ({
    apiLink,
    downloadFileName,
    downloadBtnText = 'Download',
    copyBtnText = 'Copy',
    deleteBtnText = 'Delete',
}) => {
    const [logData, setLogData] = useState<string[]>([]);
    const [copied, setCopied] = useState<boolean>(false);
    const apiConfig = {
        url: getApiLink(ZyraVariable, apiLink),
        method: 'GET',
        headers: { 'X-WP-Nonce': ZyraVariable.nonce },
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
    }, [apiLink]);

    const handleDownloadLog = (event: React.MouseEvent<HTMLButtonElement>) => {
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
            .catch((error) => console.error('Error downloading file:', error));
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
        event: React.MouseEvent
    ) => {
        event.preventDefault();
        const logText = logData
            .map((log) => {
                const match = log.match(logRegex);
                return match ? `${match[1].trim()} : ${match[2].trim()}` : log;
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
                <ButtonInputUI
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
                <ButtonInputUI
                    position="left"
                    buttons={[
                        {
                            icon: 'delete',
                            text: deleteBtnText,
                            color: 'red',
                            onClick: (e) => {
                                handleClearLog?.(e);
                            },
                        },
                    ]}
                />
            </div>
            <div className="log-container-wrapper">
                <div className="wrapper-header">
                    <div className="log-viewer-text">
                        {ZyraVariable.tab_name} - log viewer
                    </div>
                    
                    <CopyToClipboardUI
                        variant="button"
                        copyButtonLabel={copyBtnText}
                        copiedLabel="Copied"
                        onCopy={handleCopyToClipboard}
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
    render: ({ field }) => (
        <LogUI
            // appLocalizer={appLocalizer}
            apiLink={String(field.apiLink)}
            downloadFileName={String(field.fileName)}
            downloadBtnText={field.downloadBtnText}
            copyBtnText={field.copyBtnText}
            deleteBtnText={field.deleteBtnText}
        />
    ),

    validate: () => {
        return null;
    },
};
export default Log;
