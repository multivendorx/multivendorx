<?php
/**
 * Assets class file.
 *
 * @package VuloCart
 */

namespace VuloCart\RestAPI\Controllers;

use VuloCart\Domain\Asset\Asset;
use VuloCart\Domain\Asset\AssetType;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Assets REST controller.
 *
 * `GET /vulocart/v1/assets` (paginated) and `POST /vulocart/v1/assets`.
 * Calls VuloCart()->asset_service only — never
 * Infrastructure\Database\WPDBAssetRepository directly (rest-api.md +
 * this plugin's own Application-layer convention).
 *
 * @class       Assets class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Assets extends \WP_REST_Controller {

    /**
     * REST base for this controller's routes.
     *
     * @var string
     */
    protected $rest_base = 'assets';

    /**
     * The type-specific fields OfferingEdit.tsx's "Type Details" card shows
     * per offering type — a real, per-type functionality layer on top of
     * the generic fields every type already has (title/price/description/
     * etc.), matching how WooCommerce's simple/variable/grouped/external
     * product types each expose different meta-box fields. Keyed by
     * AssetType constant, each value maps a field name to how it's
     * sanitized: 'text' (sanitize_text_field), 'int' (absint-able,
     * nullable), 'float' (nullable), 'bool', or 'key' (sanitize_key,
     * for a small fixed option set the frontend's own SelectInput
     * enumerates). Types with no entry here (physical, license) have no
     * type-specific fields — physical's "type-specific" behavior is
     * already the existing Stock/Shipping sections, and license has no
     * dedicated fields yet (kept only for backward compatibility with any
     * asset created before this plugin's admin-UX brief specified its own
     * 11-type list, which doesn't include license).
     *
     * @var array<string, array<string, string>>
     */
    const TYPE_DETAIL_FIELDS = array(
        'digital'      => array(
            'download_url'         => 'text',
            'download_limit'       => 'int',
            'download_expiry_days' => 'int',
        ),
        'subscription' => array(
            'billing_interval'           => 'key',
            'trial_period_days'          => 'int',
            'subscription_length_cycles' => 'int',
        ),
        'course'       => array(
            'lesson_count'     => 'int',
            'duration_hours'   => 'int',
            'skill_level'      => 'key',
            'enrollment_limit' => 'int',
        ),
        'service'      => array(
            'duration_minutes' => 'int',
            'location_type'    => 'key',
        ),
        'membership'   => array(
            'membership_duration_days' => 'int',
            'renewal_type'             => 'key',
        ),
        'booking'      => array(
            'slot_duration_minutes'  => 'int',
            'max_attendees_per_slot' => 'int',
        ),
        'rental'       => array(
            'rental_period'    => 'key',
            'deposit_amount'   => 'float',
            'late_fee_per_day' => 'float',
        ),
        'bundle'       => array(
            'bundle_items' => 'text',
        ),
        'donation'     => array(
            'suggested_amounts'   => 'text',
            'allow_custom_amount' => 'bool',
        ),
        'gift_card'    => array(
            'denominations' => 'text',
            'expiry_days'   => 'int',
        ),
    );

    /**
     * Registers this controller's REST routes.
     *
     * @return void
     */
    public function register_routes() {
        register_rest_route(
            VuloCart()->rest_namespace,
            '/' . $this->rest_base,
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_items' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                ),
                array(
                    'methods'             => \WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'create_item' ),
                    'permission_callback' => array( $this, 'create_item_permissions_check' ),
                ),
            )
        );

        register_rest_route(
            VuloCart()->rest_namespace,
            '/' . $this->rest_base . '/(?P<id>\d+)',
            array(
                array(
                    'methods'             => \WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_item' ),
                    'permission_callback' => array( $this, 'get_items_permissions_check' ),
                ),
                array(
                    'methods'             => \WP_REST_Server::EDITABLE,
                    'callback'            => array( $this, 'update_item' ),
                    'permission_callback' => array( $this, 'create_item_permissions_check' ),
                ),
            )
        );
    }

    /**
     * Whether asset listing is open to everyone — genuinely public read
     * access, same "cart token is the access control, not a nonce"
     * posture RestAPI\Controllers\Cart's docblock explains for a
     * different reason: a storefront checkout page (src/blocks/checkout)
     * has no WordPress session at all and still needs to browse assets to
     * add them to a cart. get_items() itself is what keeps this safe —
     * it force-scopes results to `status = published` for anyone without
     * `manage_options`, so a logged-out visitor can never see (or infer
     * the existence of) a draft/archived asset just by passing a
     * different `status` query param.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return bool
     */
    public function get_items_permissions_check( $request ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found
        return true;
    }

    /**
     * Checks whether the current user can create an asset.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return bool
     */
    public function create_item_permissions_check( $request ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found
        return current_user_can( 'manage_options' );
    }

    /**
     * Converts a domain Asset into the REST response shape.
     *
     * @param Asset $asset Asset to convert to a REST response shape.
     * @return array<string, mixed>
     */
    private function prepare_asset_for_response( Asset $asset ): array {
        return array(
            'id'         => $asset->id,
            'type'       => $asset->type,
            'title'      => $asset->title,
            'slug'       => $asset->slug,
            'sku'        => $asset->sku,
            'status'     => $asset->status,
            'price'      => $asset->price,
            'currency'   => $asset->currency,
            'meta'       => $asset->meta,
            'created_at' => $asset->created_at,
            'updated_at' => $asset->updated_at,
        );
    }

    /**
     * Lists assets, paginated.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response
     */
    public function get_items( $request ) {
        $page_param     = $request->get_param( 'page' );
        $per_page_param = $request->get_param( 'per_page' );

        $page     = absint( $page_param ? $page_param : 1 );
        $per_page = absint( $per_page_param ? $per_page_param : 20 );
        $type     = sanitize_key( (string) $request->get_param( 'type' ) );
        $status   = sanitize_key( (string) $request->get_param( 'status' ) );

        // Anyone without manage_options is a public storefront request
        // (see get_items_permissions_check()'s docblock) — force
        // `published` regardless of what `status` they passed, so a
        // logged-out visitor can never list/discover draft or archived
        // assets by guessing a different status value.
        if ( ! current_user_can( 'manage_options' ) ) {
            $status = 'published';
        }

        $result = VuloCart()->asset_service->list_assets(
            array(
                'page'     => $page,
                'per_page' => $per_page,
                'type'     => $type,
                'status'   => $status,
            )
        );

        $response = rest_ensure_response( array_map( array( $this, 'prepare_asset_for_response' ), $result['data'] ) );
        $response->header( 'X-WP-Total', (string) $result['total'] );
        $response->header( 'X-WP-TotalPages', (string) ceil( $result['total'] / max( 1, $per_page ) ) );

        return $response;
    }

    /**
     * Fetches one asset by id — backs the dedicated
     * `src/pages/Offerings/OfferingEdit.tsx` page loading its initial data
     * directly from the URL's `id` query param (a real navigation, not a
     * client-side transition carrying the row already in memory — see
     * Menu.php's `add_offerings_menu()` docblock), so a fresh page load
     * needs a single-item lookup rather than only the list endpoint.
     * Same public-with-published-only-for-non-admins posture as
     * get_items() — see get_items_permissions_check()'s docblock.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function get_item( $request ) {
        $asset = VuloCart()->asset_service->get_asset( absint( $request->get_param( 'id' ) ) );

        if ( ! $asset ) {
            return new \WP_Error( 'vulocart_asset_not_found', esc_html__( 'No offering exists with this id.', 'vulocart' ), array( 'status' => 404 ) );
        }

        if ( ! current_user_can( 'manage_options' ) && 'published' !== $asset->status ) {
            return new \WP_Error( 'vulocart_asset_not_found', esc_html__( 'No offering exists with this id.', 'vulocart' ), array( 'status' => 404 ) );
        }

        return rest_ensure_response( $this->prepare_asset_for_response( $asset ) );
    }

    /**
     * Creates a new asset.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function create_item( $request ) {
        $type = sanitize_key( (string) $request->get_param( 'type' ) );

        if ( ! in_array( $type, AssetType::all(), true ) ) {
            return new \WP_Error(
                'vulocart_invalid_asset_type',
                esc_html__( 'Invalid asset type.', 'vulocart' ),
                array( 'status' => 400 )
            );
        }

        $title = sanitize_text_field( (string) $request->get_param( 'title' ) );

        if ( '' === $title ) {
            return new \WP_Error(
                'vulocart_missing_asset_title',
                esc_html__( 'An asset title is required.', 'vulocart' ),
                array( 'status' => 400 )
            );
        }

        $data = array(
            'type'  => $type,
            'title' => $title,
        );

        if ( null !== $request->get_param( 'sku' ) ) {
            $data['sku'] = sanitize_text_field( (string) $request->get_param( 'sku' ) );
        }

        if ( null !== $request->get_param( 'status' ) ) {
            $data['status'] = sanitize_key( (string) $request->get_param( 'status' ) );
        }

        if ( null !== $request->get_param( 'price' ) ) {
            $data['price'] = (float) $request->get_param( 'price' );
        }

        if ( null !== $request->get_param( 'currency' ) ) {
            $data['currency'] = sanitize_text_field( (string) $request->get_param( 'currency' ) );
        }

        if ( is_array( $request->get_param( 'meta' ) ) ) {
            $data['meta'] = $this->sanitize_offering_meta( $request->get_param( 'meta' ), $type );
        }

        $asset = VuloCart()->asset_service->create_asset( $data );

        $response = rest_ensure_response( $this->prepare_asset_for_response( $asset ) );
        $response->set_status( 201 );

        return $response;
    }

    /**
     * Updates an existing asset — backs the Assets table's inline cell
     * editing (title/sku/status/price) in src/app/routes/AssetsPage.tsx.
     * Only ever touches the fields actually present on the request, via
     * Application\AssetService::update_asset()'s own partial-update
     * semantics — a cell edit for one field never clobbers the others.
     *
     * @param \WP_REST_Request $request Full request object.
     * @return \WP_REST_Response|\WP_Error
     */
    public function update_item( $request ) {
        $id = absint( $request->get_param( 'id' ) );

        $existing_asset = VuloCart()->asset_service->get_asset( $id );

        if ( ! $existing_asset ) {
            return new \WP_Error(
                'vulocart_asset_not_found',
                esc_html__( 'No asset exists with this id.', 'vulocart' ),
                array( 'status' => 404 )
            );
        }

        $data = array();

        if ( null !== $request->get_param( 'type' ) ) {
            $type = sanitize_key( (string) $request->get_param( 'type' ) );

            if ( ! in_array( $type, AssetType::all(), true ) ) {
                return new \WP_Error(
                    'vulocart_invalid_asset_type',
                    esc_html__( 'Invalid asset type.', 'vulocart' ),
                    array( 'status' => 400 )
                );
            }

            $data['type'] = $type;
        }

        if ( null !== $request->get_param( 'title' ) ) {
            $title = sanitize_text_field( (string) $request->get_param( 'title' ) );

            if ( '' === $title ) {
                return new \WP_Error(
                    'vulocart_missing_asset_title',
                    esc_html__( 'An asset title is required.', 'vulocart' ),
                    array( 'status' => 400 )
                );
            }

            $data['title'] = $title;
        }

        if ( null !== $request->get_param( 'sku' ) ) {
            $data['sku'] = sanitize_text_field( (string) $request->get_param( 'sku' ) );
        }

        if ( null !== $request->get_param( 'status' ) ) {
            $data['status'] = sanitize_key( (string) $request->get_param( 'status' ) );
        }

        if ( null !== $request->get_param( 'price' ) ) {
            $data['price'] = (float) $request->get_param( 'price' );
        }

        if ( null !== $request->get_param( 'currency' ) ) {
            $data['currency'] = sanitize_text_field( (string) $request->get_param( 'currency' ) );
        }

        if ( is_array( $request->get_param( 'meta' ) ) ) {
            $effective_type = isset( $data['type'] ) ? $data['type'] : $existing_asset->type;
            $data['meta']   = $this->sanitize_offering_meta( $request->get_param( 'meta' ), $effective_type );
        }

        $asset = VuloCart()->asset_service->update_asset( $id, $data );

        return rest_ensure_response( $this->prepare_asset_for_response( $asset ) );
    }

    /**
     * Sanitizes the offering-detail-page's meta bag — a whitelist rather
     * than a generic recursive sanitizer, since this meta shape now holds
     * mixed types (bools, nested media objects, string arrays), not just
     * flat strings `map_deep(..., 'sanitize_text_field')` could handle
     * safely. Backs `src/pages/Offerings/OfferingEdit.tsx`'s full
     * WooCommerce/Shopify-style edit screen — short/full description,
     * sale price, stock management, delivery method, package dimensions,
     * policies, simple related/add-on product lists (comma-separated ids,
     * no picker UI yet), featured/catalog-visibility flags, a small
     * hand-maintained category list (categories.tsx has no real taxonomy
     * behind it yet — see OfferingEdit.tsx's docblock), tags, and
     * featured image/gallery (real `wp.media()` attachment id + url
     * pairs, via zyra's `FileInput`). Unknown keys are silently dropped —
     * this is deliberately whitelist-based, not "sanitize whatever keys
     * show up.".
     *
     * @param array<string, mixed> $meta Raw meta payload from the request.
     * @param string               $type The offering's type — determines which TYPE_DETAIL_FIELDS entry (if any) governs `meta.type_details`.
     * @return array<string, mixed>
     */
    private function sanitize_offering_meta( $meta, $type ) {
        if ( ! is_array( $meta ) ) {
            return array();
        }

        $sanitized = array();

        $text_fields = array( 'weight', 'length', 'width', 'height', 'shipping_class', 'related_products', 'addon_products' );

        foreach ( $text_fields as $key ) {
            if ( isset( $meta[ $key ] ) ) {
                $sanitized[ $key ] = sanitize_text_field( (string) $meta[ $key ] );
            }
        }

        $textarea_fields = array( 'short_description', 'full_description', 'shipping_policy', 'refund_policy', 'cancellation_policy' );

        foreach ( $textarea_fields as $key ) {
            if ( isset( $meta[ $key ] ) ) {
                $sanitized[ $key ] = sanitize_textarea_field( (string) $meta[ $key ] );
            }
        }

        if ( array_key_exists( 'sale_price', $meta ) ) {
            $sanitized['sale_price'] = ( '' === $meta['sale_price'] || null === $meta['sale_price'] ) ? null : (float) $meta['sale_price'];
        }

        if ( isset( $meta['stock_management'] ) ) {
            $sanitized['stock_management'] = (bool) $meta['stock_management'];
        }

        if ( isset( $meta['stock_status'] ) && in_array( $meta['stock_status'], array( 'in_stock', 'out_of_stock', 'backorder' ), true ) ) {
            $sanitized['stock_status'] = $meta['stock_status'];
        }

        if ( isset( $meta['delivery_method'] ) && in_array( $meta['delivery_method'], array( 'physical', 'downloadable', 'digital_service', 'other' ), true ) ) {
            $sanitized['delivery_method'] = $meta['delivery_method'];
        }

        if ( isset( $meta['featured'] ) ) {
            $sanitized['featured'] = (bool) $meta['featured'];
        }

        if ( isset( $meta['catalog_visibility'] ) && in_array( $meta['catalog_visibility'], array( 'shop_and_search', 'shop_only', 'search_only', 'hidden' ), true ) ) {
            $sanitized['catalog_visibility'] = $meta['catalog_visibility'];
        }

        if ( isset( $meta['categories'] ) && is_array( $meta['categories'] ) ) {
            $sanitized['categories'] = array_values( array_map( 'sanitize_key', $meta['categories'] ) );
        }

        if ( isset( $meta['tags'] ) && is_array( $meta['tags'] ) ) {
            $sanitized['tags'] = array_values( array_map( 'sanitize_text_field', $meta['tags'] ) );
        }

        if ( array_key_exists( 'featured_image', $meta ) ) {
            $sanitized['featured_image'] = $this->sanitize_media_item( $meta['featured_image'] );
        }

        if ( isset( $meta['gallery'] ) && is_array( $meta['gallery'] ) ) {
            $sanitized['gallery'] = array_values( array_filter( array_map( array( $this, 'sanitize_media_item' ), $meta['gallery'] ) ) );
        }

        if ( isset( $meta['type_details'] ) && is_array( $meta['type_details'] ) ) {
            $sanitized['type_details'] = $this->sanitize_type_details( $type, $meta['type_details'] );
        }

        return $sanitized;
    }

    /**
     * Sanitizes `meta.type_details` against TYPE_DETAIL_FIELDS' whitelist
     * for this specific offering type — a field the current type doesn't
     * declare (e.g. `download_url` submitted for a `service` offering,
     * which has no such field) is silently dropped rather than stored,
     * same "whitelist, not generic sanitize-whatever-shows-up" posture
     * sanitize_offering_meta() already documents.
     *
     * @param string               $type    One of AssetType's constants.
     * @param array<string, mixed> $details Raw `type_details` payload.
     * @return array<string, mixed>
     */
    private function sanitize_type_details( $type, $details ) {
        if ( ! isset( self::TYPE_DETAIL_FIELDS[ $type ] ) ) {
            return array();
        }

        $sanitized = array();

        foreach ( self::TYPE_DETAIL_FIELDS[ $type ] as $key => $kind ) {
            if ( ! array_key_exists( $key, $details ) ) {
                continue;
            }

            $value = $details[ $key ];

            switch ( $kind ) {
                case 'int':
                    $sanitized[ $key ] = ( '' === $value || null === $value ) ? null : absint( $value );
                    break;

                case 'float':
                    $sanitized[ $key ] = ( '' === $value || null === $value ) ? null : (float) $value;
                    break;

                case 'bool':
                    $sanitized[ $key ] = (bool) $value;
                    break;

                case 'key':
                    $sanitized[ $key ] = sanitize_key( (string) $value );
                    break;

                default:
                    $sanitized[ $key ] = sanitize_text_field( (string) $value );
                    break;
            }
        }

        return $sanitized;
    }

    /**
     * Sanitizes one `{id, url}` media attachment reference — used for both
     * `featured_image` (single) and each entry of `gallery` (array).
     *
     * @param mixed $item Raw media item, expected shape `{id?: int, url: string}`.
     * @return array{id: int, url: string}|null Null if $item has no usable url.
     */
    private function sanitize_media_item( $item ) {
        if ( ! is_array( $item ) || empty( $item['url'] ) ) {
            return null;
        }

        return array(
            'id'  => isset( $item['id'] ) ? absint( $item['id'] ) : 0,
            'url' => esc_url_raw( (string) $item['url'] ),
        );
    }
}
