<?php
/**
 * PostSeoMetaFields class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Services;

use VuloPilot\AIActions\Actions\GenerateSchemaAction;

defined( 'ABSPATH' ) || exit;

/**
 * Registers the post-editor metabox's own postmeta fields via
 * `register_post_meta( ..., 'show_in_rest' => true )` rather than a
 * bespoke REST controller for reading/writing them — this makes every
 * field here ride along with the Block Editor's own native Save/Update
 * button (`wp/v2/posts|pages/{id}`'s `meta` property, read/written from
 * the sidebar via `wp.data.select('core/editor').getEditedPostAttribute(
 * 'meta' )`/`editPost({ meta })`), so undo/redo, autosave, and revisions
 * all already work without this plugin reimplementing any of them.
 *
 * `META_KEYS` is the single source of truth for the literal postmeta
 * strings — Services\CanonicalUrlManager/SocialMetaTagsManager/
 * PostRobotsMetaManager (which read these same keys to actually affect
 * frontend output) and Services\PostEditorAssets (which localizes this
 * same map to the editor's JS bundle) all reference it rather than each
 * holding their own copy.
 *
 * @class       PostSeoMetaFields class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class PostSeoMetaFields {

    /**
     * Postmeta key strings, keyed by field name.
     *
     * @var array<string, string>
     */
    public const META_KEYS = array(
        'focus_keyword'      => '_vulopilot_focus_keyword',
        'canonical_url'      => '_vulopilot_canonical_url',
        'robots_noindex'     => '_vulopilot_robots_noindex',
        'robots_nofollow'    => '_vulopilot_robots_nofollow',
        'social_title'       => '_vulopilot_social_title',
        'social_description' => '_vulopilot_social_description',
        'social_image_id'    => '_vulopilot_social_image_id',
        'schema_type'        => '_vulopilot_schema_type',
    );

    /**
     * Post types the metabox appears on — matches
     * AIActions\Actions\WriteMetaTitleAction/WriteMetaDescriptionAction's
     * own `array( 'post', 'page' )` scope.
     *
     * @var string[]
     */
    private const POST_TYPES = array( 'post', 'page' );

    /**
     * PostSeoMetaFields constructor.
     */
    public function __construct() {
        add_action( 'init', array( $this, 'register_meta_fields' ) );
    }

    /**
     * Registers every metabox field for both 'post' and 'page' post types.
     *
     * @return void
     */
    public function register_meta_fields(): void {
        foreach ( self::POST_TYPES as $post_type ) {
            register_post_meta(
                $post_type,
                self::META_KEYS['focus_keyword'],
                $this->string_field_args()
            );

            register_post_meta(
                $post_type,
                self::META_KEYS['canonical_url'],
                $this->string_field_args( 'esc_url_raw' )
            );

            register_post_meta( $post_type, self::META_KEYS['robots_noindex'], $this->boolean_field_args() );
            register_post_meta( $post_type, self::META_KEYS['robots_nofollow'], $this->boolean_field_args() );

            register_post_meta( $post_type, self::META_KEYS['social_title'], $this->string_field_args() );
            register_post_meta( $post_type, self::META_KEYS['social_description'], $this->string_field_args() );
            register_post_meta( $post_type, self::META_KEYS['social_image_id'], $this->integer_field_args() );
            register_post_meta( $post_type, self::META_KEYS['schema_type'], $this->string_field_args() );

            // GenerateSchemaAction's own meta key, registered here too so
            // the Schema tab's manual JSON textarea rides the same native
            // save button as every other field — the sanitize callback
            // re-encodes through json_decode/wp_json_encode so a stored
            // value is always either valid JSON or empty, never
            // arbitrary text mangled by sanitize_text_field's tag-stripping.
            register_post_meta(
                $post_type,
                GenerateSchemaAction::META_KEY,
                $this->string_field_args(
                    static function ( $value ) {
                        $decoded = json_decode( (string) $value, true );

                        return is_array( $decoded ) ? wp_json_encode( $decoded ) : '';
                    }
                )
            );
        }
    }

    /**
     * Shared register_post_meta() args for every plain-string field.
     *
     * @param callable|string $sanitize_callback Defaults to sanitize_text_field.
     * @return array<string, mixed>
     */
    private function string_field_args( $sanitize_callback = 'sanitize_text_field' ): array {
        return array(
            'type'              => 'string',
            'single'            => true,
            'default'           => '',
            'show_in_rest'      => true,
            'sanitize_callback' => $sanitize_callback,
            'auth_callback'     => array( $this, 'can_edit_post' ),
        );
    }

    /**
     * Shared register_post_meta() args for the two robots toggle fields.
     *
     * @return array<string, mixed>
     */
    private function boolean_field_args(): array {
        return array(
            'type'          => 'boolean',
            'single'        => true,
            'default'       => false,
            'show_in_rest'  => true,
            'auth_callback' => array( $this, 'can_edit_post' ),
        );
    }

    /**
     * The register_post_meta() args for the social image attachment id field.
     *
     * @return array<string, mixed>
     */
    private function integer_field_args(): array {
        return array(
            'type'          => 'integer',
            'single'        => true,
            'default'       => 0,
            'show_in_rest'  => true,
            'auth_callback' => array( $this, 'can_edit_post' ),
        );
    }

    /**
     * The auth_callback every register_post_meta() call above passes —
     * REST-exposed metadata defaults to requiring `edit_post`-equivalent
     * capability checks per field; this is that check, explicit rather
     * than relying on core's own default so every field here is
     * consistently gated.
     *
     * @param bool   $allowed Whether the value is allowed to be edited.
     * @param string $meta_key Meta key.
     * @param int    $post_id  Post id.
     * @return bool
     */
    public function can_edit_post( bool $allowed, string $meta_key, int $post_id ): bool {
        return current_user_can( 'edit_post', $post_id );
    }
}
