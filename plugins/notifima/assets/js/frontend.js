'use strict';

/* global jQuery, frontendLocalizer */
jQuery(function ($) {
    /**
     * Init event listener on page loading.
     * @return {undefined}
     */
    function init() {
        $(document).on('click', '.notifima-subscribe', subscribe);
        $(document).on('click', '.notifima-unsubscribe', unsubscribe);
        $(document).on(
            'change',
            'input.variation_id',
            getVariationSubscribeForm
        );
    }

    /**
     * Subscribe user on subscribe button click.
     *
     * @param {Object} event dom event object.
     * @return {undefined}
     */
    function subscribe(event) {
        // Prevent default form submission.
        event.preventDefault();

        /**
         * Subscriber form dom objects
         *
         * @var {Object} dom objects
         */
        const form = $(this).closest('.notifima-subscribe-form');

        // Set button as processing and disable click event.
        $(this).text(frontendLocalizer.processing);
        $(this).addClass('submit_btn_disabled');

        const recaptchaEnabled = frontendLocalizer.recaptcha_enabled;

        // Recaptcha is enabled validate recaptcha then process form
        if (recaptchaEnabled) {
            const recaptchaSecret = form.find('#recaptchav3_secretkey').val();
            const recaptchaResponse = form.find('#recaptchav3_response').val();

            // Prepare recaptcha request data.
            const recaptchRequest = {
                action: 'recaptcha_validate_ajax',
                nonce: frontendLocalizer.nonce,
                recaptcha_secret: recaptchaSecret,
                recaptcha_response: recaptchaResponse,
            };

            // Request for recaptcha validation
            $.post(
                frontendLocalizer.ajax_url,
                recaptchRequest,
                function (response) {
                    // If valid response process form submition.
                    if (response) {
                        processForm(form);
                    } else {
                        // Response is not a valid response alert and enable click.
                        alert('Oops, recaptcha not verified!');
                        $(this).removeClass('submit_btn_disabled');
                    }
                }
            );
        } else {
            processForm(form);
        }
    }

    /**
     * Process subscription
     * @param {Object}
     */
    function processForm(form) {
        // Get data from form.
        const customerEmail = form.find('.notifima-email').val();
        const productId = form.find('.notifima-product-id').val();
        const variationId = form.find('.notifima-variation-id').val();
        const productTitle = form.find('.notifima-product-name').val();

        // Get data from localizer
        const buttonHtml = frontendLocalizer.button_html;

        $(this).toggleClass('alert_loader').blur();

        // Request data for subscription
        const requestData = {
            action: 'subscribe_users',
            nonce: frontendLocalizer.nonce,
            customer_email: customerEmail,
            product_id: productId,
            product_title: productTitle,
            variation_id: variationId,
        };

        // Add additional fields data
        frontendLocalizer.additional_fields.forEach((element) => {
            requestData[element] = $('#notifima_' + element).val();
        });

        // Request for subscription
        $.post(frontendLocalizer.ajax_url, requestData, function (response) {
            console.log(response);
            // Handle response
            if (response.status) {
                form.html(response.message);
            } else {
                form.find(`.responsedata-error-message`).remove() &&
                    form.html(response.message);
            }
            form.find('.notifima-subscribe').replaceWith(buttonHtml);
        });
    }

    /**
     * Unsubscribe user on subscribe button click.
     * @param {Object} event dom event object.
     * @return {undefined}
     */
    function unsubscribe(event) {
        // Prevent default from submittion.
        event.preventDefault();

        /**
         * Subscriber form dom objects
         * @var {Object} dom objects
         */
        const form = $(this).parent().parent();

        // Set button as processing and disable click event.
        $(this).text(frontendLocalizer.processing);
        $(this).addClass('submit_btn_disabled');

        // Unsubscribe request data
        const unsubscribeRequest = {
            action: 'unsubscribe_users',
            nonce: frontendLocalizer.nonce,
            customer_email: form.find('.notifima_subscribed_email').val(),
            product_id: form.find('.notifima_product_id').val(),
            variation_id: form.find('.notifima_variation_id').val(),
        };

        // Request for unsubscribe user.
        $.post(
            frontendLocalizer.ajax_url,
            unsubscribeRequest,
            function (response) {
                // unsubscribe success
                if (response) {
                    form.html(response.message);
                }
                // Enable submit button.
                $(this).removeClass('submit_btn_disabled');
            }
        );
    }

    /**
     * Get subscription form of variation product.
     */
    function getVariationSubscribeForm() {
        const variationId = Number($(this).val());
        const productId = Number(
            $('.notifima-shortcode-subscribe-form').data('product-id')
        );

        // Subscription form exist and variation id exist
        if ($('.notifima-shortcode-subscribe-form').length && variationId) {
            // Request body for subscription form
            const subscriptionFormRequest = {
                action: 'get_subscription_form_for_variation',
                nonce: frontendLocalizer.nonce,
                product_id: productId,
                variation_id: variationId,
            };

            // Request for subscription form
            $.post(
                frontendLocalizer.ajax_url,
                subscriptionFormRequest,
                function (response) {
                    // Set subscription form as inner-html
                    $('.notifima-shortcode-subscribe-form').html(response);
                }
            );
        } else {
            // Variation not exist.
            $('.notifima-shortcode-subscribe-form').html('');
        }
    }

    // Call init function
    init();
});
