import { __ } from '@wordpress/i18n';
import { TextControl, TextareaControl, Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { usePostData } from '../usePostData';

// window.wp.media() has no shipped type definitions.
type MediaFrame = any;

/**
 * The metabox's Social tab — per-post Open Graph/Twitter Card overrides.
 * Services\SocialMetaTagsManager already outputs sitewide OG/Twitter tags
 * (gated by the `social_meta_tags_enabled` setting); these three fields
 * override the title/description/image for THIS post specifically, and —
 * per that manager's own `has_post_override()` check — take effect even
 * when the sitewide setting is off, since setting one of these is a
 * deliberate per-post action.
 *
 * Uses `window.wp.media` directly (WP core's own media modal, already
 * loaded on every post-edit screen) rather than pulling in
 * `@wordpress/media-utils` for a single "pick an image" button.
 */
export default function SocialTab() {
	const { meta, setMeta } = usePostData();
	const { metaKeys } = window.vulopilotPostSeo;

	const socialTitle = ( meta[ metaKeys.social_title ] as string ) || '';
	const socialDescription = ( meta[ metaKeys.social_description ] as string ) || '';
	const socialImageId = Number( meta[ metaKeys.social_image_id ] ) || 0;

	const [ previewUrl, setPreviewUrl ] = useState< string >( '' );

	const openMediaPicker = () => {
		/* eslint-disable-next-line no-unused-vars */
		const wp = ( window as unknown as { wp: { media: ( args: Record< string, unknown > ) => MediaFrame } } ).wp;

		if ( ! wp?.media ) {
			return;
		}

		const frame: MediaFrame = wp.media( {
			title: __( 'Choose a social sharing image', 'vulopilot' ),
			multiple: false,
			library: { type: 'image' },
		} );

		frame.on( 'select', () => {
			const attachment = frame.state().get( 'selection' ).first().toJSON();
			setMeta( { [ metaKeys.social_image_id ]: attachment.id } );
			setPreviewUrl( attachment.url );
		} );

		frame.open();
	};

	const removeImage = () => {
		setMeta( { [ metaKeys.social_image_id ]: 0 } );
		setPreviewUrl( '' );
	};

	return (
		<div className="vulopilot-seo-tab vulopilot-seo-tab--social">
			<TextControl
				label={ __( 'Social Title', 'vulopilot' ) }
				help={ __( 'Leave empty to use the SEO title.', 'vulopilot' ) }
				value={ socialTitle }
				onChange={ ( value ) => setMeta( { [ metaKeys.social_title ]: value } ) }
			/>

			<TextareaControl
				label={ __( 'Social Description', 'vulopilot' ) }
				help={ __( 'Leave empty to use the meta description.', 'vulopilot' ) }
				value={ socialDescription }
				onChange={ ( value ) => setMeta( { [ metaKeys.social_description ]: value } ) }
				rows={ 3 }
			/>

			<div className="vulopilot-seo-social-image">
				<label>{ __( 'Social Image', 'vulopilot' ) }</label>
				{ ( previewUrl || socialImageId > 0 ) && previewUrl && (
					<img src={ previewUrl } alt="" className="vulopilot-seo-social-image__preview" />
				) }
				<div className="vulopilot-seo-social-image__actions">
					<Button variant="secondary" onClick={ openMediaPicker }>
						{ socialImageId > 0 ? __( 'Replace Image', 'vulopilot' ) : __( 'Choose Image', 'vulopilot' ) }
					</Button>
					{ socialImageId > 0 && (
						<Button variant="tertiary" isDestructive onClick={ removeImage }>
							{ __( 'Remove', 'vulopilot' ) }
						</Button>
					) }
				</div>
				<p className="vulopilot-seo-social-image__help">
					{ __( 'Leave empty to use the featured image.', 'vulopilot' ) }
				</p>
			</div>
		</div>
	);
}
