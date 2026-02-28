// FreeVsProTab.tsx

import React, { useEffect, useState } from 'react';
import { AdminButtonUI, Card, Column, Modules ,ItemListUI,} from 'zyra';
import { __ } from '@wordpress/i18n';
import { getModuleData } from '../../services/templateService';
import axios from 'axios';
import proPopupContent from '../Popup/Popup';
import Mascot from '../../assets/images/multivendorx-mascot-scale.png';
import catalogx from '../../assets/images/catalogx.png';
import notifima from '../../assets/images/brand-icon.png';

interface WPPlugin {
    plugin?: string;
    status?: string;
}

const DashboardTab: React.FC<{}> = () => {
    const [installing, setInstalling] = useState<string>('');
    const [pluginStatus, setPluginStatus] = useState<{
        [key: string]: boolean;
    }>({});
    const [successMsg, setSuccessMsg] = useState<string>('');
    const [plugins, setPlugins] = useState<WPPlugin[]>([]);

    const modulesArray = getModuleData();
	const isPro = !!appLocalizer.khali_dabba;

	const renderUpgradeButton = (label = __('Upgrade Now', 'multivendorx')) => {
		if (isPro) {
			return null;
		}
		return (
			<a
				href={appLocalizer.shop_url}
				target="_blank"
				className="admin-btn btn-purple"
			>
				<i className="adminfont-pro-tag"></i>
				{__(label, 'multivendorx')}
				<i className="adminfont-arrow-right icon-pro-btn"></i>
			</a>
		);
	};

    useEffect(() => {
        fetchPlugins();
    }, []);

    const fetchPlugins = () => {
        axios
            .get(`${appLocalizer.apiUrl}/wp/v2/plugins`, {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
            })
            .then((response) => {
                const pluginList = response.data;

                setPlugins(pluginList);

                const statusMap: Record<string, boolean> = {};

                [
                    'woocommerce-catalog-enquiry',
                    'woocommerce-product-stock-alert',
                ].forEach((slug) => {
                    statusMap[slug] = pluginList.some(
                        (plugin: WPPlugin) =>
                            plugin.plugin.includes(slug) &&
                            plugin.status === 'active'
                    );
                });

                setPluginStatus(statusMap);
            })
            .catch((error) => {
                console.error('Failed to fetch plugins:', error);
            });
    };
    const installOrActivatePlugin = (slug: string) => {
        if (!slug || installing) {
            return;
        }

        setInstalling(slug);

        let apiUrl = `${appLocalizer.apiUrl}/wp/v2/plugins`;
        let requestData: any = { status: 'active' };

        const existingPlugin = plugins.find((plugin) =>
            plugin.plugin.includes(slug)
        );

        if (!existingPlugin) {
            requestData.slug = slug;
        } else if (existingPlugin.status === 'active') {
            setSuccessMsg(`Plugin "${slug}" is already active.`);
            setInstalling('');
            return;
        } else {
            const encodedFile = encodeURIComponent(existingPlugin.plugin);
            apiUrl += `/${encodedFile}`;
        }

        axios
            .post(apiUrl, requestData, {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
            })
            .then((response) => {
                if (!existingPlugin) {
                    setPlugins((prev) => [...prev, response.data]);
                } else {
                    setPlugins((prev) =>
                        prev.map((p) =>
                            p.plugin === existingPlugin.plugin
                                ? { ...p, status: 'active' }
                                : p
                        )
                    );
                }

                setPluginStatus((prev) => ({
                    ...prev,
                    [slug]: true,
                }));

                setSuccessMsg(
                    `Plugin "${slug}" ${existingPlugin ? 'activated' : 'installed & activated'
                    } successfully!`
                );
            })
            .catch((error) => {
                console.error(error);
                setSuccessMsg(`Failed to install/activate plugin "${slug}".`);
            })
            .finally(() => {
                setTimeout(() => setSuccessMsg(''), 3000);
                setInstalling('');
            });
    };

    const resources = [
        {
            title: __('Documentation', 'multivendorx'),
            desc: __('Step-by-step guides to set up and manage your marketplace.', 'multivendorx'),
            iconClass: 'adminfont-book',
            linkText: __('Explore Docs', 'multivendorx'),
            href: 'https://multivendorx.com/docs/knowledgebase/',
        },
        {
            title: __('Expert consultation', 'multivendorx'),
            desc: __('Get tailored advice from our marketplace specialists.', 'multivendorx'),
            iconClass: 'adminfont-preview',
            linkText: __('Book Consultation', 'multivendorx'),
            href: 'https://multivendorx.com/custom-development/',
        },
        {
            title: __('Developer community', 'multivendorx'),
            desc: __('Connect with our team and fellow builders on Discord.', 'multivendorx'),
            iconClass: 'adminfont-global-community',
            linkText: __('Join Discord', 'multivendorx'),
            href: 'https://discord.com/channels/1376811097134469191/1376811102020829258',
        },
        {
            title: __('Facebook group', 'multivendorx'),
            desc: __('Share experiences and tips with other marketplace owners.', 'multivendorx'),
            iconClass: 'adminfont-user-circle',
            linkText: __('Join Group', 'multivendorx'),
            href: 'https://www.facebook.com/groups/226246620006065/',
        },
    ];

    const featuresList = [
        {
            title: __('Membership rewards & commission', 'multivendorx'),
            desc: __('Charge your sellers a monthly or yearly membership fee to sell on your marketplace - predictable revenue every month.', 'multivendorx'),
            icon: 'adminfont-commission',
            linkText: __('Join Discord', 'multivendorx'),
            href: '#',
        },
        {
            title: __('Verified stores only', 'multivendorx'),
            desc: __('Screen stores with document verification and approval - build a trusted marketplace from day one.', 'multivendorx'),
            icon: 'adminfont-verification3',
            linkText: __('Join Discord', 'multivendorx'),
            href: '#',
        },
        {
            title: __('Diversified marketplace', 'multivendorx'),
            desc: __('Enable bookings, subscriptions, and auctions to boost sales and engagement.', 'multivendorx'),
            icon: 'adminfont-marketplace',
            linkText: __('Explore Docs', 'multivendorx'),
            href: '#',
        },
        {
            title: __('Vacation mode for stores', 'multivendorx'),
            desc: __('Stores can pause their stores temporarily with automatic buyer notifications - no missed messages.', 'multivendorx'),
            icon: 'adminfont-vacation',
            linkText: __('Explore Docs', 'multivendorx'),
            href: '#',
        },
        {
            title: __('Never run out of stock', 'multivendorx'),
            desc: __('Real-time inventory tracking with automatic low-stock alerts keeps sellers prepared and buyers happy.', 'multivendorx'),
            icon: 'adminfont-global-community',
            linkText: __('Book Consultation', 'multivendorx'),
            href: '#',
        },
        {
            title: __('Autopilot notifications', 'multivendorx'),
            desc: __('Automatic emails and alerts for every order, refund, and payout - everyone stays in the loop.', 'multivendorx'),
            icon: 'adminfont-notification',
            linkText: __('Join Discord', 'multivendorx'),
            href: '#',
        },
    ];

    return (
        <>
            <Column grid={8}>
                <Card contentHeight>
                    <div className="pro-banner-wrapper">
                        <div className="content">
                            <div className="heading">
                                {__(
                                    'Welcome to MultiVendorX',
                                    'multivendorx'
                                )}
                            </div>
                            <div className="description">
                                {__(
                                    'Expand your WooCommerce store by creating a marketplace for multiple stores. Manage, grow, and scale seamlessly.',
                                    'multivendorx'
                                )}
                            </div>

                            <div className="button-wrapper">
                                {renderUpgradeButton(
                                    __('Upgrade Now', 'multivendorx')
                                )}

                                <div
                                    className="admin-btn"
                                    onClick={() =>
                                    (window.location.href =
                                        '?page=multivendorx-setup')
                                    }
                                >
                                    {__(
                                        'Launch Setup Wizard',
                                        'multivendorx'
                                    )}
                                    <i className="adminfont-import"></i>
                                </div>
                            </div>
                        </div>

                        <div className="image">
                            <img src={Mascot} alt="" />
                        </div>
                    </div>
                </Card>
                {!appLocalizer.khali_dabba && (
                    <Card
                        title={__(
                            'Build a professional marketplace',
                            'multivendorx'
                        )}
                        badge={[
                            {
                                text: 'Starting at $299/year',
                                color: 'blue',
                            },
                        ]}
                        desc={__(
                            'Unlock advanced features and premium modules to create a marketplace that stands out.',
                            'multivendorx'
                        )}
                    >
                        <ItemListUI
                            className="feature-list"
                            items={featuresList.map(
                                ({ icon, title, desc }) => ({
                                    icon: icon,
                                    title: title,
                                    desc: desc,
                                })
                            )}
                        />
                        <div className="pro-banner">
                            <div className="text">
                                {__(
                                    'Join 8,000+ successful marketplace owners',
                                    'multivendorx'
                                )}
                            </div>
                            <div className="des">
                                {__(
                                    'Create, manage, and grow your marketplace with confidence. Trusted by thousands of entrepreneurs worldwide.',
                                    'multivendorx'
                                )}
                            </div>

                            {renderUpgradeButton(
                                __('Upgrade Now', 'multivendorx')
                            )}

                            <div className="des">
                                {__(
                                    '15-day money-back guarantee',
                                    'multivendorx'
                                )}
                            </div>
                        </div>
                    </Card>
                )}
                <Card
                    contentHeight
                    title={__('Modules', 'multivendorx')}
                    action={
                        <AdminButtonUI
                            buttons={[
                                {
                                    icon: 'eye',
                                    text: __(
                                        'View All',
                                        'multivendorx'
                                    ),
                                    color: 'purple',
                                    onClick: () => {
                                        window.open(
                                            '?page=multivendorx#&tab=modules'
                                        );
                                    },
                                },
                            ]}
                        />
                    }
                >
                    <Modules
                        modulesArray={modulesArray}
                        appLocalizer={appLocalizer}
                        apiLink="modules"
                        proPopupContent={proPopupContent}
                        pluginName="multivendorx"
                        variant="mini-module"
                    />
                </Card>
            </Column>

            {/* Right Side */}
            <Column grid={4}>
                <Card
                    contentHeight
                    title={__('Extend your website', 'multivendorx')}
                >
                    <Column row>
                        {pluginStatus['woocommerce-catalog-enquiry'] ? (
                            <ItemListUI
                                className="mini-card"
                                background
                                items={[
                                    {
                                        title: __(
                                            'CatalogX Pro',
                                            'multivendorx'
                                        ),
                                        desc: __(
                                            'Advanced product catalog with enhanced enquiry features and premium templates',
                                            'multivendorx'
                                        ),
                                        img: catalogx,
                                        tags: (
                                            <>
                                                <span className="admin-badge red">
                                                    <i className="adminfont-pro-tag"></i>{' '}
                                                    {__(
                                                        'Pro',
                                                        'multivendorx'
                                                    )}
                                                </span>
                                                <a
                                                    href="https://catalogx.com/pricing/"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {__(
                                                        'Get Pro',
                                                        'multivendorx'
                                                    )}
                                                </a>
                                            </>
                                        ),
                                    },
                                ]}
                            />
                        ) : (
                            <ItemListUI
                                className="mini-card"
                                background
                                items={[
                                    {
                                        title: __(
                                            'CatalogX',
                                            'multivendorx'
                                        ),
                                        desc: __(
                                            'Turn your store into a product catalog with enquiry-based sales',
                                            'multivendorx'
                                        ),
                                        img: catalogx,
                                        tags: (
                                            <>
                                                <span className="admin-badge green">
                                                    {__(
                                                        'Free',
                                                        'multivendorx'
                                                    )}
                                                </span>
                                                <a
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (
                                                            !installing
                                                        ) {
                                                            installOrActivatePlugin(
                                                                'woocommerce-catalog-enquiry'
                                                            );
                                                        }
                                                    }}
                                                    style={{
                                                        pointerEvents:
                                                            installing
                                                                ? 'none'
                                                                : 'auto',
                                                        opacity:
                                                            installing ===
                                                                'woocommerce-catalog-enquiry'
                                                                ? 0.6
                                                                : 1,
                                                    }}
                                                >
                                                    {installing ===
                                                        'woocommerce-catalog-enquiry'
                                                        ? __(
                                                            'Installing...',
                                                            'multivendorx'
                                                        )
                                                        : __(
                                                            'Install',
                                                            'multivendorx'
                                                        )}
                                                </a>
                                            </>
                                        ),
                                    },
                                ]}
                            />
                        )}

                        {pluginStatus[
                            'woocommerce-product-stock-alert'
                        ] ? (
                            <ItemListUI
                                className="mini-card"
                                background
                                items={[
                                    {
                                        title: __(
                                            'Notifima Pro',
                                            'multivendorx'
                                        ),
                                        desc: __(
                                            'Advanced stock alerts, wishlist features, and premium notification system',
                                            'multivendorx'
                                        ),
                                        img: notifima,
                                        tags: (
                                            <>
                                                <span className="admin-badge red">
                                                    <i className="adminfont-pro-tag"></i>{' '}
                                                    {__(
                                                        'Pro',
                                                        'multivendorx'
                                                    )}
                                                </span>
                                                <a
                                                    href="https://notifima.com/pricing/"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {__(
                                                        'Get Pro',
                                                        'multivendorx'
                                                    )}
                                                </a>
                                            </>
                                        ),
                                    },
                                ]}
                            />
                        ) : (
                            <ItemListUI
                                className="mini-card"
                                background
                                items={[
                                    {
                                        title: __(
                                            'Notifima',
                                            'multivendorx'
                                        ),
                                        desc: __(
                                            'Advanced stock alerts and wishlist features for WooCommerce',
                                            'multivendorx'
                                        ),
                                        img: notifima,
                                        tags: (
                                            <>
                                                <span className="admin-badge green">
                                                    {__(
                                                        'Free',
                                                        'multivendorx'
                                                    )}
                                                </span>
                                                <a
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (
                                                            !installing
                                                        ) {
                                                            installOrActivatePlugin(
                                                                'woocommerce-product-stock-alert'
                                                            );
                                                        }
                                                    }}
                                                    style={{
                                                        pointerEvents:
                                                            installing
                                                                ? 'none'
                                                                : 'auto',
                                                        opacity:
                                                            installing ===
                                                                'woocommerce-product-stock-alert'
                                                                ? 0.6
                                                                : 1,
                                                    }}
                                                >
                                                    {installing ===
                                                        'woocommerce-product-stock-alert'
                                                        ? __(
                                                            'Installing...',
                                                            'multivendorx'
                                                        )
                                                        : __(
                                                            'Install',
                                                            'multivendorx'
                                                        )}
                                                </a>
                                            </>
                                        ),
                                    },
                                ]}
                            />
                        )}
                    </Column>
                </Card>

                {/* Quick Links */}
                <Card
                    contentHeight
                    title={__(
                        'Need help getting started?',
                        'multivendorx'
                    )}
                >
                    <div className="cards-wrapper quick-link">
                        {resources.map((res, index) => (
                            <div className="cards" key={index}>
                                <div className="header">
                                    <i
                                        className={`icon ${res.iconClass}`}
                                    ></i>
                                    <a href={res.href} target="blank">
                                        {__(
                                            res.linkText,
                                            'multivendorx'
                                        )}
                                        <i className="adminfont-external"></i>
                                    </a>
                                </div>
                                <h3>{__(res.title, 'multivendorx')}</h3>
                                <p>{__(res.desc, 'multivendorx')}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </Column>
        </>
    );
};

export default DashboardTab;