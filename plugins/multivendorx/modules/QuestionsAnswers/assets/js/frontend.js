/* global qnaFrontend */
jQuery(document).ready(function($) {
    // Show hidden form when clicking "Post your Question"
    $(document).on('click', '#qna-show-form', function() {
        $('#qna-form').slideDown();
        $(this).hide();
    });

    // Submit new question
    $(document).on('click', '#qna-submit', function() {
        let question = $('#qna-question').val();
        let productId = $('#product-qna').data('product');
        if (!question.trim()) return;

        $.post(qnaFrontend.ajaxurl, {
            action: 'qna_submit',
            product_id: productId,
            question: question,
            nonce: qnaFrontend.nonce
        }, function(res) {
            if (res.success) {
                let q = res.data;
                // $('#qna-list').append(
                //     `<li data-qna="${q.id}">
                //         <p><strong>Q:</strong> ${q.question}</p>
                //         <button class="qna-vote" data-type="question">👍 <span>0</span></button>
                //         <em>No answer yet</em>
                //     </li>`
                // );
                $('#qna-question').val('');
                $('#qna-form').slideUp();
                $('#qna-show-form').show();
            } else {
                alert(res.data.message);
            }
        });
    });

    $(document).on('keyup', '#qna-search', function() {
        let keyword = $(this).val();
        let productId = $('#product-qna').data('product');

        $.post(qnaFrontend.ajaxurl, {
            action: 'qna_search',
            product_id: productId,
            search: keyword,
            nonce: qnaFrontend.nonce
        }, function(res) {
            if (res.success) {
                $('#qna-list').html(res.data.html);
                // $('#qna-form').slideUp();
                $('#qna-show-form').show();
            }
        });
    });

    // Voting
    $('#qna-list').on('click', '.qna-vote', function(){
        var btn = $(this);
        var li = btn.closest('.qna-item');
        var qna_id = li.data('qna');
        var type = btn.data('type');

        $.ajax({
            url: qnaFrontend.ajaxurl,
            type: 'POST',
            data: {
                action: 'qna_vote',
                qna_id: qna_id,
                type: type,
                nonce: qnaFrontend.nonce
            },
            success: function(response){
                if(response.success){
                    li.find('.qna-votes p').text(response.data.total_votes);
                } else {
                    alert(response.data.message);
                }
            }
        });
    });

});
