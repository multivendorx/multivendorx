<?php
/**
 * MultiVendorX Ajax class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\QuestionsAnswers;

use MultiVendorX\Utill;

/**
 * MultiVendorX Questions Answers Ajax class
 *
 * @class       Ajax class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Ajax {
    public function __construct() {

        add_action( 'wp_ajax_qna_submit', array( $this, 'multivendorx_qna_submit' ) );
        add_action( 'wp_ajax_nopriv_qna_submit', array( $this, 'multivendorx_qna_submit' ) );

        add_action( 'wp_ajax_qna_search', array( $this, 'multivendorx_qna_search' ) );
        add_action( 'wp_ajax_nopriv_qna_search', array( $this, 'multivendorx_qna_search' ) );

        add_action( 'wp_ajax_qna_vote', array( $this, 'multivendorx_qna_vote' ) );
    }

    // Submit Question
    public function multivendorx_qna_submit() {
        check_ajax_referer( 'qna_ajax_nonce', 'nonce' );
        if ( ! is_user_logged_in() ) {
            wp_send_json_error( array( 'message' => 'You must log in.' ) );
        }

        global $wpdb;
        $table      = $wpdb->prefix . Utill::TABLES['product_qna'];
        $user_id    = get_current_user_id();
        $question   = sanitize_textarea_field( $_POST['question'] );
        $product_id = filter_input( INPUT_POST, 'product_id', FILTER_VALIDATE_INT ) ?: 0;
        $store_id   = intval( get_post_meta( $product_id, 'multivendorx_store_id', true ) ?: 0 );

        $wpdb->insert(
            $table,
            array(
                'product_id'    => $product_id,
                'store_id'      => $store_id,
                'question_text' => $question,
                'question_by'   => $user_id,
                'question_date' => current_time( 'mysql' ),
            ),
            array( '%d', '%d', '%s', '%d', '%s' )
        );

        $insert_id = $wpdb->insert_id;

        wp_send_json_success(
            array(
				'id'       => $insert_id,
				'question' => $question,
				'votes'    => 0,
				'date'     => current_time( 'mysql' ),
            )
        );
    }

    public function multivendorx_qna_search() {
        check_ajax_referer( 'qna_ajax_nonce', 'nonce' );

        $product_id = intval( $_POST['product_id'] );
        $search     = sanitize_text_field( $_POST['search'] );

        // Get filtered questions (you may update Util::get_questions to handle $search).
        $rows = Util::get_questions( $product_id, $search );

        // Filter only answered.
        $answered_rows = array_filter(
            $rows,
            function ( $q ) {
				return ! empty( $q->answer_text );
			}
        );

        ob_start();

        if ( ! empty( $answered_rows ) ) {
            foreach ( $answered_rows as $row ) {
                ?>
                <li data-qna="<?php echo esc_attr( $row->id ); ?>" class="qna-item">
                    <p class="qna-question"><strong>Q:</strong> <?php echo esc_html( $row->question_text ); ?></p>
                    <small class="qna-meta">
                        By <?php echo esc_html( get_the_author_meta( 'display_name', $row->question_by ) ); ?>,
                        <?php echo esc_html( human_time_diff( strtotime( $row->question_date ), current_time( 'timestamp' ) ) ) . ' ago'; ?>
                    </small>
    
                    <p class="qna-answer"><strong>A:</strong> <?php echo esc_html( $row->answer_text ); ?></p>
    
                    <!-- Voting buttons -->
                    <div class="qna-votes">
                        <span class="qna-vote adminlib-thumbs-ok admin-badge green" data-type="up"></span>
                        <span class="qna-vote adminlib-thumbs-ok admin-badge red" data-type="down"></span>
                        <p><?php echo intval( $row->total_votes ); ?></p>
                    </div>
                </li>
                <?php
            }
        } else {
            echo '<li>No matching questions found.</li>';
        }

        $html = ob_get_clean();

        wp_send_json_success( array( 'html' => $html ) );
    }


    // Voting.
    public function multivendorx_qna_vote() {
        check_ajax_referer( 'qna_ajax_nonce', 'nonce' );

        if ( ! is_user_logged_in() ) {
            wp_send_json_error( array( 'message' => 'You must be logged in.' ) );
        }

        global $wpdb;
        $table   = $wpdb->prefix . Utill::TABLES['product_qna'];
        $user_id = get_current_user_id();
        $qna_id  = intval( $_POST['qna_id'] );
        $type    = $_POST['type'] === 'up' ? 1 : -1;

        // Get current voters and total_votes.
        $row         = $wpdb->get_row( $wpdb->prepare( "SELECT voters, total_votes FROM $table WHERE id = %d", $qna_id ) );
        $voters      = $row->voters ? maybe_unserialize( $row->voters ) : array();
        $total_votes = intval( $row->total_votes );

        $previous_vote = $voters[ $user_id ] ?? 0;

        if ( $previous_vote === $type ) {
            // Clicking the same vote again does nothing.
            wp_send_json_success(
                array(
					'total_votes' => $total_votes,
					'voters'      => $voters,
                )
            );
        } else {
            // Remove previous vote effect if exists.
            $total_votes -= $previous_vote;
            // Add new vote.
            $voters[ $user_id ] = $type;
            $total_votes       += $type;

            // Update database.
            $wpdb->update(
                $table,
                array(
                    'voters'      => maybe_serialize( $voters ),
                    'total_votes' => $total_votes,
                ),
                array( 'id' => $qna_id ),
                array( '%s', '%d' ),
                array( '%d' )
            );

            wp_send_json_success(
                array(
					'total_votes' => $total_votes,
					'voters'      => $voters,
                )
            );
        }
    }
}