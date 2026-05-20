document.addEventListener('DOMContentLoaded', () => {
	document
		.querySelectorAll('.multivendorx-store-description')
		.forEach((el) => {
			if (window.StoreInfo?.storeDetails?.storeDescription) {
				el.textContent = window.StoreInfo.storeDetails.storeDescription;
			}
		});
});