/* global appLocalizer */
import { __ } from '@wordpress/i18n';
import './email-logs.scss';

interface Feature {
    icon: string;
    title: string;
    description: string;
}

const FEATURES: Feature[] = [
    {
        icon: 'email-alt',
        title: __( 'Never miss a restock alert', 'notifima' ),
        description: __(
            'See exactly which back-in-stock notification emails were sent, delivered, opened, or bounced for every subscriber.',
            'notifima'
        ),
    },
    {
        icon: 'warning',
        title: __( 'Catch delivery failures early', 'notifima' ),
        description: __(
            'Spot bounced or blocked restock emails before customers complain, and resend a failed notification in one click.',
            'notifima'
        ),
    },
    {
        icon: 'index-card',
        title: __( 'One log for every store email', 'notifima' ),
        description: __(
            'Back-in-stock alerts sit alongside every other transactional and WooCommerce email your store sends, in a single searchable log.',
            'notifima'
        ),
    },
    {
        icon: 'media-text',
        title: __( 'Full email content, on demand', 'notifima' ),
        description: __(
            'Open the exact HTML that was sent to a subscriber to confirm pricing, stock status, and links were correct at send time.',
            'notifima'
        ),
    },
];

const EmailLogs = () => {
    const isVuloMailActive = Boolean( appLocalizer.vulomail?.is_vulomail_active );

    if ( isVuloMailActive ) {
        return (
            <section className="nf-el-hero is-active">
                <div className="nf-el-hero-text">
                    <span className="nf-el-pill is-active">
                        <i className="dashicons dashicons-yes-alt" aria-hidden="true" />
                        { __( 'VuloMail', 'notifima' ) }
                    </span>
                    <h1>{ __( 'VuloMail is installed and active', 'notifima' ) }</h1>
                    <p>
                        { __(
                            'Every back-in-stock email Notifima sends is already being logged there - open VuloMail’s Email Logs to see delivery status, content, and history.',
                            'notifima'
                        ) }
                    </p>
                    <a className="nf-el-btn" href={ appLocalizer.vulomail.email_logs_url }>
                        <i className="dashicons dashicons-list-view" aria-hidden="true" />
                        { __( 'Open VuloMail Email Logs', 'notifima' ) }
                    </a>
                </div>
                <span className="nf-el-hero-badge is-active">
                    <i className="dashicons dashicons-yes-alt" aria-hidden="true" />
                </span>
            </section>
        );
    }

    return (
        <>
            <section className="nf-el-hero">
                <div className="nf-el-hero-text">
                    <span className="nf-el-pill">
                        <i className="dashicons dashicons-email-alt" aria-hidden="true" />
                        { __( 'VuloMail', 'notifima' ) }
                    </span>
                    <h1>
                        { __(
                            'Track every back-in-stock email Notifima sends',
                            'notifima'
                        ) }
                    </h1>
                    <p>
                        { __(
                            'Notifima sends restock notification emails, but it doesn’t keep a log of them. Install VuloMail - our free email logging plugin - to see the delivery status, content, and history of every notification Notifima sends.',
                            'notifima'
                        ) }
                    </p>
                    <div className="nf-el-hero-actions">
                        <a className="nf-el-btn is-large" href={ appLocalizer.vulomail.install_url }>
                            <i className="dashicons dashicons-download" aria-hidden="true" />
                            { __( 'Install VuloMail', 'notifima' ) }
                        </a>
                        <span className="nf-el-note">
                            <i className="dashicons dashicons-shield" aria-hidden="true" />
                            { __( 'Free & built by MultiVendorX', 'notifima' ) }
                        </span>
                    </div>
                </div>
                <span className="nf-el-hero-badge">
                    <i className="dashicons dashicons-email-alt" aria-hidden="true" />
                </span>
            </section>

            <div className="nf-el-features">
                { FEATURES.map( ( feature ) => (
                    <div className="nf-el-feature" key={ feature.title }>
                        <span className="nf-el-feature-icon">
                            <i className={ `dashicons dashicons-${ feature.icon }` } aria-hidden="true" />
                        </span>
                        <div className="nf-el-feature-body">
                            <strong>{ feature.title }</strong>
                            <span>{ feature.description }</span>
                        </div>
                    </div>
                ) ) }
            </div>

            <section className="nf-el-cta">
                <div>
                    <h3>{ __( 'Set it up once, see every email forever', 'notifima' ) }</h3>
                    <p>
                        { __(
                            'Installing VuloMail takes a minute and needs no configuration - Notifima’s emails start appearing in its log right away.',
                            'notifima'
                        ) }
                    </p>
                </div>
                <a className="nf-el-btn is-light" href={ appLocalizer.vulomail.install_url }>
                    <i className="dashicons dashicons-download" aria-hidden="true" />
                    { __( 'Install VuloMail', 'notifima' ) }
                </a>
            </section>
        </>
    );
};

export default EmailLogs;
