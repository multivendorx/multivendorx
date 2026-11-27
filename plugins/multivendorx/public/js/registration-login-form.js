/**
 * Submits the account/login section's WooCommerce login form
 * (`Frontend::add_woocommerce_login_form()`) on click, as a real, standalone `<form>` that this
 * script creates and submits itself.
 *
 * That section is rendered inside the store registration form's VuloForm embed
 * (`Integrations\VuloForm\LoginField::render()`), itself inside VuloForm's own `<form>` -- so the
 * WooCommerce login form can't keep its own native `<form>` tag there (nested `<form>` elements
 * are invalid HTML; a browser closes the OUTER form as soon as it hits the inner one's closing
 * tag, which breaks VuloForm's own page-break/multi-page navigation by orphaning everything after
 * that point outside the real form). `add_woocommerce_login_form()` already unwraps it to a plain
 * `.multivendorx-login-form` `<div>` for that reason; this is what makes clicking inside it still
 * actually submit the login, via a detached form this script builds on the fly.
 *
 * Delegated on `document` (not queried once on load) because the login form's HTML is injected
 * into the page well after this script runs -- VuloForm's embed fetch is a separate, later
 * request, and the embed HTML (including any inline `<script>` in it) is inserted via
 * `container.innerHTML`, which never executes embedded `<script>` tags at all. A normally
 * enqueued script with delegation is the only thing that can still catch that later click.
 */
document.addEventListener( 'click', function ( event ) {
	var submit = event.target.closest( '.multivendorx-login-form button[type="submit"], .multivendorx-login-form input[type="submit"]' );

	if ( ! submit ) {
		return;
	}

	var wrap = submit.closest( '.multivendorx-login-form' );

	event.preventDefault();

	var tempForm = document.createElement( 'form' );
	tempForm.method = 'post';
	tempForm.style.display = 'none';

	wrap.querySelectorAll( 'input, select, textarea' ).forEach( function ( field ) {
		if ( ( 'checkbox' === field.type || 'radio' === field.type ) && ! field.checked ) {
			return;
		}

		var hidden = document.createElement( 'input' );
		hidden.type = 'hidden';
		hidden.name = field.name;
		hidden.value = field.value;
		tempForm.appendChild( hidden );
	} );

	var clicked = document.createElement( 'input' );
	clicked.type = 'hidden';
	clicked.name = submit.name;
	clicked.value = submit.value;
	tempForm.appendChild( clicked );

	document.body.appendChild( tempForm );
	tempForm.submit();
} );
