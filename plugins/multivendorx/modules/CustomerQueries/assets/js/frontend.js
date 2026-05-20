/* global jQuery, customerQueriesFrontend, wp */
const { __ } = wp.i18n;

jQuery(document).ready(function ($) {
	let productId = $('#product-customer-queries').data('product');
	let searchTimeout;

	// Load all questions on page load
	loadQuestions('');

	$(document).on('keyup', '#customer-queries-search', function () {
		const keyword = $(this).val().trim();

		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			loadQuestions(keyword);
		}, 300);
	});

	// Direct question submission
	$(document).on('click', '#customer-queries-direct-submit', function () {
		const $btn = $(this);
		if ($btn.prop('disabled')) {
			return;
		}

		$btn
			.prop('disabled', true)
			.text(__('Submitting...', 'multivendorx'));

		let question = $(this).data('question');

		$.post(
			customerQueriesFrontend.ajaxurl,
			{
				action: 'customer_queries_submit',
				product_id: productId,
				question: question,
				nonce: customerQueriesFrontend.nonce,
			},
			function (res) {
				if (res.success) {
					$('#customer-queries-search').val('');

					// Hide "no results" message immediately
					$('#customer-queries-no-results-container').hide();

					// Show success message
					$('#customer-queries-success-message')
						.fadeIn()
						.delay(2000)
						.fadeOut(function () {
							// Reload questions after fade out
							loadQuestions('');
							$btn
								.prop('disabled', false)
								.text(__('Ask now', 'multivendorx'));
						});
				} else {
					alert(res.data.message);
					$btn
						.prop('disabled', false)
						.text(__('Ask now', 'multivendorx'));
				}
			}
		);
	});

	function loadQuestions(search) {
		$.post(
			customerQueriesFrontend.ajaxurl,
			{
				action: 'customer_queries_search',
				product_id: productId,
				search: search || '',
				nonce: customerQueriesFrontend.nonce,
			},
			function (res) {
				if (!res.success) {
					return;
				}

				$('#customer-queries-list').empty().html(res.data.html);

				if (!res.data.has_items && search) {
					// Show message + button container
					$('#customer-queries-no-results-container').show();
					$('#customer-queries-direct-submit').data(
						'question',
						search
					);
				} else {
					// Hide if results found
					$('#customer-queries-no-results-container').hide();
				}
			}
		);
	}

	$(document).on('click', '.customer-queries-vote', function () {
		const $btn = $(this);
		const $item = $btn.closest('.customer-queries-item');
		const queriesId = $item.data('customer-queries');
		const type = $btn.data('type');

		$.post(
			customerQueriesFrontend.ajaxurl,
			{
				action: 'customer_queries_vote',
				queries_id: queriesId,
				type: type,
				nonce: customerQueriesFrontend.nonce,
			},
			function (res) {
				if (res.success) {
					loadQuestions('');
				}
			}
		);
	});
});