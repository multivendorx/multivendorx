
document.addEventListener('DOMContentLoaded', () => {
	const address = window?.StoreInfo?.storeDetails?.storeAddress;
	const showAddress = window?.StoreInfo?.admin_settings?.privacy?.store_contact_details.includes('show_store_owner_info');
	document
		.querySelectorAll('.multivendorx-store-address-block')
		.forEach((el) => {
			const wrapper = el.closest('.wp-block-multivendorx-store-address');

			if (!address || !showAddress) {
				wrapper?.remove();
				return;
			}

			el.textContent = address;
		});
});