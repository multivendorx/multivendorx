<?php
/**
 * Enrollment Email class file.
 *
 * @package MooWoodle
 */

namespace MooWoodle\Emails;

/**
 * MooWoodle EnrollmentEmail class
 *
 * @class       Emails class
 * @version     3.3.0
 * @author      DualCube
 */
class EnrollmentEmail extends \WC_Email {
	/**
	 * Holds the recipient for email.
	 *
	 * @var string
	 */
	public $recipient = '';
	/**
     * Holds the all email data.
     *
     * @var array
     */
	public $email_data;

	/**
     * EnrollmentEmail constructor.
     */
	public function __construct() {
		$this->id             = 'new_moodle_enrollment';
		$this->title          = __( 'New Moodle Enrollment', 'moowoodle' );
		$this->description    = __( 'This is a notification email sent to the enrollees for new enrollment.', 'moowoodle' );
		$this->heading        = __( 'Welcome to {site_title}!', 'moowoodle' );
		$this->template_html  = 'emails/html/EnrollmentEmail.php';
		$this->template_plain = 'emails/plain/EnrollmentEmail.php';
		$this->template_base  = MooWoodle()->plugin_path . 'templates/';

		parent::__construct();
	}

	/**
	 * Trigger the email sending process.
	 *
	 * @param string $recipient  Email address of the recipient.
	 * @param array  $email_data Data to be used in the email template.
	 *
	 * @return void
	 */
	public function trigger( $recipient, $email_data ) {
		$this->customer_email = $recipient;
		$this->recipient      = $recipient;
		$this->email_data     = $email_data;

		if ( ! $this->is_enabled() || ! $this->get_recipient() ) {
			return;
		}

        $this->send(
			$this->get_recipient(),
			$this->get_subject(),
			$this->get_content(),
			$this->get_headers(),
			$this->get_attachments()
		);

		$user = get_user_by( 'email', $recipient );
		if ( $user && ( get_user_meta( $user->ID, 'moowoodle_moodle_new_user_created', true ) || get_user_meta( $user->ID, 'moowoodle_wordpress_new_user_created', true ) ) ) {
            delete_user_meta( $user->ID, 'moowoodle_wordpress_new_user_created' );
            delete_user_meta( $user->ID, 'moowoodle_moodle_new_user_created' );
        }
	}

	/**
     * Get default subject.
     */
	public function get_default_subject() {
		return apply_filters(
			'moowoodle_enrollment_email_heading',
			sprintf( __( 'Your enrolment is confirmed - login info inside', 'moowoodle' ) )
		);
	}

	/**
     * Get default heading.
     */
	public function get_default_heading() {
		$site_name = get_bloginfo( 'name' );
		return apply_filters(
			'moowoodle_enrollment_email_subject',
			// translators: %s: Site name.
			sprintf( __( 'Welcome to %s! Your Account and Course Access Details', 'moowoodle' ), $site_name )
		);
	}

	/**
     * Get content for template.
     */
	public function get_content_html() {
		ob_start();
		MooWoodle()->util->get_template(
            $this->template_html,
            array(
				'enrollments'   => $this->email_data,
				'user_email'    => $this->recipient,
				'email_heading' => $this->get_heading(),
				'sent_to_admin' => false,
				'plain_text'    => false,
            )
        );

		return ob_get_clean();
	}

	/**
     * Get content for plain template.
     */
	public function get_content_plain() {
		ob_start();
		MooWoodle()->util->get_template(
            $this->template_plain,
            array(
				'enrollments'   => $this->email_data,
				'user_email'    => $this->recipient,
				'email_heading' => $this->get_heading(),
				'sent_to_admin' => false,
				'plain_text'    => true,
            )
        );
		return ob_get_clean();
	}
}
