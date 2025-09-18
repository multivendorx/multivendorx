<?php
use MultiVendorX\QuestionsAnswers\Util;

$product_id = $args['product_id'];
$questions = Util::get_questions($product_id);

// Filter only questions with answers
$answered_questions = array_filter($questions, function($q) {
    return !empty($q->answer_text);
});
?>

<div id="product-qna" data-product="<?php echo esc_attr($product_id); ?>">

    <h3>Questions about this product</h3>

    <!-- Search -->
    <div class="qna-search">
        <input type="text" id="qna-search" placeholder="Search questions...">
    </div>

    <!-- Questions List -->
    <ul id="qna-list">
        <?php if ($answered_questions) : ?>
            <?php foreach ($answered_questions as $row) : ?>
                <li data-qna="<?php echo esc_attr($row->id); ?>" class="qna-item">
                    <p class="qna-question"><strong>Q:</strong> <?php echo esc_html($row->question_text); ?></p>
                    <small class="qna-meta">
                        by <?php echo esc_html(get_the_author_meta('display_name', $row->question_by)); ?>,
                        <?php echo esc_html(human_time_diff(strtotime($row->question_date), current_time('timestamp'))) . ' ago'; ?>
                    </small>

                    <p class="qna-answer"><strong>A:</strong> <?php echo esc_html($row->answer_text); ?></p>

                    <!-- Voting buttons -->
                    <div class="qna-votes">
                        <button class="qna-vote" data-type="up">👍</button>
                        <button class="qna-vote" data-type="down">👎</button>
                        <p><?php echo intval($row->total_votes); ?></p>
                    </div>
                </li>
            <?php endforeach; ?>
        <?php else : ?>
            <li>No questions yet.</li>
        <?php endif; ?>
    </ul>

    <!-- Ask Question -->
    <?php if (is_user_logged_in()) : ?>
        <div id="qna-form" style="display:none; margin-top:20px;">
            <h4>Ask a Question</h4>
            <textarea id="qna-question" placeholder="Type your question..."></textarea><br>
            <button type="submit" id="qna-submit" class="qna-btn qna-btn-red">Submit</button>
        </div>
        <div class="qna-cta">
            <button type="button" id="qna-show-form" class="qna-btn qna-btn-red">Post your Question</button>
        </div>
    <?php else : ?>
        <div class="qna-cta">
            <a href="<?php echo esc_url(wc_get_page_permalink('myaccount')); ?>" class="qna-btn qna-btn-red">
                Log in to Ask
            </a>
        </div>
    <?php endif; ?>

</div>
