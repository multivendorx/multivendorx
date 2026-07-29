/* global vulocartLocalizer */
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import axios from 'axios';
import { getApiLink } from '@zyra/core';
import { ContainerComponent, ColumnComponent, NavigatorHeaderComponent, FormGroupWrapperComponent, FormGroupComponent } from '@zyra/components';
import { TableCard, TableRow } from '@zyra/table';
import { TextInput, TextAreaInput, SelectInput, ButtonInput } from '@zyra/inputs';
import './terms-page.scss';

interface Term {
	id: number;
	taxonomy: string;
	name: string;
	slug: string;
	parent_id: number | null;
	description: string | null;
	offering_count: number;
}

interface TermsPageProps {
	/** REST route segment — 'categories'|'brands'|'collections'. */
	routeSegment: string;
	headerTitle: string;
	headerDescription: string;
	headerIcon: string;
	/** Only `categories` supports hierarchy (Domain\Term\Taxonomy's own docblock). */
	hierarchical?: boolean;
}

const emptyForm = { id: null as number | null, name: '', description: '', parent_id: '' };

/**
 * Shared list+inline-edit UI for Categories/Brands/Collections — one
 * component, parametrized by `routeSegment`, mirroring
 * `classes/RestAPI/Controllers/Terms.php`'s own "one controller, three
 * taxonomies" design (Domain\Term\Taxonomy's docblock: these are the
 * exact same shape, not three things that happen to look similar).
 * Deliberately no separate "Add New" page like Offerings/Orders have —
 * a term is a lightweight name/slug/description record, not worth a
 * second full-page round trip.
 */
export function TermsPage( { routeSegment, headerTitle, headerDescription, headerIcon, hierarchical }: TermsPageProps ) {
	const [ terms, setTerms ] = useState< Term[] >( [] );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ form, setForm ] = useState( emptyForm );
	const [ isSaving, setIsSaving ] = useState( false );

	const load = () => {
		setIsLoading( true );
		axios
			.get< Term[] >( getApiLink( vulocartLocalizer, routeSegment ), {
				headers: { 'X-WP-Nonce': vulocartLocalizer.nonce },
			} )
			.then( ( response ) => setTerms( response.data ) )
			.finally( () => setIsLoading( false ) );
	};

	useEffect( load, [] );

	const resetForm = () => setForm( emptyForm );

	const save = () => {
		if ( ! form.name.trim() ) {
			return;
		}

		setIsSaving( true );

		const payload = {
			name: form.name,
			description: form.description || undefined,
			parent_id: hierarchical && form.parent_id ? Number( form.parent_id ) : undefined,
		};

		const request = form.id
			? axios.patch( getApiLink( vulocartLocalizer, `${ routeSegment }/${ form.id }` ), payload, {
					headers: { 'X-WP-Nonce': vulocartLocalizer.nonce },
			  } )
			: axios.post( getApiLink( vulocartLocalizer, routeSegment ), payload, {
					headers: { 'X-WP-Nonce': vulocartLocalizer.nonce },
			  } );

		request
			.then( () => {
				resetForm();
				load();
			} )
			.finally( () => setIsSaving( false ) );
	};

	const editTerm = ( term: Term ) => {
		setForm( {
			id: term.id,
			name: term.name,
			description: term.description || '',
			parent_id: term.parent_id ? String( term.parent_id ) : '',
		} );
	};

	const deleteTerm = ( id: number ) => {
		if ( ! window.confirm( __( 'Delete this entry? This cannot be undone.', 'vulocart' ) ) ) {
			return;
		}

		axios
			.delete( getApiLink( vulocartLocalizer, `${ routeSegment }/${ id }` ), {
				headers: { 'X-WP-Nonce': vulocartLocalizer.nonce },
			} )
			.then( load );
	};

	const headers = {
		name: {
			label: __( 'Name', 'vulocart' ),
			render: ( row?: TableRow ) => row?.name as string,
		},
		slug: {
			label: __( 'Slug', 'vulocart' ),
			render: ( row?: TableRow ) => <code>{ row?.slug as string }</code>,
		},
		description: {
			label: __( 'Description', 'vulocart' ),
			render: ( row?: TableRow ) => ( row?.description as string ) || '—',
		},
		offering_count: {
			label: __( 'Offerings', 'vulocart' ),
			isNumeric: true,
			render: ( row?: TableRow ) => row?.offering_count ?? 0,
		},
		actions: {
			label: __( 'Actions', 'vulocart' ),
			render: ( row?: TableRow ) =>
				row && (
					<div style={ { display: 'flex', gap: '8px' } }>
						<a
							href="#edit"
							onClick={ ( event ) => {
								event.preventDefault();
								editTerm( row as unknown as Term );
							} }
						>
							{ __( 'Edit', 'vulocart' ) }
						</a>
						<a
							href="#delete"
							onClick={ ( event ) => {
								event.preventDefault();
								deleteTerm( row.id as number );
							} }
						>
							{ __( 'Delete', 'vulocart' ) }
						</a>
					</div>
				),
		},
	};

	const parentOptions = terms
		.filter( ( term ) => ! term.parent_id && term.id !== form.id )
		.map( ( term ) => ( { label: term.name, value: String( term.id ) } ) );

	return (
		<ContainerComponent general>
			<ColumnComponent>
				<NavigatorHeaderComponent headerIcon={ headerIcon } headerTitle={ headerTitle } headerDescription={ headerDescription } />

				<div className="vulocart-terms-grid">
					<div className="vulocart-terms-form-col">
						<h2>{ form.id ? __( 'Edit', 'vulocart' ) : __( 'Add New', 'vulocart' ) }</h2>
						<FormGroupWrapperComponent>
							<FormGroupComponent label={ __( 'Name', 'vulocart' ) } htmlFor="vulocart-term-name">
								<TextInput
									name="name"
									type="text"
									value={ form.name }
									onChange={ ( value ) => setForm( { ...form, name: value as string } ) }
								/>
							</FormGroupComponent>
							<FormGroupComponent label={ __( 'Description', 'vulocart' ) } htmlFor="vulocart-term-description">
								<TextAreaInput
									name="description"
									value={ form.description }
									onChange={ ( value ) => setForm( { ...form, description: value as string } ) }
								/>
							</FormGroupComponent>
							{ hierarchical && (
								<FormGroupComponent label={ __( 'Parent', 'vulocart' ) } htmlFor="vulocart-term-parent">
									<SelectInput
										name="parent_id"
										type="single-select"
										options={ [ { label: __( 'None', 'vulocart' ), value: '' }, ...parentOptions ] }
										value={ form.parent_id }
										onChange={ ( value ) => setForm( { ...form, parent_id: value as string } ) }
									/>
								</FormGroupComponent>
							) }
						</FormGroupWrapperComponent>
						<ButtonInput
							buttons={ [
								{
									icon: 'save',
									text: isSaving ? __( 'Saving…', 'vulocart' ) : form.id ? __( 'Update', 'vulocart' ) : __( 'Add', 'vulocart' ),
									onClick: save,
									disabled: isSaving,
								},
								...( form.id
									? [
											{
												icon: 'close-delete',
												text: __( 'Cancel', 'vulocart' ),
												onClick: resetForm,
											},
									  ]
									: [] ),
							] }
						/>
					</div>

					<div className="vulocart-terms-list-col">
						<TableCard
							title={ headerTitle }
							headers={ headers }
							rows={ terms as unknown as TableRow[] }
							totalRows={ terms.length }
							isLoading={ isLoading }
							ids={ terms.map( ( term ) => term.id ) }
						/>
					</div>
				</div>
			</ColumnComponent>
		</ContainerComponent>
	);
}

export default TermsPage;
