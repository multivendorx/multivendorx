/* global appLocalizer */
import { useState, useEffect } from 'react';
import { PopupUI, getApiLink,Column, Container, Card, ItemListUI, Notice, ButtonInputUI } from 'zyra';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
interface ConnectedProfiles {
    [key: string]: {
        id?: string;
        name?: string;
        email?: string;
        connected_at?: string;
        [key: string]: unknown;
    };
}
interface VerificationMethod {
    active: boolean;
    label: string;
    required?: boolean;
    [key: string]: unknown;
}

type VerificationStatus = 'approved' | 'pending' | 'rejected';

export const getStoreStatus = (items: { status: VerificationStatus }[]) => {
    if (!items.length) return 'under_review';

    const allApproved = items.every(i => i.status === 'approved');
    if (allApproved) return 'approved';

    const allRejected = items.every(i => i.status === 'rejected');
    if (allRejected) return 'rejected';

    return 'under_review';
};

const Verification = () => {
    const allVerificationMethods = appLocalizer.settings_databases_value['store-identity']['all_verification_methods'] || {};
    const verificationMethods = appLocalizer.settings_databases_value['store-identity']['verification_methods'] || {};
    const [connectedProfiles, setConnectedProfiles] =
        useState<ConnectedProfiles>({});
    const [loading, setLoading] = useState<string>('');
    const [statusMessage, setStatusMessage] = useState<{
        type: string;
        text: string;
    } | null>(null);

    const [methodsState, setMethodsState] = useState<Record<string, any>>({});
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        fetchConnectedProfiles();
        checkUrlStatus();
    }, []);

    useEffect(() => {
        const savedMethods =
            connectedProfiles?.store_identity?.verification_methods || {};

        const merged: Record<string, any> = {};

        Object.entries(verificationMethods || {}).forEach(([key, method]: any) => {
            merged[key] = {
                ...method,
                document_url: savedMethods[key]?.document_url || '',
                status: savedMethods[key]?.status || '',
                created_at: savedMethods[key]?.created_at || '',
            };
        });

        console.log('FINAL MERGED:', merged);

        setMethodsState(merged);
    }, [connectedProfiles]);

    const checkUrlStatus = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const verificationStatus = urlParams.get('social_verification');
        const message = urlParams.get('message');

        if (verificationStatus && message) {
            setStatusMessage({
                type: verificationStatus,
                text: decodeURIComponent(message),
            });

            // Clean URL
            const cleanUrl = window.location.pathname + '?tab=verification';
            window.history.replaceState({}, document.title, cleanUrl);

            // Auto-hide success messages after 5 seconds
            if (verificationStatus === 'success') {
                setTimeout(() => {
                    setStatusMessage(null);
                }, 5000);
            }
        }
    };

    const fetchConnectedProfiles = async () => {
        try {
            const response = await axios({
                method: 'GET',
                url:
                    getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
                headers: { 'X-WP-Nonce': appLocalizer.nonce, },
                params: { id: appLocalizer.store_id },
            });

            const data = response.data;
            setConnectedProfiles(data);
        } catch (error) {
            console.error('Error fetching connected profiles:', error);
        }
    };

    const connectSocialProfile = async (provider: string) => {
        setLoading(provider);
        try {
            const response = await axios({
                method: 'POST',
                url:
                    getApiLink(appLocalizer, 'verification') +
                    '?action=connect',
                headers: {
                    'X-WP-Nonce': appLocalizer.nonce,
                    'Content-Type': 'application/json',
                },
                data: { provider },
            });

            const data = response.data;
            if (data.success && data.data.redirect_url) {
                window.location.href = data.data.redirect_url;
            } else {
                alert(
                    'Failed to connect: ' + (data.message || 'Unknown error')
                );
            }
        } catch (error: any) {
            console.error('Error connecting social profile:', error);
            const errorMessage =
                error.response?.data?.message ||
                'Failed to connect social profile';
            alert(errorMessage);
        } finally {
            setLoading('');
        }
    };

    const disconnectSocialProfile = async (provider: string) => {
        if (!confirm('Are you sure you want to disconnect this social profile?')) {
            return;
        }

        try {
            const response = await axios({
                method: 'POST',
                url:
                    getApiLink(appLocalizer, 'verification') +
                    '?action=disconnect',
                headers: {
                    'X-WP-Nonce': appLocalizer.nonce,
                    'Content-Type': 'application/json',
                },
                data: { provider },
            });

            const data = response.data;
            if (data.success) {
                setConnectedProfiles((prev) => {
                    const updated = { ...prev };
                    delete updated[provider];
                    return updated;
                });
                alert('Social profile disconnected successfully');
            } else {
                alert(
                    'Failed to disconnect: ' + (data.message || 'Unknown error')
                );
            }
        } catch (error: any) {
            console.error('Error disconnecting social profile:', error);
            const errorMessage =
                error.response?.data?.message ||
                'Failed to disconnect social profile';
            alert(errorMessage);
        }
    };

    const getSocialStatus = (provider: string) => {
        return connectedProfiles[provider] ? 'connected' : 'not_connected';
    };

    const getButtonConfig = (provider: string) => {
        const status = getSocialStatus(provider);

        switch (status) {
            case 'connected':
                return {
                    text: 'Connected',
                    class: 'admin-btn btn-green',
                    action: () => disconnectSocialProfile(provider),
                    disabled: false,
                };
            case 'not_connected':
                return {
                    text: loading === provider ? 'Connecting...' : 'Connect',
                    class: 'admin-btn btn-purple',
                    action: () => connectSocialProfile(provider),
                    disabled: loading !== '',
                };
            default:
                return {
                    text: 'Connect',
                    class: 'admin-btn btn-purple',
                    action: () => connectSocialProfile(provider),
                    disabled: false,
                };
        }
    };

    const renderSocialVerification = () => {
        const socialConfigs = [
            {
                provider: 'linkedin',
                icon: 'adminfont-linkedin yellow',
                name: __('Verify via LinkedIn', 'multivendorx'),
                enabled:
                    allVerificationMethods?.['linkedin-connect']
                        ?.enable,
            },
            {
                provider: 'google',
                icon: 'adminfont-google yellow',
                name: __('Verify via Google', 'multivendorx'),
                enabled:
                    allVerificationMethods?.['google-connect']
                        ?.enable,
            },
            {
                provider: 'facebook',
                icon: 'adminfont-facebook yellow',
                name: __('Verify via Facebook', 'multivendorx'),
                enabled:
                    allVerificationMethods?.['facebook-connect']
                        ?.enable,
            },
            {
                provider: 'twitter',
                icon: 'adminfont-twitter yellow',
                name: __('Verify via Twitter', 'multivendorx'),
                enabled:
                    allVerificationMethods?.['twitter-connect']
                        ?.enable,
            },
        ];

        return socialConfigs
            .map((social) => {
                if (!social.enabled) {
                    return null;
                }

                const buttonConfig = getButtonConfig(social.provider);

                return (
                    <div key={social.provider} className="varification-wrapper">
                        <div className="left">
                            <i className={social.icon}></i>
                            <div className="name">{social.name}</div>
                        </div>
                        <div className="right">
                            <button
                                className={buttonConfig.class}
                                onClick={buttonConfig.action}
                                disabled={buttonConfig.disabled}
                            >
                                {buttonConfig.text}
                            </button>
                        </div>
                    </div>
                );
            })
            .filter(Boolean);
    };

    const handleFileUpload = (file: File, key: string) => {
    const formData = new FormData();
    formData.append('file', file);

    axios({
        method: 'POST',
        url: getApiLink(appLocalizer, 'upload'), // same endpoint FileInputUI was using
        headers: {
            'X-WP-Nonce': appLocalizer.nonce,
        },
        data: formData,
    }).then((res) => {
        const documentUrl = res?.data?.url;
        if (!documentUrl) return;

        const now = new Date().toISOString();

        const updated = {
            ...methodsState,
            [key]: {
                ...methodsState[key],
                document_url: documentUrl,
                status: 'under_review',
                created_at: methodsState[key]?.created_at || now,
                updated_at: now,
            },
        };

        setMethodsState(updated);
        autoSave(updated);
    });
};

    const autoSave = (updatedMethods: Record<string, any>) => {
        axios({
            method: 'POST',
            url: getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: {
                store_identity: {
                    verification_methods: updatedMethods,
                },
            },
        }).then((res) => {
            if (res.data.success) {
                console.log('Saved!');
            }
        });
    };

    const storeStatus = getStoreStatus(
        Object.values(methodsState || {}).map((m: any) => ({
            status: m.status || 'pending',
        }))
    );

    const STATUS_MAP = {
        approved: 'Store Approved',
        rejected: 'Store Rejected',
        under_review: 'Store Under Review',
    };

    return (
        <Container>
            <Column grid={6}>
                <Card
                    title={__('Identity Verification', 'multivendorx')}
                    action={<>{STATUS_MAP[storeStatus]}</>}
                >
                    <ItemListUI
                        className="mini-card"
                        border
                        items={Object.entries(methodsState || {}).map(
                            ([key, method]: any) => ({
                                title: method.title,

                                desc: (
                                    <span
                                        className="doc-link"
                                        style={{ cursor: 'pointer', color: '#6c5ce7' }}
                                        onClick={() => setPreviewUrl(method.document_url)}
                                    >
                                        {method.document_url?.split('/').pop() || ''}
                                    </span>
                                ),
                                tags: (
                                    <>
                                        {/* ✅ STATUS BADGE */}
                                        {method.status && (
                                            <span
                                                className={`admin-badge ${method.status === 'approved'
                                                        ? 'green'
                                                        : method.status === 'rejected'
                                                            ? 'red'
                                                            : 'yellow'
                                                    }`}
                                            >
                                                {method.status.replaceAll('_', ' ')}
                                            </span>
                                        )}

                                        {/* ✅ FILE INPUT */}
                                        <ButtonInputUI
                                            buttons={{
                                                text: method.document_url
                                                    ? __('Replace Document', 'multivendorx')
                                                    : __('Upload Document', 'multivendorx'),
                                                color: 'purple',
                                                onClick: () => {
                                                    if (!wp?.media) return;

                                                    const frame = wp.media({
                                                        title: 'Select or Upload File',
                                                        button: { text: 'Use this file' },
                                                        multiple: false,
                                                    });

                                                    frame.on('select', () => {
                                                        const selected = frame
                                                            .state()
                                                            .get('selection')
                                                            .toJSON();

                                                        const file = selected?.[0];
                                                        if (!file?.url) return;

                                                        const now = new Date().toISOString();

                                                        const updated = {
                                                            ...methodsState,
                                                            [key]: {
                                                                ...methodsState[key],
                                                                document_url: file.url,
                                                                status: 'under_review',
                                                                created_at:
                                                                    methodsState[key]?.created_at || now,
                                                                updated_at: now,
                                                            },
                                                        };

                                                        setMethodsState(updated);
                                                        autoSave(updated);
                                                    });

                                                    frame.open();
                                                },
                                            }}
                                        />

                                        {/* HIDDEN INPUT */}
                                        <input
                                            id={`file-input-${key}`}
                                            type="file"
                                            accept=".pdf,.zip"
                                            style={{ display: 'none' }}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                handleFileUpload(file, key);
                                            }}
                                        />
                                    </>
                                ),
                            })
                        )}
                    />
                </Card>
            </Column>

            {/* RIGHT SIDE */}
            <Column grid={6}>
                <Card title={__('Social Verification', 'multivendorx')}>
                    {renderSocialVerification()}
                </Card>
            </Column>
            <PopupUI
                position="lightbox"
                open={!!previewUrl}
                onClose={() => setPreviewUrl(null)}
                width="80%"
                height="80%"
                header={{
                    title: 'Document Preview',
                }}
            >
                {previewUrl && (
                    previewUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <img
                            src={previewUrl}
                            alt="preview"
                            style={{ width: '100%', height: 'auto' }}
                        />
                    ) : (
                        <iframe
                            src={previewUrl}
                            title="Document"
                            style={{ width: '100%', height: '100%' }}
                        />
                    )
                )}
            </PopupUI>
        </Container>
    );
};

export default Verification;