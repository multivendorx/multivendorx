<?php

namespace MultiVendorX;

defined( 'ABSPATH' ) || exit;

/**
 * @class       MultiVendorX Tracker Class
 *
 * @version     PRODUCT_VERSION
 * @package     MultiVendorX
 * @author 		MultiVendorX

 */
class Tracker {

    private string $slug;
    private string $review_url;
    private string $support_url;
    private string $facebook_url;
    private string $calendy_url;
    private string $pro_shop_url;
    private string $plugin_version;
    private string $settings_url;
    private string $api_url;

    public function __construct() {
        $this->slug = MultiVendorX()->plugin_slug;
        $this->plugin_version = MULTIVENDORX_PLUGIN_VERSION;
        $this->pro_shop_url = MULTIVENDORX_PRO_SHOP_URL;
        $this->review_url = 'https://wordpress.org/support/plugin/'. MultiVendorX()->plugin_slug .'/reviews/#new-post';
        $this->support_url = "https://multivendorx.com/support-forum/";
        $this->facebook_url = "https://www.facebook.com/groups/226246620006065";
        $this->calendy_url = "https://calendly.com/contact-hkdq/30min";
        $this->settings_url = admin_url( 'admin.php?page=multivendorx#&tab=settings&subtab=overview' );
        $this->api_url = 'https://multivendorx.com/wp-json/mvx_thirdparty/v1/users_database_update';

        add_filter( 'plugin_action_links_' . MultiVendorX()->plugin_base, [ $this, 'deactivate_action_links' ] );
        add_action( 'admin_print_footer_scripts-plugins.php', [ $this, 'print_deactivation_form' ] );
        add_action( 'admin_print_styles-plugins.php', [ $this, 'print_deactivation_styles' ] );
        add_action( 'wp_ajax_deactivation_form_' . $this->slug, [ $this, 'handle_form_submit' ] );

        register_deactivation_hook(
            MultiVendorX()->plugin_path . 'dc_product_vendor.php',
            [ $this, 'on_plugin_deactivated' ]
        );
    }

    public function deactivate_action_links( array $links ): array {
        $links['settings'] = '<a href="' . esc_url( $this->settings_url ) . '">'
            . esc_html__( 'Settings', 'multivendorx' ) . '</a>';

        if ( isset( $links['deactivate'] ) ) {
            $links['deactivate'] = $this->wrap_deactivate_link( $links['deactivate'] );
        }

        $links['write_review'] = '<a href="' . esc_url( $this->review_url ) . '" target="_blank" rel="noopener noreferrer">'
            . esc_html__( 'Write a Review', 'multivendorx' ) . '</a>';

        if ( ! Utill::is_khali_dabba() ) {
            $links['go_pro'] = '<a href="' . esc_url( $this->pro_shop_url ) . '" target="_blank" rel="noopener noreferrer">'
                . esc_html__( 'Upgrade to Pro', 'multivendorx' ) . '</a>';
        }

        return $links;
    }

    private function wrap_deactivate_link( string $link ): string {
        $slug = esc_attr( $this->slug );
        $modal = '<div class="modal-wrap" id="modal-' . $slug . '" style="display: none">'
               .     '<div class="modal-bg"></div>'
               .     '<div class="modal-box" id="modal-box-' . $slug . '"></div>'
               . '</div>';

        return str_replace(
            '<a ',
            $modal . '<a id="deactivate-link-' . $slug . '" ',
            $link
        );
    }

    public function on_plugin_deactivated(): void {
        if ( get_option( 'plugin_action_block_notice' ) !== 'yes' ) {
            return;
        }

        $slug = $this->slug;
        $body = $this->get_data();
        $body['status']           = 'Deactivated';
        $body['deactivated_date'] = time();
        $body['deactivation_reason']  = get_option( 'deactivation_reason_'  . $slug, '' );
        $body['deactivation_details'] = get_option( 'deactivation_details_' . $slug, '' );

        $this->send_data( $body );

        delete_option( 'deactivation_reason_'  . $slug );
        delete_option( 'deactivation_details_' . $slug );
    }

    public function print_deactivation_form(): void {
        $slug  = $this->slug;
        $form  = $this->deactivation_reasons();
        $nonce = wp_create_nonce( 'deactivation_nonce' );
        ?>

        <!-- Deactivation Modal -->
        <script type="text/html" id="form-template-<?php echo esc_attr( $slug ); ?>">
            <div class="form-head">
                <?php echo esc_html( $form['heading'] ); ?>
            </div>

            <div class="form-body">
                <p><?php echo esc_html( $form['subtitle'] ); ?></p>

                <div class="support-cards">
                    <a href="<?php echo esc_url( $this->support_url ); ?>" target="_blank" rel="noopener noreferrer" class="support-card">
                        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M15.573,11.624c0.568-0.478,0.947-1.219,0.947-2.019c0-1.37-1.108-2.569-2.371-2.569s-2.371,1.2-2.371,2.569c0,0.8,0.379,1.542,0.946,2.019c-0.253,0.089-0.496,0.2-0.728,0.332c-0.743-0.898-1.745-1.573-2.891-1.911c0.877-0.61,1.486-1.666,1.486-2.812c0-1.79-1.479-3.359-3.162-3.359S4.269,5.443,4.269,7.233c0,1.146,0.608,2.202,1.486,2.812c-2.454,0.725-4.252,2.998-4.252,5.685c0,0.218,0.178,0.396,0.395,0.396h16.203c0.218,0,0.396-0.178,0.396-0.396C18.497,13.831,17.273,12.216,15.573,11.624 M12.568,9.605c0-0.822,0.689-1.779,1.581-1.779s1.58,0.957,1.58,1.779s-0.688,1.779-1.58,1.779S12.568,10.427,12.568,9.605 M5.06,7.233c0-1.213,1.014-2.569,2.371-2.569c1.358,0,2.371,1.355,2.371,2.569S8.789,9.802,7.431,9.802C6.073,9.802,5.06,8.447,5.06,7.233 M2.309,15.335c0.202-2.649,2.423-4.742,5.122-4.742s4.921,2.093,5.122,4.742H2.309z M13.346,15.335c-0.067-0.997-0.382-1.928-0.882-2.732c0.502-0.271,1.075-0.429,1.686-0.429c1.828,0,3.338,1.385,3.535,3.161H13.346z"/></svg>
                        <span><?php esc_html_e( 'Support Forum', 'multivendorx' ); ?></span>
                    </a>
                    <a href="<?php echo esc_url($this->facebook_url); ?>" target="_blank" rel="noopener noreferrer" class="support-card">
                        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10,0.5c-5.247,0-9.5,4.253-9.5,9.5c0,5.247,4.253,9.5,9.5,9.5c5.247,0,9.5-4.253,9.5-9.5C19.5,4.753,15.247,0.5,10,0.5 M10,18.637c-4.77,0-8.636-3.867-8.636-8.637S5.23,1.364,10,1.364S18.637,5.23,18.637,10S14.77,18.637,10,18.637 M10.858,7.949c0-0.349,0.036-0.536,0.573-0.536h0.719v-1.3H11c-1.38,0-1.866,0.65-1.866,1.743v0.845h-0.86V10h0.86v3.887h1.723V10h1.149l0.152-1.299h-1.302L10.858,7.949z"/></svg>
                        <span><?php esc_html_e( 'Facebook Group', 'multivendorx' ); ?></span>
                    </a>
                    <a href="<?php echo esc_url($this->calendy_url); ?>" target="_blank" rel="noopener noreferrer" class="support-card">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.384,17.752a2.108,2.108,0,0,1-.522,3.359,7.543,7.543,0,0,1-5.476.642C10.5,20.523,3.477,13.5,2.247,8.614a7.543,7.543,0,0,1,.642-5.476,2.108,2.108,0,0,1,3.359-.522L8.333,4.7a2.094,2.094,0,0,1,.445,2.328A3.877,3.877,0,0,1,8,8.2c-2.384,2.384,5.417,10.185,7.8,7.8a3.877,3.877,0,0,1,1.173-.781,2.092,2.092,0,0,1,2.328.445Z"/></svg>
                        <span><?php esc_html_e( 'Book a Call', 'multivendorx' ); ?></span>
                    </a>
                </div>

                <p><?php echo esc_html( $form['reason_label'] ); ?></p>

                <ul class="deactivation-reasons">
                    <?php foreach ( $form['options'] as $option ) :
                        $label     = is_array( $option ) ? $option['label'] : $option;
                        $id        = 'deactivate-reason-' . sanitize_title( $label );
                        $has_extra = is_array( $option ) && ! empty( $option['extra_field'] );
                        $is_textarea = $has_extra && ( $option['type'] ?? '' ) === 'textarea';
                    ?>
                        <li>
                            <input type="radio" name="deactivate-reason" id="<?php echo esc_attr( $id ); ?>" value="<?php echo esc_attr( $label ); ?>">
                            <label for="<?php echo esc_attr( $id ); ?>"><?php echo esc_html( $label ); ?></label>
                            <?php if ( $has_extra ) : ?>
                                <?php if ( $is_textarea ) : ?>
                                    <textarea class="extra-field" placeholder="<?php echo esc_attr( $option['extra_field'] ); ?>"></textarea>
                                <?php else : ?>
                                    <input type="text" class="extra-field" placeholder="<?php echo esc_attr( $option['extra_field'] ); ?>">
                                <?php endif; ?>
                            <?php endif; ?>
                        </li>
                    <?php endforeach; ?>
                </ul>

                <div class="data-notice">
                    <?php esc_html_e( 'We collect non-sensitive diagnostic data and plugin usage information along with your feedback.', 'multivendorx' ); ?>
                </div>
            </div>

            <div class="form-footer">
                <a class="footer-button button-skip" href="#"><?php esc_html_e( 'Skip & Deactivate', 'multivendorx' ); ?></a>
                <button type="button" class="footer-button button-submit"><?php esc_html_e( 'Submit & Deactivate', 'multivendorx' ); ?></button>
            </div>
        </script>

        <script>
        jQuery(function($) {
            var slug      = <?php echo wp_json_encode( $slug ); ?>;
            var nonce     = <?php echo wp_json_encode( $nonce ); ?>;
            var ajaxUrl   = <?php echo wp_json_encode( admin_url( 'admin-ajax.php' ) ); ?>;
            var template  = $( '#form-template-' + slug ).html();

            var $modal    = $( '#modal-' + slug );
            var $box      = $( '#modal-box-' + slug );
            var $bg       = $modal.find( '.modal-bg' );

            // Populate box once
            $box.html( template );
            $box.find( '.extra-field' ).hide();
            $modal.hide();

            var deactivateUrl = '';

            // Open modal
            $( '#deactivate-link-' + slug ).on( 'click', function(e) {
                e.preventDefault();
                deactivateUrl = $( this ).attr( 'href' );
                $modal.show();
                $box.find( '.button-skip' ).attr( 'href', deactivateUrl );
            });

            // Show extra field when radio selected
            $box.on( 'change', 'input[type="radio"]', function() {
                $box.find( '.extra-field' ).hide();
                $( this ).closest( 'li' ).find( '.extra-field' ).show();
            });

            // Submit
            $box.on( 'click', '.button-submit', function() {
                var $checked = $box.find( 'input[name="deactivate-reason"]:checked' );
                var reason   = $checked.length ? $checked.val() : 'No Reason';
                var details  = $checked.closest( 'li' ).find( '.extra-field' ).val() || '';

                $box.find( '.form-body, .form-footer' ).hide();
                $box.find( '.form-head' ).after( '<p><span class="spinner is-active"></span> <?php esc_html_e( 'Submitting…', 'multivendorx' ); ?></p>' );

                $.post( ajaxUrl, {
                    action   : 'deactivation_form_' + slug,
                    values   : reason,
                    details  : details,
                    security : nonce
                }).always(function() {
                    window.location.href = deactivateUrl;
                });
            });

            $bg.on( 'click', function() {
                $modal.hide();
            });
        });
        </script>
        <?php
    }

    public function handle_form_submit(): void {
        check_ajax_referer( 'deactivation_nonce', 'security' );

        if ( ! current_user_can( 'activate_plugins' ) ) {
            wp_send_json_error( 'Insufficient permissions.', 403 );
        }

        $slug    = $this->slug;
        $reason  = sanitize_text_field( wp_unslash( filter_input( INPUT_POST, 'values'  ) ?? '' ) );
        $details = sanitize_text_field( wp_unslash( filter_input( INPUT_POST, 'details' ) ?? '' ) );

        update_option( 'deactivation_reason_'  . $slug, $reason,  false );
        update_option( 'deactivation_details_' . $slug, $details, false );

        $mailer = WC()->mailer()->emails['WC_Email_Plugin_Deactivated_Mail'] ?? null;
        if ( $mailer ) {
            $mailer->trigger( get_current_user_id() );
        }

        wp_send_json_success();
    }

    private function deactivation_reasons(): array {
        $form = [
            'heading'      => __( "We're sorry to see you leave 😔", 'multivendorx' ),
            'subtitle'     => __( "Thinking about deactivating? We're here to help — contact us anytime.", 'multivendorx' ),
            'reason_label' => __( 'Would you quickly share your reason for deactivating?', 'multivendorx' ),
            'options'      => [
                __( 'I no longer need the plugin', 'multivendorx' ),
                [
                    'label'       => __( 'I found a better plugin', 'multivendorx' ),
                    'extra_field' => __( 'Please share which plugin', 'multivendorx' ),
                ],
                __( "I couldn't get the plugin to work", 'multivendorx' ),
                __( "It's a temporary deactivation", 'multivendorx' ),
                [
                    'label'       => __( 'Other', 'multivendorx' ),
                    'extra_field' => __( 'Please share the reason', 'multivendorx' ),
                    'type'        => 'textarea',
                ],
            ],
        ];

        return $form;
    }

    public function get_data(): array {
        if ( ! function_exists( 'get_plugins' ) ) {
            require_once ABSPATH . '/wp-admin/includes/plugin.php';
        }
        if ( ! function_exists( 'wp_get_current_user' ) ) {
            require_once ABSPATH . 'wp-includes/pluggable.php';
        }

        $all_plugins    = array_keys( get_plugins() );
        $active_plugins = is_network_admin()
            ? array_keys( get_site_option( 'active_sitewide_plugins', [] ) )
            : (array) get_option( 'active_plugins', [] );

        $user     = wp_get_current_user();
        $user_one = get_userdata( 1 );
        $theme    = wp_get_theme();

        return [
            'plugin_slug'      => $this->slug,
            'plugin_version'   => $this->plugin_version,
            'url'              => get_bloginfo( 'url' ),
            'site_name'        => get_bloginfo( 'name' ),
            'site_version'     => get_bloginfo( 'version' ),
            'site_language'    => get_bloginfo( 'language' ),
            'charset'          => get_bloginfo( 'charset' ),
            'php_version'      => phpversion(),
            'multisite'        => is_multisite(),
            'text_direction'   => function_exists( 'is_rtl' ) ? ( is_rtl() ? 'RTL' : 'LTR' ) : 'NOT SET',
            'server'           => sanitize_text_field( wp_unslash( $_SERVER['SERVER_SOFTWARE'] ?? '' ) ),
            'email'            => implode( ',', array_filter( [
                                    $user->user_email ?? '',
                                    $user_one ? $user_one->data->user_email : '',
                                    get_option( 'admin_email', '' ),
                                  ] ) ),
            'active_plugins'   => maybe_serialize( $active_plugins ),
            'inactive_plugins' => maybe_serialize( array_values( array_diff( $all_plugins, $active_plugins ) ) ),
            'theme'            => sanitize_text_field( $theme->Name    ?? '' ),
            'theme_version'    => sanitize_text_field( $theme->Version ?? '' ),
            'status'           => 'Active',
        ];
    }

    public function send_data( array $body ): void {
        $slug         = $this->slug;
        $site_id_key  = "{$slug}_site_id";
        $orig_url_key = "{$slug}_original_url";
        $site_url     = get_bloginfo( 'url' );

        $site_id  = get_option( $site_id_key,  false );
        $orig_url = get_option( $orig_url_key, false );

        // Reset if site URL changed
        if ( $orig_url !== false && $orig_url !== $site_url ) {
            $site_id = false;
        }

        if ( $site_id !== false ) {
            return; // Already registered
        }

        $ip = $_SERVER['REMOTE_ADDR'] ?? '';
        if ( $ip && $ip !== '127.0.0.1' && filter_var( $ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE ) ) {
            $geo = wp_remote_get( 'https://ip-api.com/json/' . rawurlencode( $ip ) . '?fields=country' );
            if ( ! is_wp_error( $geo ) && wp_remote_retrieve_response_code( $geo ) === 200 ) {
                $geo_data        = json_decode( wp_remote_retrieve_body( $geo ) );
                $body['country'] = sanitize_text_field( $geo_data->country ?? 'NOT SET' );
            }
        }

        $body['plugin_slug'] = $slug;
        $body['url']         = $site_url;

        $response = wp_remote_post( $this->api_url, [
            'method'      => 'POST',
            'timeout'     => 30,
            'httpversion' => '1.1',
            'body'        => $body,
            'user-agent'  => 'PUT/1.0.0; ' . $site_url,
        ] );

        if ( is_wp_error( $response ) || wp_remote_retrieve_response_code( $response ) !== 200 ) {
            return;
        }

        $result = json_decode( wp_remote_retrieve_body( $response ), true );
        if ( is_array( $result ) && isset( $result['siteId'] ) ) {
            $sid = $result['siteId'];
            update_option( $site_id_key,                   $sid,      false );
            update_option( $orig_url_key,                  $site_url, false );
            update_option( "{$slug}_{$sid}", $body,     false );
        }
    }

    public function print_deactivation_styles(): void {
        ?>
        <style>
        .modal-wrap {
            position: fixed; inset: 0;
            display: flex; align-items: center; justify-content: center;
            z-index: 99999;
        }
        .modal-bg {
            position: absolute; inset: 0;
            background: rgba(0,0,0,.75);
        }
        .modal-box {
            position: relative; z-index: 1;
            width: 35%; max-width: 90vw; max-height: 85vh;
            background: #fff; border-radius: .375rem;
            overflow-y: auto;
            box-shadow: 0 .5rem 2rem rgba(0,0,0,.25);
        }

        .form-head {
            padding: 1.25rem; text-align: center;
            border-bottom: 0.063rem solid #eee; font-size: 1.625rem; color: #333;
            font-weight: 600;
        }

        .form-body { padding: 1.25rem; color: #444; }
        .form-body p { margin: 0 0 1rem; font-size: .9rem; line-height: 1.5; }

        .support-cards {
            display: flex; gap: .75rem;
            margin-bottom: 1.25rem;
        }
        .support-card {
            flex: 1 0 6rem; padding: 1rem .75rem;
            border: 0.063rem solid #dbdbdb; border-radius: .25rem;
            display: flex; flex-direction: column; align-items: center; gap: .5rem;
            text-decoration: none; color: #5007aa; font-size: .8rem; text-align: center;
            transition: background .2s;
        }
        .support-card  span{
            font-size: 0.95rem;
            font-weight: 500;
        }
        .support-card:hover { background: #f5f0fb; }
        .support-card:hover span{ color: #5007aa; }
        .support-card svg { width: 2rem; height: 2rem; fill: #5007aa; }

        /* ── Reasons list ── */
        .deactivation-reasons { margin: 0 0 1rem; padding: 0; list-style: none; }
        .deactivation-reasons li { margin-bottom: .75rem; }
        .deactivation-reasons label { margin-left: .4rem; color: #555; cursor: pointer; }
        .deactivation-reasons .extra-field {
            display: block; margin-top: .5rem; margin-left: 1.4rem;
            width: calc(100% - 1.4rem); padding: .4rem .5rem;
            border: 0.063rem solid #ccc; border-radius: .25rem; font-size: .875rem;
        }
        .deactivation-reasons textarea.extra-field { height: 5rem; resize: vertical; }

        .data-notice {
            border: .063rem solid #5007aa;
            border-radius: .25rem;
            box-sizing: border-box;
            display: flex;
            gap: .5rem;
            padding: .5rem .8rem;
            background: #ece2f9f1;
            color: #5007aa;
            font-size: 0.813rem;
            font-weight: 500;
        }

        .form-footer {
            display: flex; justify-content: flex-end; align-items: center; gap: .75rem;
            padding: 1rem 1.25rem;
            border-top: 0.063rem solid #eee;
            position: sticky; bottom: 0; background: #fff;
        }
        .footer-button {
            padding: .6rem 1.2rem; border-radius: .25rem;
            font-size: .875rem; font-weight: 500; cursor: pointer;
            text-decoration: none; border: none; display: inline-block;
        }
        .button-skip {
            background: #fff3f1; color: #ef9587;
        }
        .button-skip:hover { background: #e0e0e0; color: #333; }
        .button-submit {
            background: #5007aa;
            color: #fff;
        }
        </style>
        <?php
    }
}