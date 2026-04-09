<?php
/**
 * MultiVendorX Ajax class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\CustomerQueries;

use MultiVendorX\Store\Store;
use MultiVendorX\Utill;
/**
 * MultiVendorX Questions Answers Ajax class
 *
 * @class       Ajax class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Ajax {

    /**
     * Constructor. Registers AJAX actions and enqueues dashicons.
     */
    public function __construct() {
        add_action( 'wp_ajax_qna_submit', array( $this, 'submit_question' ) );
        add_action( 'wp_ajax_nopriv_qna_submit', array( $this, 'submit_question' ) );

        add_action( 'wp_ajax_qna_search', array( $this, 'search_questions' ) );
        add_action( 'wp_ajax_nopriv_qna_search', array( $this, 'search_questions' ) );

        add_action( 'wp_ajax_qna_vote', array( $this, 'vote_question' ) );

        // Load dashicons on frontend so vote icons are visible.
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_dashicons' ) );
    }

    /**
     * Enqueue dashicons for frontend
     */
    public function enqueue_dashicons() {
        wp_enqueue_style( 'dashicons' );
    }

    /**
     * Submit a question via AJAX
     */
    public function submit_question() {
        check_ajax_referer( 'multivendorx-qna-frontend-script', 'nonce' );

        if ( ! is_user_logged_in() ) {
            wp_send_json_error( array( 'message' => 'You must log in to submit a question.' ) );
        }

        $user_id    = MultiVendorX()->current_user_id;
        $question   = sanitize_textarea_field( filter_input( INPUT_POST, 'question', FILTER_UNSAFE_RAW ) );
        $product_id = filter_input( INPUT_POST, 'product_id', FILTER_VALIDATE_INT );

        if ( empty( $question ) || ! $product_id ) {
            wp_send_json_error( array( 'message' => 'Invalid question or product ID.' ) );
        }

        $store_id = intval( get_post_meta( $product_id, Utill::POST_META_SETTINGS['store_id'], true ) ?? 0 );

        $data = array(
            'product_id'    => $product_id,
            'store_id'      => $store_id,
            'question_text' => $question,
            'question_by'   => $user_id,
            'total_votes'   => 0,
            'voters'        => array(),
            'answer_text'   => '',
        );
        // Insert question using Util class.
        $inserted = Util::insert_question( $data );
        if ( $inserted ) {
            $store   = new Store( $store_id );
            $product = wc_get_product( $product_id );

            MultiVendorX()->notifications->send_notification_helper('product_question_submitted', $store, null, [
                'product_name'  => $product->get_name(),
                'customer_name' => get_user_by( 'id', $user_id )->display_name,
                'category'      => 'activity',
            ]);
            wp_send_json_success( array( 'message' => 'Question submitted successfully.' ) );
        } else {
            wp_send_json_error( array( 'message' => 'Failed to submit question.' ) );
        }
    }

    /**
     * Fetch all answered questions via AJAX
     */
    public function search_questions() {
        check_ajax_referer( 'multivendorx-qna-frontend-script', 'nonce' );

        $product_id = filter_input( INPUT_POST, 'product_id', FILTER_VALIDATE_INT );
        $search_raw = filter_input( INPUT_POST, 'search', FILTER_UNSAFE_RAW );
        $search     = sanitize_text_field( $search_raw );

        if ( ! $product_id ) {
            wp_send_json_error( array( 'html' => '<li>Invalid product ID.</li>' ) );
        }

        $questions = Util::get_question_information(
            array(
				'product_ids'         => array( $product_id ),
				'has_answer'          => true,
				'question_visibility' => 'public',
				'orderBy'             => 'question_date',
				'order'               => 'DESC',
				'search'              => $search,
            )
        );

        ob_start();

        if ( ! empty( $questions ) ) {
            foreach ( $questions as $row ) {
                ?>
                <li data-qna="<?php echo esc_attr( $row['id'] ); ?>" class="qna-item review byuser comment-author-customer">
                    <div class="comment_container">
                        <div class="comment-text">
                            <p class="qna-question meta">
                                <strong class="woocommerce-review__author">Q: <?php echo esc_html( $row['question_text'] ); ?> </strong>
                                <em class="woocommerce-review__verified verified">(By <?php echo esc_html( get_the_author_meta( 'display_name', $row['question_by'] ) ); ?>)</em>
                                <time class="woocommerce-review__published-date"><?php echo esc_html( human_time_diff( strtotime( $row['question_date'] ), time() ) ) . ' ago'; ?></time>
                            </p>
                            <div class="description"><strong>A:</strong> <?php echo esc_html( $row['answer_text'] ); ?></div>
                            <div class="qna-votes">
                                <span class="qna-vote dashicons dashicons-thumbs-up" data-type="up"></span>
                                <span class="qna-vote dashicons dashicons-thumbs-down" data-type="down"></span>
                                <p><?php echo intval( $row['total_votes'] ); ?></p>
                            </div>
                        </div>
                    </div>
                </li>
                <?php
            }
        }

        $html = ob_get_clean();
        wp_send_json_success(
            array(
				'html'      => $html,
				'has_items' => ! empty( $questions ),
            )
        );
    }

    /**
     * Vote on a question via AJAX
     */
    public function vote_question() {
        check_ajax_referer( 'multivendorx-qna-frontend-script', 'nonce' );

        if ( ! is_user_logged_in() ) {
            wp_send_json_error( array( 'message' => 'You must be logged in to vote.' ) );
        }

        $user_id = MultiVendorX()->current_user_id;
        $qna_id  = filter_input( INPUT_POST, 'qna_id', FILTER_VALIDATE_INT );
        $type    = ( filter_input( INPUT_POST, 'type', FILTER_UNSAFE_RAW ) === 'up' ) ? 1 : -1;

        if ( ! $qna_id ) {
            wp_send_json_error( array( 'message' => 'Invalid question ID.' ) );
        }

        $row = Util::get_question_information( array( 'id' => $qna_id ) )[0] ?? null;

        if ( ! $row ) {
            wp_send_json_error( array( 'message' => 'Question not found.' ) );
        }

        $voters      = maybe_unserialize( $row['voters'] );
        $total_votes = intval( $row['total_votes'] );

        $prev_vote = $voters[ $user_id ] ?? 0;

        if ( $prev_vote === $type ) {
            wp_send_json_success( array( 'total_votes' => $total_votes ) );
        }

        $total_votes        = $total_votes - $prev_vote + $type;
        $voters[ $user_id ] = $type;

        Util::update_question(
            $qna_id,
            array(
				'total_votes' => $total_votes,
				'voters'      => $voters,
            )
        );
        wp_send_json_success( array( 'total_votes' => $total_votes ) );
    }
}
