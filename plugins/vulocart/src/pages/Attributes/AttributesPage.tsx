/* global vulocartLocalizer */
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import axios from 'axios';
import { getApiLink } from '@zyra/core';
import { ContainerComponent, ColumnComponent, NavigatorHeaderComponent, CardComponent, FormGroupWrapperComponent, FormGroupComponent } from '@zyra/components';
import { TextInput, ButtonInput } from '@zyra/inputs';
import '../Terms/terms-page.scss';

interface AttributeValue {
	id: number;
	value: string;
}

interface Attribute {
	id: number;
	name: string;
	slug: string;
	values: AttributeValue[];
}

/**
 * The Offerings menu's "Attributes" admin page — manages attribute
 * *definitions* (name + values, e.g. "Color": Red/Blue/Green), not a
 * variant/SKU matrix (OfferingEdit.tsx's own "Attributes & Variations"
 * section stays an inert placeholder — Attribute.php's own docblock
 * explains why building that on top of this is a separate, later step).
 */
export function AttributesPage() {
	const [ attributes, setAttributes ] = useState< Attribute[] >( [] );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ newAttributeName, setNewAttributeName ] = useState( '' );
	const [ newValueByAttribute, setNewValueByAttribute ] = useState< Record< number, string > >( {} );

	const load = () => {
		setIsLoading( true );
		axios
			.get< Attribute[] >( getApiLink( vulocartLocalizer, 'attributes' ), {
				headers: { 'X-WP-Nonce': vulocartLocalizer.nonce },
			} )
			.then( ( response ) => setAttributes( response.data ) )
			.finally( () => setIsLoading( false ) );
	};

	useEffect( load, [] );

	const addAttribute = () => {
		if ( ! newAttributeName.trim() ) {
			return;
		}

		axios
			.post(
				getApiLink( vulocartLocalizer, 'attributes' ),
				{ name: newAttributeName },
				{ headers: { 'X-WP-Nonce': vulocartLocalizer.nonce } }
			)
			.then( () => {
				setNewAttributeName( '' );
				load();
			} );
	};

	const deleteAttribute = ( id: number ) => {
		if ( ! window.confirm( __( 'Delete this attribute and all its values? This cannot be undone.', 'vulocart' ) ) ) {
			return;
		}

		axios
			.delete( getApiLink( vulocartLocalizer, `attributes/${ id }` ), {
				headers: { 'X-WP-Nonce': vulocartLocalizer.nonce },
			} )
			.then( load );
	};

	const addValue = ( attributeId: number ) => {
		const value = ( newValueByAttribute[ attributeId ] || '' ).trim();

		if ( ! value ) {
			return;
		}

		axios
			.post(
				getApiLink( vulocartLocalizer, `attributes/${ attributeId }/values` ),
				{ value },
				{ headers: { 'X-WP-Nonce': vulocartLocalizer.nonce } }
			)
			.then( () => {
				setNewValueByAttribute( { ...newValueByAttribute, [ attributeId ]: '' } );
				load();
			} );
	};

	const deleteValue = ( valueId: number ) => {
		axios
			.delete( getApiLink( vulocartLocalizer, `attributes/values/${ valueId }` ), {
				headers: { 'X-WP-Nonce': vulocartLocalizer.nonce },
			} )
			.then( load );
	};

	return (
		<ContainerComponent general>
			<ColumnComponent>
				<NavigatorHeaderComponent
					headerIcon="product-options"
					headerTitle={ __( 'Attributes', 'vulocart' ) }
					headerDescription={ __(
						'Named properties offerings can be described by — e.g. "Color" with values Red/Blue/Green.',
						'vulocart'
					) }
				/>

				<div className="vulocart-terms-grid">
					<div className="vulocart-terms-form-col">
						<h2>{ __( 'Add New', 'vulocart' ) }</h2>
						<FormGroupWrapperComponent>
							<FormGroupComponent label={ __( 'Name', 'vulocart' ) } htmlFor="vulocart-attribute-name">
								<TextInput
									name="name"
									type="text"
									placeholder={ __( 'e.g. Color', 'vulocart' ) }
									value={ newAttributeName }
									onChange={ ( value ) => setNewAttributeName( value as string ) }
								/>
							</FormGroupComponent>
						</FormGroupWrapperComponent>
						<ButtonInput
							buttons={ [ { icon: 'plus', text: __( 'Add attribute', 'vulocart' ), onClick: addAttribute } ] }
						/>
					</div>

					<div className="vulocart-terms-list-col">
						{ isLoading && <p>{ __( 'Loading…', 'vulocart' ) }</p> }
						{ ! isLoading && attributes.length === 0 && <p>{ __( 'No attributes yet.', 'vulocart' ) }</p> }

						{ attributes.map( ( attribute ) => (
							<div key={ attribute.id } style={ { marginBottom: '16px' } }>
							<CardComponent title={ attribute.name }>
								<div style={ { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' } }>
									{ attribute.values.length === 0 && (
										<span style={ { color: '#6b7280', fontSize: '13px' } }>
											{ __( 'No values yet.', 'vulocart' ) }
										</span>
									) }
									{ attribute.values.map( ( value ) => (
										<span
											key={ value.id }
											style={ {
												display: 'inline-flex',
												alignItems: 'center',
												gap: '6px',
												border: '1px solid #e5e7eb',
												borderRadius: '999px',
												padding: '4px 10px',
												fontSize: '13px',
											} }
										>
											{ value.value }
											<button
												type="button"
												aria-label={ __( 'Remove value', 'vulocart' ) }
												onClick={ () => deleteValue( value.id ) }
												style={ { border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626' } }
											>
												×
											</button>
										</span>
									) ) }
								</div>
								<div style={ { display: 'flex', gap: '8px', alignItems: 'center' } }>
									<input
										type="text"
										placeholder={ __( 'Add a value…', 'vulocart' ) }
										value={ newValueByAttribute[ attribute.id ] || '' }
										onChange={ ( event ) =>
											setNewValueByAttribute( { ...newValueByAttribute, [ attribute.id ]: event.target.value } )
										}
										onKeyDown={ ( event ) => {
											if ( 'Enter' === event.key ) {
												addValue( attribute.id );
											}
										} }
									/>
									<button type="button" onClick={ () => addValue( attribute.id ) }>
										{ __( 'Add', 'vulocart' ) }
									</button>
									<a
										href="#delete"
										style={ { marginLeft: 'auto', color: '#dc2626' } }
										onClick={ ( event ) => {
											event.preventDefault();
											deleteAttribute( attribute.id );
										} }
									>
										{ __( 'Delete attribute', 'vulocart' ) }
									</a>
								</div>
							</CardComponent>
							</div>
						) ) }
					</div>
				</div>
			</ColumnComponent>
		</ContainerComponent>
	);
}

export default AttributesPage;
