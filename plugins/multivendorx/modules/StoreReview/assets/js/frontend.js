/* global jQuery, review */
const { __ } = wp.i18n;

jQuery(document).ready(function ($) {
	const store_id = $('#store_for_rating').val();

	// Load Average Ratings
	function loadAverageRatings() {
		$.post(
			review.ajaxurl,
			{
				action: 'multivendorx_store_review_avg',
				store_id: store_id,
				nonce: review.nonce,
			},
			function (res) {
				if (res.success) {
					const data = res.data;
					const total = data.total_reviews || 0;
					const overall = Math.round(data.overall * 10) / 10;
					const breakdown = data.breakdown || {};

					//Build HTML
					let html = `<div class="avg-rating-summary">
                                <div class="overall-wrapper"> 
                                    <div class="overall-rating">
                                        <div class="total">${overall}</div>`;

					let ratingValue = Math.round(overall);
					let ratingPercentage = (ratingValue / 5) * 100;

					html += `<div class="star-rating" role="img" aria-label="${__(
								'Rated',
								'multivendorx'
							)} ${ratingValue} ${__('out of 5', 'multivendorx')}">
							<span style="width: ${ratingPercentage}%;">
								<strong class="rating">${ratingValue}</strong> ${__(
												'out of 5',
												'multivendorx'
											)}
							</span>
						</div>`;

					html += `<div class="total-number">${total} ${total !== 1
							? __('Ratings', 'multivendorx')
							: __('Rating', 'multivendorx')
						}</div>
						</div>
						<div class="rating-count">`;

					//Add breakdown dynamically
					for (let i = 5; i >= 1; i--) {
						const count = breakdown[i] || 0;
						const percent =
							total > 0 ? Math.round((count / total) * 100) : 0;
						html += `
							<div class="rating">
								${i} ${__('Star', 'multivendorx')}</i>
								<div class="bar"><span style="width:${percent}%;"></span></div> 
								<span>${count} ${count !== 1 ? __('Reviews', 'multivendorx') : __('Review', 'multivendorx')}</span>
							</div>`;
					}

					html += `</div></div><ul>`;

					for (let p in data.averages) {
						html += `<li><span>${Math.round(data.averages[p] * 10) / 10
							}</span> ${p}</li>`;
					}

					html += `</ul></div>`;

					$('#avg-rating').html(html);
				} else {
					$('#avg-rating').html(`<p>${__('No ratings yet.', 'multivendorx')}</p>`);
				}
			}
		);
	}

	// Load Reviews
	function loadReviews() {
		$.post(
			review.ajaxurl,
			{
				action: 'multivendorx_store_review_list',
				store_id: store_id,
				nonce: review.nonce,
			},
			function (res) {
				if (res.success) {
					$('#multivendorx-store-reviews-list').html(res.data.html);
				}
			}
		);
	}

	// Submit Review
	$('#review_submit').on('click', function (e) {
		e.preventDefault();

		// Clear previous messages
		$('.review-message').remove();

		const title = $('#review_title').val().trim();
		const content = $('#review_content').val().trim();

		// Inline validation
		if (!title || !content) {
			$('#commentform').prepend(`
				<div class="woocommerce-error review-message">
					${!title && !content
					? __('Please enter both the Review Title and Review Content.', 'multivendorx')
					: !title
						? __('Please enter a Review Title.', 'multivendorx')
						: __('Please enter your Review Content.', 'multivendorx')
				}
				</div>
			`);
			return;
		}

		const formData = new FormData();
		formData.append('action', 'multivendorx_store_review_submit');
		formData.append('nonce', review.nonce);
		formData.append('store_id', store_id);
		formData.append('review_title', title);
		formData.append('review_content', content);

		// Ratings
		$('.multivendorx-rating-select').each(function () {
			const key = $(this).attr('name');
			formData.append(key, $(this).val());
		});

		// Images
		const files = $('#review_images')[0].files;
		for (let i = 0; i < files.length; i++) {
			formData.append('review_images[]', files[i]);
		}

		$.ajax({
			url: review.ajaxurl,
			type: 'POST',
			data: formData,
			processData: false,
			contentType: false,
			beforeSend: function () {
				$('#review_submit')
					.prop('disabled', true)
					.text(__('Submitting...', 'multivendorx'));
			},
			success: function (res) {
				$('#review_submit')
					.prop('disabled', false)
					.text(__('Submit Review', 'multivendorx'));
				$('.review-message').remove();

				if (res.success) {
					$('#review-form-wrapper').html(`
						<div class="woocommerce-message review-message">
							${__('Thank you for your review!', 'multivendorx')}
						</div>
					`);
					loadAverageRatings();
					loadReviews();
				} else {
					const message =
						res.data && res.data.message
							? res.data.message
							: __('Something went wrong. Please try again.', 'multivendorx');
					$('#commentform').prepend(`
                    <div class="woocommerce-error review-message">${message}</div>
                `);
				}
			},
			error: function () {
				$('#review_submit')
					.prop('disabled', false)
					.text(__('Submit Review', 'multivendorx'));
				$('#commentform').prepend(`
						<div class="woocommerce-error review-message">
							${__('Unable to submit review. Please try again later.', 'multivendorx')}
						</div>
					`);
			},
		});
	});

	// Star hover
	$(document).on('mouseenter', '.rating i', function () {
		const value = $(this).data('value');
		const $rating = $(this).closest('.rating');

		$rating.find('i').each(function () {
			if ($(this).data('value') <= value) {
				$(this)
					.removeClass('dashicons-star-empty')
					.addClass('dashicons-star-filled');
			} else {
				$(this)
					.removeClass('dashicons-star-filled')
					.addClass('dashicons-star-empty');
			}
		});
	});

	// Reset stars when leaving
	$(document).on('mouseleave', '.rating', function () {
		const selected = $(this).attr('data-selected') || 0;
		const $rating = $(this);

		$rating.find('i').each(function () {
			if ($(this).data('value') <= selected) {
				$(this)
					.removeClass('dashicons-star-empty')
					.addClass('dashicons-star-filled');
			} else {
				$(this)
					.removeClass('dashicons-star-filled')
					.addClass('dashicons-star-empty');
			}
		});
	});

	// Star click (selection)
	$(document).on('click', '.rating i', function () {
		const value = $(this).data('value');
		const $rating = $(this).closest('.rating');

		// store selected value
		$rating.attr('data-selected', value);

		// update UI
		$rating.find('i').each(function () {
			if ($(this).data('value') <= value) {
				$(this)
					.removeClass('dashicons-star-empty')
					.addClass('dashicons-star-filled');
			} else {
				$(this)
					.removeClass('dashicons-star-filled')
					.addClass('dashicons-star-empty');
			}
		});

		// update hidden field
		$rating.find('.multivendorx-rating-select').val(value);
	});

	$(document).on('click', '#write-review-btn', function () {
		const $form = $('#commentform');
		$form.slideToggle(300, () => {
			const formVisible = $form.is(':visible');
			$('#write-review-btn').text(
				formVisible ? __('Cancel Review', 'multivendorx') : __('Write a Review', 'multivendorx')
			);
		});
	});

	// Initial Load
	loadAverageRatings();
	loadReviews();
});
