<?php
/**
 * New enrollment email (Plain Text)
 *
 * Override this template by copying it to yourtheme/moowoodle/emails/plain/EnrollmentEmail.php
 *
 * @author    DualCube
 * @package   moowoodle/templates
 * @version   PRODUCT_VERSION
 */

defined( 'ABSPATH' ) || exit();

$user = get_user_by( 'email', $args['user_email'] );

// translators: %s is the user's first name.
echo esc_html( sprintf( __( "Hi %s,\n\n", 'moowoodle' ), $user->first_name ?? '' ) );

echo esc_html(
	sprintf(
		// translators: %s is the site name.
		__( "Welcome to %s! We’re excited to have you onboard.\n\n", 'moowoodle' ),
		get_bloginfo( 'name' )
	)
);

esc_html_e( "An account has been created for you on our learning platform so you can begin your journey with us.\n", 'moowoodle' );
esc_html_e( "Below are your login details:\n\n", 'moowoodle' );

esc_html_e( "=== Your Account Information ===\n", 'moowoodle' );
// translators: %s is the website URL.
echo esc_html( sprintf( __( 'Website: %s', 'moowoodle' ), home_url() ) ) . "\n";

// translators: %s is the username.
echo esc_html( sprintf( __( 'Username: %s', 'moowoodle' ), $user->user_login ?? 'John Doe' ) ) . "\n";

$wp_pwd         = get_user_meta( $user->ID ?? 0, 'moowoodle_wordpress_user_pwd', true );
$moodle_pwd     = get_user_meta( $user->ID ?? 0, 'moowoodle_moodle_user_pwd', true );
$wp_created     = get_user_meta( $user->ID ?? 0, 'moowoodle_wordpress_new_user_created', true );
$moodle_created = get_user_meta( $user->ID ?? 0, 'moowoodle_moodle_new_user_created', true );

if ( $wp_created && $moodle_created && $wp_pwd === $moodle_pwd ) {
	// translators: %s is the user's password.
	echo esc_html( sprintf( __( 'Password: %s', 'moowoodle' ), $wp_pwd ) ) . "\n";
	esc_html_e( "(This password will work for both your WordPress and Moodle accounts. You will be required to change your Moodle password after your first login.)\n\n", 'moowoodle' );
} else {
	if ( $wp_created ) {
		// translators: %s is the WordPress password.
		echo esc_html( sprintf( __( 'WordPress Password: %s', 'moowoodle' ), $wp_pwd ) ) . "\n";
	}
	if ( $moodle_created ) {
		// translators: %s is the Moodle password.
		echo esc_html( sprintf( __( 'Moodle Password: %s', 'moowoodle' ), $moodle_pwd ) ) . "\n";
		esc_html_e( "(Note: You will be required to change your Moodle password after your first login.)\n", 'moowoodle' );
	}
}

echo "\n" . esc_html__( '=== Enrollment Details ===', 'moowoodle' ) . "\n";

if ( ! empty( $args['enrollments']['gift_email'] ) ) {
	// translators: %s is the gifter's email address.
	echo esc_html( sprintf( __( 'This enrollment was gifted by %s', 'moowoodle' ), $args['enrollments']['gift_email'] ) ) . "\n";
} elseif ( ! empty( $args['enrollments']['teacher_email'] ) ) {
	// translators: %s is the teacher's email address.
	echo esc_html( sprintf( __( 'You have been enrolled by %s', 'moowoodle' ), $args['enrollments']['teacher_email'] ) ) . "\n";
}

if ( ! empty( $args['enrollments']['group_details'] ) ) {
	esc_html_e( "Group(s):\n", 'moowoodle' );
	foreach ( $args['enrollments']['group_details'] as $group ) {
		echo '- ' . esc_html( $group['name'] ) . "\n";
	}
}

if ( ! empty( $args['enrollments']['cohort_details'] ) ) {
	esc_html_e( "Cohort(s):\n", 'moowoodle' );
	foreach ( $args['enrollments']['cohort_details'] as $cohort ) {
		echo '- ' . esc_html( $cohort['name'] ) . "\n";
	}
}

if ( ! empty( $args['enrollments']['classroom_details'] ) && empty( $args['enrollments']['teacher_email'] ) ) {
	printf(
		// translators: %s is the name of the classroom.
		esc_html__( 'Classroom: %s', 'moowoodle' ) . "\n",
		esc_html( $args['enrollments']['classroom_details'][0]['name'] )
	);
}

if ( ! empty( $args['enrollments']['course_details'] ) ) {
	esc_html_e( "Course(s):\n", 'moowoodle' );
	foreach ( $args['enrollments']['course_details'] as $course ) {
		echo '- ' . esc_html( $course['fullname'] ) . "\n";
	}
} else {
	esc_html_e( "Course(s):\n", 'moowoodle' );
	echo '- Dummy Course\n';
}

echo "\n" . esc_html__( "=== Access Your Courses ===\n", 'moowoodle' );
$course_url = wc_get_page_permalink( 'myaccount' ) . 'my-courses/';
/* translators: %s is the course access URL */
printf( esc_html__( "To get started, visit: %s\n\n", 'moowoodle' ), esc_url( $course_url ) );

$support_email = 'support@' . wp_parse_url( home_url(), PHP_URL_HOST );
printf(
	/* translators: %s is the support email address */
	esc_html__( "If you have questions or face issues logging in, contact us at: %s\n\n", 'moowoodle' ),
	esc_html( $support_email )
);


esc_html_e( "Wishing you a great learning experience!\n", 'moowoodle' );
