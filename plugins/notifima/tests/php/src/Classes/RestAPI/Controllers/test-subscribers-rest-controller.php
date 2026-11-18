<?php
/**
 * Tests for Notifima\RestAPI\Controllers\Subscribers's subscribe/unsubscribe
 * REST actions.
 *
 * @package Notifima
 */

/**
 * Covers Notifima\RestAPI\Controllers\Subscribers::subscribe_user() and
 * unsubscribe_user(), the two REST actions the front-end subscription form
 * and my-account unsubscribe links actually call through update_item().
 */
class Notifima_Subscribers_Rest_Controller_Test extends WP_UnitTestCase {

    /**
     * The Subscribers controller instance under test.
     *
     * @var \Notifima\RestAPI\Controllers\Subscribers
     */
    private $controller;

    /**
     * An out-of-stock product fresh for each test.
     *
     * @var int
     */
    private $product_id;

    /**
     * Set up a fresh controller and out-of-stock product before each test.
     *
     * @return void
     */
    public function set_up() {
        parent::set_up();

        $this->controller = new \Notifima\RestAPI\Controllers\Subscribers();

        $product = new WC_Product_Simple();
        $product->set_name( 'Subscribers REST Test Product' );
        $product->set_regular_price( '12.00' );
        $product->set_stock_status( 'outofstock' );
        $product->save();

        $this->product_id = $product->get_id();
    }

    /**
     * Build a REST request with a valid `X-WP-Nonce` header, since both
     * subscribe_user() and unsubscribe_user() run every request through
     * Utill::validate_nonce() before touching any posted data.
     *
     * @param array $params Request params to set.
     * @return WP_REST_Request
     */
    private function create_request( $params = array() ) {
        $request = new WP_REST_Request( 'POST', '/notifima/v1/subscribers/0' );

        foreach ( $params as $key => $value ) {
            $request->set_param( $key, $value );
        }

        $request->set_header( 'X-WP-Nonce', wp_create_nonce( 'wp_rest' ) );

        return $request;
    }

    /**
     * A well-formed subscribe request for an out-of-stock product should
     * succeed and actually create the subscriber row.
     *
     * @return void
     */
    public function test_subscribe_user_with_valid_email_and_product_succeeds() {
        $request = $this->create_request(
            array(
                'customer_email' => 'shopper@example.com',
                'product_id'     => $this->product_id,
                'product_title'  => 'Subscribers REST Test Product',
            )
        );

        $response = $this->controller->subscribe_user( $request );
        $data     = $response->get_data();

        $this->assertTrue( $data['status'] );
        $this->assertNotEmpty(
            \Notifima\Subscriber::is_already_subscribed( 'shopper@example.com', $this->product_id )
        );
    }

    /**
     * An invalid email address must be rejected before any subscriber row is
     * created, regardless of how well-formed the rest of the request is.
     *
     * @return void
     */
    public function test_subscribe_user_with_invalid_email_fails_without_inserting_a_row() {
        $request = $this->create_request(
            array(
                'customer_email' => 'not-an-email',
                'product_id'     => $this->product_id,
            )
        );

        $response = $this->controller->subscribe_user( $request );
        $data     = $response->get_data();

        $this->assertFalse( $data['status'] );
        $this->assertEmpty(
            \Notifima\Subscriber::is_already_subscribed( 'not-an-email', $this->product_id )
        );
    }

    /**
     * A missing/falsy product id must be rejected rather than silently
     * subscribing the email to product id 0.
     *
     * @return void
     */
    public function test_subscribe_user_with_missing_product_id_fails() {
        $request = $this->create_request(
            array(
                'customer_email' => 'shopper@example.com',
            )
        );

        $response = $this->controller->subscribe_user( $request );
        $data     = $response->get_data();

        $this->assertFalse( $data['status'] );
    }

    /**
     * Subscribing the same email to the same product twice should report
     * `already_subscribed` on the second attempt instead of creating a
     * duplicate row.
     *
     * @return void
     */
    public function test_subscribe_user_reports_already_subscribed_on_second_attempt() {
        $request = $this->create_request(
            array(
                'customer_email' => 'shopper@example.com',
                'product_id'     => $this->product_id,
                'product_title'  => 'Subscribers REST Test Product',
            )
        );

        $this->controller->subscribe_user( $request );
        $second_response = $this->controller->subscribe_user( $request );
        $data            = $second_response->get_data();

        $this->assertFalse( $data['status'] );
        $this->assertTrue( $data['already_subscribed'] );
    }

    /**
     * Unsubscribing a known subscriber should succeed and flip their row's
     * status away from 'subscribed'.
     *
     * @return void
     */
    public function test_unsubscribe_user_with_existing_subscription_succeeds() {
        \Notifima\Subscriber::insert_subscriber( 'shopper@example.com', $this->product_id );

        $request = $this->create_request(
            array(
                'customer_email' => 'shopper@example.com',
                'product_id'     => $this->product_id,
            )
        );

        $response = $this->controller->unsubscribe_user( $request );
        $data     = $response->get_data();

        $this->assertTrue( $data['status'] );
        $this->assertEmpty(
            \Notifima\Subscriber::is_already_subscribed( 'shopper@example.com', $this->product_id )
        );
    }

    /**
     * A logged-out request with no customer_email and no current user must
     * fail with a clear message rather than unsubscribing an empty email.
     *
     * @return void
     */
    public function test_unsubscribe_user_without_email_or_logged_in_user_fails() {
        $request = $this->create_request(
            array(
                'product_id' => $this->product_id,
            )
        );

        $response = $this->controller->unsubscribe_user( $request );
        $data     = $response->get_data();

        $this->assertFalse( $data['status'] );
    }

    /**
     * Update_item() must dispatch to subscribe_user()/unsubscribe_user()
     * based on the `action` param, and fall back to `false` for anything else.
     *
     * @return void
     */
    public function test_update_item_returns_false_for_an_unknown_action() {
        $request = $this->create_request(
            array(
                'action'         => 'not_a_real_action',
                'customer_email' => 'shopper@example.com',
                'product_id'     => $this->product_id,
            )
        );

        $response = $this->controller->update_item( $request );

        $this->assertFalse( $response->get_data() );
    }
}
