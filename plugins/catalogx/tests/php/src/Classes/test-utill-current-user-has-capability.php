<?php
/**
 * Tests for CatalogX\Utill::current_user_has_capability()'s permission logic.
 *
 * @package CatalogX
 */

/**
 * Covers the guest "everyone" bypass, the capability/role match, and the
 * 'catalogx_permissions_check' filter - the gate every enquiry/quote/
 * wholesale REST endpoint's permission_callback ultimately goes through.
 */
class CatalogX_Utill_Current_User_Has_Capability_Test extends WP_UnitTestCase {

    /**
     * Restore the service container's cached current_user_id after each
     * test, since it's a value captured once at boot rather than a live
     * lookup - see CatalogX::register_services().
     *
     * @var int
     */
    private $original_current_user_id;

    /**
     * Remember the boot-time cached current_user_id so it can be restored.
     *
     * @return void
     */
    public function set_up() {
        parent::set_up();
        $this->original_current_user_id = CatalogX()->current_user_id;
    }

    /**
     * Restore the cached current_user_id and clear any per-test filters.
     *
     * @return void
     */
    public function tear_down() {
        CatalogX()->current_user_id = $this->original_current_user_id;
        wp_set_current_user( 0 );
        remove_all_filters( 'catalogx_permissions_check' );
        parent::tear_down();
    }

    /**
     * A logged-out visitor must be allowed through when the setting is
     * explicitly set to 'everyone'.
     *
     * @return void
     */
    public function test_guest_is_allowed_when_setting_is_everyone() {
        wp_set_current_user( 0 );
        CatalogX()->current_user_id = 0;

        $allowed = \CatalogX\Utill::current_user_has_capability(
            array( 'manage_options' ),
            '',
            'this_setting_key_does_not_exist'
        );

        // The default value get_setting() falls back to is 'everyone', so an
        // unset setting key behaves the same as an explicit 'everyone'.
        $this->assertTrue( $allowed );
    }

    /**
     * A logged-out visitor must be denied when no capability matches and
     * the "everyone" bypass doesn't apply.
     *
     * @return void
     */
    public function test_guest_is_denied_without_the_everyone_bypass() {
        wp_set_current_user( 0 );
        CatalogX()->current_user_id = 0;

        $allowed = \CatalogX\Utill::current_user_has_capability( array( 'manage_options' ) );

        $this->assertFalse( $allowed );
    }

    /**
     * A logged-in user whose role matches one of the requested capabilities
     * must be allowed, even without the "everyone" setting.
     *
     * @return void
     */
    public function test_logged_in_user_is_allowed_when_role_matches() {
        $user_id = self::factory()->user->create( array( 'role' => 'customer' ) );
        wp_set_current_user( $user_id );
        CatalogX()->current_user_id = $user_id;

        $allowed = \CatalogX\Utill::current_user_has_capability( array( 'customer', 'manage_options' ) );

        $this->assertTrue( $allowed );
    }

    /**
     * A logged-in user without any of the requested capabilities must be
     * denied.
     *
     * @return void
     */
    public function test_logged_in_user_is_denied_without_a_matching_capability() {
        $user_id = self::factory()->user->create( array( 'role' => 'subscriber' ) );
        wp_set_current_user( $user_id );
        CatalogX()->current_user_id = $user_id;

        $allowed = \CatalogX\Utill::current_user_has_capability( array( 'manage_options' ) );

        $this->assertFalse( $allowed );
    }

    /**
     * The 'catalogx_permissions_check' filter must be able to add a
     * capability that wasn't in the original list.
     *
     * @return void
     */
    public function test_permissions_check_filter_can_grant_an_extra_capability() {
        $user_id = self::factory()->user->create( array( 'role' => 'subscriber' ) );
        wp_set_current_user( $user_id );
        CatalogX()->current_user_id = $user_id;

        add_filter(
            'catalogx_permissions_check',
            function ( $capabilities ) {
                $capabilities[] = 'read';
                return $capabilities;
            }
        );

        $allowed = \CatalogX\Utill::current_user_has_capability( array( 'manage_options' ) );

        $this->assertTrue( $allowed, 'A subscriber has the read capability by default' );
    }
}
