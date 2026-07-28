<?php
/**
 * Cart class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Cart\Domain;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Cart module Cart entity.
 *
 * Plain domain object. `token` (not a WordPress user id or PHP session) is
 * the cart's identity — the vision's "headless" requirement means a cart
 * must be addressable by a client that has no WordPress session at all (a
 * Next.js app, a mobile app, an MCP client), so identity has to travel as
 * an opaque string the caller stores itself, not a cookie/session VuloCart
 * owns.
 *
 * @class       Cart class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Cart {

    /**
     * Cart id.
     *
     * @var int|null Null for a cart not yet persisted.
     */
    public $id;

    /**
     * Opaque client-held identity for this cart.
     *
     * @var string
     */
    public $token;

    /**
     * Currency code.
     *
     * @var string|null ISO 4217 currency code.
     */
    public $currency;

    /**
     * Line items belonging to this cart.
     *
     * @var CartItem[]
     */
    public $items;

    /**
     * Extensible, cart-specific attributes (coupons/shipping selection
     * belong here once Coupon/Shipping modules exist).
     *
     * @var array<string, mixed>
     */
    public $meta;

    /**
     * Creation timestamp.
     *
     * @var string|null MySQL datetime string, once persisted.
     */
    public $created_at;

    /**
     * Last-updated timestamp.
     *
     * @var string|null MySQL datetime string, once persisted.
     */
    public $updated_at;

    /**
     * Cart constructor.
     *
     * @param int|null             $id         Null for a cart not yet persisted.
     * @param string               $token      Opaque client-held identity for this cart.
     * @param string|null          $currency   ISO 4217 currency code.
     * @param CartItem[]           $items      Line items belonging to this cart.
     * @param array<string, mixed> $meta       Extensible, cart-specific attributes.
     * @param string|null          $created_at MySQL datetime string, once persisted.
     * @param string|null          $updated_at MySQL datetime string, once persisted.
     */
    public function __construct(
        $id,
        $token,
        $currency = null,
        $items = array(),
        $meta = array(),
        $created_at = null,
        $updated_at = null
    ) {
        $this->id         = $id;
        $this->token      = $token;
        $this->currency   = $currency;
        $this->items      = $items;
        $this->meta       = $meta;
        $this->created_at = $created_at;
        $this->updated_at = $updated_at;
    }
}
