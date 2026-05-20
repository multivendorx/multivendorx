
document.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('.multivendorx-store-name').forEach((el) => {
		el.textContent = StoreInfo.storeDetails.storeName;
	});
});