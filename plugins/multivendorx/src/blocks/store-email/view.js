document.addEventListener('DOMContentLoaded', () => {
	document
		.querySelectorAll('.multivendorx-store-email-block')
		.forEach((el) => {
			const email = StoreInfo?.storeDetails?.storeEmail;

			const showEmail =StoreInfo?.admin_settings?.privacy?.store_contact_details?.includes('show_store_email');

			if (email && showEmail) {
				el.textContent = email;
			} else {
				el.closest('.wp-block-multivendorx-store-email')?.remove();
			}
		});
});