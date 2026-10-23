<?php
/**
 * Tests for CatalogX\Quote\Util's exclusion-setting logic.
 *
 * @package CatalogX
 */

/**
 * Covers Util::is_available() (role/user exclusion) and
 * Util::is_available_for_product() (product/category/tag/brand exclusion) -
 * the gate the "Request a Quote" button is built on. Mirrors the sibling
 * Enquiry\Util test, since both modules share the same
 * catalogx_enquiry_quote_exclusion_settings option, just different keys
 * inside it (quote_exclusion_value_* vs enquiry_exclusion_value_*).
 */
class CatalogX_Quote_Util_Is_Available_Test extends WP_UnitTestCase {

    /**
     * The settings option key the exclusion settings live under.
     *
     * @var string
     */
    private $option_key;

    /**
     * Reset to a logged-out user before each test.
     *
     * @return void
     */
    public function set_up() {
        parent::set_up();
        $this->option_key = \CatalogX\Utill::CATALOGX_SETTINGS['enquiry-quote-exclusion'];
        wp_set_current_user( 0 );
    }

    /**
     * Clear any exclusion settings a test added.
     *
     * @return void
     */
    public function tear_down() {
        CatalogX()->setting->update_setting( 'exclusion', array(), $this->option_key );
        wp_set_current_user( 0 );
        parent::tear_down();
    }

    /**
     * No exclusion settings at all must allow quoting for any product.
     *
     * @return void
     */
    public function test_is_available_for_product_with_no_exclusions_returns_true() {
        $product = new WC_Product_Simple();
        $product->set_name( 'Quote Available Product' );
        $product->save();

        $this->assertTrue( \CatalogX\Quote\Util::is_available_for_product( $product->get_id() ) );
    }

    /**
     * A product explicitly listed in the quote product exclusion setting
     * must be excluded.
     *
     * @return void
     */
    public function test_is_available_for_product_excludes_a_listed_product() {
        $product = new WC_Product_Simple();
        $product->set_name( 'Quote Excluded Product' );
        $product->save();

        CatalogX()->setting->update_setting(
            'exclusion',
            array( 'quote_exclusion_value_product_list' => array( $product->get_id() ) ),
            $this->option_key
        );

        $this->assertFalse( \CatalogX\Quote\Util::is_available_for_product( $product->get_id() ) );
    }

    /**
     * A product tagged with an excluded tag must be excluded.
     *
     * @return void
     */
    public function test_is_available_for_product_excludes_a_product_with_an_excluded_tag() {
        $tag = wp_insert_term( 'Excluded Quote Tag', 'product_tag' );

        $product = new WC_Product_Simple();
        $product->set_name( 'Tagged Quote Product' );
        $product->set_tag_ids( array( $tag['term_id'] ) );
        $product->save();

        CatalogX()->setting->update_setting(
            'exclusion',
            array( 'quote_exclusion_value_tag_list' => array( $tag['term_id'] ) ),
            $this->option_key
        );

        $this->assertFalse( \CatalogX\Quote\Util::is_available_for_product( $product->get_id() ) );
    }

    /**
     * A product with an unrelated tag must remain available even when a
     * different tag is excluded.
     *
     * @return void
     */
    public function test_is_available_for_product_ignores_unrelated_tag_exclusion() {
        $other_tag = wp_insert_term( 'Excluded Quote Tag', 'product_tag' );

        $product = new WC_Product_Simple();
        $product->set_name( 'Untagged Quote Product' );
        $product->save();

        CatalogX()->setting->update_setting(
            'exclusion',
            array( 'quote_exclusion_value_tag_list' => array( $other_tag['term_id'] ) ),
            $this->option_key
        );

        $this->assertTrue( \CatalogX\Quote\Util::is_available_for_product( $product->get_id() ) );
    }

    /**
     * A user whose role is in the excluded-roles list must not see quoting
     * as available at all, regardless of product.
     *
     * @return void
     */
    public function test_is_available_returns_false_for_an_excluded_user_role() {
        $user_id = self::factory()->user->create( array( 'role' => 'subscriber' ) );
        wp_set_current_user( $user_id );

        CatalogX()->setting->update_setting(
            'exclusion',
            array( 'quote_exclusion_value_userroles_list' => array( 'subscriber' ) ),
            $this->option_key
        );

        $this->assertFalse( \CatalogX\Quote\Util::is_available() );
    }

    /**
     * A specifically excluded user id must not see quoting as available,
     * even when their role isn't excluded.
     *
     * @return void
     */
    public function test_is_available_returns_false_for_an_excluded_user_id() {
        $user_id = self::factory()->user->create( array( 'role' => 'customer' ) );
        wp_set_current_user( $user_id );

        CatalogX()->setting->update_setting(
            'exclusion',
            array( 'quote_exclusion_value_user_list' => array( $user_id ) ),
            $this->option_key
        );

        $this->assertFalse( \CatalogX\Quote\Util::is_available() );
    }

    /**
     * Get_customer_id_by_email() must resolve a known email to its user id.
     *
     * @return void
     */
    public function test_get_customer_id_by_email_resolves_a_known_user() {
        $user_id = self::factory()->user->create( array( 'user_email' => 'quote-customer@example.com' ) );

        $this->assertSame( $user_id, \CatalogX\Quote\Util::get_customer_id_by_email( 'quote-customer@example.com' ) );
    }

    /**
     * Get_customer_id_by_email() must return 0, not false or null, when no
     * user matches.
     *
     * @return void
     */
    public function test_get_customer_id_by_email_returns_zero_for_an_unknown_email() {
        $this->assertSame( 0, \CatalogX\Quote\Util::get_customer_id_by_email( 'nobody@example.com' ) );
    }
}
