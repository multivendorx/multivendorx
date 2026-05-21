import CheckoutMapFill from "./CheckoutMapFill";

const { registerPlugin } = window.wp.plugins;
const domReady = window.wp.domReady;

domReady(() => {
    if (registerPlugin) {
        registerPlugin('multivendorx-checkout-map', {
            render: CheckoutMapFill,
            scope: 'woocommerce-checkout',
        });
    }
});