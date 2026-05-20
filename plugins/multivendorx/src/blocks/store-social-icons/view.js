window.addEventListener('load', () => {
	if (!window.StoreInfo?.storeDetails) return;

	const links = document.querySelectorAll('.wp-block-social-link a');

	const map = [
		'facebook',
		'twitter',
		'instagram',
		'youtube',
		'linkedin',
		'pinterest'
	];

	links.forEach((el, index) => {
		const key = map[index];
		const url = StoreInfo.storeDetails[key];

		if (url && url.trim() !== '') {
			el.href = url;
			el.target = '_blank';
		} else {
			el.closest('li').style.display = 'none';
		}
	});
});
