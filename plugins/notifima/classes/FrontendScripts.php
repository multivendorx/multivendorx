<?php

namespace Notifima;

defined( 'ABSPATH' ) || exit;

class FrontendScripts {

    public static $scripts = array();
    public static $styles  = array();

    public function __construct() {
        add_action( 'wp_enqueue_scripts', array( $this, 'load_scripts' ) );
        add_action( 'admin_enqueue_scripts', [ $this, 'admin_load_scripts' ] );
    }

    public static function get_script_name($name){
        if(Notifima()->is_dev) return $name;
        return PLUGIN_SLUG . '-' . $name . '.min';
    }

    public static function get_build_path_name(){
        if(Notifima()->is_dev) return "release/assets/";
        return "assets/";
    }

    public static function register_script( $handle, $path, $deps = array(), $version = '', $text_domain = '' ) {
        self::$scripts[] = $handle;
        wp_register_script( $handle, $path, $deps, $version, true );
        wp_set_script_translations( $handle, 'notifima' );
    }

    public static function register_style( $handle, $path, $deps = array(), $version = '' ) {
        self::$styles[] = $handle;
        wp_register_style( $handle, $path, $deps, $version );
    }

    public static function register_scripts() {
        $version = Notifima()->version;
        
        error_log( 'FrontendUrl : ' . print_r( Notifima()->plugin_url . 'assets/js/' . self::get_script_name('frontend') . '.js', true ) );

        $register_scripts = apply_filters(
            'notifima_register_scripts',
            array(
				'notifima-frontend-script' => array(
					'src'         => Notifima()->plugin_url . 'assets/js/' . self::get_script_name('frontend') . '.js',
					'deps'        => array( 'jquery', 'wp-element', 'wp-components' ),
					'version'     => $version,
					'text_domain' => 'notifima',
				),
			)
        );
        foreach ( $register_scripts as $name => $props ) {
            self::register_script( $name, $props['src'], $props['deps'], $props['version'], $props['text_domain'] );
        }
    }

    public static function register_styles() {
        $version = Notifima()->version;
        $register_styles = apply_filters(
            'notifima_register_styles',
            array(
				'notifima-frontend-style' => array(
					'src'     => Notifima()->plugin_url . 'assets/styles/' . self::get_script_name('frontend') . '.css',
					'deps'    => array(),
					'version' => $version,
				),
			)
        );
        foreach ( $register_styles as $name => $props ) {
            self::register_style( $name, $props['src'], $props['deps'], $props['version'] );
        }
    }

    /**
     * Register/queue frontend scripts.
     */
    public static function load_scripts() {
        self::register_scripts();
        self::register_styles();
    }

    /**
	 * Register/queue admin scripts.
	 */
	public static function admin_load_scripts() {
        self::admin_register_scripts();
		self::admin_register_styles();
    }

    public static function enqueue_external_scripts() {
        $base_dir = plugin_dir_path( __FILE__ ) . '../' . self::get_build_path_name() . 'js/';
        $base_url = MooWoodle()->plugin_url . self::get_build_path_name() . 'js/';
        self::enqueue_scripts_from_dir( $base_dir . 'externals/', $base_url . 'externals/' );
        if ( MooWoodle()->is_dev ) {
            self::enqueue_scripts_from_dir(
                $base_dir,
                $base_url,
                [ 'index.js', 'components.js' ],
                '/min\.js$/i'
            );
        }
    }
    private static function enqueue_scripts_from_dir( $dir, $url, $exclude_files = [], $exclude_pattern = '' ) {
        if ( ! is_dir( $dir ) ) {
            return;
        }
        $js_files = glob( $dir . '*.js' );
        foreach ( $js_files as $chunk_path ) {
            $chunk_file = basename( $chunk_path );
            // Exclude based on filename or regex
            if ( in_array( $chunk_file, $exclude_files, true ) ||
                ( $exclude_pattern && preg_match( $exclude_pattern, $chunk_file ) )
            ) {
                continue;
            }
            $chunk_handle = 'moowoodle-script-' . sanitize_title( $chunk_file );
            $asset_file   = str_replace( '.js', '.asset.php', $chunk_path );
            $deps         = [];
            $version      = filemtime( $chunk_path );
            if ( file_exists( $asset_file ) ) {
                $asset   = include $asset_file;
                $deps    = $asset['dependencies'] ?? [];
                $version = $asset['version'] ?? $version;
            }
            wp_enqueue_script(
                $chunk_handle,
                $url . $chunk_file,
                $deps,
                $version,
                true
            );
        }
    }

    public static function admin_register_scripts() {
		$version = Notifima()->version;
        // Enqueue all chunk files (External dependencies)
        self::enqueue_external_scripts();
        $index_asset = include plugin_dir_path( __FILE__ ) . '../' . self::get_build_path_name() . 'js/index.asset.php';
        $component_asset = include plugin_dir_path( __FILE__ ) . '../' . self::get_build_path_name() . 'js/components.asset.php';
		$register_scripts = apply_filters('admin_notifima_register_scripts', array(
			'notifima-admin-script' => [
				'src'     => Notifima()->plugin_url . self::get_build_path_name() . 'js/index.js',
				'deps'    => $index_asset['dependencies'],
				'version' => $version,
                'text_domain' => 'notifima'
            ],
			'notifima-components-script' => [
				'src'     => Notifima()->plugin_url . self::get_build_path_name() . 'js/components.js',
				'deps'    => $component_asset['dependencies'],
				'version' => $version,
                'text_domain' => 'notifima'
            ],
		) );
		foreach ( $register_scripts as $name => $props ) {
			self::register_script( $name, $props['src'], $props['deps'], $props['version'], $props['text_domain'] );
		}

	}

    public static function admin_register_styles() {
		$version = Notifima()->version;
		$register_styles = apply_filters('admin_notifima_register_styles', [
			'notifima-style'   => [
				'src'     => Notifima()->plugin_url . self::get_build_path_name() . 'styles/index.css',
				'deps'    => array(),
				'version' => $version,
            ],		
			'notifima-components-style'   => [
				'src'     => Notifima()->plugin_url . self::get_build_path_name() . 'styles/components.css',
				'deps'    => array(),
				'version' => $version,
            ],		
			'notifima-admin-style'   => [
				'src'     => Notifima()->plugin_url .'assets/styles/' . self::get_script_name('admin') . '.css',
				'deps'    => array(),
				'version' => $version,
            ],		
        ] );

		foreach ( $register_styles as $name => $props ) {
			self::register_style( $name, $props['src'], $props['deps'], $props['version'] );
		}

	}


    public static function localize_scripts( $handle ) {
        // Get all tab setting's database value
        $settings_databases_value = array();

        $tabs_names = array( 'appearance', 'form_submission', 'email', 'mailchimp' );

        foreach ( $tabs_names as $tab_name ) {
            $settings_databases_value[ $tab_name ] = Notifima()->setting->get_option( 'notifima_' . $tab_name . '_settings' );
        }

        $settings_array  = Utill::get_form_settings_array();
        $button_settings = $settings_array['customize_btn'];

        $border_size = ( ! empty( $button_settings['button_border_size'] ) ) ? $button_settings['button_border_size'] . 'px' : '1px';

        $button_css = '';
        if ( ! empty( $button_settings['button_background_color'] ) ) {
            $button_css .= 'background:' . $button_settings['button_background_color'] . '; ';
        }
        if ( ! empty( $button_settings['button_text_color'] ) ) {
            $button_css .= 'color:' . $button_settings['button_text_color'] . '; ';
        }
        if ( ! empty( $button_settings['button_border_color'] ) ) {
            $button_css .= 'border: ' . $border_size . ' solid ' . $button_settings['button_border_color'] . '; ';
        }
        if ( ! empty( $button_settings['button_font_size'] ) ) {
            $button_css .= 'font-size:' . $button_settings['button_font_size'] . 'px; ';
        }
        if ( ! empty( $button_settings['button_border_redious'] ) ) {
            $button_css .= 'border-radius:' . $button_settings['button_border_redious'] . 'px;';
        }

        $subscribe_button_html   = '<button style="' . $button_css . '" class="notifima-button alert_button_hover" name="alert_button">' . $button_settings['button_text'] . '</button>';
        $unsubscribe_button_html = '<button class="unsubscribe-button" style="' . $button_css . '">' . $settings_array['unsubscribe_button_text'] . '</button>';

        $localize_scripts = apply_filters(
            'notifima_localize_scripts',
            array(
				'notifima-frontend-script'                 => array(
					'object_name' => 'localizeData',
					'data'        => array(
						'ajax_url'                  => admin_url( 'admin-ajax.php', 'relative' ),
						'nonce'                     => wp_create_nonce( 'notifima-security-nonce' ),
						'additional_fields'         => apply_filters( 'notifima_subscription_form_additional_fields', array() ),
						'button_html'               => $subscribe_button_html,
						'alert_success'             => $settings_array['alert_success'],
						'alert_email_exist'         => $settings_array['alert_email_exist'],
						'valid_email'               => $settings_array['valid_email'],
						'ban_email_domain_text'     => $settings_array['ban_email_domain_text'],
						'ban_email_address_text'    => $settings_array['ban_email_address_text'],
						'double_opt_in_success'     => $settings_array['double_opt_in_success'],
						'processing'                => __( 'Processing...', 'notifima' ),
						'error_occurs'              => __( 'Some error occurs', 'notifima' ),
						'try_again'                 => __( 'Please try again.', 'notifima' ),
						'unsubscribe_button'        => $unsubscribe_button_html,
						'alert_unsubscribe_message' => $settings_array['alert_unsubscribe_message'],
						'recaptcha_enabled'         => apply_filters( 'notifima_recaptcha_enabled', false ),
					),
				),
                'notifima-admin-script' => array(
                    'object_name' => 'appLocalizer',
					'data'        => array(
						'apiUrl'                   => untrailingslashit( get_rest_url() ),
						'restUrl'                  => Notifima()->rest_namespace,
						'nonce'                    => wp_create_nonce( 'wp_rest' ),
						'subscriber_list'          => Notifima()->plugin_url . 'src/assets/images/subscriber-list.jpg',
						'export_button'            => admin_url( 'admin-ajax.php?action=export_subscribers' ),
						'khali_dabba'              => Utill::is_khali_dabba(),
						'tab_name'                 => __( 'Notifima', 'notifima' ),
						'settings_databases_value' => $settings_databases_value,
						'pro_url'                  => esc_url( NOTIFIMA_PRO_SHOP_URL ),
						/* translators: %s: Link to the Pro version. */
						'is_double_optin_free'     => sprintf( __( 'Upgrade to <a href="%s" target="_blank"><span class="pro-strong">Pro</span></a> to enable Double Opt-in flow for subscription confirmation.', 'notifima' ), NOTIFIMA_PRO_SHOP_URL ),
						'is_double_optin_pro'      => __( 'Enable Double Opt-in flow for subscription confirmation.', 'notifima' ),
						/* translators: %s: Link to the Pro version. */
						'is_recaptcha_enable_free' => sprintf( __( 'Upgrade to <a href="%s" target="_blank"><span class="pro-strong">Pro</span></a> for unlocking reCAPTCHA for out-of-stock form subscriptions.', 'notifima' ), NOTIFIMA_PRO_SHOP_URL ),
						'is_recaptcha_enable_pro'  => __( 'Enable this to prevent automated bots from submitting forms. Get your v3 reCAPTCHA site key and secret key from <a href="https://developers.google.com/recaptcha" target="_blank">here</a>.', 'notifima' ),
					),
                ),
				'notifima-stock-notification-block-script' => array(
					'object_name' => 'stockNotificationBlock',
					'data'        => array(
						'apiurl'  => untrailingslashit( get_rest_url() ),
						'restUrl' => Notifima()->rest_namespace,
						'nonce'   => wp_create_nonce( 'notifima-security-nonce' ),
					),
				),
				'notifima-stock-notification-block-editor-script' => array(
					'object_name' => 'stockNotificationBlock',
					'data'        => array(
						'apiurl'  => untrailingslashit( get_rest_url() ),
						'restUrl' => Notifima()->rest_namespace,
						'nonce'   => wp_create_nonce( 'notifima-security-nonce' ),
					),
				),
			)
        );

        if ( isset( $localize_scripts[ $handle ] ) ) {
            $props = $localize_scripts[ $handle ];
            self::localize_script( $handle, $props['object_name'], $props['data'] );
        }
    }

    public static function localize_script( $handle, $name, $data = array() ) {
        wp_localize_script( $handle, $name, $data );
    }

    public static function enqueue_script( $handle ) {
        wp_enqueue_script( $handle );
    }

    public static function enqueue_style( $handle ) {
        wp_enqueue_style( $handle );
    }
}
