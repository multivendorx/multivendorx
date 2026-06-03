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
	public $enrollment_details;

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
	 * @param array  $enrollment_details Data to be used in the email template.
	 *
	 * @return void
	 */
	public function trigger( $recipient, $enrollment_details ) {
		$this->recipient          = $recipient;
		$this->enrollment_details = $enrollment_details;

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
	}

	/**
	 * Get the default email subject.
	 *
	 * @return string
	 */
	public function get_default_subject() {
		return apply_filters(
			'moowoodle_enrollment_email_subject',
			__( 'Your enrolment is confirmed - login info inside', 'moowoodle' )
		);
	}

	/**
	 * Get the default email heading.
	 *
	 * @return string
	 */
	public function get_default_heading() {
		$site_name = get_bloginfo( 'name' );
		return apply_filters(
			'moowoodle_enrollment_email_heading',
			// translators: %s: Site name.
			sprintf( __( 'Welcome to %s! Your Account and Course Access Details', 'moowoodle' ), $site_name )
		);
	}

	/**
	 * Get HTML email content.
	 *
	 * @return string
	 */
	public function get_content_html() {
		ob_start();
		MooWoodle()->util->get_template(
            $this->template_html,
            $this->get_template_args()
        );

		return ob_get_clean();
	}

	/**
	 * Get plain email content.
	 *
	 * @return string
	 */
	public function get_content_plain() {
		ob_start();
		MooWoodle()->util->get_template(
            $this->template_plain,
            $this->get_template_args( true )
        );
		return ob_get_clean();
	}

	/**
	 * Get template arguments.
	 *
	 * @param bool $plain_text Whether plain template is used.
	 * @return array
	 */
	public function get_template_args( $plain_text = false ) {
		return array(
			'enrollments'   => $this->enrollment_details,
			'user_email'    => $this->recipient,
			'email_heading' => $this->get_heading(),
			'sent_to_admin' => false,
			'plain_text'    => $plain_text,
		);
	}
}
