<?php
/**
 * MooWoodle Synchronization Abilities controller.
 *
 * @package MooWoodle
 */

namespace MooWoodle\Abilities\AbilitiesApi;

use MooWoodle\Util;

defined( 'ABSPATH' ) || exit;

/**
 * MooWoodle Synchronization Abilities controller.
 */
class Synchronization {

	/**
	 * Register synchronization abilities.
	 */
	public function register_abilities() {

		/**
		 * Get synchronization status.
		 */
		wp_register_ability(
			'moowoodle/get-sync-status',
			array(
				'label'               => __( 'Get Sync Status', 'moowoodle' ),
				'description'         => __( 'Check the current MooWoodle course synchronization status.', 'moowoodle' ),
				'category'            => 'moowoodle',

				'input_schema'        => array(
					'type'       => 'object',
					'properties' => array(
						'type' => array(
							'type'        => 'string',
							'description' => __( 'Synchronization type.', 'moowoodle' ),
							'enum'        => array(
								'course',
							),
							'default'     => 'course',
						),
					),
				),

				'output_schema'       => array(
					'type'       => 'object',
					'properties' => array(
						'status'  => array(
							'type'        => 'object',
							'description' => __( 'Current course synchronization progress.', 'moowoodle' ),
						),

						'running' => array(
							'type'        => 'boolean',
							'description' => __( 'Whether course synchronization is currently running.', 'moowoodle' ),
						),
					),
				),

				'execute_callback'    => array(
					$this,
					'get_sync_status',
				),

				'permission_callback' => array(
					$this,
					'permissions_check',
				),

				'meta'                => array(
					'mcp' => array(
						'public' => true,
					),
				),
			)
		);

		/**
		 * Start course synchronization.
		 */
		wp_register_ability(
			'moowoodle/sync-courses',
			array(
				'label'               => __( 'Sync Courses', 'moowoodle' ),
				'description'         => __( 'Synchronize Moodle courses and related WooCommerce products with MooWoodle.', 'moowoodle' ),
				'category'            => 'moowoodle',

				'input_schema'        => array(
					'type' => 'object',
				),

				'output_schema'       => array(
					'type'       => 'object',
					'properties' => array(
						'success' => array(
							'type' => 'boolean',
						),

						'message' => array(
							'type' => 'string',
						),
					),
				),

				'execute_callback'    => array(
					$this,
					'sync_courses',
				),

				'permission_callback' => array(
					$this,
					'permissions_check',
				),

				'meta'                => array(
					'mcp' => array(
						'public' => true,
					),
				),
			)
		);
	}

	/**
	 * Check permission.
	 *
	 * @return bool
	 */
	public function permissions_check() {

		return Util::current_user_has_capability(
			array( 'manage_options' )
		);
	}

	/**
	 * Get course synchronization status.
	 *
	 * @param array $input Ability input.
	 * @return array
	 */
	public function get_sync_status( $input ) {

		return array(
			'status'  => Util::get_sync_status( 'course' ),
			'running' => (bool) get_transient( 'course_sync_running' ),
		);
	}

	/**
	 * Synchronize Moodle courses.
	 *
	 * @param array $input Ability input.
	 * @return array
	 */
	public function sync_courses( $input ) {

		try {
			$response = MooWoodle()->rest->get_service( 'synchronization' )->course_synchronization();

			if ( is_wp_error( $response ) ) {
				return array(
					'success' => false,
					'message' => $response->get_error_message(),
				);
			}

			return array(
				'success' => true,
				'message' => __( 'Course synchronization completed successfully.', 'moowoodle' ),
			);
		} catch ( \Exception $e ) {
			return array(
				'success' => false,
				'message' => $e->getMessage(),
			);
		}
	}
}
