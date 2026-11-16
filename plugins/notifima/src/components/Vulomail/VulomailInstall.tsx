
import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import axios from 'axios';

import {
    ContainerComponent,
    ColumnComponent,
    ModuleGuardComponent,
} from '@zyra/components';

interface WPPlugin {
    plugin: string;
    status: string;
    name?: string;
}

const VulomailInstall: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pluginSlug = 'vulomail';

    const api = axios.create({
        baseURL: appLocalizer.apiUrl.replace(/\/$/, ''),
        headers: {
            'X-WP-Nonce': appLocalizer.nonce,
            'Content-Type': 'application/json',
        },
    });

    // Redirect to VuloMail logs.
    const redirectToLogs = () => {
        window.location.assign(
            `${appLocalizer.admin_url}admin.php?page=vulomail#&tab=logs`
        );
    };

    // Install or activate VuloMail.
    const installVulomail = async () => {
        if (loading) return;

        setLoading(true);
        setError(null);

        try {
            // Fetch installed plugins.
            const { data: plugins } = await api.get<WPPlugin[]>(
                '/wp/v2/plugins'
            );

            // Find VuloMail.
            const vulomailPlugin = plugins.find(
                ({ plugin }) => plugin.startsWith(`${pluginSlug}/`)
            );

            // Already active.
            if (vulomailPlugin?.status === 'active') {
                redirectToLogs();
                return;
            }

            // Activate existing plugin.
            if (vulomailPlugin) {
                await api.post(
                    `/wp/v2/plugins/${encodeURIComponent(vulomailPlugin.plugin)}`,
                    {
                        status: 'active',
                    }
                );
            } else {
                // Install and activate new plugin.
                await api.post('/wp/v2/plugins', {
                    slug: pluginSlug,
                    status: 'active',
                });
            }

            // Redirect after successful installation.
            redirectToLogs();
        } catch (err: unknown) {
            console.error('VuloMail installation error:', err);

            setError(
                axios.isAxiosError(err)
                    ? err.response?.data?.message || err.message
                    : err instanceof Error
                        ? err.message
                        : __('Unable to install or activate VuloMail.', 'notifima')
            );
        } finally {
            setLoading(false);
        }
    };

    // Redirect if VuloMail is already active.
    if (Boolean(Number(appLocalizer.vulomail_active))) {
        redirectToLogs();
        return null;
    }

    return (
        <ContainerComponent general>
            <ColumnComponent>
                <ModuleGuardComponent
                    title={__(
                        'Looks like VuloMail isn’t active yet!',
                        'notifima'
                    )}
                    desc={
                        error ||
                        __(
                            'Install and activate VuloMail to review and manage your email logs.',
                            'notifima'
                        )
                    }
                    buttonText={
                        loading
                            ? __('Installing...', 'notifima')
                            : __('Install VuloMail', 'notifima')
                    }
                    buttonLink=""
                    onButtonClick={installVulomail}
                />
            </ColumnComponent>
        </ContainerComponent>
    );
};

export default VulomailInstall;
