<?php
/**
 * New enrollment email (Plain Text)
 *
 * @package MooWoodle
 */

defined( 'ABSPATH' ) || exit();

$user = get_user_by( 'email', $args['user_email'] );

echo 'Hi ' . esc_html( $user->first_name ?? '' ) . ",\n\n";

echo 'Welcome to ' . esc_html( get_bloginfo( 'name' ) ) . "! We’re excited to have you onboard.\n\n";
echo "An account has been created for you on our learning platform so you can begin your journey with us.\n";
echo "Below are your login details:\n\n";

echo "=== Your Account Information ===\n";
echo 'Website: ' . esc_url( home_url() ) . "\n";
echo 'Username: ' . esc_html( $user->user_login ?? '' ) . "\n";

$wp_pwd         = get_user_meta( $user->ID ?? 0, 'moowoodle_wordpress_user_pwd', true );
$moodle_pwd     = get_user_meta( $user->ID ?? 0, 'moowoodle_moodle_user_pwd', true );
$wp_created     = get_user_meta( $user->ID ?? 0, 'moowoodle_wordpress_new_user_created', true );
$moodle_created = get_user_meta( $user->ID ?? 0, 'moowoodle_moodle_new_user_created', true );

if ( $wp_created && $moodle_created && $wp_pwd === $moodle_pwd ) {
	echo 'Password: ' . esc_html( $wp_pwd ) . "\n";
	echo "(This password will work for both your WordPress and Moodle accounts. You will be required to change your Moodle password after your first login.)\n\n";
} else {
	if ( $wp_created ) {
		echo 'WordPress Password: ' . esc_html( $wp_pwd ) . "\n";
	}
	if ( $moodle_created ) {
		echo 'Moodle Password: ' . esc_html( $moodle_pwd ) . "\n";
		echo "(Note: You will be required to change your Moodle password after your first login.)\n";
	}
}
echo "\n";

echo "=== Enrollment Details ===\n";

if ( ! empty( $args['enrollments']['gift_email'] ) ) {
	echo 'This enrollment was gifted by ' . esc_html( $args['enrollments']['gift_email'] ) . "\n";
} elseif ( ! empty( $args['enrollments']['teacher_email'] ) ) {
	echo 'You have been enrolled by ' . esc_html( $args['enrollments']['teacher_email'] ) . "\n";
}

if ( ! empty( $args['enrollments']['group_details'] ) ) {
	echo "Group(s):\n";
	foreach ( $args['enrollments']['group_details'] as $group ) {
		echo '- ' . esc_html( $group['name'] ) . "\n";
	}
}

if ( ! empty( $args['enrollments']['cohort_details'] ) ) {
	echo "Cohort(s):\n";
	foreach ( $args['enrollments']['cohort_details'] as $cohort ) {
		echo '- ' . esc_html( $cohort['name'] ) . "\n";
	}
}

if ( ! empty( $args['enrollments']['classroom_details'] ) && empty( $args['enrollments']['teacher_email'] ) ) {
	echo 'Classroom: ' . esc_html( $args['enrollments']['classroom_details'][0]['name'] ) . "\n";
}

if ( ! empty( $args['enrollments']['course_details'] ) ) {
	echo "Course(s):\n";
	foreach ( $args['enrollments']['course_details'] as $course ) {
		echo '- ' . esc_html( $course['fullname'] ) . "\n";
	}
}

echo "\n=== Access Your Courses ===\n";
$course_url = wc_get_page_permalink( 'myaccount' ) . 'my-courses/';
echo 'To get started, visit: ' . esc_url( $course_url ) . "\n\n";

$support_email = 'support@' . wp_parse_url( home_url(), PHP_URL_HOST );
echo 'If you have questions or face issues logging in, contact us at: ' . esc_html( $support_email ) . "\n\n";

echo "Wishing you a great learning experience!\n";
