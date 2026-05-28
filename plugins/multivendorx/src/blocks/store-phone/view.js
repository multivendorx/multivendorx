document.addEventListener('DOMContentLoaded', () => {
	const phone = window?.StoreInfo?.storeDetails?.storePhone;
	const showPhone = window?.StoreInfo?.admin_settings?.privacy?.store_contact_details.includes('show_store_phone');

	document
		.querySelectorAll('.multivendorx-store-phone-block')
		.forEach((el) => {
			const wrapper = el.closest('.wp-block-multivendorx-store-phone');

			if (!phone || !showPhone) {
				wrapper?.remove(); // removes icon + block completely
				return;
			}

			el.textContent = phone;
		});
});