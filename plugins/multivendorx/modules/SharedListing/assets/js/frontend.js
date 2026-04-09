/* global jQuery */
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

	const hasLocation = document.cookie.includes('user_lat');

	if (!hasLocation) {
		navigator.geolocation.getCurrentPosition((position) => {
			document.cookie = `user_lat=${position.coords.latitude}; path=/; SameSite=Lax`;
			document.cookie = `user_lng=${position.coords.longitude}; path=/; SameSite=Lax`;

			location.reload();
		});
	}
});
