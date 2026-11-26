<?php
/**
 * Templates class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Integrations\VuloMail;

defined( 'ABSPATH' ) || exit;

/**
 * Registers MultiVendorX's remaining one-off admin emails with VuloMail
 * (`vulomail_email_templates`), so their subject/content are editable there -- the single
 * source of truth `Integration::send()` reads from, instead of the old (unregistered, dead)
 * `WC_Email_Send_Site_Information`/`WC_Email_Plugin_Deactivated_Mail` classes.
 *
 * MultiVendorX's own marketplace notifications (order/commission/etc.) already go through
 * `Notifications::trigger_notifications()`'s plain `wp_mail()` calls, transparently
 * intercepted by VuloMail site-wide -- these two are the only emails left that were still
 * reaching for `WC()->mailer()->emails[...]`.
 */
class Templates {

    const SITE_INFORMATION  = 'multivendorx/site-information';
    const PLUGIN_DEACTIVATED = 'multivendorx/plugin-deactivated';

    /**
     * Templates constructor.
     */
    public function __construct() {
        add_filter( 'vulomail_email_templates', array( $this, 'add_templates' ) );
        add_filter( 'vulomail_email_template_categories', array( $this, 'add_category' ) );
    }

    /**
     * @param array $templates Existing templates, `plugin/name` => {title, description, category, ...}.
     * @return array
     */
    public function add_templates( $templates ) {
        return array_merge( $templates, self::defaults() );
    }

    /**
     * @param array $categories Existing categories, slug => label.
     * @return array
     */
    public function add_category( $categories ) {
        $categories['multivendorx'] = __( 'MultiVendorX', 'multivendorx' );

        return $categories;
    }

    /**
     * The default subject/content for every email `Integration::send()` knows how to send -- used
     * to register them with VuloMail, and as the fallback when VuloMail isn't active.
     *
     * @return array `plugin/name` => {title, description, category, group, recipients, subject, content}
     */
    public static function defaults() {
        return array(
            self::SITE_INFORMATION   => array(
                'title'       => __( 'Site information shared', 'multivendorx' ),
                'description' => __( 'Sent to the site owner after they agree to share site information and usage data on plugin deactivation.', 'multivendorx' ),
                'category'    => 'multivendorx',
                'group'       => __( 'Deactivation', 'multivendorx' ),
                'recipients'  => array( 'customer' ),
                'subject'     => __( 'Thanks for sharing your site information, {user_name}', 'multivendorx' ),
                'content'     => '<h2>' . esc_html__( 'Thank you!', 'multivendorx' ) . '</h2><p>' . esc_html__( 'We received your site information and usage data. As a thank you, we have created a discount coupon for your next purchase.', 'multivendorx' ) . '</p><p>' . esc_html__( 'This was sent to {user_email}.', 'multivendorx' ) . '</p>',
            ),
            self::PLUGIN_DEACTIVATED => array(
                'title'       => __( 'Plugin deactivation feedback (admin notification)', 'multivendorx' ),
                'description' => __( 'Sent to the site admin when a user submits the deactivation-feedback form.', 'multivendorx' ),
                'category'    => 'multivendorx',
                'group'       => __( 'Deactivation', 'multivendorx' ),
                'recipients'  => array( 'admin' ),
                'subject'     => __( 'MultiVendorX deactivation feedback: {reason}', 'multivendorx' ),
                'content'     => '<h2>' . esc_html__( 'Deactivation feedback received', 'multivendorx' ) . '</h2><p><strong>' . esc_html__( 'Reason:', 'multivendorx' ) . '</strong> {reason}</p><p><strong>' . esc_html__( 'Details:', 'multivendorx' ) . '</strong><br>{details}</p>',
            ),
        );
    }
}
