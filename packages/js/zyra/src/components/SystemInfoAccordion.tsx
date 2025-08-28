/**
 * External dependencies
 */
import React, { useEffect, useState } from "react";
import axios from "axios";

/**
 * Internal dependencies
 */
import { getApiLink } from "../utils/apiService";

// Types
interface SystemInfoAccordionProps {
    apiLink: string;
    appLocalizer: Record<string, any>;
    copyButtonLabel?: string;
    copiedLabel?: string;
}

interface Field {
    label: string;
    value: string;
}

interface InfoSection {
    label: string;
    description?: string;
    fields: Record<string, Field>;
}

type ApiResponse = Record<string, InfoSection>;

// Dummy fallback (dynamic tests)
const fallbackData: ApiResponse = {
    multivendorx: {
        label: "MultivendorX",
        description: "Marketplace plugin details",
        fields: {
            version: { label: "Version", value: "4.1.0" },
            status: { label: "Status", value: "Active" },
        },
    },
    dropsin: {
        label: "Dropsin",
        description: "Dropshipping integration",
        fields: {
            version: { label: "Version", value: "2.5.3" },
            status: { label: "Status", value: "Inactive" },
        },
    },
    active_theme: {
        label: "Active Theme",
        description: "Current WordPress theme details",
        fields: {
            name: { label: "Theme", value: "Astra" },
            version: { label: "Version", value: "3.8.0" },
        },
    },
};

const SystemInfoAccordion: React.FC<SystemInfoAccordionProps> = ({
    apiLink,
    appLocalizer,
    copyButtonLabel = "Copy System Info", // dynamic label
    copiedLabel = "Copied!", // dynamic label
}) => {
    const [data, setData] = useState<ApiResponse | null>(null);
    const [openKeys, setOpenKeys] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    // Fetch everything at once
    useEffect(() => {
        axios({
            url: getApiLink(appLocalizer, apiLink),
            method: "GET",
            headers: { "X-WP-Nonce": appLocalizer.nonce },
        })
            .then((response) => {
                setData(response.data || fallbackData);
            })
            .catch((err) => {
                setData(fallbackData);
                console.error("Error fetching system info:", err);
            })
            .finally(() => setLoading(false));
    }, [apiLink, appLocalizer]);

    const toggleSection = (key: string) => {
        setOpenKeys((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    };

    // Format data for clipboard
    const formatSystemInfo = (info: ApiResponse): string => {
        let output = "";
        Object.values(info).forEach((section) => {
            output += `=== ${section.label} ===\n`;
            Object.values(section.fields).forEach((field) => {
                output += `${field.label}: ${field.value}\n`;
            });
            output += "\n";
        });
        return output.trim();
    };

    const copyToClipboard = () => {
        if (!data) return;
        const formatted = formatSystemInfo(data);
        navigator.clipboard.writeText(formatted).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    if (loading) return <p>Loading</p>;
    if (!data) return null;

    return (
        <div className="system-info-container">
            {/* Copy Button */}
            <div className="copy-info-bar">
                <button type="button" onClick={copyToClipboard} className="copy-btn">
                    {copyButtonLabel}
                </button>
                {copied && <span className="copy-success">{copiedLabel}</span>}
            </div>

            {Object.entries(data).map(([key, section]) => (
                <div key={key} className="accordion-item">
                    <button
                        type="button"
                        onClick={() => toggleSection(key)}
                        className="accordion-header"
                    >
                        <span>{section.label}</span>
                        <span>{openKeys.includes(key) ? "▲" : "▼"}</span>
                    </button>

                    {openKeys.includes(key) && (
                        <div className="accordion-body">
                            {section.description && (
                                <p className="accordion-desc">{section.description}</p>
                            )}
                            <table className="accordion-table">
                                <tbody>
                                    {Object.entries(section.fields).map(([fieldKey, field]) => (
                                        <tr key={fieldKey}>
                                            <td className="field-label">{field.label}</td>
                                            <td className="field-value">{field.value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default SystemInfoAccordion;
