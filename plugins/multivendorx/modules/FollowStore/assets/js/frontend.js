/* global jQuery, followStoreFrontend, wp */

jQuery(document).ready(function ($) {
	const { __ } = wp.i18n;
	// Initialize buttons
	$('.follow-btn').each(function () {
		var btn = $(this);
		var store_id = btn.data('store-id');
		var user_id = btn.data('user-id');

		$.ajax({
			url:
				followStoreFrontend.apiUrl +
				'/' +
				followStoreFrontend.restUrl +
				'/follow-stores/' +
				store_id,
			method: 'GET',
			headers: {
				'X-WP-Nonce': followStoreFrontend.nonce,
			},
			data: {
				store_id,
				user_id,
			},
			success: function (res) {
				var isFollowing = res.follow;
				var count = parseInt(res.follower_count, 10) || 0;

				/**
				 * Button text
				 */
				btn
					.text(
						isFollowing
							? __('Unfollow', 'multivendorx')
							: __('Follow', 'multivendorx')
					)
					.show();

				/**
				 * Follower count text
				 */
				var label =
					count === 1
						? __('Follower', 'multivendorx')
						: __('Followers', 'multivendorx');

				$('#followers-count-' + store_id).text(count + ' ' + label);
			},
		});
	});

	// Handle follow/unfollow click
	$(document).on('click', '.follow-btn', function () {
		var btn = $(this);
		var store_id = btn.data('store-id');
		var user_id = btn.data('user-id');

		if (!user_id) {
			$('#multivendorx-login-modal')
				.data('store-id', store_id)
				.fadeIn();

			return;
		}

		btn.prop('disabled', true);

		$.ajax({
			url:
				followStoreFrontend.apiUrl +
				'/' +
				followStoreFrontend.restUrl +
				'/follow-stores/' +
				store_id,
			method: 'POST',
			headers: {
				'X-WP-Nonce': followStoreFrontend.nonce,
			},
			data: {
				store_id,
				user_id,
			},
			success: function (res) {
				var isFollowing = res.follow;
				var count = parseInt(res.follower_count, 10) || 0;

				/**
				 * Button text
				 */
				btn.text(
					isFollowing
						? __('Unfollow', 'multivendorx')
						: __('Follow', 'multivendorx')
				);

				/**
				 * Follower count
				 */
				var label =
					count === 1
						? __('Follower', 'multivendorx')
						: __('Followers', 'multivendorx');

				$('#followers-count-' + store_id).text(count + ' ' + label);

				btn.prop('disabled', false);
			},
			error: function () {
				btn.prop('disabled', false);
			},
		});
	});

	$(document).on('click', '.multivendorx-close', function () {
		$('#multivendorx-login-modal').fadeOut();
	});

	// Close when clicking outside the modal content
	$(document).on('click', '#multivendorx-login-modal', function (e) {
		if ($(e.target).is('#multivendorx-login-modal')) {
			$(this).fadeOut();
		}
	});

	// Optional: Close modal on ESC key
	$(document).on('keydown', function (e) {
		if (e.key === 'Escape') {
			$('#multivendorx-login-modal').fadeOut();
		}
	});
});