<?php
/**
 * Tests for MultiVendorX\Cron's payout-schedule calculation helpers.
 *
 * Path mirrors the source file under test: classes/Cron.php.
 *
 * @package MultiVendorX
 */

/**
 * Covers MultiVendorX\Cron::custom_cron_schedules()/normalize_settings()/get_first_run().
 */
class MultiVendorX_Cron_Test extends WP_UnitTestCase {

	/**
	 * Custom_cron_schedules() adds weekly/fortnightly/monthly intervals.
	 *
	 * @return void
	 */
	public function test_custom_cron_schedules_adds_expected_intervals() {
		$cron      = new \MultiVendorX\Cron();
		$schedules = $cron->custom_cron_schedules( array() );

		$this->assertSame( WEEK_IN_SECONDS, $schedules['weekly']['interval'] );
		$this->assertSame( 2 * WEEK_IN_SECONDS, $schedules['fortnightly']['interval'] );
		$this->assertSame( MONTH_IN_SECONDS, $schedules['monthly']['interval'] );
	}

	/**
	 * Normalize_settings('hourly') defaults the interval to 1 when unconfigured.
	 *
	 * @return void
	 */
	public function test_normalize_settings_hourly_defaults_to_one() {
		$cron = new \MultiVendorX\Cron();

		$this->assertSame( array( 'interval' => 1 ), $cron->normalize_settings( 'hourly' ) );
	}

	/**
	 * Normalize_settings('daily') defaults the time to 09:00 when unconfigured.
	 *
	 * @return void
	 */
	public function test_normalize_settings_daily_defaults_to_nine_am() {
		$cron = new \MultiVendorX\Cron();

		$this->assertSame( array( 'time' => '09:00' ), $cron->normalize_settings( 'daily' ) );
	}

	/**
	 * Normalize_settings('weekly') reads the configured weekday/time from settings.
	 *
	 * @return void
	 */
	public function test_normalize_settings_weekly_reads_configured_values() {
		MultiVendorX()->setting->update_setting(
			'disbursement_weekly',
			array(
				array(
					'weekly_payout_day'  => array( 'value' => 'friday' ),
					'weekly_payout_time' => '14:00',
				),
			)
		);

		$cron   = new \MultiVendorX\Cron();
		$result = $cron->normalize_settings( 'weekly' );

		$this->assertSame( 'friday', $result['weekday'] );
		$this->assertSame( '14:00', $result['time'] );
	}

	/**
	 * Normalize_settings() for an unrecognized type returns an empty array,
	 * not a fatal error.
	 *
	 * @return void
	 */
	public function test_normalize_settings_unknown_type_returns_empty_array() {
		$cron = new \MultiVendorX\Cron();

		$this->assertSame( array(), $cron->normalize_settings( 'manual' ) );
	}

	/**
	 * Get_first_run('daily') schedules for today at the configured time if
	 * that moment hasn't passed yet, otherwise tomorrow.
	 *
	 * @return void
	 */
	public function test_get_first_run_daily_rolls_to_tomorrow_when_time_passed() {
		$cron = new \MultiVendorX\Cron();

		// A time far in the past today has definitely already passed.
		$first_run = $cron->get_first_run( 'daily', array( 'time' => '00:01' ) );

		$this->assertGreaterThan( time(), $first_run );
		$this->assertLessThanOrEqual( time() + DAY_IN_SECONDS, $first_run );
	}

	/**
	 * Get_first_run('weekly') returns a timestamp for the configured weekday.
	 *
	 * @return void
	 */
	public function test_get_first_run_weekly_returns_future_timestamp_for_weekday() {
		$cron      = new \MultiVendorX\Cron();
		$first_run = $cron->get_first_run(
            'weekly',
            array(
				'weekday' => 'monday',
				'time'    => '09:00',
            )
        );

		$this->assertGreaterThan( time(), $first_run );
		$this->assertSame( 'Monday', gmdate( 'l', $first_run ) );
	}

	/**
	 * Get_first_run() for an unrecognized schedule falls back to "one minute
	 * from now", not a fatal error.
	 *
	 * @return void
	 */
	public function test_get_first_run_unknown_schedule_falls_back_to_one_minute() {
		$cron      = new \MultiVendorX\Cron();
		$first_run = $cron->get_first_run( 'unknown', array() );

		$this->assertEqualsWithDelta( time() + MINUTE_IN_SECONDS, $first_run, 2 );
	}
}
