<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class MVX_Store_Document extends \Elementor\Core\Base\Document {

    /**
     * Get document properties
     */
    public static function get_properties() {
        $properties = parent::get_properties();
        $properties['support_kit'] = true;
        $properties['show_in_library'] = true;
        $properties['cpt'] = [ 'elementor_library' ];
        return $properties;
    }

    /**
     * Get document name
     */
    public function get_name() {
        return 'mvx-store';
    }

    /**
     * Get document title
     */
    public static function get_title() {
        return __( 'Store Page', 'multivendorx' );
    }

    /**
     * Get document type label
     */
    public static function get_plural_title() {
        return __( 'Store Pages', 'multivendorx' );
    }

    /**
     * Register controls for the document
     */
    protected function register_controls() {
        parent::register_controls();
    }

    /**
     * Get CSS wrapper selector
     */
    public function get_css_wrapper_selector() {
        return 'body.store-page';
    }

    /**
     * Save template type
     */
    protected function _register_controls() {
        parent::_register_controls();
    }
}