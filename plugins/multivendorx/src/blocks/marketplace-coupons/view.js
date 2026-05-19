import { createRoot } from '@wordpress/element';
import StoreCouponList from './StoreCouponList';

window.addEventListener('load', () => {
	const element = document.getElementById('marketplace-coupons');
	if (element) {
		const attributes = JSON.parse(
			element.getAttribute('data-attributes') || '{}'
		);
		const root = createRoot(element);
		root.render(<StoreCouponList {...attributes} />);
	}
});