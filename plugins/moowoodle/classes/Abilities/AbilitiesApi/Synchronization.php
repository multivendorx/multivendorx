<?php
/**
 * MooWoodle Synchronization Abilities controller.
 *
 * @package MooWoodle
 */

namespace MooWoodle\Abilities\AbilitiesApi;

use MooWoodle\Abilities\Abilities;
use MooWoodle\Util;

defined( 'ABSPATH' ) || exit;

/**
 * Exposes Moodle course synchronization through the Abilities API.
 */
class Synchronization {

	/**
	 * Register the synchronization abilities.
	 *
	 * @return void
	 */
	public function register_abilities() {
		wp_register_ability(
			'moowoodle/get-sync-status',
			array(
				'label'               => __( 'Get Sync Status', 'moowoodle' ),
				'description'         => __( 'Check the current MooWoodle course synchronization status.', 'moowoodle' ),
				'category'            => Abilities::CATEGORY,
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
				'execute_callback'    => array( $this, 'get_course_sync_status' ),
				'permission_callback' => array( Abilities::class, 'current_user_can_manage' ),
				'meta'                => array(
					'annotations' => array( 'readonly' => true ),
					'mcp'         => array( 'public' => true ),
				),
			)
		);

		wp_register_ability(
			'moowoodle/sync-courses',
			array(
				'label'               => __( 'Sync Courses', 'moowoodle' ),
				'description'         => __( 'Synchronize Moodle courses and related WooCommerce products with MooWoodle.', 'moowoodle' ),
				'category'            => Abilities::CATEGORY,
				'output_schema'       => array(
					'type'       => 'object',
					'properties' => array(
						'success' => array( 'type' => 'boolean' ),
						'message' => array( 'type' => 'string' ),
					),
				),
				'execute_callback'    => array( $this, 'sync_courses' ),
				'permission_callback' => array( Abilities::class, 'current_user_can_manage' ),
				'meta'                => array(
					'mcp' => array( 'public' => true ),
				),
			)
		);
	}

	/**
	 * Get the course synchronization progress and running flag.
	 *
	 * @return array
	 */
	public function get_course_sync_status() {
		return array(
			'status'  => (object) Util::get_sync_status( 'course' ),
			'running' => (bool) get_transient( 'moowoodle_course_sync_running' ),
		);
	}

	/**
	 * Run a full Moodle course synchronization.
	 *
	 * @return array
	 */
	public function sync_courses() {
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
			// Make sure a failed run doesn't leave the "running" flag stuck.
			delete_transient( 'moowoodle_course_sync_running' );

			return array(
				'success' => false,
				'message' => $e->getMessage(),
			);
		}
	}
}
