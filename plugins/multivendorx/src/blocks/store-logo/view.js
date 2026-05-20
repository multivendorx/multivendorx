document.addEventListener('DOMContentLoaded', () => {
	const storeName = StoreInfo?.storeDetails?.storeName || '';
	const storeLogo = StoreInfo?.storeDetails?.storeLogo || '';

	const fallbackText = storeName
		? storeName.substring(0, 2).toUpperCase()
		: '';

	document
		.querySelectorAll('.multivendorx-store-logo-container')
		.forEach((container) => {
			// 🔹 FIRST priority: image
			if (storeLogo) {
				const img = document.createElement('img');
				img.src = storeLogo;
				img.alt = storeName;
				img.style.width = '100%';
				img.style.height = '100%';
				img.style.objectFit = 'cover';
				img.style.position = 'absolute';
				img.style.top = '0';
				img.style.left = '0';

				container.appendChild(img);
				return;
			}

			container.innerHTML = `
                <div class="placeholder">
                    ${fallbackText}
                </div>
            `;
		});
});