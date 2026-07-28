import { __ } from '@wordpress/i18n';
import { TextControl, TextareaControl } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { usePostData } from '../usePostData';
import SnippetPreview from '../SnippetPreview';
import Checklist from '../Checklist';
import { analyzePost, AnalysisResult, FixResponse } from '../api';

const GROUP_LABELS: Record< AnalysisResult[ 'group' ], string > = {
	basic: __( 'Basic SEO', 'vulopilot' ),
	additional: __( 'Additional', 'vulopilot' ),
	title_readability: __( 'Title Readability', 'vulopilot' ),
};

/**
 * The metabox's General tab — focus keyword, SEO title (native
 * `post_title`), meta description (native `post_excerpt`), a live snippet
 * preview, and Services\OnPageAnalyzer's checklist. Analysis re-runs on a
 * short debounce as the editor's title/excerpt/content/focus keyword
 * change — it has to run against LIVE, possibly-unsaved editor state
 * (this class's own PHP counterpart's docblock explains why that's a
 * POST-with-body rather than reading the stored post).
 */
export default function GeneralTab() {
	const { postId, title, excerpt, slug, content, meta, setTitle, setExcerpt, setMeta } = usePostData();
	const focusKeyword = ( meta[ window.vulopilotPostSeo.metaKeys.focus_keyword ] as string ) || '';

	const [ results, setResults ] = useState< AnalysisResult[] >( [] );
	const [ analyzing, setAnalyzing ] = useState( false );

	useEffect( () => {
		let cancelled = false;
		setAnalyzing( true );

		const timeout = setTimeout( () => {
			analyzePost( postId, { title, content, excerpt, slug, focus_keyword: focusKeyword } )
				.then( ( response ) => {
					if ( ! cancelled ) {
						setResults( response.results );
					}
				} )
				.catch( () => {
					// A failed analysis call just leaves the previous
					// checklist showing — not worth surfacing as an error,
					// it re-runs automatically on the next edit.
				} )
				.finally( () => {
					if ( ! cancelled ) {
						setAnalyzing( false );
					}
				} );
		}, 600 );

		return () => {
			cancelled = true;
			clearTimeout( timeout );
		};
	}, [ postId, title, excerpt, slug, content, focusKeyword ] );

	const handleFixed = ( actionId: string, response: FixResponse ) => {
		if ( ! response.post ) {
			return;
		}

		if ( 'write-meta-title' === actionId ) {
			setTitle( response.post.title );
		}

		if ( 'write-meta-description' === actionId ) {
			setExcerpt( response.post.excerpt );
		}

		// improve-readability/add-subheadings rewrite post_content on the
		// server — deliberately NOT live-synced into the open editor's
		// block canvas (that would mean re-parsing HTML into blocks under
		// an actively-edited post, risking clobbering an in-progress edit
		// or the undo stack). The write already happened and is real;
		// reloading the editor is what picks it up.
	};

	const byGroup = ( group: AnalysisResult[ 'group' ] ) => results.filter( ( result ) => result.group === group );

	return (
		<div className="vulopilot-seo-tab vulopilot-seo-tab--general">
			<TextControl
				label={ __( 'Focus Keyword', 'vulopilot' ) }
				help={ __( 'The main term you want this page to rank for — drives the checks below.', 'vulopilot' ) }
				value={ focusKeyword }
				onChange={ ( value ) => setMeta( { [ window.vulopilotPostSeo.metaKeys.focus_keyword ]: value } ) }
			/>

			<TextControl
				label={ __( 'SEO Title', 'vulopilot' ) }
				help={ __( 'This is the page title — shown in search results and used as the page heading.', 'vulopilot' ) + ` (${ title.length }/60)` }
				value={ title }
				onChange={ setTitle }
			/>

			<TextareaControl
				label={ __( 'Meta Description', 'vulopilot' ) }
				help={ __( 'Shown as the description snippet in search results.', 'vulopilot' ) + ` (${ excerpt.length }/160)` }
				value={ excerpt }
				onChange={ setExcerpt }
				rows={ 3 }
			/>

			<SnippetPreview
				title={ title }
				description={ excerpt }
				url={ window.location.origin + '/' + slug }
				siteName={ document.title.split( '‹' ).pop()?.trim() || '' }
			/>

			{ analyzing && 0 === results.length ? (
				<p>{ __( 'Analyzing…', 'vulopilot' ) }</p>
			) : (
				( [ 'basic', 'additional', 'title_readability' ] as const ).map( ( group ) => (
					<Checklist
						key={ group }
						title={ GROUP_LABELS[ group ] }
						results={ byGroup( group ) }
						postId={ postId }
						isPro={ window.vulopilotPostSeo.isPro }
						shopUrl={ window.vulopilotPostSeo.shopUrl }
						onFixed={ handleFixed }
					/>
				) )
			) }
		</div>
	);
}
