<?php
/**
 * Tests for Notifima\Utill::get_subscriber_records().
 *
 * @package Notifima
 */

/**
 * Covers Utill::get_subscriber_records()'s batched product/thumbnail lookup,
 * guarding the per-row-to-batch refactor against regressions.
 */
class Notifima_Utill_Subscriber_Records_Test extends WP_UnitTestCase {

    /**
     * Two out-of-stock products, each with its own subscriber.
     *
     * @var int[]
     */
    private $product_ids = array();

    /**
     * Create two products, each with one subscribed email, before each test.
     *
     * @return void
     */
    public function set_up() {
        parent::set_up();

        foreach ( array( 'Record Test Product A', 'Record Test Product B' ) as $name ) {
            $product = new WC_Product_Simple();
            $product->set_name( $name );
            $product->set_regular_price( '10.00' );
            $product->set_stock_status( 'outofstock' );
            $product->save();

            $this->product_ids[] = $product->get_id();
        }

        \Notifima\Subscriber::insert_subscriber( 'subscriber-a@example.com', $this->product_ids[0] );
        \Notifima\Subscriber::insert_subscriber( 'subscriber-b@example.com', $this->product_ids[1] );
    }

    /**
     * Every subscriber row should still resolve its own product name and id,
     * even though products are now fetched via a single batched lookup.
     *
     * @return void
     */
    public function test_get_subscriber_records_resolves_each_row_to_its_own_product() {
        $records = \Notifima\Utill::get_subscriber_records(
            array( 'subscribers' => array( 'product_ids' => $this->product_ids ) )
        );

        $this->assertCount( 2, $records['items'] );

        $items_by_email = array();
        foreach ( $records['items'] as $item ) {
            $items_by_email[ $item['email'] ] = $item;
        }

        $this->assertSame( $this->product_ids[0], $items_by_email['subscriber-a@example.com']['product_id'] );
        $this->assertSame( 'Record Test Product A', $items_by_email['subscriber-a@example.com']['product'] );

        $this->assertSame( $this->product_ids[1], $items_by_email['subscriber-b@example.com']['product_id'] );
        $this->assertSame( 'Record Test Product B', $items_by_email['subscriber-b@example.com']['product'] );
    }

    /**
     * A subscriber row referencing a product id with no matching post (e.g. a
     * stale/orphaned reference) should degrade to empty product fields via the
     * batched lookup's `?? null` fallback, rather than erroring.
     *
     * @return void
     */
    public function test_get_subscriber_records_handles_an_orphaned_product_id_gracefully() {
        // Deliberately never created as a post - insert_subscriber() has no FK check.
        $orphan_product_id = 999999999;

        \Notifima\Subscriber::insert_subscriber( 'subscriber-c@example.com', $orphan_product_id );

        $records = \Notifima\Utill::get_subscriber_records(
            array( 'subscribers' => array( 'product_ids' => array( $orphan_product_id ) ) )
        );

        $this->assertCount( 1, $records['items'] );
        $this->assertSame( '', $records['items'][0]['product'] );
        $this->assertSame( '', $records['items'][0]['product_id'] );
    }
}
