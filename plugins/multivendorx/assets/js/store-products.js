jQuery(document).ready(function ($) {
	// theme color
	jQuery(window).on('load', function () {
		const root = document.documentElement;
		const $btn = $('button, .button, .woocommerce-Button').filter(function () {
			return $(this).css('background-color') !== 'rgba(0, 0, 0, 0)';
		}).first();

		if ($btn.length) {
			const color = $btn.css('background-color');
			root.style.setProperty('--theme-primary', color);
		} 
	});
	$(document).on('click', '.multivendorx-apply-now-btn', function () {
		$('#wholesale-popup').addClass('active');
	});

	$(document).on('click', '.popup-close', function () {
		$('#wholesale-popup').removeClass('active');
	});

	$(document).on('click', '#wholesale-popup', function (e) {
		if (!$(e.target).closest('.popup-content').length) {
			$(this).removeClass('active');
		}
	});
	console.log('Popup toggled');
	function toggleAuth(type) {
		const wrapper = document.getElementById('customer_login');
		if (!wrapper) return;

		if (type === 'register') {
			wrapper.classList.add('show-register');
		} else {
			wrapper.classList.remove('show-register');
		}
	}
	document.querySelectorAll('.multivendorx-tab').forEach((tab) => {
		tab.addEventListener('click', function () {
			const type = this.dataset.tab;
			document.querySelectorAll('.multivendorx-tab').forEach(t => t.classList.remove('active'));
			this.classList.add('active');

			toggleAuth(type);
		});
	});
	toggleAuth('login');
});