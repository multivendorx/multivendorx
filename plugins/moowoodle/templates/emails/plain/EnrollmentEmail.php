<?php

/**
 * New enrollment email (plain text)
 *
 * Override this template by copying it to yourtheme/moowoodle/emails/plain/EnrollmentEmail.php
 *
 * @author    DualCube
 * @package   moowoodle/templates
 * @version   3.3.0
 */

use MooWoodle\Util;

defined( 'ABSPATH' ) || exit();

$user = get_user_by( 'email', $args['user_email'] );

echo esc_html(
	sprintf(
		// translators: %s: User's first name.
		__( 'Hi %s,', 'moowoodle' ),
		$user->first_name ?? ''
	)
) . "\n\n";

echo esc_html(
	sprintf(
		// translators: %s: Blog name.
		__( 'Welcome to %s! We’re excited to have you onboard.', 'moowoodle' ),
		get_bloginfo( 'name' )
	)
) . "\n\n";

echo esc_html__(
	'An account has been created for you on our learning platform so you can begin your journey with us. Below are your login details:',
	'moowoodle'
) . "\n\n";

echo esc_html__( 'Your Account Information', 'moowoodle' ) . "\n";
echo "-------------------------\n";
echo esc_html__( 'Website:', 'moowoodle' ) . ' ' . esc_url( home_url() ) . "\n";
echo esc_html__( 'Username:', 'moowoodle' ) . ' ' . esc_html( $user->user_login ?? 'John Doe' ) . "\n";

echo "\n";

echo esc_html__(
	'You will receive separate password setup/reset emails from WordPress and Moodle. Please check your inbox and follow the instructions to set your password and access your account.',
	'moowoodle'
) . "\n";

if ( get_user_meta( $user->ID, Util::MOOWOODLE_USER_META['password_reset'], true ) ) {
	echo "\n";
	echo esc_html__(
		'Moodle Login Notice: We were unable to synchronize your Moodle password automatically. If you cannot sign in to Moodle, please use the "Forgot Password" option on the Moodle login page and follow the instructions sent to your email address.',
		'moowoodle'
	) . "\n";
}

echo "\n" . esc_html__( 'Enrollment Details', 'moowoodle' ) . "\n";
echo "--------------------\n";

echo esc_html__( 'Course(s):', 'moowoodle' ) . "\n";
if ( ! empty( $args['enrollments']['course'] ) && is_array( $args['enrollments']['course'] ) ) {
	foreach ( $args['enrollments']['course'] as $product_id => $product_name ) {
		echo '- ' . esc_html( $product_name ) . "\n";
	}
} else {
	echo '- ' . esc_html__( 'Dummy Course', 'moowoodle' ) . "\n";
}

echo "\n" . esc_html__( 'Access Your Courses', 'moowoodle' ) . "\n";
echo "----------------------\n";
echo esc_html__( 'To get started with your courses, please visit:', 'moowoodle' ) . "\n";
echo '👉 ' . esc_url( wc_get_page_permalink( 'myaccount' ) . 'my-courses/' ) . "\n\n";

$support_email = 'support@' . wp_parse_url( home_url(), PHP_URL_HOST );

echo esc_html(
	sprintf(
		// translators: %s: support email address.
		__( 'If you have any questions or face any issues logging in, feel free to reach out to our support team at %s.', 'moowoodle' ),
		$support_email
	)
) . "\n\n";

echo esc_html__( 'Wishing you a great learning experience!', 'moowoodle' ) . "\n";
