<?php
/**
 * MooWoodle Courses Abilities controller.
 *
 * @package MooWoodle
 */

namespace MooWoodle\Abilities\AbilitiesApi;

use MooWoodle\Abilities\Abilities;

defined( 'ABSPATH' ) || exit;

/**
 * Exposes Moodle course listing through the Abilities API.
 */
class Courses {

	/**
	 * Register the course abilities.
	 *
	 * @return void
	 */
	public function register_abilities() {
		wp_register_ability(
			'moowoodle/get-courses',
			array(
				'label'               => __( 'Get Courses', 'moowoodle' ),
				'description'         => __( 'Retrieve Moodle courses managed by MooWoodle, with optional search, category and pagination filters.', 'moowoodle' ),
				'category'            => Abilities::CATEGORY,
				'input_schema'        => $this->get_input_schema(),
				'output_schema'       => $this->get_output_schema(),
				'execute_callback'    => array( $this, 'get_courses' ),
				'permission_callback' => array( Abilities::class, 'current_user_can_manage' ),
				'meta'                => array(
					'mcp' => array( 'public' => true ),
				),
			)
		);
	}

	/**
	 * Input schema for the get-courses ability.
	 *
	 * @return array
	 */
	private function get_input_schema() {
		return array(
			'type'       => 'object',
			'properties' => array(
				'search'      => array(
					'type'        => 'string',
					'description' => __( 'Search keyword matched against the field given in search_by.', 'moowoodle' ),
				),
				'search_by'   => array(
					'type'        => 'string',
					'description' => __( 'Course field to search.', 'moowoodle' ),
					'enum'        => array( 'name', 'shortname' ),
					'default'     => 'name',
				),
				'category_id' => array(
					'type'        => 'integer',
					'description' => __( 'Filter courses by Moodle category ID.', 'moowoodle' ),
				),
				'page'        => array(
					'type'        => 'integer',
					'description' => __( 'Page number of results.', 'moowoodle' ),
					'default'     => 1,
					'minimum'     => 1,
				),
				'limit'       => array(
					'type'        => 'integer',
					'description' => __( 'Maximum number of courses to return.', 'moowoodle' ),
					'default'     => 50,
					'minimum'     => 1,
					'maximum'     => 100,
				),
			),
		);
	}

	/**
	 * Output schema for the get-courses ability.
	 *
	 * @return array
	 */
	private function get_output_schema() {
		return array(
			'type'       => 'object',
			'properties' => array(
				'total' => array(
					'type'        => 'integer',
					'description' => __( 'Total number of courses matching the filters.', 'moowoodle' ),
				),
				'items' => array(
					'type'  => 'array',
					'items' => array(
						'type'       => 'object',
						'properties' => array(
							'id'                => array( 'type' => 'integer' ),
							'moodle_url'        => array( 'type' => 'string' ),
							'moodle_course_id'  => array( 'type' => 'integer' ),
							'course_short_name' => array( 'type' => 'string' ),
							'course_name'       => array( 'type' => 'string' ),
							'product_name'      => array( 'type' => 'string' ),
							'product_url'       => array( 'type' => 'string' ),
							'product_image'     => array( 'type' => 'string' ),
							'category_name'     => array( 'type' => 'string' ),
							'enrolled_user'     => array( 'type' => 'integer' ),
							'view_users_url'    => array( 'type' => 'string' ),
							'date'              => array( 'type' => 'string' ),
						),
					),
				),
			),
		);
	}

	/**
	 * Fetch courses via the REST courses controller and reshape the
	 * response into the ability's { total, items } output.
	 *
	 * @param array $input Ability input.
	 * @return array
	 */
	public function get_courses( $input = array() ) {
		// Map ability input names onto the ones the REST controller expects; anything
		// omitted falls back to that controller's own defaults.
		$response = MooWoodle()->rest->get_service( 'courses' )->get_courses_records(
			array(
				'search'       => $input['search'] ?? '',
				'searchaction' => 'shortname' === ( $input['search_by'] ?? '' ) ? 'shortname' : 'course',
				'category'     => $input['category_id'] ?? 0,
				'page'         => $input['page'] ?? 1,
				'limit'        => $input['limit'] ?? 50,
			)
		);

		$headers = $response->get_headers();

		return array(
			'total' => (int) ( $headers['X-WP-Total'] ?? 0 ),
			'items' => (array) $response->get_data(),
		);
	}
}
