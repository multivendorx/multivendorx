<?php
/**
 * MooWoodle Rest API
 *
 * @package MooWoodle
 */

namespace MooWoodle\RestAPI;

use MooWoodle\RestAPI\Controllers\Settings;
use MooWoodle\RestAPI\Controllers\Logs;

defined( 'ABSPATH' ) || exit;

/**
 * MooWoodle Main Rest class
 *
 * @version     PRODUCT_VERSION
 * @package     MooWoodle
 * @author      MooWoodle
 */
class Rest {

    /**
     * Container for all our classes
     *
     * @var array
     */
    private $container = array();
    /**
     * Constructor
     */
    public function __construct() {
        $this->init_classes();
    }

    /**
     * Initialize all REST API controller classes.
     */
    public function init_classes() {
        $this->container = array(
            'settings'          => new Settings(),
            'logs'              => new Logs(),
        );
    }
}
