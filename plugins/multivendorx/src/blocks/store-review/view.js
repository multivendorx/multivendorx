
import StoreReview from './StoreReview';
import { createRoot } from '@wordpress/element';

window.addEventListener('load', () => {
	const activeModules = StoreInfo.activeModules;

	if (!activeModules.includes('store-review')) {
		return;
	}

	document.querySelectorAll('.multivendorx-review-list').forEach((el) => {
		const { reviewsToShow, showImages, showAdminReply, sortOrder } =
			el.dataset;

		const props = {
			reviewsToShow: Number(reviewsToShow),
			showImages: showImages === 'true',
			showAdminReply: showAdminReply === 'true',
			sortOrder,
		};

		const root = createRoot(el);
		root.render(<StoreReview {...props} />);
	});
});
