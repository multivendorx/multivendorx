/* global jQuery */
jQuery(document).ready(function ($) {
    $('#catalogx-modal').hide();
    var $enquiryBtn = $('.catalogx-enquiry-btn');
    if ($('form.variations_form').length > 0) {
        $enquiryBtn.hide();
    }
    $('form.variations_form').on('show_variation', function (event, variation) {
        $enquiryBtn.show();
    });

    $('form.variations_form').on('hide_variation', function (event) {
        $enquiryBtn.hide();
    });

    $('.catalogx-modal-close-btn').on('click', function (event) {
        $('#catalogx-modal').hide();
    });

    $('#catalogx-enquiry .catalogx-enquiry-btn').on('click', function () {
        $('#catalogx-modal').slideToggle(1000);
    });
    $('#catalogx-close-enquiry-popup').on('click', function (e) {
        e.preventDefault();
        $('#catalogx-modal').slideToggle(1000);
    });

    $('form.variations_form').on(
        'found_variation',
        function (event, variation) {
            let variationData = {};
            let chosen = 0;
            let variationId = '';

            // Select the variation form
            let variationSelector =
                event?.target || 'form.variations_form.cart';

            // Loop through variation selects and store selected values
            $(variationSelector)
                .find('.variations select')
                .each(function () {
                    let attributeName =
                        $(this).data('attribute_name') || $(this).attr('name');
                    let value = $(this).val() || '';
                    variationData[attributeName] = value;
                });

            // Determine the variation ID
            variationId =
                variation.variation_id ||
                variation.id ||
                $('form.variations_form').data('product_id');
            $('#product-id-for-enquiry').val(variationId);

            $.post(
                enquiryFrontend.ajaxurl,
                {
                    action: 'add_variation_for_enquiry_mail',
                    product_id: variationId,
                    variation_data: variationData,
                },
                function (response) {
                    console.log(response);
                }
            );
        }
    );
});
