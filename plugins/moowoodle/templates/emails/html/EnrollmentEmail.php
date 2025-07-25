<?php
/**
 * New enrollment email (HTML)
 *
 * Override this template by copying it to yourtheme/moowoodle/emails/html/EnrollmentEmail.php
 *
 * @author    DualCube
 * @package   moowoodle/templates
 * @version   3.3.0
 */

defined( 'ABSPATH' ) || exit();

do_action( 'woocommerce_email_header', $email_heading );
$user = get_user_by( 'email', $args['user_email'] );
?>

<p>
	<?php
		// translators: %s: User's first name.
		echo esc_html( sprintf( __( 'Hi %s,', 'moowoodle' ), $user->first_name ?? '' ) );
	?>
</p>

<p>
	<?php
	echo wp_kses_post(
		sprintf(
			// translators: %s: Blog name.
			__( 'Welcome to <strong>%s</strong>! We’re excited to have you onboard.', 'moowoodle' ),
			esc_html( get_bloginfo( 'name' ) )
		)
	);
	?>
</p>

<p>
	<?php esc_html_e( 'An account has been created for you on our learning platform so you can begin your journey with us. Below are your login details:', 'moowoodle' ); ?>
</p>

<h3><?php esc_html_e( 'Your Account Information', 'moowoodle' ); ?></h3>

<p>
	<strong><?php esc_html_e( 'Website:', 'moowoodle' ); ?></strong>
	<a href="<?php echo esc_url( home_url() ); ?>">
		<?php echo esc_html( home_url() ); ?>
	</a><br>

	<strong><?php esc_html_e( 'Username:', 'moowoodle' ); ?></strong>
	<?php echo esc_html( $user->user_login ?? 'John Doe' ); ?><br>

	<?php
	$wp_pwd         = get_user_meta( $user->ID ?? 0, 'moowoodle_wordpress_user_pwd', true );
	$moodle_pwd     = get_user_meta( $user->ID ?? 0, 'moowoodle_moodle_user_pwd', true );
	$wp_created     = get_user_meta( $user->ID ?? 0, 'moowoodle_wordpress_new_user_created', true );
	$moodle_created = get_user_meta( $user->ID ?? 0, 'moowoodle_moodle_new_user_created', true );

	if ( $wp_created && $moodle_created && $wp_pwd === $moodle_pwd ) :
		?>
		<p>
			<strong><?php esc_html_e( 'Password:', 'moowoodle' ); ?></strong> <?php echo esc_html( $wp_pwd ); ?><br>
			<em><?php esc_html_e( 'This password will work for both your WordPress and Moodle accounts. You will be required to change your Moodle password after your first login.', 'moowoodle' ); ?></em><br>
		</p>
	<?php else : ?>
		<?php if ( $wp_created ) : ?>
			<p>
				<strong><?php esc_html_e( 'WordPress Password:', 'moowoodle' ); ?></strong> <?php echo esc_html( $wp_pwd ); ?><br>
			</p>
		<?php endif; ?>
		<?php if ( $moodle_created ) : ?>
			<p>
				<strong><?php esc_html_e( 'Moodle Password:', 'moowoodle' ); ?></strong> <?php echo esc_html( $moodle_pwd ); ?><br>
				<em><?php esc_html_e( 'Note: You will be required to change your Moodle password after your first login.', 'moowoodle' ); ?></em><br>
			</p>
		<?php endif; ?>
	<?php endif; ?>

</p>

<h3><?php esc_html_e( 'Enrollment Details', 'moowoodle' ); ?></h3>

<?php if ( ! empty( $args['enrollments']['course'] ) ) : ?>
	<p><strong><?php esc_html_e( 'Course(s):', 'moowoodle' ); ?></strong></p>
	<ul>
		<?php foreach ( $args['enrollments']['course'] as $product_id => $product_name ) : ?>
			<li><?php echo esc_html( $product_name ); ?></li>
		<?php endforeach; ?>
	</ul>
<?php else : ?>
	<p><strong><?php esc_html_e( 'Course(s):', 'moowoodle' ); ?></strong></p>
	<ul>
		<li><?php esc_html_e( 'Dummy Course', 'moowoodle' ); ?></li>
	</ul>
<?php endif; ?>


<h3><?php esc_html_e( 'Access Your Courses', 'moowoodle' ); ?></h3>

<p>
	<?php esc_html_e( 'To get started with your courses, please click the link below:', 'moowoodle' ); ?><br>
	👉 <a href="<?php echo esc_url( wc_get_page_permalink( 'myaccount' ) . 'my-courses/' ); ?>" target="_blank">
		<?php echo esc_html( wc_get_page_permalink( 'myaccount' ) . 'my-courses/' ); ?>
	</a>
</p>

<p>
	<?php
	$support_email = 'support@' . wp_parse_url( home_url(), PHP_URL_HOST );
	echo wp_kses_post(
		sprintf(
			// translators: %s is the support email address.
			__( 'If you have any questions or face any issues logging in, feel free to reach out to our support team at <a href="mailto:%1$s">%2$s</a>.', 'moowoodle' ),
			esc_attr( $support_email ),
			esc_html( $support_email )
		)
	);
	?>
</p>

<p><?php esc_html_e( 'Wishing you a great learning experience!', 'moowoodle' ); ?></p>

<?php do_action( 'woocommerce_email_footer' ); ?>
