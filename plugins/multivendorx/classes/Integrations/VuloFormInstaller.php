<?php
/**
 * VuloForm integration class.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Integrations;

defined( 'ABSPATH' ) || exit;

/**
 * Installs the companion VuloForm plugin, which builds and renders MultiVendorX's
 * forms (store and wholesale registration) now that zyra no longer ships a form
 * renderer. Install.php flags it 'pending' on a new site and on an upgrade to 5.0.23;
 * CompanionPlugin does the rest. There are no settings to move into VuloForm.
 *
 * @class       VuloFormInstaller class
 * @version     5.0.23
 * @author      MultiVendorX
 */
class VuloFormInstaller extends CompanionPlugin {

	/**
	 * Option storing the install status: 'pending', 'done', or 'failed'.
	 *
	 * @var string
	 */
	const STATUS_OPTION = 'multivendorx_vuloform_install_status';

	/**
	 * Option storing the last install error message, when status is 'failed'.
	 *
	 * @var string
	 */
	const ERROR_OPTION = 'multivendorx_vuloform_install_error';

	/**
	 * Option flagging that the one-time success notice has already been shown.
	 *
	 * @var string
	 */
	const NOTICE_SHOWN_OPTION = 'multivendorx_vuloform_install_notice_shown';

	/**
	 * {@inheritDoc}
	 *
	 * @return string
	 */
	protected function get_plugin_slug() {
		return 'vuloform';
	}

	/**
	 * {@inheritDoc}
	 *
	 * @return string
	 */
	protected function get_plugin_file() {
		return 'vuloform/vuloform.php';
	}

	/**
	 * {@inheritDoc}
	 *
	 * @return string
	 */
	protected function get_plugin_name() {
		return 'VuloForm';
	}

	/**
	 * {@inheritDoc}
	 *
	 * @return string
	 */
	protected function get_status_option() {
		return self::STATUS_OPTION;
	}

	/**
	 * {@inheritDoc}
	 *
	 * @return string
	 */
	protected function get_error_option() {
		return self::ERROR_OPTION;
	}

	/**
	 * {@inheritDoc}
	 *
	 * @return string
	 */
	protected function get_notice_shown_option() {
		return self::NOTICE_SHOWN_OPTION;
	}

	/**
	 * {@inheritDoc}
	 *
	 * @return string
	 */
	protected function get_retry_action() {
		return 'multivendorx_retry_vuloform_install';
	}

	/**
	 * {@inheritDoc}
	 *
	 * @return string
	 */
	protected function get_success_message() {
		return __( 'MultiVendorX has installed VuloForm, the companion plugin that builds and displays your marketplace forms, such as store and wholesale registration.', 'multivendorx' );
	}
}
