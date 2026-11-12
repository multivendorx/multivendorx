<?php
/**
 * Email containing the subscriber report for the configured recipients.
 *
 * @package Notifima
 */

namespace Notifima\Emails;

defined( 'ABSPATH' ) || exit;

/**
 * Email to configured recipients for the subscriber report.
 *
 * An email will be sent to the configured recipients with the report
 * for the selected reporting period.
 *
 * @class SubscriberReportEmail class
 * @version 3.1.10
 * @author MultiVendorX
 * @extends \WC_Email
 */
class SubscriberReportEmail extends \WC_Email {

    /**
     * Subscribers included in the report.
     *
     * @var array
     */
    public $subscribers;

    /**
     * Report start date.
     *
     * @var string
     */
    public $start_date;

    /**
     * Report end date.
     *
     * @var string
     */
    public $end_date;

    /**
     * Email attachments.
     *
     * @var array
     */
    public $attachments;

    /**
     * Constructor.
     */
    public function __construct() {
        $this->id          = 'notifima_subscriber_report';
        $this->title       = __( 'Subscriber Report', 'notifima' );
        $this->description = __( 'Sends the subscriber report to the configured email recipient(s) at the selected frequency.', 'notifima' );

        $base_template_path = apply_filters(
            'notifima_email_template_base_path',
            Notifima()->plugin_path . 'templates/'
        );

        // Set the appropriate template paths.
        $this->template_html  = 'emails/html/SubscriberReportEmail.php';
        $this->template_plain = 'emails/plain/SubscriberReportEmail.php';
        $this->template_base  = $base_template_path;

        // Call parent constructor.
        parent::__construct();

        $this->recipient = get_option( 'admin_email' );
    }

    /**
     * Trigger the email.
     *
     * @param array  $subscribers Subscribers included in the report.
     * @param string $start_date  Report start date.
     * @param string $end_date    Report end date.
     * @param array  $attachments Email attachments.
     * @return bool
     */
    public function trigger( $subscribers, $start_date, $end_date, $attachments = array() ) {
        $this->subscribers = $subscribers;
        $this->start_date  = $start_date;
        $this->end_date    = $end_date;
        $this->attachments = $attachments;

        if ( ! $this->is_enabled() || ! $this->get_recipient() ) {
            return false;
        }

        $this->find = array( '{START_DATE}', '{END_DATE}', '{SUBSCRIBER_COUNT}' );

        $this->replace = array(
            $this->start_date,
            $this->end_date,
            array_sum( wp_list_pluck( $this->subscribers, 'count' ) ),
        );

        return $this->send(
            $this->get_recipient(),
            $this->get_subject(),
            $this->get_content(),
            $this->get_headers(),
            $this->get_attachments()
        );
    }

    /**
     * Get email subject.
     *
     * @return string
     */
    public function get_default_subject() {
        return apply_filters(
            'notifima_subscriber_report_email_subject',
            __( 'Subscriber Report ({START_DATE} - {END_DATE})', 'notifima' ),
            $this->object
        );
    }

    /**
     * Get email heading.
     *
     * @return string
     */
    public function get_default_heading() {
        return apply_filters(
            'notifima_subscriber_report_email_heading',
            __( 'Subscriber Report', 'notifima' ),
            $this->object
        );
    }

    /**
     * Get email attachments.
     *
     * @return array
     */
    public function get_attachments() {
        return apply_filters(
            'notifima_subscriber_report_email_attachments',
            $this->attachments,
            $this->id,
            $this->object
        );
    }

    /**
     * Get email headers.
     *
     * @return string
     */
    public function get_headers() {
        $header = 'Content-Type: ' . $this->get_content_type() . "\r\n";

        return apply_filters(
            'notifima_subscriber_report_email_headers',
            $header,
            $this->id,
            $this->object
        );
    }

    /**
     * Get HTML content.
     *
     * @return string
     */
    public function get_content_html() {
        ob_start();

        $template_loader = apply_filters(
            'notifima_template_loader',
            array(
                'object' => Notifima()->util,
                'method' => 'get_template',
            ),
            $this->template_html,
            $this->get_template_args()
        );

        call_user_func(
            array( $template_loader['object'], $template_loader['method'] ),
            $this->template_html,
            $this->get_template_args()
        );

        return ob_get_clean();
    }

    /**
     * Get plain content.
     *
     * @return string
     */
    public function get_content_plain() {
        ob_start();

        Notifima()->util->get_template(
            $this->template_plain,
            $this->get_template_args()
        );

        return ob_get_clean();
    }

    /**
     * Get template arguments.
     *
     * @return array
     */
    protected function get_template_args() {
        return array(
            'email_heading' => $this->get_heading(),
            'subscribers'   => $this->subscribers,
            'start_date'    => $this->start_date,
            'end_date'      => $this->end_date,
            'sent_to_admin' => true,
            'plain_text'    => false,
        );
    }
}
