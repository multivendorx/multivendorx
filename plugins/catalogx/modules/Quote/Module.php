<?php
/**
 * Quote module Module class file
 *
 * @package CatalogX
 */

namespace CatalogX\Quote;

/**
 * CatalogX Quote Module class
 *
 * @class       Module class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Module {
    /**
     * Container contain all helper class
     *
     * @var array
     */
    private $container = array();

    /**
     * Contain reference of the class
     *
     * @var self|null
     */
    private static $instance = null;

    /**
     * Catalog class constructor function
     */
    public function __construct() {

        // Init helper classes.
        $this->init_classes();

        do_action( 'load_premium_quote_module' );

        if ( CatalogX()->modules->is_active( 'quote' ) ) {
            $this->create_page_for_quote();
        }
    }


    /**
     * Init helper classes
     *
     * @return void
     */
    public function init_classes() {
        $this->container['admin']    = new Admin();
        $this->container['ajax']     = new Ajax();
        $this->container['frontend'] = new Frontend();
        $this->container['rest']     = new Rest();
        $this->container['util']     = new Util();
    }

    /**
     * Create page for quote
     *
     * @return void
     */
    public function create_page_for_quote() {
        // quote page.
        $option_value = get_option( 'catalogx_request_quote_page' );
        if ( $option_value > 0 && get_post( $option_value ) ) {
            return;
        }

        $default_slug = function_exists( 'pll__' ) ? pll__( 'my-quote' ) : 'my-quote';

        $page_found = get_posts(
            array(
				'name'        => 'my-quote',
				'post_status' => 'publish',
				'post_type'   => 'page',
				'fields'      => 'ids',
				'numberposts' => 1,
            )
        );
        if ( $page_found ) {
            if ( ! $option_value ) {
                update_option( 'catalogx_request_quote_page', $page_found[0] );
            }
            return;
        }
        $page_data = array(
            'post_status'    => 'publish',
            'post_type'      => 'page',
            'post_author'    => 1,
            'post_name'      => $default_slug,
            'post_title'     => __( 'My Quote', 'catalogx' ),
            'post_content'   => $this->request_quote_block() ? $this->request_quote_block() : '[catalogx_request_quote]',
            'comment_status' => 'closed',
        );
        $page_id   = wp_insert_post( $page_data );
        update_option( 'catalogx_request_quote_page', $page_id );

        // Assign language using Polylang.
        if ( function_exists( 'pll_get_languages' ) && function_exists( 'pll_set_post_language' ) ) {
            $languages    = pll_get_languages( array( 'fields' => array() ) );
            $translations = array();

            foreach ( $languages as $lang_code => $lang_data ) {
                if ( pll_default_language() === $lang_code ) {
                    $translations[ $lang_code ] = $page_id;
                    pll_set_post_language( $page_id, $lang_code );
                    continue;
                }

                $translated_id = wp_insert_post(
                    array(
						'post_status'    => 'publish',
						'post_type'      => 'page',
						'post_author'    => 1,
						'post_name'      => pll_translate_string( 'my-quote', lang: $lang_code ),
						'post_title'     => pll_translate_string( 'My Quote', $lang_code ),
						'post_content'   => $this->request_quote_block() ? $this->request_quote_block() : '[catalogx_request_quote]',
						'comment_status' => 'closed',
                    )
                );

                if ( $translated_id ) {
                    pll_set_post_language( $translated_id, $lang_code );
                    $translations[ $lang_code ] = $translated_id;
                }
            }

            // Link translations together.
            if ( function_exists( 'pll_save_post_translations' ) ) {
                pll_save_post_translations( $translations );
            }
        }
    }

    /**
     * Returns the block markup for the quote carts page.
     *
     * @return string The block markup HTML for the quote cart.
     */
    public function request_quote_block() {
        return '<!-- wp:catalogx/quote-cart -->
                <div id="request-quote-list"></div>
                <!-- /wp:catalogx/quote-cart -->';
    }

    /**
     * Magic getter function to get the reference of class.
     * Accept class name, If valid return reference, else Wp_Error.
     *
     * @param   mixed $class The name of the class to retrieve from the container.
     * @return  object | \WP_Error
     */
    public function __get( $class ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound
        if ( array_key_exists( $class, $this->container ) ) {
            return $this->container[ $class ];
        }
        return new \WP_Error( sprintf( 'Call to unknown class %s.', $class ) );
    }

    /**
     * Magic setter function to store a reference of a class.
     * Accepts a class name as the key and stores the instance in the container.
     *
     * @param string $class The class name or key to store the instance.
     * @param object $value The instance of the class to store.
     */
    public function __set( $class, $value ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound
        $this->container[ $class ] = $value;
    }

    /**
     * Initializes Catalog class.
     * Checks for an existing instance
     * And if it doesn't find one, create it.
     *
     * @return self|null
     */
    public static function init() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }

        return self::$instance;
    }
}
