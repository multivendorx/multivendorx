jQuery(document).ready(function ($) {
	$('.goto_more_offer_tab').on('click', function (e) {
		e.preventDefault();
		$(
			'.singleproductmultistore_tab a, #tab_singleproductmultistore'
		).trigger('click');
		$('html, body').animate(
			{
				scrollTop: $('.woocommerce-tabs').offset().top - 120,
			},
			1500
		);
	});
});
