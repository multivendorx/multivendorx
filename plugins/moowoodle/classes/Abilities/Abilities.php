<?php
/**
 * MooWoodle Abilities API bootstrap.
 *
 * @package MooWoodle
 */

namespace MooWoodle\Abilities;

use MooWoodle\Abilities\AbilitiesApi\Courses;
use MooWoodle\Abilities\AbilitiesApi\Synchronization;
use MooWoodle\Util;

defined( 'ABSPATH' ) || exit;

/**
 * Registers the MooWoodle ability category and every ability controller
 * with the WordPress Abilities API.
 *
 * @package MooWoodle
 */
class Abilities {

	/**
	 * Ability category slug shared by every MooWoodle ability.
	 */
	const CATEGORY = 'moowoodle';

	/**
	 * Ability controllers, keyed by controller name.
	 *
	 * @var array
	 */
	private $controllers = array();

	/**
	 * Constructor. Instantiates controllers and hooks into the Abilities API.
	 */
	public function __construct() {
		$this->init_classes();

		add_action( 'wp_abilities_api_categories_init', array( $this, 'register_categories' ) );
		add_action( 'wp_abilities_api_init', array( $this, 'register_abilities' ) );
	}

	/**
	 * Instantiate every ability controller.
	 *
	 * @return void
	 */
	public function init_classes() {
		$this->controllers = array(
			'courses'         => new Courses(),
			'synchronization' => new Synchronization(),
		);
	}

	/**
	 * Register the MooWoodle ability category.
	 *
	 * @return void
	 */
	public function register_categories() {
		wp_register_ability_category(
			self::CATEGORY,
			array(
				'label'       => __( 'MooWoodle', 'moowoodle' ),
				'description' => __( 'MooWoodle Moodle and WooCommerce integration abilities.', 'moowoodle' ),
			)
		);
	}

	/**
	 * Let each controller register its own abilities.
	 *
	 * @return void
	 */
	public function register_abilities() {
		foreach ( $this->controllers as $controller ) {
			$controller->register_abilities();
		}
	}

	/**
	 * Shared permission check: only site administrators may run MooWoodle abilities.
	 *
	 * @return bool
	 */
	public static function current_user_can_manage() {
		return Util::current_user_has_capability( array( 'manage_options' ) );
	}
}
