<?php
/**
 * Email containing the enquiry report for the configured recipients.
 *
 * @package CatalogX
 */

namespace CatalogX\Emails;

defined( 'ABSPATH' ) || exit;

/**
 * Email to configured recipients for the enquiry report.
 *
 * An email will be sent to the configured recipients with the report
 * for the selected reporting period.
 *
 * @class EnquiryReportEmail class
 * @version 6.0.0
 * @author MultiVendorX
 * @extends \WC_Email
 */
class EnquiryReportEmail extends \WC_Email {

    /**
     * Enquiries included in the report.
     *
     * @var array
     */
    public $enquiries;

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
        $this->id          = 'catalogx_enquiry_report';
        $this->title       = __( 'Enquiry Report', 'catalogx' );
        $this->description = __( 'Sends the enquiry report to the configured email recipient(s) at the selected frequency.', 'catalogx' );

        $base_template_path = apply_filters( 'catalogx_email_template_base_path', CatalogX()->plugin_path . 'templates/' );

        // Set the appropriate template paths.
        $this->template_html  = 'emails/enquiry-report-email.php';
        $this->template_plain = 'emails/plain/enquiry-report-email.php';
        $this->template_base  = $base_template_path;

        // Call parent constructor.
        parent::__construct();

        $this->recipient = get_option( 'admin_email' );
    }

    /**
     * Trigger the email.
     *
     * @param array  $enquiries   Enquiries included in the report.
     * @param string $start_date  Report start date.
     * @param string $end_date    Report end date.
     * @param array  $attachments Email attachments.
     * @return bool
     */
    public function trigger( $enquiries, $start_date, $end_date, $attachments = array() ) {
        $this->enquiries   = $enquiries;
        $this->start_date  = $start_date;
        $this->end_date    = $end_date;
        $this->attachments = $attachments;

        if ( ! $this->is_enabled() || ! $this->get_recipient() ) {
            return false;
        }

        $this->find = array( '{START_DATE}', '{END_DATE}', '{ENQUIRY_COUNT}');

        $this->replace = array( $this->start_date, $this->end_date, count( $this->enquiries ));

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
        return apply_filters( 'catalogx_enquiry_report_email_subject',  __( 'Enquiry Report ({START_DATE} - {END_DATE})', 'catalogx' ), $this->object );
    }

    /**
     * Get email heading.
     *
     * @return string
     */
    public function get_default_heading() {
        return apply_filters( 'catalogx_enquiry_report_email_heading', __( 'Enquiry Report', 'catalogx' ), $this->object );
    }

    /**
     * Get email attachments.
     *
     * @return array
     */
    public function get_attachments() {
        return apply_filters( 'catalogx_enquiry_report_email_attachments', $this->attachments, $this->id, $this->object );
    }
    /**
     * Get email headers.
     *
     * @return string
     */
    public function get_headers() {
        $header = 'Content-Type: ' . $this->get_content_type() . "\r\n";

        return apply_filters( 'catalogx_enquiry_report_email_headers', $header, $this->id, $this->object );
    }

    /**
     * Get HTML content.
     *
     * @return string
     */
    public function get_content_html() {
        ob_start();

        $template_loader = apply_filters(
            'catalogx_template_loader',
            array(
                'object' => CatalogX()->util,
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

        CatalogX()->util->get_template( $this->template_plain, $this->get_template_args());

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
            'enquiries'     => $this->enquiries,
            'start_date'    => $this->start_date,
            'end_date'      => $this->end_date,
            'sent_to_admin' => true,
            'plain_text'    => false,
        );
    }
}
