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
			const expanded = $(this).attr('aria-expanded') === 'true';
			$(this).attr('aria-expanded', String(!expanded));
			$('.tracking-details').slideToggle('fast');
		})

		// A notice rendered with a `dismiss_key` (AdminNotice::render()) stays closed for this user.
		.on('click', '.multivendorx-notice[data-dismiss-key] .notice-dismiss', function () {
			$.post(ajaxurl, {
				action: 'multivendorx_dismiss_admin_notice',
				nonce: ajaxData.nonce,
				dismiss_key: $(this).closest('.multivendorx-notice').data('dismiss-key'),
			});
		})

		// Free pro notice dismiss
		.on('click', '.free-pro-notice .notice-dismiss', function () {
			$.post(ajaxurl, {
				action: 'multivendorx_dismiss_free_pro_notice',
				nonce: ajaxData.nonce,
			});
		});
});
