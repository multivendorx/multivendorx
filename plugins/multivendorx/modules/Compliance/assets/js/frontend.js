/*global jQuery reportAbuseFrontend */
jQuery(function ($) {
	function showThemeNotice(container, type, message) {
		var $container = $(container);
		$container.empty(); // Clear previous messages

		var noticeHtml = '<div class="wc-block-components-notice-banner is-' + type + '">' +
			'<div class="wc-block-components-notice-banner__content">' +
			'<strong>' + capitalizeFirstLetter(type) + ':</strong> ' + message +
			'</div>' +
			'</div>';

		$container.html(noticeHtml);
	}

	function capitalizeFirstLetter(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	// Fetch reasons dynamically (expects popup already open)
	$(document).on('click', '.open-report-abuse', function (e) {
		e.preventDefault();

		var $form = $(this).siblings('.report-abuse-form');
		var $wrapper = $form.find('.report-abuse-reasons-wrapper');

		// Fetch reasons only once
		if ($wrapper.children().length === 0) {
			$.ajax({
				url: reportAbuseFrontend.ajaxurl,
				type: 'POST',
				data: { action: 'get_report_reasons' },
				success: function (res) {
					if (res.success) {
						$.each(res.data, function (i, reason) {
							var radio =
								'<div class="woocommerce-form__radio">' +
								'<label class="woocommerce-form__label woocommerce-form__label-for-radio">' +
								'<input type="radio" class="woocommerce-form__input woocommerce-form__input-radio" ' +
								'name="report_abuse_reason_' +
								$form.find('.report_abuse_product_id').val() +
								'" value="' +
								reason +
								'"> <span>' +
								reason +
								'</span></label></div>';

							$wrapper.append(radio);
						});
					}
				},
			});
		}
	});

	// Show/hide custom message textarea if "Other" is selected
	$(document).on(
		'change',
		'.report-abuse-reasons-wrapper input[type=radio]',
		function () {
			var $form = $(this).closest('.report-abuse-form');

			if ($(this).val().toLowerCase() === 'other') {
				$form.find('.report-abuse-custom-msg').show();
			} else {
				$form.find('.report-abuse-custom-msg').hide();
			}
		}
	);

	// Submit abuse report
	$(document).on('click', '.submit-report-abuse', function (e) {
		e.preventDefault();

		var $btn = $(this);
		if ($btn.prop('disabled')) return;

		var $form = $btn.closest('.report-abuse-form');
		var name = $form.find('.report-abuse-name').val().trim();
		var email = $form.find('.report-abuse-email').val().trim();
		var reason = $form
			.find('.report-abuse-reasons-wrapper input[type=radio]:checked')
			.val();

		var msg =
			reason === 'Other'
				? $form.find('.report-abuse-msg').val().trim()
				: reason;

		var pid = $form.find('.report_abuse_product_id').val();
		var $msgBox = $form.find('.report-abuse-msg-box');

		$msgBox.empty();

		var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (!name || !email || !reason || !msg) {
			showThemeNotice($msgBox, 'error', 'All fields are required.');
			return;
		}

		if (!emailRegex.test(email)) {
			showThemeNotice($msgBox, 'error', 'Please enter a valid email address.');
			return;
		}

		$btn.prop('disabled', true);
		$btn.find('.btn-text').hide();
		$btn.find('.btn-spinner').show();

		$.ajax({
			url: reportAbuseFrontend.ajaxurl,
			type: 'POST',
			data: {
				action: 'multivendorx_submit_report_abuse',
				nonce: reportAbuseFrontend.nonce,
				name: name,
				email: email,
				message: msg,
				product_id: pid,
			},
			success: function (res) {
				if (res.success) {
					$msgBox.html(
						'<div class="wc-block-components-notice-banner is-success">' +
						'<div class="wc-block-components-notice-banner__content">' +
						'<strong>Success:</strong> ' +
						res.data +
						'</div></div>'
					);

					setTimeout(function () {
						$form.find('.report-abuse-msg-box').empty();
					}, 1000);

					$form
						.find('input[type=text], input[type=email], textarea')
						.val('');
					$form.find('input[type=radio]').prop('checked', false);
					$form.find('.report-abuse-custom-msg').hide();
				} else {
					showThemeNotice($msgBox, 'error', res.data);
				}

				$btn.prop('disabled', false);
				$btn.find('.btn-text').show();
				$btn.find('.btn-spinner').hide();
			},
			error: function () {
				showThemeNotice(
					$msgBox,
					'error',
					'Something went wrong. Try again.'
				);

				$btn.prop('disabled', false);
				$btn.find('.btn-text').show();
				$btn.find('.btn-spinner').hide();
			},
		});
	});





	// OPEN popup
	$(document).on('click', '.open-popup', function (e) {
		e.preventDefault();
		e.stopPropagation();

		var $popup = $(this).siblings('.multivendorx-popup');

		// Close other popups
		$('.multivendorx-popup').not($popup).fadeOut(200);

		// Fade in popup
		$popup.fadeIn(200);
	});

	// CLOSE via close icon
	$(document).on('click', '.multivendorx-popup .popup-close', function (e) {
		e.preventDefault();
		e.stopPropagation();

		$(this).closest('.multivendorx-popup').fadeOut(200);
	});

	// PREVENT close when clicking inside content
	$(document).on('click', '.multivendorx-popup-content', function (e) {
		e.stopPropagation();
	});

	// CLOSE when clicking outside content (overlay)
	$(document).on('click', '.multivendorx-popup', function () {
		$(this).fadeOut(200);
	});

});
