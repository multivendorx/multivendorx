<?php
/**
 * Commission class file.
 *
 * @package MultiVendorX\Commission
 */

namespace MultiVendorX\Commission;

use MultiVendorX\Commission\CommissionUtil;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Commission class
 *
 * @version     PRODUCT_VERSION
 * @package     MultiVendorX
 * @author      MultiVendorX
 */
class Commission {
    /**
     * Commission id.
     *
     * @var int
     */
    private $id;
    /**
     * Commission information.
     *
     * @var object
     */
    private $commission;

    /**
     * Constructor function.
     *
     * @param int | object $commission commission id.
     */
    public function __construct( $commission ) {
        if ( is_int( $commission ) ) {
            $this->id         = $commission;
            $this->commission = CommissionUtil::get_commission_db( $commission );
        } else {
            $this->id         = $commission->ID;
            $this->commission = $commission;
        }
    }

    /**
     * Get commission id.
     *
     * @return mixed
     */
    public function get_id() {
        return $this->id;
    }

    /**
     * Get commission information.
     *
     * @param   string $key commission key.
     * @return  mixed
     */
    public function get_data( $key ) {
        return $this->commission->{ $key };
    }
}
