<?php
/**
 * Tests for CatalogX\Quote\QuoteCart, the /quote-cart REST routes.
 *
 * @package CatalogX
 */

/**
 * Covers check_quote_cart_permission() (guest read-only, admin-only delete),
 * get_items() (pagination + total count), update_item()'s input validation
 * (invalid payload/quantity must be rejected before touching the cart), and
 * delete_item().
 */
class CatalogX_Quote_Cart_Rest_Controller_Test extends WP_UnitTestCase {

    /**
     * The QuoteCart controller instance under test.
     *
     * @var \CatalogX\Quote\QuoteCart
     */
    private $controller;

    /**
     * Set up a fresh controller and an empty cart before each test.
     *
     * @return void
     */
    public function set_up() {
        parent::set_up();
        $this->controller = new \CatalogX\Quote\QuoteCart();
        CatalogX()->quotecart->unset_session();
    }

    /**
     * Clear the cart session and current user after each test.
     *
     * @return void
     */
    public function tear_down() {
        CatalogX()->quotecart->unset_session();
        wp_set_current_user( 0 );
        CatalogX()->current_user_id = 0;
        parent::tear_down();
    }

    /**
     * Build a REST request with a valid `X-WP-Nonce` header, since every
     * handler here runs the request through Utill::validate_nonce().
     *
     * @param string $method HTTP method.
     * @param array  $params Request params to set.
     * @return WP_REST_Request
     */
    private function create_request( $method, $params = array() ) {
        $request = new WP_REST_Request( $method, '/catalogx/v1/quote-cart' );

        foreach ( $params as $key => $value ) {
            $request->set_param( $key, $value );
        }

        $request->set_header( 'X-WP-Nonce', wp_create_nonce( 'wp_rest' ) );

        return $request;
    }

    /**
     * Populate both the session store and the cart's in-memory
     * quote_cart_content property - get_cart_contents()/update_cart_item()/
     * remove_cart_item() all read the in-memory property directly rather
     * than re-reading the session.
     *
     * @param array $cart_content Cart content keyed by cart item key.
     * @return void
     */
    private function fill_cart( $cart_content ) {
        CatalogX()->quotecart->set_session( $cart_content, true );
        CatalogX()->quotecart->quote_cart_content = $cart_content;
    }

    /**
     * A logged-out guest must be allowed a GET request.
     *
     * @return void
     */
    public function test_permission_check_allows_a_guest_get_request() {
        wp_set_current_user( 0 );

        $request = $this->create_request( 'GET' );

        $this->assertTrue( $this->controller->check_quote_cart_permission( $request ) );
    }

    /**
     * A logged-out guest must be denied a DELETE request.
     *
     * @return void
     */
    public function test_permission_check_denies_a_guest_delete_request() {
        wp_set_current_user( 0 );

        $request = $this->create_request( 'DELETE' );

        $this->assertFalse( $this->controller->check_quote_cart_permission( $request ) );
    }

    /**
     * A logged-in customer must be denied a DELETE request - only admins
     * can delete.
     *
     * @return void
     */
    public function test_permission_check_denies_a_customers_delete_request() {
        $user_id = self::factory()->user->create( array( 'role' => 'customer' ) );
        wp_set_current_user( $user_id );
        // CatalogX()->current_user_id is a service captured once at boot,
        // not a live get_current_user_id() call - set it directly so the
        // permission check reads the user this test just switched to.
        CatalogX()->current_user_id = $user_id;

        $request = $this->create_request( 'DELETE' );

        $this->assertFalse( $this->controller->check_quote_cart_permission( $request ) );
    }

    /**
     * An administrator must be allowed a DELETE request.
     *
     * @return void
     */
    public function test_permission_check_allows_an_admins_delete_request() {
        $user_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
        wp_set_current_user( $user_id );
        CatalogX()->current_user_id = $user_id;

        $request = $this->create_request( 'DELETE' );

        $this->assertTrue( $this->controller->check_quote_cart_permission( $request ) );
    }

    /**
     * Get_items() must page the cart content and report the full,
     * un-paginated count.
     *
     * @return void
     */
    public function test_get_items_paginates_and_reports_the_full_count() {
        $cart_content = array();
        for ( $i = 1; $i <= 3; $i++ ) {
            $product = new WC_Product_Simple();
            $product->set_name( "Quote Cart Page Product {$i}" );
            $product->set_regular_price( '5.00' );
            $product->save();

            $cart_content[ "key-{$i}" ] = array(
                'product_id' => $product->get_id(),
                'quantity'   => 1,
                'variation'  => array(),
            );
        }
        $this->fill_cart( $cart_content );

        $request  = $this->create_request(
            'GET',
            array(
				'row'  => 2,
				'page' => 1,
            )
        );
        $response = $this->controller->get_items( $request );
        $data     = $response->get_data();

        $this->assertCount( 2, $data['response'] );
        $this->assertSame( 3, $data['count'] );
    }

    /**
     * Update_item() must reject a non-array/empty products payload before
     * touching the cart.
     *
     * @return void
     */
    public function test_update_item_rejects_an_empty_products_payload() {
        $response = $this->controller->update_item( $this->create_request( 'PUT', array( 'products' => array() ) ) );

        $this->assertWPError( $response );
        $this->assertSame( 'catalogx_invalid_products', $response->get_error_code() );
    }

    /**
     * Update_item() must reject a quantity that isn't a positive integer.
     *
     * @return void
     */
    public function test_update_item_rejects_a_non_positive_quantity() {
        $this->fill_cart(
            array(
				'key-a' => array(
					'product_id' => 101,
					'quantity'   => 1,
				),
            )
        );

        $response = $this->controller->update_item(
            $this->create_request(
                'PUT',
                array(
                    'products' => array(
                        array(
                            'key'      => 'key-a',
                            'quantity' => 0,
                        ),
                    ),
                )
            )
        );

        $this->assertWPError( $response );
        $this->assertSame( 'catalogx_invalid_quantity', $response->get_error_code() );
    }

    /**
     * Update_item() with a valid payload must apply the new quantity.
     *
     * @return void
     */
    public function test_update_item_applies_a_valid_quantity() {
        $this->fill_cart(
            array(
				'key-a' => array(
					'product_id' => 101,
					'quantity'   => 1,
				),
            )
        );

        $response = $this->controller->update_item(
            $this->create_request(
                'PUT',
                array(
                    'products' => array(
                        array(
                            'key'      => 'key-a',
                            'quantity' => 4,
                        ),
                    ),
                )
            )
        );

        $this->assertNotWPError( $response );
        $this->assertSame( 4, CatalogX()->quotecart->get_cart_contents()['key-a']['quantity'] );
    }

    /**
     * Delete_item() must reject a request with no key param.
     *
     * @return void
     */
    public function test_delete_item_rejects_a_missing_key() {
        $response = $this->controller->delete_item( $this->create_request( 'DELETE', array( 'productId' => 101 ) ) );

        $this->assertWPError( $response );
        $this->assertSame( 'catalogx_missing_key', $response->get_error_code() );
    }

    /**
     * Delete_item() with a valid key must remove only that entry.
     *
     * @return void
     */
    public function test_delete_item_removes_only_the_matching_entry() {
        $this->fill_cart(
            array(
                'key-a' => array(
					'product_id' => 101,
					'quantity'   => 1,
				),
                'key-b' => array(
					'product_id' => 102,
					'quantity'   => 1,
				),
            )
        );

        $response = $this->controller->delete_item(
            $this->create_request(
                'DELETE',
                array(
                    'productId' => 101,
                    'key'       => 'key-a',
                )
            )
        );

        $data = $response->get_data();

        $this->assertTrue( $data['status'] );
        $this->assertArrayNotHasKey( 'key-a', $data['cart_data'] );
        $this->assertArrayHasKey( 'key-b', $data['cart_data'] );
    }
}
