/*global jQuery followStoreFrontend*/
jQuery(document).ready(function ($) {

	// Initialize buttons
	$('.follow-btn').each(function () {
		var btn = $(this);
		var store_id = btn.data('store-id');
		var user_id  = btn.data('user-id');

		$.ajax({
			url: followStoreFrontend.restUrl + 'follow-store/' + store_id,
			method: 'GET',
			headers: {
				'X-WP-Nonce': followStoreFrontend.nonce
			},
			data: {
				storeId: store_id,
				userId: user_id
			},
			success: function (res) {

				var isFollowing = res.follow;
				var count = parseInt(res.follower_count, 10) || 0;

				/**
				 * Button text
				 */
				btn.text(isFollowing ? 'Unfollow' : 'Follow').show();

				/**
				 * Follower count text
				 */
				var label = count === 1 ? 'Follower' : 'Followers';
				$('#followers-count-' + store_id).text(count + ' ' + label);
			}
		});
	});

	// Handle follow/unfollow click
	$(document).on('click', '.follow-btn', function () {
		var btn = $(this);
		var store_id = btn.data('store-id');
		var user_id  = btn.data('user-id');

		if (!user_id) {
			$('#multivendorx-login-modal').data('store-id', store_id).fadeIn();
			return;
		}

		btn.prop('disabled', true);

		$.ajax({
			url: followStoreFrontend.restUrl + 'follow-store/' + store_id,
			method: 'POST',
			headers: {
				'X-WP-Nonce': followStoreFrontend.nonce
			},
			data: {
				storeId: store_id,
				userId: user_id
			},
			success: function (res) {

				var isFollowing = res.follow;
				var count = parseInt(res.follower_count, 10) || 0;

				/**
				 * Button text
				 */
				btn.text(isFollowing ? 'Unfollow' : 'Follow');

				/**
				 * Follower count
				 */
				var label = count === 1 ? 'Follower' : 'Followers';
				$('#followers-count-' + store_id).text(count + ' ' + label);

				btn.prop('disabled', false);
			},
			error: function () {
				btn.prop('disabled', false);
			}
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
