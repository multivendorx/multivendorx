<?php
/**
 * LoginField class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Integrations\VuloForm;

defined( 'ABSPATH' ) || exit;

/**
 * Makes the locked "account status" field (`Templates::locked_login_field()`) behave like a real,
 * non-removable part of the store registration form despite being an ordinary `html` field as far
 * as VuloForm's own schema knows:
 * - render-time content is always re-computed fresh (it needs today's login state/nonce, not
 *   whatever was saved), and shows a placeholder card instead in any admin preview context;
 * - VuloForm's own builder UI hides its delete button and blocks dragging/reordering it, via
 *   VuloForm's existing locking mechanism (zyra's `FormBuilder`, not a VuloForm core change);
 * - it's re-added server-side on save as a last-resort guard against a raw REST call.
 */
class LoginField {

    /**
     * LoginField constructor.
     */
    public function __construct() {
        add_filter( 'vuloform_render_field', array( $this, 'render' ), 10, 3 );
        add_filter( 'vuloform_localize_data', array( $this, 'lock' ) );
        add_filter( 'rest_request_before_callbacks', array( $this, 'ensure_present_on_save' ), 10, 3 );
    }

    /**
     * Fresh, per-request markup for the locked "account status" field (`vuloform_render_field`
     * filter, fired by VuloForm's `Renderer::render()` on every embed/preview request -- never
     * cached), so it always reflects the current viewer's login state and carries a live nonce,
     * regardless of whatever placeholder content is actually stored in the form's schema.
     *
     * @param string $field_html Field's default rendered HTML.
     * @param array  $field      Field definition.
     * @param array  $form       The VuloForm form (id, title, status, schema, ...).
     * @return string
     */
    public function render( $field_html, $field, $form ) {
        if ( Templates::LOGIN_FIELD_KEY !== ( $field['key'] ?? '' ) ) {
            return $field_html;
        }

        $configured_form_id = (int) MultiVendorX()->setting->get_setting( 'vuloform_store_registration_form_id', 0 );

        if ( ! $configured_form_id || $configured_form_id !== (int) ( $form['id'] ?? 0 ) ) {
            return $field_html;
        }

        if ( self::is_admin_preview_request() ) {
            return self::admin_preview_markup();
        }

        return '<div class="vuloform-field vuloform-html multivendorx-account-status">'
            . apply_filters( 'multivendorx_add_content_before_form', '' )
            . '</div>';
    }

    /**
     * Tells zyra's `FormBuilder` (`vuloform_localize_data` -- the only filter over
     * `vuloformAppLocalizer`, see `FrontendScripts::localize_scripts()`) to hide the delete button
     * for the locked "account status" field and refuse to remove it client-side, for any form
     * whose persisted `settings.template` is our template id (every form created from
     * `Templates::add_templates()`'s template, since it carries a `'plugin'` key -- see
     * `VuloForm\Forms\Templates::all()`). This is VuloForm's own existing locking mechanism
     * (`fields.ts`'s `lockOf()`), not a VuloForm core change.
     *
     * @param array $data `vuloformAppLocalizer` data.
     * @return array
     */
    public function lock( $data ) {
        $data['locked'][ Templates::TEMPLATE_ID ][ Templates::LOGIN_FIELD_KEY ] = array( 'delete' => false );

        if ( class_exists( '\VuloForm\Fields\Registry' ) ) {
            $data['palettes'][ Templates::TEMPLATE_ID ] = self::locked_palette();
        }

        return $data;
    }

    /**
     * Replicates VuloForm's own default field library -- grouped the same way its builder already
     * groups it (`basic`/`layout`/`advanced`), read fresh from `Registry::types()` every time so it
     * can't drift out of sync with VuloForm's real type list -- as a custom "palette" for our
     * template, with one addition: the locked "account status" field pinned to the top of the
     * `layout` group. A template's palette (`vuloform_localize_data`'s `palettes` key) is the only
     * thing that drives zyra's `FormBuilder`'s "pin" lock (which also blocks dragging/reordering,
     * not just deleting, unlike the plain `delete` lock in `lock()` above) -- but supplying one for
     * a template fully replaces its standard library in that component (`paletteGroups()`), so the
     * whole thing has to be reproduced here, not just our one field.
     *
     * @return array[] {id, label, items}[]
     */
    private static function locked_palette() {
        $groups = array(
            'basic'    => array(),
            'layout'   => array(),
            'advanced' => array(),
        );

        foreach ( \VuloForm\Fields\Registry::types() as $type_id => $type ) {
            $group = $type['group'] ?? 'basic';

            if ( isset( $groups[ $group ] ) ) {
                $groups[ $group ][] = $type_id;
            }
        }

        array_unshift(
            $groups['layout'],
            array(
                'id'     => Templates::LOGIN_FIELD_KEY,
                'type'   => 'html',
                'key'    => Templates::LOGIN_FIELD_KEY,
                'label'  => __( 'Account', 'multivendorx' ),
                'icon'   => 'lock',
                'pin'    => 'top',
                'unique' => true,
            )
        );

        return array(
            array(
                'id'    => 'basic',
                'label' => __( 'Questions', 'multivendorx' ),
                'items' => $groups['basic'],
            ),
            array(
                'id'    => 'layout',
                'label' => __( 'Text and layout', 'multivendorx' ),
                'items' => $groups['layout'],
            ),
            array(
                'id'    => 'advanced',
                'label' => __( 'Special fields', 'multivendorx' ),
                'items' => $groups['advanced'],
            ),
        );
    }

    /**
     * There's no dedicated "is this an editor/preview render" flag on VuloForm's request --
     * the Registration settings tab's `FormPreview`, VuloForm's own form-builder preview pane,
     * and the real frontend registration page all fetch the exact same public embed endpoint
     * (`useVuloFormPreview`/`VuloFormEmbed` both call `/public/forms/{id}/embed`). The referer is
     * the only signal available to tell them apart: both admin contexts load from a `wp-admin`
     * URL, the frontend registration page never does.
     *
     * @return bool
     */
    private static function is_admin_preview_request() {
        $referer = wp_get_raw_referer();

        return $referer && 0 === strpos( $referer, admin_url() );
    }

    /**
     * What the locked "account status" field shows inside an admin preview (the Registration
     * settings tab, and VuloForm's own form editor) instead of the real WooCommerce login form: a
     * centered placeholder card over a blurred/dimmed preview of the fields it stands in for
     * (matching this workspace's other empty-state-over-content cards), since showing the actual
     * interactive login form there would be misleading (it's not actually usable in that context)
     * and the field can't be edited/dragged/deleted regardless of how it looks.
     *
     * @return string
     */
    private static function admin_preview_markup() {
        // VuloForm's own stylesheet (loaded by the iframe this renders into -- see
        // `Renderer::field()`'s wrapper/label/input classes) doesn't have this card-over-blur look
        // built in. There's no enqueued stylesheet of ours reaching that iframe either -- it's
        // assembled from VuloForm's own `embed.style` + `embed.html`, outside any normal WP page --
        // so the styling is scoped to this one snippet with its own `<style>` block instead.
        ob_start();
        ?>
        <style>
            .multivendorx-account-status-preview { position: relative; min-height: 14rem; }
            .multivendorx-account-status-preview .multivendorx-blurred-fields {
                pointer-events: none;
                user-select: none;
                -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, .8) 0%, rgba(0, 0, 0, .35) 100%);
                mask-image: linear-gradient(to bottom, rgba(0, 0, 0, .8) 0%, rgba(0, 0, 0, .35) 100%);
            }
            .multivendorx-account-status-preview .multivendorx-preview-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .75rem; padding: 1rem; }
            .multivendorx-account-status-preview .multivendorx-preview-card { display: flex; flex-direction: column; align-items: center; text-align: center; gap: .25rem; width: 100%; max-width: 26rem; padding: 1.5rem; border: 1px solid #e5e7eb; border-radius: var(--vf-radius, 12px); background: #fff; box-shadow: 0 4px 16px rgba(0, 0, 0, .08); }
            .multivendorx-account-status-preview .multivendorx-preview-icon { width: 40px; height: 40px; border-radius: 10px; background: #ede9fe; display: flex; align-items: center; justify-content: center; margin-bottom: .5rem; }
            .multivendorx-account-status-preview .multivendorx-preview-title { font-size: 1rem; color: #111827; }
            .multivendorx-account-status-preview .multivendorx-preview-desc { margin: .25rem 0 0; color: #6b7280; font-size: .8125rem; line-height: 1.45; }
            .multivendorx-account-status-preview .multivendorx-preview-caption { color: #9ca3af; font-size: .75rem; }
        </style>
        <div class="vuloform-field vuloform-field--html multivendorx-account-status">
            <div class="multivendorx-account-status-preview">
                <div class="multivendorx-blurred-fields">
                    <div class="vuloform-field vuloform-field--email">
                        <label class="vuloform-label"><?php esc_html_e( 'Username or email address', 'multivendorx' ); ?></label>
                        <input class="vuloform-input" type="email" disabled="disabled" />
                    </div>
                    <div class="vuloform-field vuloform-field--password">
                        <label class="vuloform-label"><?php esc_html_e( 'Password', 'multivendorx' ); ?></label>
                        <input class="vuloform-input" type="password" disabled="disabled" />
                    </div>
                </div>
                <div class="multivendorx-preview-overlay">
                    <div class="multivendorx-preview-card">
                        <div class="multivendorx-preview-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <rect x="4" y="11" width="16" height="9" rx="2"></rect>
                                <path d="M8 11V7a4 4 0 0 1 8 0v4"></path>
                            </svg>
                        </div>
                        <strong class="multivendorx-preview-title">
                            <?php esc_html_e( 'WooCommerce login / registration', 'multivendorx' ); ?>
                        </strong>
                        <p class="multivendorx-preview-desc">
                            <?php esc_html_e( 'On the live site, this is replaced with the WooCommerce login/register form.', 'multivendorx' ); ?>
                        </p>
                    </div>
                    <span class="multivendorx-preview-caption">
                        <?php esc_html_e( "Can't be edited, dragged, or deleted here.", 'multivendorx' ); ?>
                    </span>
                </div>
            </div>
        </div>
        <?php
        return (string) ob_get_clean();
    }

    /**
     * Restores the locked "account status" field (`Templates::locked_login_field()`) into the
     * store registration form's schema if an admin deletes it from the VuloForm builder and
     * saves -- VuloForm has no "locked field" concept of its own (its per-field sanitize filter
     * only runs for fields still present in the request, so it can't resurrect a deleted one),
     * so this intercepts the save request itself, the only point where a missing field can still
     * be re-added before it's persisted.
     *
     * @param mixed            $response Response to replace the request with, or null to proceed.
     * @param array            $handler  Route handler.
     * @param \WP_REST_Request $request  Request.
     * @return mixed
     */
    public function ensure_present_on_save( $response, $handler, $request ) {
        if ( ! preg_match( '#^/vuloform/v1/forms/(\d+)$#', $request->get_route(), $matches ) ) {
            return $response;
        }

        if ( ! in_array( $request->get_method(), array( 'POST', 'PUT' ), true ) ) {
            return $response;
        }

        $configured_form_id = (int) MultiVendorX()->setting->get_setting( 'vuloform_store_registration_form_id', 0 );

        if ( ! $configured_form_id || $configured_form_id !== (int) $matches[1] ) {
            return $response;
        }

        $params = $request->get_json_params();
        $fields = $params['schema']['fields'] ?? null;

        if ( ! is_array( $fields ) ) {
            return $response;
        }

        foreach ( $fields as $field ) {
            if ( Templates::LOGIN_FIELD_KEY === ( $field['key'] ?? '' ) ) {
                return $response;
            }
        }

        array_unshift( $params['schema']['fields'], Templates::locked_login_field() );
        $request->set_body( (string) wp_json_encode( $params ) );

        return $response;
    }
}
