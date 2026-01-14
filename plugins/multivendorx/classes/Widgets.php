<?php
namespace MultiVendorX;

defined('ABSPATH') || exit;

class Widgets {

    public function __construct() {
        add_action('wp_enqueue_scripts', array($this, 'frontend_scripts'));
    }

    public function frontend_scripts()
    {
        FrontendScripts::load_scripts();
        FrontendScripts::enqueue_script('multivendorx-store-coupons-script');
        FrontendScripts::localize_scripts('multivendorx-marketplace-coupons-script');
        FrontendScripts::enqueue_script('multivendorx-stores-script');
        FrontendScripts::enqueue_script('multivendorx-stores-script');
        FrontendScripts::localize_scripts('multivendorx-stores-script');
    }
}
