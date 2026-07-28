import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Every field the metabox reads/writes lives on `core/editor`'s own edited
 * post attributes/meta — title and excerpt are the same native fields
 * AIActions\Actions\WriteMetaTitleAction/WriteMetaDescriptionAction already
 * write server-side (RestAPI\Controllers\PostSeo's own docblock explains
 * why this metabox doesn't invent a second, disconnected "SEO title"
 * field), and `meta` is whatever Services\PostSeoMetaFields registered via
 * `show_in_rest` — both ride the Block Editor's own Save/Update button,
 * undo/redo, and autosave for free.
 */
export function usePostData() {
	const { postId, postType, title, excerpt, slug, content, meta } = useSelect(
		( select ) => {
			const editor = select( 'core/editor' ) as any;

			return {
				postId: editor.getCurrentPostId(),
				postType: editor.getCurrentPostType(),
				title: editor.getEditedPostAttribute( 'title' ) || '',
				excerpt: editor.getEditedPostAttribute( 'excerpt' ) || '',
				slug: editor.getEditedPostAttribute( 'slug' ) || '',
				content: editor.getEditedPostContent() || '',
				meta: editor.getEditedPostAttribute( 'meta' ) || {},
			};
		},
		[]
	);

	const { editPost } = useDispatch( 'core/editor' ) as any;

	const setTitle = ( value: string ) => editPost( { title: value } );
	const setExcerpt = ( value: string ) => editPost( { excerpt: value } );

	// core/editor's own `meta` edited-attribute is a full replace, not a
	// deep merge — every write here spreads the current object first so a
	// single-field update doesn't drop every other meta key.
	const setMeta = ( patch: Record< string, unknown > ) =>
		editPost( { meta: { ...meta, ...patch } } );

	return {
		postId,
		postType,
		title,
		excerpt,
		slug,
		content,
		meta,
		setTitle,
		setExcerpt,
		setMeta,
	};
}
