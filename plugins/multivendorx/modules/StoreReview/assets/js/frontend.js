/* global review */
jQuery(document).ready(function($) {

    $('#review_submit').on('click', function(e) {
        e.preventDefault();

        let rating  = $('#rating').val();
        let comment = $('#comment').val();
        let store   = $('#store_for_rating').val();

        if (rating === '' || comment === '') {
            return;
        }

        $.ajax({
            url: review.ajaxurl,
            type: 'POST',
            data: {
                action: 'store_review_submit',
                rating: rating,
                comment: comment,
                store_for_rating: store,
                nonce: review.nonce
            },
            beforeSend: function() {
                $('#review_submit').attr('disabled', true).val('Submitting...');
            },
            success: function(response) {
                console.log(response)
                $('#review_submit').attr('disabled', false).val('Submit');
                if (response.success) {
                    alert(response.data.message);
                    $('#commentform')[0].reset();
                } else {
                    alert(response.data.message);
                }
            }
        });
    });

});