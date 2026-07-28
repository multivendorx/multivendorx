import { __ } from '@wordpress/i18n';
import { SelectControl, TextareaControl, Button, Notice } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { usePostData } from '../usePostData';
import { fixWithAi } from '../api';

const SCHEMA_TYPES = [ 'Article', 'Product', 'FAQPage', 'Recipe', 'Event', 'JobPosting', 'Organization', 'LocalBusiness', 'Review' ];

/**
 * The metabox's Schema tab — a type hint (`_vulopilot_schema_type`, UI-only:
 * it labels the dropdown, it isn't sent to the AI prompt, since
 * AIActions\Actions\GenerateSchemaAction already infers Article vs
 * Product/Recipe/Event from the content itself) plus the actual JSON-LD,
 * which rides the SAME postmeta key GenerateSchemaAction writes
 * (GenerateSchemaAction::META_KEY, registered for REST by
 * Services\PostSeoMetaFields so this textarea's edits save through the
 * Block Editor's own native Save button same as everything else here).
 * Services\SchemaJsonLdRenderer outputs whatever ends up in that key on
 * the frontend — manual edits here "just work" with no output-layer change.
 */
export default function SchemaTab() {
	const { postId, meta, setMeta } = usePostData();
	const { metaKeys, isPro, shopUrl } = window.vulopilotPostSeo;

	const schemaType = ( meta[ metaKeys.schema_type ] as string ) || 'Article';
	const schemaJson = ( meta[ metaKeys.schema_json ] as string ) || '';

	const [ generating, setGenerating ] = useState( false );
	const [ error, setError ] = useState< string | null >( null );

	const isValidJson = ( value: string ): boolean => {
		if ( '' === value.trim() ) {
			return true;
		}
		try {
			JSON.parse( value );
			return true;
		} catch {
			return false;
		}
	};

	const handleGenerate = async () => {
		setGenerating( true );
		setError( null );

		try {
			const response = await fixWithAi( postId, 'generate-schema' );
			if ( response.post ) {
				setMeta( { [ metaKeys.schema_json ]: response.post.schema_json } );
			}
		} catch ( err ) {
			setError( err instanceof Error ? err.message : String( err ) );
		} finally {
			setGenerating( false );
		}
	};

	return (
		<div className="vulopilot-seo-tab vulopilot-seo-tab--schema">
			<SelectControl
				label={ __( 'Schema Type', 'vulopilot' ) }
				help={ __( 'A label for your own reference — VuloPilot\'s AI generator picks the right type automatically based on the content.', 'vulopilot' ) }
				value={ schemaType }
				options={ SCHEMA_TYPES.map( ( type ) => ( { label: type, value: type } ) ) }
				onChange={ ( value ) => setMeta( { [ metaKeys.schema_type ]: value } ) }
			/>

			{ isPro ? (
				<Button variant="primary" isBusy={ generating } disabled={ generating } onClick={ handleGenerate }>
					{ __( 'Generate with AI', 'vulopilot' ) }
				</Button>
			) : (
				<Button variant="secondary" href={ shopUrl } target="_blank" rel="noreferrer">
					{ __( 'Upgrade to generate with AI', 'vulopilot' ) }
				</Button>
			) }

			{ error && <Notice status="error" isDismissible={ false }>{ error }</Notice> }

			<TextareaControl
				label={ __( 'Structured Data (JSON-LD)', 'vulopilot' ) }
				help={ isValidJson( schemaJson ) ? __( 'Advanced — edit the raw JSON-LD directly.', 'vulopilot' ) : __( 'This is not valid JSON — it will be cleared on save.', 'vulopilot' ) }
				value={ schemaJson }
				onChange={ ( value ) => setMeta( { [ metaKeys.schema_json ]: value } ) }
				rows={ 10 }
			/>
		</div>
	);
}
