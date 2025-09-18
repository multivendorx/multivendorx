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
    public function __construct(){

        add_action('wp_ajax_qna_submit', array($this, 'multivendorx_qna_submit'));
        add_action('wp_ajax_nopriv_qna_submit', array($this, 'multivendorx_qna_submit'));

        add_action('wp_ajax_qna_search', array($this, 'multivendorx_qna_search'));
        add_action('wp_ajax_nopriv_qna_search', array($this, 'multivendorx_qna_search'));

        add_action('wp_ajax_qna_vote', array($this, 'multivendorx_qna_vote'));

    }

    // Submit Question
    public function multivendorx_qna_submit() {
        check_ajax_referer('qna_ajax_nonce', 'nonce');
        if ( !is_user_logged_in() ) {
            wp_send_json_error(['message' => 'You must log in.']);
        }

        global $wpdb;
        $table = $wpdb->prefix . Utill::TABLES['product_qna'];
        $user_id = get_current_user_id();
        $question = sanitize_textarea_field($_POST['question']);
        $product_id = intval($_POST['product_id']);

        $wpdb->insert(
            $table,
            [
                'product_id'    => $product_id,
                'question_text' => $question,
                'question_by'   => $user_id,
                'question_date' => current_time('mysql'),
            ],
            [ '%d', '%s', '%d', '%s' ]
        );

        $insert_id = $wpdb->insert_id;

        wp_send_json_success([
            'id'       => $insert_id,
            'question' => $question,
            'votes'    => 0,
            'date'     => current_time('mysql'),
        ]);
    }

    public function multivendorx_qna_search() {
        check_ajax_referer('qna_ajax_nonce', 'nonce');

        $product_id = intval($_POST['product_id']);
        $search     = sanitize_text_field($_POST['search']);

        $rows =  Util::get_questions($product_id, $search);;

        ob_start();
        if ($rows) {
            foreach ($rows as $row) {
                ?>
                <li data-qna="<?php echo esc_attr($row->id); ?>">
                    <p><strong>Q:</strong> <?php echo esc_html($row->question_text); ?></p>
                    <button class="qna-vote" data-type="question">
                        👍 <span><?php echo intval($row->question_votes); ?></span>
                    </button>

                    <?php if ($row->answer_text) : ?>
                        <p><strong>A:</strong> <?php echo esc_html($row->answer_text); ?></p>
                        <button class="qna-vote" data-type="answer">
                            👍 <span><?php echo intval($row->answer_vote_count); ?></span>
                        </button>
                    <?php else : ?>
                        <em>No answer yet</em>
                    <?php endif; ?>
                </li>
                <?php
            }
        } else {
            echo '<li>No matching questions found.</li>';
        }
        $html = ob_get_clean();

        wp_send_json_success(['html' => $html]);
    }

    // Voting
    public function multivendorx_qna_vote() {
        check_ajax_referer('qna_ajax_nonce', 'nonce');

        if (!is_user_logged_in()) {
            wp_send_json_error(['message' => 'You must be logged in.']);
        }

        global $wpdb;
        $table = $wpdb->prefix . Utill::TABLES['product_qna'];
        $user_id = get_current_user_id();
        $qna_id  = intval($_POST['qna_id']);
        $type    = $_POST['type'] === 'up' ? 1 : -1; // 1 = upvote, -1 = downvote

        // Get current voters and total_votes
        $row = $wpdb->get_row($wpdb->prepare("SELECT voters, total_votes FROM $table WHERE id = %d", $qna_id));
        $voters = $row->voters ? maybe_unserialize($row->voters) : [];
        $total_votes = intval($row->total_votes);

        $previous_vote = $voters[$user_id] ?? 0;

        if ($previous_vote === $type) {
            // Clicking the same vote again does nothing
            wp_send_json_success([
                'total_votes' => $total_votes,
                'voters' => $voters
            ]);
        } else {
            // Remove previous vote effect if exists
            $total_votes -= $previous_vote;
            // Add new vote
            $voters[$user_id] = $type;
            $total_votes += $type;

            // Update database
            $wpdb->update(
                $table,
                [
                    'voters' => maybe_serialize($voters),
                    'total_votes' => $total_votes
                ],
                ['id' => $qna_id],
                ['%s', '%d'],
                ['%d']
            );

            wp_send_json_success([
                'total_votes' => $total_votes,
                'voters' => $voters
            ]);
        }
    }

}