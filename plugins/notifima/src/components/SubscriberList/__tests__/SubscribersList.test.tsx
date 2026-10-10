/* global describe, it, expect, jest, beforeEach, afterEach */
import { render, screen } from '@testing-library/react';
import { downloadCSV, formatLocalDate } from '../SubscribersList';
import SubscribersList from '../SubscribersList';

// SubscribersList reads the WP-localized global directly (no React context),
// same as it does on a real page where wp_localize_script() defines it.
( global as any ).appLocalizer = {
	nonce: 'test-nonce',
	apiUrl: 'https://example.test/wp-json',
	khali_dabba: false,
};

describe( 'formatLocalDate', () => {
	it( 'formats a Date as YYYY-MM-DD', () => {
		expect( formatLocalDate( new Date( '2024-03-05T12:34:56Z' ) ) ).toBe(
			'2024-03-05'
		);
	} );

	it( 'returns an empty string when no date is given', () => {
		expect( formatLocalDate( undefined ) ).toBe( '' );
	} );
} );

describe( 'downloadCSV', () => {
	const headers = {
		product: { label: 'Product' },
		internal_id: { label: 'Internal ID', csvDisplay: false },
		email: { label: 'Email' },
	};

	let createObjectURLSpy: jest.SpyInstance;
	let clickSpy: jest.SpyInstance;

	beforeEach( () => {
		// jsdom doesn't implement these at all, so they must be defined
		// before they can be spied on/mocked.
		( URL as any ).createObjectURL = jest.fn();
		( URL as any ).revokeObjectURL = jest.fn();

		createObjectURLSpy = jest
			.spyOn( URL, 'createObjectURL' )
			.mockReturnValue( 'blob:mock-url' );
		jest.spyOn( URL, 'revokeObjectURL' ).mockImplementation( () => {} );
		clickSpy = jest
			.spyOn( HTMLAnchorElement.prototype, 'click' )
			.mockImplementation( () => {} );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	it( 'does nothing when there are no rows', () => {
		downloadCSV( headers, [], 'export.csv' );

		expect( createObjectURLSpy ).not.toHaveBeenCalled();
	} );

	it( 'only includes columns whose csvDisplay is not explicitly false', () => {
		let capturedParts: string[] | undefined;
		const BlobSpy = jest
			.spyOn( global, 'Blob' as any )
			.mockImplementation( ( parts: string[] ) => {
				capturedParts = parts;
				return {} as any;
			} );

		downloadCSV(
			headers,
			[ { product: 'Widget', internal_id: 42, email: 'a@example.com' } ],
			'export.csv'
		);

		expect( clickSpy ).toHaveBeenCalledTimes( 1 );
		expect( capturedParts?.[ 0 ] ).toBe(
			'"Product","Email"\n"Widget","a@example.com"'
		);

		BlobSpy.mockRestore();
	} );

	it( 'renders a missing value as an empty cell, not the literal "null"', () => {
		let capturedParts: string[] | undefined;
		const BlobSpy = jest
			.spyOn( global, 'Blob' as any )
			.mockImplementation( ( parts: string[] ) => {
				capturedParts = parts;
				return {} as any;
			} );

		downloadCSV(
			{ email: { label: 'Email' } },
			[ { email: null } ],
			'export.csv'
		);

		expect( capturedParts?.[ 0 ] ).toBe( '"Email"\n""' );

		BlobSpy.mockRestore();
	} );
} );

describe( 'SubscribersList', () => {
	it( 'renders the subscribers header without crashing', () => {
		render( <SubscribersList /> );

		expect( screen.getByText( 'Subscribers' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Download CSV' ) ).toBeInTheDocument();
	} );
} );
