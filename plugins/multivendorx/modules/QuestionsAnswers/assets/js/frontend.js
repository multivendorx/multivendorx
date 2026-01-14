/* global jQuery, qnaFrontend */
jQuery(document).ready(function ($) {

    let productId = $('#product-qna').data('product');

    // Load all questions on page load
    loadQuestions('');

    // Show form
    $(document).on('click', '#qna-show-form', function () {
        $('#qna-form').slideDown();
        $(this).hide();
    });
    // Search questions
    $(document).on('keyup', '#qna-search', function () {
        let keyword = $(this).val().trim();
        if (keyword) {
            $('#qna-direct-submit').hide(); // default hide
            loadQuestions(keyword);
        } else {
            $('#qna-direct-submit').hide();
            loadQuestions('');
        }
    });

    // Submit search as direct question
    $(document).on('click', '#qna-direct-submit', function () {

        const $btn = $(this);
    
        // Prevent multiple clicks
        if ($btn.prop('disabled')) {
            return;
        }
    
        $btn.prop('disabled', true).text('Submitting...');
    
        let question = $btn.data('question');
    
        $.post(qnaFrontend.ajaxurl, {
            action: 'qna_submit',
            product_id: productId,
            question: question,
            nonce: qnaFrontend.nonce
        }, function (res) {
    
            if (res.success) {
                $('#qna-search').val('');
                $('#qna-success-message')
                    .fadeIn()
                    .delay(2000)
                    .fadeOut(function () {
                        loadQuestions('');
                    });
            } else {
                alert(res.data.message);
                // Re-enable if failed
                $btn.prop('disabled', false).text('(Ask now)');
            }
        });
    });

    // Voting
    $(document).on('click', '.qna-vote', function () {
        let $vote = $(this),
            type = $vote.data('type'),
            $item = $vote.closest('.qna-item'),
            qnaId = $item.data('qna');

        $.post(qnaFrontend.ajaxurl, {
            action: 'qna_vote',
            qna_id: qnaId,
            type: type,
            nonce: qnaFrontend.nonce
        }, function (res) {
            if (res.success) {
                $item.find('.qna-votes p').text(res.data.total_votes);
            } else alert(res.data.message);
        });
    });

    // Function to load questions via AJAX
    function loadQuestions(search) {
        $.post(qnaFrontend.ajaxurl, {
            action: 'qna_search',
            product_id: productId,
            search: search || '',
            nonce: qnaFrontend.nonce
        }, function (res) {
    
            if (!res.success) return;
    
            $('#qna-list').empty();
    
            if (!res.data.has_items && search) {
                $('#qna-list').html(`
                    <li class="qna-empty">
                        Have not discovered the information you seek
                        <button
                            type="submit"
                            id="qna-direct-submit"
                            data-question="${search}"
                            class="woocommerce-button button">
                            Ask now
                        </button>
                    </li>
                `);
            } else {
                $('#qna-list').html(res.data.html);
            }
        });
    }    

});
