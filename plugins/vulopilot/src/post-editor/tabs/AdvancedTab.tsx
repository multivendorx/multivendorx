import { __ } from '@wordpress/i18n';
import { TextControl, ToggleControl } from '@wordpress/components';
import { usePostData } from '../usePostData';

/**
 * The metabox's Advanced tab — a per-post canonical URL override
 * (Services\CanonicalUrlManager::maybe_override_canonical(), which filters
 * WP core's own `get_canonical_url` directly, so it takes effect
 * regardless of the sitewide "Add canonical URL tags" setting) and
 * noindex/nofollow (Services\PostRobotsMetaManager's `wp_robots` filter).
 */
export default function AdvancedTab() {
	const { slug, meta, setMeta } = usePostData();
	const { metaKeys } = window.vulopilotPostSeo;

	const canonicalUrl = ( meta[ metaKeys.canonical_url ] as string ) || '';
	const noindex = Boolean( meta[ metaKeys.robots_noindex ] );
	const nofollow = Boolean( meta[ metaKeys.robots_nofollow ] );

	return (
		<div className="vulopilot-seo-tab vulopilot-seo-tab--advanced">
			<TextControl
				label={ __( 'Canonical URL', 'vulopilot' ) }
				help={ __( 'Leave empty to use this page\'s own permalink (the default WordPress already uses).', 'vulopilot' ) }
				placeholder={ window.location.origin + '/' + slug }
				value={ canonicalUrl }
				onChange={ ( value ) => setMeta( { [ metaKeys.canonical_url ]: value } ) }
			/>

			<ToggleControl
				label={ __( 'No Index', 'vulopilot' ) }
				help={ __( 'Tell search engines not to show this page in search results.', 'vulopilot' ) }
				checked={ noindex }
				onChange={ ( value ) => setMeta( { [ metaKeys.robots_noindex ]: value } ) }
			/>

			<ToggleControl
				label={ __( 'No Follow', 'vulopilot' ) }
				help={ __( 'Tell search engines not to follow links on this page.', 'vulopilot' ) }
				checked={ nofollow }
				onChange={ ( value ) => setMeta( { [ metaKeys.robots_nofollow ]: value } ) }
			/>
		</div>
	);
}
