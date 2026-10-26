<?php
/**
 * MooWoodle Abilities API
 *
 * @package MooWoodle
 */

namespace MooWoodle\Abilities;

use MooWoodle\Abilities\AbilitiesApi\Courses;
use MooWoodle\Abilities\AbilitiesApi\Synchronization;

defined( 'ABSPATH' ) || exit;

/**
 * MooWoodle Main Abilities class.
 *
 * @package MooWoodle
 */
class Abilities {

    /**
     * Container for all our ability controller classes.
     *
     * @var array
     */
    private $container = array();

    /**
     * Constructor.
     */
    public function __construct() {

        $this->init_classes();

        add_action( 'wp_abilities_api_categories_init', array( $this, 'register_categories' ) );

        add_action( 'wp_abilities_api_init', array( $this, 'register_abilities' ) );
    }

    /**
     * Initialize all Abilities API controller classes.
     */
    public function init_classes() {

        $this->container = array(
            'courses'         => new Courses(),
            'synchronization' => new Synchronization(),
        );
    }

    /**
     * Register MooWoodle ability category.
     */
    public function register_categories() {

        wp_register_ability_category(
            'moowoodle',
            array(
                'label'       => __( 'MooWoodle', 'moowoodle' ),
                'description' => __(
                    'MooWoodle Moodle and WooCommerce integration abilities.',
                    'moowoodle'
                ),
            )
        );
    }

    /**
     * Register all MooWoodle abilities.
     */
    public function register_abilities() {

        foreach ( $this->container as $controller ) {
            if ( method_exists( $controller, 'register_abilities' ) ) {
                $controller->register_abilities();
            }
        }
    }
}
