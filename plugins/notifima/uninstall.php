<?php
/**
 * Fired when Notifima is uninstalled.
 *
 * Removes only what classes/Growth/Tracker.php itself owns - the stored consent decision and the
 * VuloCloud connection (encrypted secret and registration retry timer included) - and clears the
 * daily reporting cron. No network request is ever sent from here. Scoped strictly to
 * usage-tracking state; it does not touch any other Notifima option, setting, or table.
 *
 * @package Notifima
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

delete_option( 'notifima_tracking_consent' );
delete_option( 'notifima_vulocloud_connection' );

wp_clear_scheduled_hook( 'notifima_site_telemetry_daily' );
