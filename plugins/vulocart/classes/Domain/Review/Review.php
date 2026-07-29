<?php
/**
 * Review class file.
 *
 * @package VuloCart
 */

namespace VuloCart\Domain\Review;

defined( 'ABSPATH' ) || exit;

/**
 * VuloCart Review entity.
 *
 * A customer's rating/comment on one Offering. Submitted publicly (no
 * account required — same "guest-first" posture Cart/Order already take,
 * `customer_email` is informational only, not an authentication check),
 * always created as `ReviewStatus::PENDING` and never shown on the
 * storefront until an admin approves it (`Rest::update_item()`).
 *
 * @class       Review class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Review {

    /**
     * Review id.
     *
     * @var int|null Null for a review not yet persisted.
     */
    public $id;

    /**
     * The Offering this review is about.
     *
     * @var int
     */
    public $offering_id;

    /**
     * Reviewer's display name.
     *
     * @var string|null
     */
    public $customer_name;

    /**
     * Reviewer's email — informational only, not an authentication check.
     *
     * @var string|null
     */
    public $customer_email;

    /**
     * 1-5.
     *
     * @var int
     */
    public $rating;

    /**
     * Review title.
     *
     * @var string|null
     */
    public $title;

    /**
     * Review body.
     *
     * @var string|null
     */
    public $content;

    /**
     * One of ReviewStatus's constants.
     *
     * @var string
     */
    public $status;

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
     * Review constructor.
     *
     * @param int|null    $id             Null for a review not yet persisted.
     * @param int         $offering_id       The Offering this review is about.
     * @param string|null $customer_name  Reviewer's display name.
     * @param string|null $customer_email Reviewer's email.
     * @param int         $rating         1-5.
     * @param string|null $title          Review title.
     * @param string|null $content        Review body.
     * @param string      $status         One of ReviewStatus's constants.
     * @param string|null $created_at     MySQL datetime string, once persisted.
     * @param string|null $updated_at     MySQL datetime string, once persisted.
     */
    public function __construct(
        $id,
        $offering_id,
        $customer_name,
        $customer_email,
        $rating,
        $title,
        $content,
        $status = ReviewStatus::PENDING,
        $created_at = null,
        $updated_at = null
    ) {
        $this->id             = $id;
        $this->offering_id    = $offering_id;
        $this->customer_name  = $customer_name;
        $this->customer_email = $customer_email;
        $this->rating         = $rating;
        $this->title          = $title;
        $this->content        = $content;
        $this->status         = $status;
        $this->created_at     = $created_at;
        $this->updated_at     = $updated_at;
    }
}
