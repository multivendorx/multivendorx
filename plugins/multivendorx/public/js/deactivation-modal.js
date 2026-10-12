/* global jQuery, multivendorxDeactivation */
jQuery(function ($) {
	var slug = multivendorxDeactivation.slug;
	var nonce = multivendorxDeactivation.nonce;
	var ajaxUrl = multivendorxDeactivation.ajaxUrl;
	var template = $('#form-template-' + slug).html();

	var $modal = $('#modal-' + slug);
	var $box = $('#modal-box-' + slug);
	var $bg = $modal.find('.modal-bg');

	// Populate box once
	$box.html(template);
	$box.find('.extra-field').hide();
	$modal.hide();

	var deactivateUrl = '';

	// Open modal
	$('#deactivate-link-' + slug).on('click', function (e) {
		e.preventDefault();
		deactivateUrl = $(this).attr('href');
		$modal.show();
		$box.find('.button-skip').attr('href', deactivateUrl);
	});

	// Show extra field when radio selected
	$box.on('change', 'input[type="radio"]', function () {
		$box.find('.extra-field').hide();
		$(this).closest('li').find('.extra-field').show();
	});

	// Submit
	$box.on('click', '.button-submit', function () {
		var $checked = $box.find('input[name="deactivate-reason"]:checked');
		var reason = $checked.length ? $checked.val() : 'No Reason';
		var details = $checked.closest('li').find('.extra-field').val() || '';

		$box.find('.form-body, .form-footer').hide();
		$box.find('.form-head').after(
			'<p><span class="spinner is-active"></span> ' +
				multivendorxDeactivation.submittingText +
				'</p>'
		);

		$.post(ajaxUrl, {
			action: 'deactivation_form_' + slug,
			values: reason,
			details: details,
			security: nonce,
		}).always(function () {
			window.location.href = deactivateUrl;
		});
	});

	$bg.on('click', function () {
		$modal.hide();
	});
});
