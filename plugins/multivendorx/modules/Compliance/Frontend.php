<?php
/**
 * MultiVendorX Frontend class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Compliance;

use MultiVendorX\FrontendScripts;

/**
 * MultiVendorX Follow Store Frontend class
 *
 * @class       Frontend class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Frontend
{
    /**
     * Frontend class constructor function.
     */
    public function __construct()
    {
        add_action('woocommerce_product_meta_start', array($this, 'add_report_abuse_link'), 30);
        add_action('wp_enqueue_scripts', array($this, 'load_scripts'));
    }

    /**
     * Load scripts
     */
    public function load_scripts()
    {
        FrontendScripts::load_scripts();
        FrontendScripts::enqueue_script('multivendorx-report-abuse-frontend-script');
        FrontendScripts::localize_scripts('multivendorx-report-abuse-frontend-script');
    }

    /**
     * Store report abuse option
     *
     * @param int $product_id Product ID.
     */
    public function add_report_abuse_link($product_id = 0)
    {
        if (!$product_id && function_exists('get_the_ID')) {
            $product_id = get_the_ID();
        }
        $product = wc_get_product($product_id);
        if (!$product) {
            return;
        }
        $who_can_report = MultiVendorX()->setting->get_setting('who_can_report', array());

        if (
            ('logged_in' === $who_can_report && !is_user_logged_in()) ||
            ('guests' === $who_can_report && is_user_logged_in())
        ) {
            // Do not show link.
            return;
        }

        if (apply_filters('mvx_show_report_abuse_link', true, $product)) {
            $report_abuse_text = apply_filters('mvx_report_abuse_text', __('Report Abuse', 'multivendorx'), $product);
            ?>
            <div class="multivendorx-report-abuse-wrapper">
                <a href="javascript:void(0);" class="open-popup open-report-abuse"><?php echo esc_html($report_abuse_text); ?></a>
                <div class="report-abuse-form multivendorx-popup" style="display:none;">
                    <form class="woocommerce-form woocommerce-form-login login multivendorx-popup-content">
                        <span class="popup-close"><i class="dashicons dashicons-no-alt"></i></span>
                        <h3>
                            <?php
                            $report_title = sprintf(
                                /* translators: %s: Product name for abuse report */
                                esc_html__('Report abuse for "%s"', 'multivendorx'),
                                esc_html($product->get_name())
                            );
                            printf('<h3>%s</h3>', esc_html($report_title));
                            ?>
                        </h3>

                        <!-- Name & Email -->
                        <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                            <label for="report-abuse-name"><?php esc_attr_e('Name', 'multivendorx'); ?></label>
                            <input type="text" name="report-abuse-name"
                                class="woocommerce-Input woocommerce-Input--text input-text report-abuse-name">
                        </p>
                        <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                            <label for="report-abuse-email"><?php esc_attr_e('Email', 'multivendorx'); ?></label>
                            <input type="email" name=""
                                class="report-abuse-email woocommerce-Input woocommerce-Input--text input-text">
                        </p>

                        <!-- Radio buttons for reasons -->
                        <p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
                        <div class="report-abuse-reasons-wrapper woocommerce-form woocommerce-form--radio">
                            <!-- Dynamic radio buttons will be appended here via jQuery -->
                        </div>
                        </p>
                        <!-- Custom message textarea (hidden initially) -->
                        <p class="report-abuse-custom-msg woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide" style="display:none;">
                            <textarea class="report-abuse-msg input-text"
                                placeholder="<?php esc_attr_e('Message', 'multivendorx'); ?>"></textarea>
                        </p>

                        <input type="hidden" class="report_abuse_product_id" value="<?php echo esc_attr($product->get_id()); ?>">

                        <!-- Submit button -->
                        <button type="button" class="submit-report-abuse woocommerce-button button wp-element-button">
                            <?php esc_html_e('Report', 'multivendorx'); ?>
                        </button>

                        <div class="report-abuse-msg-box woocommerce-notices-wrapper">
                        </div>
                    </form>
                </div>
            </div>
            <?php
        }
    }
}
