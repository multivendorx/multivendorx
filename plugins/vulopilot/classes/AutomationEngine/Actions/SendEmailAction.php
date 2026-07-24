<?php
/**
 * SendEmailAction class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AutomationEngine\Actions;

use VuloPilotCore\Contracts\Automation\ActionInterface;
use VuloPilotCore\ValueObjects\AutomationRunResult;
use VuloPilotCore\ValueObjects\Recommendation;
use VuloPilot\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Emails a recommendation's summary via `wp_mail()` — core WordPress's own
 * mail API, no separate mail library. Recipient is
 * `Utill::VULOPILOT_SETTINGS_KEY`'s `notification_email` setting (a value
 * the Settings screen has always saved, but nothing previously read),
 * falling back to the site admin email when that setting is empty.
 *
 * @class       SendEmailAction class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class SendEmailAction implements ActionInterface {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'send-email';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Send an email', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function execute( Recommendation $recommendation, array $config ): AutomationRunResult {
        $settings  = wp_parse_args( get_option( Utill::VULOPILOT_SETTINGS_KEY, array() ), Utill::VULOPILOT_SETTINGS_DEFAULTS );
        $recipient = ! empty( $config['recipient'] ) ? sanitize_email( (string) $config['recipient'] ) : $settings['notification_email'];
        $recipient = $recipient ?: get_option( 'admin_email' );

        $headers = array();

        if ( ! empty( $settings['email_from_address'] ) && is_email( $settings['email_from_address'] ) ) {
            $from_name = $settings['email_from_name'] ?: get_bloginfo( 'name' );
            $headers[] = sprintf( 'From: %s <%s>', $from_name, $settings['email_from_address'] );
        }

        $sent = wp_mail(
            $recipient,
            sprintf(
                /* translators: %s is the site name. */
                __( '[%s] VuloPilot recommendation', 'vulopilot' ),
                get_bloginfo( 'name' )
            ),
            sprintf(
                "%s\n\n%s",
                $recommendation->get_title(),
                $recommendation->get_description()
            ),
            $headers
        );

        return new AutomationRunResult(
            $sent,
            $this->get_id(),
            $sent
                ? sprintf(
                    /* translators: %s is the recipient email address. */
                    __( 'Email sent to %s.', 'vulopilot' ),
                    $recipient
                )
                : __( 'wp_mail() returned false — check the site\'s mail configuration.', 'vulopilot' )
        );
    }
}
