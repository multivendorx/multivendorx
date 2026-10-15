<?php
/**
 * Tests for CatalogX\Enquiry\Util's exclusion-setting logic.
 *
 * @package CatalogX
 */

/**
 * Covers Util::is_available() (role/user exclusion) and
 * Util::is_available_for_product() (product/category/tag/brand exclusion) -
 * the gate every enquiry button/form on the frontend is built on.
 */
class CatalogX_Enquiry_Util_Is_Available_Test extends WP_UnitTestCase {

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
     * No exclusion settings at all must allow enquiry for any product.
     *
     * @return void
     */
    public function test_is_available_for_product_with_no_exclusions_returns_true() {
        $product = new WC_Product_Simple();
        $product->set_name( 'Enquiry Available Product' );
        $product->save();

        $this->assertTrue( \CatalogX\Enquiry\Util::is_available_for_product( $product->get_id() ) );
    }

    /**
     * A product explicitly listed in the product exclusion setting must be
     * excluded.
     *
     * @return void
     */
    public function test_is_available_for_product_excludes_a_listed_product() {
        $product = new WC_Product_Simple();
        $product->set_name( 'Enquiry Excluded Product' );
        $product->save();

        CatalogX()->setting->update_setting(
            'exclusion',
            array( 'enquiry_exclusion_value_product_list' => array( $product->get_id() ) ),
            $this->option_key
        );

        $this->assertFalse( \CatalogX\Enquiry\Util::is_available_for_product( $product->get_id() ) );
    }

    /**
     * A product in a different, non-excluded category must remain
     * available even when a product-category exclusion is set for another
     * category.
     *
     * @return void
     */
    public function test_is_available_for_product_ignores_unrelated_category_exclusion() {
        $other_category = wp_insert_term( 'Excluded Category', 'product_cat' );

        $product = new WC_Product_Simple();
        $product->set_name( 'Uncategorized Enquiry Product' );
        $product->save();

        CatalogX()->setting->update_setting(
            'exclusion',
            array( 'enquiry_exclusion_value_category_list' => array( $other_category['term_id'] ) ),
            $this->option_key
        );

        $this->assertTrue( \CatalogX\Enquiry\Util::is_available_for_product( $product->get_id() ) );
    }

    /**
     * A product assigned to an excluded category must be excluded.
     *
     * @return void
     */
    public function test_is_available_for_product_excludes_a_product_in_an_excluded_category() {
        $category = wp_insert_term( 'Excluded Category', 'product_cat' );

        $product = new WC_Product_Simple();
        $product->set_name( 'Categorized Enquiry Product' );
        $product->set_category_ids( array( $category['term_id'] ) );
        $product->save();

        CatalogX()->setting->update_setting(
            'exclusion',
            array( 'enquiry_exclusion_value_category_list' => array( $category['term_id'] ) ),
            $this->option_key
        );

        $this->assertFalse( \CatalogX\Enquiry\Util::is_available_for_product( $product->get_id() ) );
    }

    /**
     * A user whose role is in the excluded-roles list must not see enquiry
     * as available at all, regardless of product.
     *
     * @return void
     */
    public function test_is_available_returns_false_for_an_excluded_user_role() {
        $user_id = self::factory()->user->create( array( 'role' => 'subscriber' ) );
        wp_set_current_user( $user_id );

        CatalogX()->setting->update_setting(
            'exclusion',
            array( 'enquiry_exclusion_value_userroles_list' => array( 'subscriber' ) ),
            $this->option_key
        );

        $this->assertFalse( \CatalogX\Enquiry\Util::is_available() );
    }

    /**
     * A user not in any excluded list, with no excluded role, must have
     * enquiry available.
     *
     * @return void
     */
    public function test_is_available_returns_true_when_no_exclusions_match() {
        $user_id = self::factory()->user->create( array( 'role' => 'customer' ) );
        wp_set_current_user( $user_id );

        $this->assertTrue( \CatalogX\Enquiry\Util::is_available() );
    }
}
