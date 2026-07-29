import { registerPlugin } from '@wordpress/plugins';
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/edit-post';
import { __ } from '@wordpress/i18n';
import PostSeoPanel from './PostSeoPanel';
import './style.scss';

const SIDEBAR_NAME = 'vulopilot-seo-sidebar';

/**
 * "Meta Box Appearing in Single Posts & Pages" — VuloPilot's first Block
 * Editor integration (react-frontend.md's mounting rules cover the
 * dashboard app at `#admin-main-wrapper`/`#multivendorx-store-dashboard`,
 * a different surface entirely). Registered as a `PluginSidebar` rather
 * than a classic `add_meta_box()` panel — the modern, React-native
 * equivalent every current Block-Editor-era SEO plugin (RankMath included,
 * per rankmath.com/kb/on-page-seo/) now uses.
 *
 * Only enqueued for post/page screens
 * (Services\PostEditorAssets::enqueue_assets()), so this module never runs
 * anywhere else.
 */
registerPlugin( 'vulopilot-seo', {
	render: () => (
		<>
			<PluginSidebarMoreMenuItem target={ SIDEBAR_NAME }>
				{ __( 'VuloPilot SEO', 'vulopilot' ) }
			</PluginSidebarMoreMenuItem>
			<PluginSidebar name={ SIDEBAR_NAME } title={ __( 'VuloPilot SEO', 'vulopilot' ) }>
				<PostSeoPanel />
			</PluginSidebar>
		</>
	),
} );
