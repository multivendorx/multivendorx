import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import DragListView from 'react-drag-listview';
import '../styles/web/EndpointEditor.scss';
import { getApiLink } from '../utils/apiService';
import { FieldComponent } from './types';

interface Submenu {
    name: string;
    slug: string;
}

interface Endpoint {
    name: string;
    slug: string;
    submenu: Submenu[];
    icon: string;
    visible?: boolean;
}

interface AppLocalizer {
    nonce: string;
    apiUrl: string;
    restUrl: string;
    [key: string]: string | number | boolean;
}

interface EndpointEditorProps {
    name: string;
    apilink: string;
    appLocalizer: AppLocalizer;
    onChange: (data: Record<string, Endpoint>) => void;
}

const EndpointManagerUI: React.FC<EndpointEditorProps> = ({
    apilink,
    appLocalizer,
    onChange,
}) => {
    const [endpoints, setEndpoints] = useState<[string, Endpoint][]>([]);
    const [editKey, setEditKey] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editSlug, setEditSlug] = useState('');
    const editRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        axios({
            url: getApiLink(appLocalizer, apilink),
            method: 'GET',
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: { menuOnly: true },
        }).then((res) => {
            const typedData = res.data as Record<string, Endpoint>;
            const formatted = Object.entries(typedData).map(([k, v]) => [
                k,
                { ...v, visible: v.visible !== false },
            ]) as [string, Endpoint][];

            setEndpoints(formatted);
        });
    }, [apilink, appLocalizer]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (editRef.current && !editRef.current.contains(event.target as Node)) {
                setEditKey(null);
            }
        };

        if (editKey) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [editKey]);

    const autoSave = (updated: [string, Endpoint][]) => {
        setEndpoints(updated);
        onChange(Object.fromEntries(updated));
    };

    const updateEndpoint = (
        key: string,
        updater: (item: Endpoint) => Endpoint
    ) => {
        const updated = endpoints.map(([k, item]) =>
            k === key ? [k, updater(item)] : [k, item]
        ) as [string, Endpoint][];

        autoSave(updated);
    };

    const updateSubmenu = (
        key: string,
        index: number,
        updater: (sub: Submenu) => Submenu
    ) => {
        updateEndpoint(key, (item) => {
            const submenu = [...item.submenu];
            submenu[index] = updater(submenu[index]);
            return { ...item, submenu };
        });
    };

    const generateUniqueSlug = (value: string, currentKey: string) => {
        const base = value.toLowerCase().replace(/[^a-z0-9-]/g, '').trim();
        if (!base) return '';

        const existing = endpoints
            .filter(([k]) => k !== currentKey)
            .map(([_, item]) => item.slug);

        let slug = base;
        let counter = 1;

        while (existing.includes(slug)) {
            slug = `${base}${counter++}`;
        }

        return slug;
    };

    const onDragEnd = (from: number, to: number) => {
        const updated = [...endpoints];
        const moved = updated.splice(from, 1)[0];
        updated.splice(to, 0, moved);
        autoSave(updated);
    };

    const onSubmenuDragEnd = (
        key: string,
        from: number,
        to: number
    ) => {
        updateEndpoint(key, (item) => {
            const submenu = [...item.submenu];
            const moved = submenu.splice(from, 1)[0];
            submenu.splice(to, 0, moved);
            return { ...item, submenu };
        });
    };

    const startEdit = (key: string, endpoint: Endpoint) => {
        setEditKey(key);
        setEditName(endpoint.name);
        setEditSlug(endpoint.slug);
    };

    const toggleVisibility = (key: string) => {
        updateEndpoint(key, (item) => ({
            ...item,
            visible: item.visible === false,
        }));
    };

    const renderRow = ([key, endpoint]: [string, Endpoint], index: number) => {
        const isDashboard = key === 'dashboard';

        return (
            <div key={key} data-index={index} className="menu-item">
                {editKey === key ? (
                    <div className="edit-menu" ref={editRef}>
                        <div className="name-wrapper">
                            <input
                                value={editName}
                                onChange={(e) => {
                                    const name = e.target.value;
                                    setEditName(name);
                                    updateEndpoint(key, (item) => ({
                                        ...item,
                                        name,
                                    }));
                                }}
                                className="basic-input"
                            />

                            {!isDashboard && (
                                <input
                                    value={editSlug}
                                    onChange={(e) => {
                                        const slug = generateUniqueSlug(
                                            e.target.value,
                                            key
                                        );
                                        setEditSlug(slug);
                                        if (!slug) return;

                                        updateEndpoint(key, (item) => ({
                                            ...item,
                                            slug,
                                        }));
                                    }}
                                    className="basic-input"
                                />
                            )}
                        </div>
                    </div>
                ) : (
                    <div
                        className="main-menu"
                        style={{ opacity: endpoint.visible === false ? 0.5 : 1 }}
                    >
                        <div className="name-wrapper">
                            {!isDashboard && <i className="adminfont-drag" />}
                            <i className={endpoint.icon} />
                            <div className="name">
                                {endpoint.name}
                                {!isDashboard && <code>{endpoint.slug}</code>}
                            </div>
                        </div>

                        {!isDashboard && (
                            <div className="edit-icon">
                                {endpoint.visible !== false && (
                                    <i
                                        className="adminfont-edit"
                                        onClick={() =>
                                            startEdit(key, endpoint)
                                        }
                                    />
                                )}
                                <i
                                    className={`adminfont-eye${
                                        endpoint.visible === false
                                            ? '-blocked'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        toggleVisibility(key)
                                    }
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Submenus */}
                {endpoint.submenu?.length > 0 && (
                    <DragListView
                        nodeSelector=".sub-menu"
                        onDragEnd={(from, to) =>
                            onSubmenuDragEnd(key, from, to)
                        }
                    >
                        <ul>
                            {endpoint.submenu.map((sub, i) => {
                                const subKey = `${key}-sub-${i}`;

                                return (
                                    <li
                                        key={i}
                                        className="sub-menu"
                                        style={{
                                            opacity:
                                                endpoint.visible === false
                                                    ? 0.5
                                                    : 1,
                                        }}
                                    >
                                        {editKey === subKey ? (
                                            <input
                                                ref={editRef}
                                                value={editName}
                                                onChange={(e) => {
                                                    const name =
                                                        e.target.value;
                                                    setEditName(name);
                                                    updateSubmenu(
                                                        key,
                                                        i,
                                                        (s) => ({
                                                            ...s,
                                                            name,
                                                        })
                                                    );
                                                }}
                                                className="basic-input"
                                            />
                                        ) : (
                                            <>
                                                <i className="adminfont-drag" />
                                                {sub.name}
                                                <i
                                                    className="adminfont-edit"
                                                    onClick={() => {
                                                        setEditKey(subKey);
                                                        setEditName(sub.name);
                                                    }}
                                                />
                                            </>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </DragListView>
                )}
            </div>
        );
    };

    return (
        <div className="endpoints-wrapper">
            <DragListView
                nodeSelector=".drag-row"
                handleSelector=".drag-handle"
                onDragEnd={onDragEnd}
            >
                <div>
                    {endpoints.map(([key, endpoint], index) => (
                        <div key={key} className="endpoint drag-row">
                            {key === 'dashboard' ? (
                                renderRow([key, endpoint], index)
                            ) : (
                                <div className="drag-handle menu-wrapper">
                                    {renderRow([key, endpoint], index)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </DragListView>
        </div>
    );
};

const EndpointManager: FieldComponent = {
    render: ({ field, value, onChange, canAccess, appLocalizer }) => (
        <EndpointManagerUI
            name={field.key}
            apilink={String(field.apiLink)}
            appLocalizer={appLocalizer}
            onChange={(val) => {
                if (!canAccess) return;
                onChange(val);
            }}
        />
    ),
    validate: () => null,
};

export default EndpointManager;
