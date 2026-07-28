import { __ } from '@wordpress/i18n';

interface SnippetPreviewProps {
	title: string;
	description: string;
	url: string;
	siteName: string;
}

/**
 * A Google-results-style preview — RankMath's own snippet editor is the
 * direct model (rankmath.com/kb/on-page-seo/). Title/description are
 * truncated with the same thresholds Services\OnPageAnalyzer/
 * AIActions\Actions\WriteMetaTitleAction/WriteMetaDescriptionAction already
 * use server-side (60/160 chars) so what's shown here matches what those
 * checks are actually grading against.
 */
export default function SnippetPreview( { title, description, url, siteName }: SnippetPreviewProps ) {
	const displayTitle = title || __( '(No title yet)', 'vulopilot' );
	const displayDescription = description || __( '(No meta description yet — search engines will pick an excerpt from the page automatically.)', 'vulopilot' );

	return (
		<div className="vulopilot-seo-snippet-preview">
			<div className="vulopilot-seo-snippet-preview__site">
				<span className="vulopilot-seo-snippet-preview__site-name">{ siteName }</span>
				<span className="vulopilot-seo-snippet-preview__url">{ url }</span>
			</div>
			<div className="vulopilot-seo-snippet-preview__title">
				{ displayTitle.length > 60 ? `${ displayTitle.slice( 0, 60 ) }…` : displayTitle }
			</div>
			<div className="vulopilot-seo-snippet-preview__description">
				{ displayDescription.length > 160 ? `${ displayDescription.slice( 0, 160 ) }…` : displayDescription }
			</div>
		</div>
	);
}
