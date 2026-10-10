/**
 * Minimal stand-ins for the shared @multivendorx/zyra UI kit exports this
 * plugin's components use, scoped to what Jest actually needs to render
 * them (see jest.config.js for why the real package can't be used here).
 * Keep this in sync with the named imports actually used from
 * '@zyra/core' | '@zyra/components' | '@zyra/inputs' | '@zyra/table' | '@zyra/builders'.
 */
const React = require( 'react' );

exports.getApiLink = ( _appLocalizer, endpoint ) =>
	`https://example.test/wp-json/notifima/v1/${ endpoint }`;

exports.ColumnComponent = ( { children } ) =>
	React.createElement( 'div', { 'data-testid': 'zyra-column' }, children );

exports.ContainerComponent = ( { children } ) =>
	React.createElement( 'div', { 'data-testid': 'zyra-container' }, children );

exports.InformationItemComponent = ( { title } ) =>
	React.createElement( 'div', { 'data-testid': 'zyra-information-item' }, title );

exports.PopupComponent = ( { open, children } ) =>
	open ? React.createElement( 'div', { 'data-testid': 'zyra-popup' }, children ) : null;

exports.NavigatorHeaderComponent = ( { headerTitle, headerDescription, buttons = [] } ) =>
	React.createElement(
		'div',
		{ 'data-testid': 'zyra-navigator-header' },
		React.createElement( 'h1', null, headerTitle ),
		React.createElement( 'p', null, headerDescription ),
		buttons.map( ( button, index ) =>
			React.createElement(
				'button',
				{ key: index, onClick: button.onClick },
				button.label
			)
		)
	);

exports.TableCard = () =>
	React.createElement( 'div', { 'data-testid': 'zyra-table-card' } );
