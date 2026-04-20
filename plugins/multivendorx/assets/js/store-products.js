jQuery(document).ready(function ($) {
	// theme color
	const root = document.documentElement;

	const primary = getComputedStyle(root)
		.getPropertyValue('--theme-primary')
		.trim();

	if (!primary || primary === '#1e73be') {
		const $btn = $('button, .button, .btn').first();

		if ($btn.length) {
			const color = $btn.css('background-color');
			root.style.setProperty('--theme-primary', color);
		}
	}

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