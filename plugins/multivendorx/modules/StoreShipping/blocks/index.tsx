import CheckoutMapFill from "./CheckoutMapFill";

const init = () => {
	if (!(window as any)?.wp?.plugins?.registerPlugin) return;
	(window as any).wp.plugins.registerPlugin(
		'multivendorx-checkout-map',
		{
			render: CheckoutMapFill,
			scope: 'woocommerce-checkout',
		}
	);
};

window.addEventListener('load', init);