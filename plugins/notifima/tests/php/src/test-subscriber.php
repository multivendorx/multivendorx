<?php
/**
 * Tests for Notifima\Subscriber's subscribe/unsubscribe lifecycle.
 *
 * @package Notifima
 */

/**
 * Covers Notifima\Subscriber's subscribe/unsubscribe lifecycle against the
 * real notifima_subscribers table.
 */
class Notifima_Subscriber_Test extends WP_UnitTestCase {

    /**
     * The id of the out-of-stock product created for each test.
     *
     * @var int
     */
    private $product_id;

    /**
     * Create a fresh out-of-stock product before each test.
     *
     * @return void
     */
    public function set_up() {
        parent::set_up();

        $product = new WC_Product_Simple();
        $product->set_name( 'Subscriber Test Product' );
        $product->set_regular_price( '15.00' );
        $product->set_stock_status( 'outofstock' );
        $product->save();

        $this->product_id = $product->get_id();
    }

    /**
     * Inserting a subscriber should create a row with 'subscribed' status.
     *
     * @return void
     */
    public function test_insert_subscriber_creates_a_subscribed_row() {
        \Notifima\Subscriber::insert_subscriber( 'shopper@example.com', $this->product_id );

        $subscription_id = \Notifima\Subscriber::is_already_subscribed( 'shopper@example.com', $this->product_id );

        $this->assertNotEmpty( $subscription_id );
    }

    /**
     * Inserting the same email/product twice should not create a duplicate row.
     *
     * @return void
     */
    public function test_insert_subscriber_is_idempotent_for_the_same_email_and_product() {
        \Notifima\Subscriber::insert_subscriber( 'shopper@example.com', $this->product_id );
        \Notifima\Subscriber::insert_subscriber( 'shopper@example.com', $this->product_id );

        $emails = \Notifima\Subscriber::get_product_subscribers_email( $this->product_id );

        $this->assertCount( 1, $emails );
    }

    /**
     * Each successful insert should update the product's subscriber count meta.
     *
     * @return void
     */
    public function test_insert_subscriber_updates_the_product_subscriber_count() {
        \Notifima\Subscriber::insert_subscriber( 'shopper-a@example.com', $this->product_id );
        \Notifima\Subscriber::insert_subscriber( 'shopper-b@example.com', $this->product_id );

        $this->assertSame( '2', get_post_meta( $this->product_id, 'no_of_subscribers', true ) );
    }

    /**
     * An email that never subscribed should not be considered subscribed.
     *
     * @return void
     */
    public function test_is_already_subscribed_is_false_for_an_unknown_email() {
        $this->assertEmpty( \Notifima\Subscriber::is_already_subscribed( 'nobody@example.com', $this->product_id ) );
    }

    /**
     * Removing a subscriber should mark the row unsubscribed and return true.
     *
     * @return void
     */
    public function test_remove_subscriber_marks_the_row_unsubscribed_and_returns_true() {
        \Notifima\Subscriber::insert_subscriber( 'shopper@example.com', $this->product_id );

        $removed = \Notifima\Subscriber::remove_subscriber( $this->product_id, 'shopper@example.com' );

        $this->assertTrue( $removed );
        $this->assertEmpty( \Notifima\Subscriber::is_already_subscribed( 'shopper@example.com', $this->product_id ) );
    }

    /**
     * Removing a subscriber who was never subscribed should return false.
     *
     * @return void
     */
    public function test_remove_subscriber_returns_false_when_not_subscribed() {
        $removed = \Notifima\Subscriber::remove_subscriber( $this->product_id, 'nobody@example.com' );

        $this->assertFalse( $removed );
    }

    /**
     * Deleting a subscriber should remove the row entirely, not just mark it unsubscribed.
     *
     * @return void
     */
    public function test_delete_subscriber_removes_the_row_entirely() {
        \Notifima\Subscriber::insert_subscriber( 'shopper@example.com', $this->product_id );

        \Notifima\Subscriber::delete_subscriber( $this->product_id, 'shopper@example.com' );

        $emails = \Notifima\Subscriber::get_product_subscribers_email( $this->product_id );

        $this->assertNotContains( 'shopper@example.com', $emails );
    }

    /**
     * Only rows with 'subscribed' status should be returned as active subscribers.
     *
     * @return void
     */
    public function test_get_product_subscribers_email_only_returns_subscribed_status() {
        \Notifima\Subscriber::insert_subscriber( 'active@example.com', $this->product_id );
        \Notifima\Subscriber::insert_subscriber( 'left@example.com', $this->product_id );
        \Notifima\Subscriber::remove_subscriber( $this->product_id, 'left@example.com' );

        $emails = \Notifima\Subscriber::get_product_subscribers_email( $this->product_id );

        $this->assertContains( 'active@example.com', $emails );
        $this->assertNotContains( 'left@example.com', $emails );
    }

    /**
     * A falsy product id should short-circuit to an empty array.
     *
     * @return void
     */
    public function test_get_product_subscribers_email_returns_empty_array_for_falsy_product_id() {
        $this->assertSame( array(), \Notifima\Subscriber::get_product_subscribers_email( 0 ) );
    }
}
