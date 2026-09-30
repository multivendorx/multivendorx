/* global jQuery, ajaxurl, multivendorxAdminNotices */
jQuery(function ($) {
	const ajaxData = {
		action: multivendorxAdminNotices.action,
		nonce: multivendorxAdminNotices.nonce,
	};

	$(document)
		.on('click', '.review-notice .button', function (e) {
			e.preventDefault();

			const actionType = $(this).data('action');
			const href = $(this).attr('href');

			$.post(ajaxurl, {
				...ajaxData,
				admin_notice_action_type: actionType,
			});

			$(this).closest('.notice').fadeOut();

			if (href && href !== '#') {
				window.open(href, '_blank', 'noopener');
			}
		})
		.on('click', '.review-notice .notice-dismiss', function () {
			$.post(ajaxurl, {
				...ajaxData,
				admin_notice_action_type: 'review_closed',
			});
		})
		.on('click', '.tracking-toggle', function (e) {
			e.preventDefault();
			$('.tracking-details').slideToggle('fast');
		})

		// Free pro notice dismiss
		.on('click', '.free-pro-notice .notice-dismiss', function () {
			$.post(ajaxurl, {
				action: 'multivendorx_dismiss_free_pro_notice',
				nonce: ajaxData.nonce,
			});
		});
});
