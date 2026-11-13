<?php
/**
 * Tests for Notifima\Utill::get_subscribers()'s filter/query-builder logic.
 *
 * @package Notifima
 */

/**
 * Covers Utill::get_subscribers(), the single query builder every subscriber
 * list/count in both the free and Pro plugin ultimately goes through -
 * product_ids filtering, email search, status filtering, date range
 * filtering, count mode, and limit/offset pagination.
 */
class Notifima_Utill_Get_Subscribers_Test extends WP_UnitTestCase {

    /**
     * Two out-of-stock products, each with subscribers in different statuses.
     *
     * @var int[]
     */
    private $product_ids = array();

    /**
     * Create two products and a handful of subscriber rows across both
     * products and multiple statuses before each test.
     *
     * @return void
     */
    public function set_up() {
        parent::set_up();

        foreach ( array( 'Get Subscribers Test Product A', 'Get Subscribers Test Product B' ) as $name ) {
            $product = new WC_Product_Simple();
            $product->set_name( $name );
            $product->set_regular_price( '10.00' );
            $product->set_stock_status( 'outofstock' );
            $product->save();

            $this->product_ids[] = $product->get_id();
        }

        \Notifima\Subscriber::insert_subscriber( 'active-a@example.com', $this->product_ids[0] );
        \Notifima\Subscriber::insert_subscriber( 'active-b@example.com', $this->product_ids[1] );
        \Notifima\Subscriber::insert_subscriber( 'left@example.com', $this->product_ids[0] );
        \Notifima\Subscriber::remove_subscriber( $this->product_ids[0], 'left@example.com' );
    }

    /**
     * With no filters at all, every row across every product must be
     * returned.
     *
     * @return void
     */
    public function test_get_subscribers_with_no_filters_returns_every_row() {
        $results = \Notifima\Utill::get_subscribers( array() );

        $this->assertCount( 3, $results );
    }

    /**
     * Filtering by product_ids must only return rows for those products.
     *
     * @return void
     */
    public function test_get_subscribers_filters_by_product_ids() {
        $results = \Notifima\Utill::get_subscribers(
            array( 'product_ids' => array( $this->product_ids[1] ) )
        );

        $this->assertCount( 1, $results );
        $this->assertSame( 'active-b@example.com', $results[0]->email );
    }

    /**
     * The email filter must be a partial (LIKE) match, not an exact match.
     *
     * @return void
     */
    public function test_get_subscribers_email_filter_is_a_partial_match() {
        $results = \Notifima\Utill::get_subscribers( array( 'email' => 'active-' ) );

        $this->assertCount( 2, $results );
    }

    /**
     * The status filter must exclude non-matching rows, and 'all' must
     * bypass the status filter entirely.
     *
     * @return void
     */
    public function test_get_subscribers_status_filter_excludes_non_matching_rows() {
        $subscribed = \Notifima\Utill::get_subscribers( array( 'status' => 'subscribed' ) );
        $this->assertCount( 2, $subscribed );

        $unsubscribed = \Notifima\Utill::get_subscribers( array( 'status' => 'unsubscribed' ) );
        $this->assertCount( 1, $unsubscribed );

        $all = \Notifima\Utill::get_subscribers( array( 'status' => 'all' ) );
        $this->assertCount( 3, $all );
    }

    /**
     * Count mode must return an integer count, not a row set, and must
     * still respect the other filters.
     *
     * @return void
     */
    public function test_get_subscribers_count_mode_returns_a_filtered_integer_count() {
        $count = \Notifima\Utill::get_subscribers(
            array(
                'count'  => true,
                'status' => 'subscribed',
            )
        );

        $this->assertSame( 2, $count );
        $this->assertIsInt( $count );
    }

    /**
     * The start_date/end_date filter must only match rows created within
     * that window.
     *
     * @return void
     */
    public function test_get_subscribers_date_range_filter_excludes_rows_outside_the_window() {
        $future_start = time() + DAY_IN_SECONDS;
        $future_end   = time() + ( 2 * DAY_IN_SECONDS );

        $results = \Notifima\Utill::get_subscribers(
            array(
                'start_date' => $future_start,
                'end_date'   => $future_end,
            )
        );

        $this->assertCount( 0, $results );
    }

    /**
     * Limit/offset must page results rather than silently ignoring them.
     *
     * @return void
     */
    public function test_get_subscribers_limit_and_offset_page_the_results() {
        $page_one = \Notifima\Utill::get_subscribers(
            array(
                'status' => 'all',
                'limit'  => 2,
                'offset' => 0,
            )
        );
        $page_two = \Notifima\Utill::get_subscribers(
            array(
                'status' => 'all',
                'limit'  => 2,
                'offset' => 2,
            )
        );

        $this->assertCount( 2, $page_one );
        $this->assertCount( 1, $page_two );
    }
}
