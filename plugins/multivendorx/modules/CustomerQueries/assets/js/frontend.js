/* global jQuery, qnaFrontend */
jQuery(document).ready(function ($) {
	let productId = $('#product-qna').data('product');
	let searchTimeout;

	// Load all questions on page load
	loadQuestions('');

	$(document).on('keyup', '#qna-search', function () {
		const keyword = $(this).val().trim();

		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			loadQuestions(keyword);
		}, 300);
	});

	// Direct question submission
	$(document).on('click', '#qna-direct-submit', function () {
		const $btn = $(this);
		if ($btn.prop('disabled')) {
			return;
		}

		$btn.prop('disabled', true).text('Submitting...');
		let question = $(this).data('question');

		$.post(
			qnaFrontend.ajaxurl,
			{
				action: 'qna_submit',
				product_id: productId,
				question: question,
				nonce: qnaFrontend.nonce,
			},
			function (res) {
				if (res.success) {
					$('#qna-search').val('');

					// Hide "no results" message immediately
					$('#qna-no-results-container').hide();

					// Show success message
					$('#qna-success-message')
						.fadeIn()
						.delay(2000)
						.fadeOut(function () {
							// Reload questions after fade out
							loadQuestions('');
							$btn.prop('disabled', false).text('Ask now');
						});
				} else {
					alert(res.data.message);
					$btn.prop('disabled', false).text('Ask now');
				}
			}
		);
	});
	function loadQuestions(search) {
		$.post(
			qnaFrontend.ajaxurl,
			{
				action: 'qna_search',
				product_id: productId,
				search: search || '',
				nonce: qnaFrontend.nonce,
			},
			function (res) {
				if (!res.success) {
					return;
				}

				$('#qna-list').empty().html(res.data.html);

				if (!res.data.has_items && search) {
					// Show message + button container
					$('#qna-no-results-container').show();
					$('#qna-direct-submit').data('question', search);
				} else {
					// Hide if results found
					$('#qna-no-results-container').hide();
				}
			}
		);
	}

	$(document).on('click', '.qna-vote', function () {
		const $btn = $(this);
		const $item = $btn.closest('.qna-item');
		const qnaId = $item.data('qna');
		const type = $btn.data('type');
		$.post(
			qnaFrontend.ajaxurl,
			{
				action: 'qna_vote',
				qna_id: qnaId,
				type: type,
				nonce: qnaFrontend.nonce,
			},
			function (res) {
				if (res.success) {
					loadQuestions('');
				}
			}
		);
	});
});
