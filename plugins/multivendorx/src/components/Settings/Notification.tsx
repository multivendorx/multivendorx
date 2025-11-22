import React, { useEffect, useMemo, useState } from 'react';
import "./Notifications.scss";
import { CommonPopup, getApiLink, TextArea, BasicInput } from 'zyra';
import axios from 'axios';

// ------------------ RecipientBadge Component ------------------
interface Recipient {
    id: number;
    type: string;
    label: string;
    enabled: boolean;
    canDelete: boolean;
}

interface RecipientBadgeProps {
    recipient: Recipient;
    onToggle: () => void;
    onDelete?: () => void;
}

const RecipientBadge: React.FC<RecipientBadgeProps> = ({ recipient, onToggle, onDelete }) => {
    let iconClass = 'adminlib-mail';
    let badgeClass = 'red';

    switch (recipient.label) {
        case 'Store':
            iconClass = 'adminlib-storefront';
            badgeClass = 'blue';
            break;
        case 'Admin':
            iconClass = 'adminlib-person';
            badgeClass = ' green';
            break;
        case 'Customer':
            iconClass = 'adminlib-user-circle';
            badgeClass = 'yellow';
            break;
        default:
            badgeClass = ' default-badge';
    }

    return (
        <>
            {recipient.enabled && (
                <div className={`admin-badge ${badgeClass}`} onClick={(e) => { e.stopPropagation(); onToggle(); }} role="button" tabIndex={0}>
                    <i className={iconClass}></i>
                    <span>{recipient.label}</span>
                </div>
            )}
        </>
    );
};

// ------------------ Notification Component ------------------
const Notification: React.FC = () => {
    // Keep notifications as an array to avoid null checks everywhere
    const [notifications, setNotifications] = useState<any[]>([]);
    const [systemTags, setSystemTags] = useState<string[]>([]);
    // openChannel holds 'mail' | 'sms' | 'system' | null
    const [openChannel, setOpenChannel] = useState<string | null>(null);

    useEffect(() => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, 'notifications'),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            params: {
                events: true
            }
        }).then((response) => {
            setNotifications(response.data || []);
        });
    }, []);

    const [addingRecipient, setAddingRecipient] = useState<number | null>(null);
    const [newRecipientValue, setNewRecipientValue] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [editingNotification, setEditingNotification] = useState<number | null>(null);
    const [notificationId, setNotificationId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});

    // NEW: activeTag state
    const [activeTag, setActiveTag] = useState<string>('All');

    // ------------------ autosave effect (keeps almost same logic you had) ------------------
    useEffect(() => {
        if (!notifications || notificationId == null) return;

        const filtered = notifications.filter(item => item.id === notificationId);

        axios({
            method: 'POST',
            url: getApiLink(appLocalizer, `notifications/${notificationId}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: {
                notifications: filtered
            }
        }).then((response) => {
            if (response.data.success) {
                setEditingNotification(null);
            }
        });
    }, [notifications, notificationId]);

    const toggleRecipient = (notifId: number, recipientId: number) => {
        setNotifications(prev =>
            prev.map(n =>
                n.id === notifId
                    ? { ...n, recipients: n.recipients.map((r: any) => r.id === recipientId ? { ...r, enabled: !r.enabled } : r) }
                    : n
            )
        );
    };

    const deleteRecipient = (notifId: number, recipientId: number) => {
        setNotifications(prev =>
            prev.map(n =>
                n.id === notifId
                    ? { ...n, recipients: n.recipients.filter((r: any) => r.id !== recipientId) }
                    : n
            )
        );
    };

    const addRecipient = (notifId: number | null) => {
        if (!newRecipientValue.trim() || notifId == null) return;
        setNotifications(prev =>
            prev.map(n => {
                if (n.id === notifId) {
                    const maxId = n.recipients && n.recipients.length ? Math.max(...n.recipients.map((r: any) => r.id)) : 0;
                    const newId = maxId + 1;
                    return {
                        ...n,
                        recipients: [...(n.recipients || []), {
                            id: newId,
                            type: 'extra',
                            label: newRecipientValue,
                            enabled: true,
                            canDelete: true
                        }]
                    };
                }
                return n;
            })
        );
        setNewRecipientValue('');
        setAddingRecipient(null);
    };

    const toggleChannel = (notifId: number, channel: string) => {
        setNotifications(prev =>
            prev.map(n =>
                n.id === notifId ? { ...n, channels: { ...n.channels, [channel]: !n.channels[channel] } } : n
            )
        );
    };

    const openEditPannel = (notifId: number, channel: string) => {
        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, `notifications/${notifId}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        }).then((response) => {
            const notifData = Array.isArray(response.data) ? response.data[0] : response.data;
            setFormData(notifData || {});
        });

        setOpenChannel(channel);
    };

    useEffect(() => {
        if (formData.system_message) {
            const matches = (formData.system_message as string).match(/\[[^\]]+\]/g) || [];
            setSystemTags(matches);
        } else {
            setSystemTags([]);
        }
    }, [formData.system_message]);

    const handleAutoSave = (id: number | null) => {
        if (id == null) return;
        axios({
            method: "POST",
            url: getApiLink(appLocalizer, `notifications/${id}`),
            headers: { "X-WP-Nonce": appLocalizer.nonce },
            data: {
                formData,
            },
        }).then(() => {
            setOpenChannel(null);
        });
    };

    // -------------- TAGS: auto-generate unique tags from notifications --------------
    const uniqueTags = useMemo(() => {
        const tags = Array.from(new Set((notifications || []).map(n => n.tag).filter(Boolean)));
        return ['All', ...tags];
    }, [notifications]);

    // -------------- FILTERED NOTIFICATIONS based on activeTag --------------
    const filteredNotifications = useMemo(() => {
        if (!notifications) return [];
        if (activeTag === 'All') return notifications;
        return notifications.filter(n => n.tag === activeTag);
    }, [notifications, activeTag]);
    // ------------------ Render ------------------
    return (
        <div className="notification-container tab-bg">

            {/* View Toggle */}
            <div className="toggle-setting-wrapper view-toggle">

                <div className="category-filter">
                    {uniqueTags.map(tag => (
                        <div
                            key={tag}
                            className={`category-item ${activeTag === tag ? 'active' : ''}`}
                            role="button"
                            tabIndex={0}
                            onClick={(e) => { e.stopPropagation(); setActiveTag(tag); }}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setActiveTag(tag); } }}
                        >
                            {tag}
                        </div>
                    ))}
                </div>

                <div className="tabs-wrapper">
                    {['list', 'grid'].map(mode => (
                        <div
                            key={mode}
                            role="button"
                            tabIndex={0}
                            onClick={() => setViewMode(mode as 'list' | 'grid')}
                            onKeyDown={e => e.key === 'Enter' && setViewMode(mode as 'list' | 'grid')}
                        >
                            <input
                                className="toggle-setting-form-input"
                                type="radio"
                                id={`${mode}-view`}
                                name="view-mode"
                                value={mode}
                                checked={viewMode === mode}
                                readOnly
                            />
                            <label htmlFor={`${mode}-view`}>
                                <i className={mode === 'list' ? 'adminlib-editor-list-ul' : 'adminlib-module'}></i>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* List View */}
            {viewMode === 'list' && (
                <div className="table-wrapper">
                    <table className="admin-table">
                        <thead className="admin-table-header">
                            <tr className='header-row'>
                                <th className='header-col notificaton'>Event</th>
                                <th className='header-col'>Recipients</th>
                                <th className='header-col'>System</th>
                                <th className='header-col action'>Action</th>
                            </tr>
                        </thead>
                        <tbody className='admin-table-body'>
                            {filteredNotifications.map((notif: any) => (
                                <tr className="admin-row" key={notif.id} onClick={() => { setEditingNotification(notif.id); setNotificationId(notif.id); }}>
                                    <td className="admin-column notificaton">
                                        <div className="table-row-custom">
                                            <div className="product-wrapper notification">
                                                <span className={`item-icon notification-icon icon-${notif.id}`}></span>
                                                <div className="details">
                                                    <div className="title">
                                                        {notif.event}
                                                        <span className={`admin-badge yellow ${notif.tag}`}>{notif.tag} </span>
                                                        <span className={`admin-badge blue ${notif.category}`}> {notif.category} </span>
                                                    </div>
                                                    <div className="des">{notif.description}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="admin-column">
                                        <div className="table-row-custom">
                                            <div className="recipients-list">
                                                {(notif.recipients || []).map((r: any) => (
                                                    <RecipientBadge
                                                        key={r.id}
                                                        recipient={r}
                                                        onToggle={() => toggleRecipient(notif.id, r.id)}
                                                        onDelete={r.canDelete ? () => deleteRecipient(notif.id, r.id) : undefined}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="admin-column">
                                        <div className="table-row-custom">
                                            <div className="system-column">
                                                {Object.entries(notif.channels || {}).map(([channel, enabled]: any) => {
                                                    let iconClass = '';
                                                    let badgeClass = 'admin-badge ';
                                                    switch (channel) {
                                                        case 'mail':
                                                            iconClass = 'adminlib-mail';
                                                            badgeClass += 'yellow';
                                                            break;
                                                        case 'sms':
                                                            iconClass = 'adminlib-enquiry';
                                                            badgeClass += 'green';
                                                            break;
                                                        case 'system':
                                                            iconClass = 'adminlib-notification';
                                                            badgeClass += 'blue';
                                                            break;
                                                    }
                                                    return (
                                                        <>
                                                            {enabled && (
                                                                <i
                                                                    key={channel}
                                                                    className={`${iconClass} ${badgeClass} ${!enabled ? 'disable' : ''}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setNotificationId(notif.id);
                                                                        openEditPannel(notif.id, channel);
                                                                    }}
                                                                ></i>
                                                            )}
                                                        </>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="admin-column action">
                                        <div className="action-section">
                                            <div className="action-icons">
                                                <div className="inline-actions">
                                                    <div className="inline-action-btn">
                                                        <i className="adminlib-edit"></i>
                                                        <span>Edit</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {openChannel && (
                <CommonPopup
                    open={!!openChannel}
                    onClose={() => setOpenChannel(null)}
                    width="500px"
                    height="70%"
                    header={
                        <>
                            <div className="title">
                                <i className="adminlib-cart"></i>
                                {openChannel === "system" && "System Notification"}
                                {openChannel === "sms" && "SMS Message"}
                                {openChannel === "mail" && "Email Message"}
                            </div>
                            <i
                                className="icon adminlib-close"
                                onClick={() => setOpenChannel(null)}
                            ></i>
                        </>
                    }
                    footer={
                        <div className="drawer-footer">
                            <button className="admin-btn btn-red" onClick={() => setOpenChannel(null)}>
                                Cancel
                            </button>
                        </div>
                    }
                >
                    <div className="content">

                        <div className="form-group-wrapper">
                            {openChannel === "system" && (
                                <div className="form-group">
                                    <>
                                        <label>System Message</label>
                                        <TextArea
                                            name="system_message"
                                            inputClass="textarea-input"
                                            value={formData.system_message || ""}
                                            onChange={(e) => {
                                                setFormData({
                                                    ...formData,
                                                    system_message: e.target.value,
                                                });
                                            }}
                                            onBlur={() => { handleAutoSave(formData.id); }}
                                        />
                                    </>

                                </div>
                            )}
                        </div>
                        <div className="form-group-wrapper">
                            {openChannel === "sms" && (
                                <div className="form-group">
                                    <>
                                        <label>SMS Content</label>
                                        <TextArea
                                            name="sms_content"
                                            inputClass="textarea-input"
                                            value={formData.sms_content || ""}
                                            onChange={(e) => {
                                                setFormData({
                                                    ...formData,
                                                    sms_content: e.target.value,
                                                });
                                                handleAutoSave(formData.id);
                                            }}
                                            onBlur={() => { handleAutoSave(formData.id); }}
                                        />
                                    </>
                                </div>
                            )}
                        </div>
                        <div className="form-group-wrapper">
                            {openChannel === "mail" && (
                                <div className="form-group">
                                    <>
                                        <label>Email Subject</label>
                                        <BasicInput
                                            type="text"
                                            name="title"
                                            value={formData.email_subject || ""}
                                            onChange={(e) => {
                                                setFormData({
                                                    ...formData,
                                                    email_subject: e.target.value,
                                                });
                                                handleAutoSave(formData.id);
                                            }}
                                            onBlur={() => { handleAutoSave(formData.id); }}
                                        />
                                    </>
                                </div>
                            )}
                        </div>
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label>Email Body</label>
                                <TextArea
                                    name="sms_content"
                                    inputClass="textarea-input"
                                    value={formData.email_body || ""}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            email_body: e.target.value,
                                        });
                                        handleAutoSave(formData.id);
                                    }}
                                    onBlur={() => { handleAutoSave(formData.id); }}
                                />
                            </div>
                        </div>
                        <div className="form-group-wrapper">
                            {systemTags?.length > 0 && (
                                <div className="tag-list">
                                    <p>You can use these tags:</p>
                                    {systemTags.map((tag, idx) => (
                                        <span
                                            key={idx}
                                            className="tag-item"
                                            onClick={() => navigator.clipboard.writeText(tag)}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </CommonPopup>
            )}

            {/* Edit Recipients Popup */}
            {editingNotification && (
                <CommonPopup
                    open={!!editingNotification}
                    onClose={() => setEditingNotification(null)}
                    width="500px"
                    height="70%"
                    header={
                        <>
                            <div className="title">
                                <i className="adminlib-notification"></i>
                                Notification preferences
                            </div>
                            <p>Edit and control notification method and recipients for this event.</p>
                            <i
                                className="icon adminlib-close"
                                onClick={() => setEditingNotification(null)}
                            ></i>
                        </>
                    }
                >
                    <div className="content">
                        <div className="title">
                            Delivery method
                        </div>
                        <div className="drawer-recipients">
                            {Object.entries(notifications.find(n => n.id === editingNotification)?.channels || {}).map(
                                ([channel, enabled]: any) => {
                                    let label = '';
                                    switch (channel) {
                                        case 'mail': label = 'Mail'; break;
                                        case 'sms': label = 'SMS'; break;
                                        case 'system': label = 'System'; break;
                                    }
                                    return (
                                        <>
                                            <div key={channel} className={`recipient ${!enabled ? 'disable' : ''}`}>
                                                <span className="icon">
                                                    <i className={
                                                        label === 'Mail' ? 'adminlib-mail' :
                                                            label === 'SMS' ? 'adminlib-enquiry' :
                                                                label === 'System' ? 'adminlib-notification' : 'adminlib-mail'
                                                    }></i>
                                                </span>
                                                <div className="details">
                                                    <span>{label}</span>

                                                </div>
                                                <i onClick={() => toggleChannel(editingNotification, channel)} className={enabled ? 'adminlib-eye' : 'adminlib-eye-blocked'}></i>
                                            </div>
                                        </>
                                    );
                                }
                            )}
                        </div>

                        <div className="title">
                            Recipients
                        </div>

                        <div className="drawer-recipients">
                            {notifications.find(n => n.id === editingNotification)?.recipients.map((r: any) => (
                                <div key={r.id} className={`recipient ${r.enabled ? '' : 'disable'}`}>
                                    <span className="icon">
                                        <i className={
                                            r.label === 'Store' ? 'adminlib-storefront' :
                                                r.label === 'Admin' ? 'adminlib-person' :
                                                    r.label === 'Customer' ? 'adminlib-user-circle' : 'adminlib-mail'
                                        }></i>
                                    </span>
                                    <div className="details">
                                        <span>{r.label}</span>
                                        {/* <div className="description">Lorem, ipsum.</div> */}
                                    </div>
                                    {r.canDelete && (
                                        <i className="delete-btn adminlib-delete" onClick={() => deleteRecipient(editingNotification, r.id)}></i>
                                    )}
                                    {!r.canDelete && (
                                        <i onClick={() => toggleRecipient(editingNotification, r.id)} className={r.enabled ? 'adminlib-eye' : 'adminlib-eye-blocked'}></i>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="drawer-add-recipient">
                            <input
                                type="text"
                                className="basic-input"
                                placeholder="Type the email address of the additional recipient you want to notify, then click ‘Add’. "
                                value={newRecipientValue}
                                onChange={(e) => setNewRecipientValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addRecipient(editingNotification)}
                            />
                            <button className="admin-btn btn-purple" onClick={() => addRecipient(editingNotification)}>
                                <i className="adminlib-plus-circle-o"></i>
                                Add
                            </button>
                        </div>
                    </div>
                </CommonPopup>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="notification-grid">
                    {filteredNotifications.map((notif: any) => (
                        <div key={notif.id} className="notification-card">
                            <div className="card-body">
                                <div className="title-wrapper">
                                    <i className={`notification-icon ${notif.icon}`}></i>
                                    <div className="details">
                                        <div className="title">{notif.event}</div>
                                        <div className="description">{notif.description}</div>
                                    </div>
                                </div>
                                <div className="recipients-list">
                                    {(notif.recipients || []).map((r: any) => (
                                        <RecipientBadge
                                            key={r.id}
                                            recipient={r}
                                            onToggle={() => toggleRecipient(notif.id, r.id)}
                                            onDelete={r.canDelete ? () => deleteRecipient(notif.id, r.id) : undefined}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="card-footer">
                                <div className="system-column">
                                    {Object.entries(notif.channels || {}).map(([channel, enabled]: any) => {
                                        let iconClass = '';
                                        let badgeClass = 'admin-badge ';
                                        switch (channel) {
                                            case 'mail':
                                                iconClass = 'adminlib-mail';
                                                badgeClass += 'yellow';
                                                break;
                                            case 'sms':
                                                iconClass = 'adminlib-enquiry';
                                                badgeClass += 'green';
                                                break;
                                            case 'system':
                                                iconClass = 'adminlib-notification';
                                                badgeClass += 'blue';
                                                break;
                                        }
                                        return (
                                            <i
                                                key={channel}
                                                className={`${iconClass} ${badgeClass} ${!enabled ? 'disable' : ''}`}
                                                onClick={(e) => { e.stopPropagation(); toggleChannel(notif.id, channel); }}
                                            ></i>
                                        );
                                    })}
                                </div>

                                <div className="admin-btn btn-purple" onClick={() => setEditingNotification(notif.id)}>
                                    Manage <i className="adminlib-edit"></i>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notification;
