// External dependencies
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Internal dependencies
import '../styles/web/SystemInfoAccordion.scss';
import { getApiLink } from '../utils/apiService';
import Skeleton from './UI/Skeleton';
import { FieldComponent } from './types';

interface AppLocalizer {
    nonce: string;
    apiUrl: string;
    restUrl: string;
}

// Types
interface SystemInfoProps {
    apiLink: string;
    appLocalizer: AppLocalizer;
    copyButtonLabel?: string;
    copiedLabel?: string;
}

interface Field {
    label: string;
    value: string;
}

interface InfoSection {
    label: string;
    fields: Record<string, Field>;
}

type ApiResponse = Record<string, InfoSection>;

export const SystemInfoUI : React.FC<SystemInfoProps> = ({
    apiLink,
    appLocalizer,
    copyButtonLabel = 'Copy System Info',
    copiedLabel = 'Copied!',
}) => {
    const [data, setData] = useState<ApiResponse | null>(null);
    const [openKeys, setOpenKeys] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);

    // Fetch everything at once
    useEffect(() => {
        axios({
            url: getApiLink(appLocalizer, apiLink),
            method: 'GET',
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        }).then((response) => {
            setData(response.data);
        });
    }, [apiLink, appLocalizer]);

    const toggleSection = (key: string) => {
        setOpenKeys((prev) => (prev.includes(key) ? [] : [key]));
    };

    // Format data for clipboard
    const formatSystemInfo = (info: ApiResponse): string => {
        let output = '';
        Object.values(info).forEach((section) => {
            output += `=== ${section.label} ===\n`;
            Object.values(section.fields).forEach((field) => {
                output += `${field.label}: ${field.value}\n`;
            });
            output += '\n';
        });
        return output.trim();
    };

    const copyToClipboard = () => {
        if (!data) {
            return;
        }
        const formatted = formatSystemInfo(data);
        navigator.clipboard.writeText(formatted).then(() => {
            setCopied(true);
        });
    };

    if (!data) {
        return (
            <div className="system-info">
                <div className="buttons-wrapper">
                    <div className="admin-btn btn-purple">
                        <Skeleton width={6} />
                    </div>
                </div>

                {Array.from({ length: 10 }).map((_, idx) => (
                    <div key={idx} className="system-item">
                        <div className="name">
                            <Skeleton width={180} />
                            <i className="adminfont-pagination-right-arrow"></i>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="system-info">
            <div className="buttons-wrapper">
                <div
                    className="admin-btn btn-purple"
                    onClick={copyToClipboard}
                >
                    <i className="adminfont-vendor-form-copy"></i>

                    <span className="copy-success">
                            {copied ? copiedLabel : copyButtonLabel}
                    </span>
                </div>
            </div>

            {Object.entries(data).map(([key, section]) => {
                const isOpen = openKeys.includes(key);
                return(
                    <div key={key} className="system-item">
                        <div
                            onClick={() => toggleSection(key)}
                            className="name"
                        >
                            <span>{section.label}</span>
                            <i
                                className={
                                    isOpen
                                        ? 'adminfont-keyboard-arrow-down'
                                        : 'adminfont-pagination-right-arrow '
                                }
                            ></i>
                        </div>

                        {isOpen && (
                            <div className="content">
                                <table>
                                    <tbody>
                                        {Object.entries(section.fields).map(
                                            ([fieldKey, field]) => (
                                                <tr key={fieldKey}>
                                                    <td className="field-label">
                                                        {field.label}
                                                    </td>
                                                    <td className="field-value">
                                                        {field.value}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
        
const SystemInfo: FieldComponent = {
    render: ({ field, appLocalizer }) => (
        <SystemInfoUI
            apiLink={field.apiLink}
            appLocalizer={appLocalizer}
            copyButtonLabel={field.copyButtonLabel}
            copiedLabel={field.copiedLabel}
        />
    ),
    validate: () => null,
};

export default SystemInfo;
