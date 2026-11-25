/* global jQuery */

jQuery(document).ready(function ($) {
	$(document).on(
		'click',
		'.multivendorx-policies-accordion .accordion-header',
		function () {
			var $currentItem = $(this).closest('.accordion-item');
			var $currentBody = $currentItem.find('.accordion-body');
			$('.multivendorx-policies-accordion .accordion-body')
				.not($currentBody)
				.slideUp(200);
			$currentBody.slideToggle(200);
		}
	);

	$(
		'.multivendorx-policies-accordion .accordion-item:first .accordion-body'
	).slideDown(0);
});
