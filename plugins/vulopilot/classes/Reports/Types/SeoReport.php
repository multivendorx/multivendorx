<?php
/**
 * SeoReport class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Reports\Types;

defined( 'ABSPATH' ) || exit;

/**
 * Category `seo` findings for one period — same category scope as the
 * SEO dashboard page's FindingsTable filter (SCANNERS.md).
 *
 * @class       SeoReport class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class SeoReport extends AbstractCategoryReportType {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'seo';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'SEO Report', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    protected function get_category(): string {
        return 'seo';
    }
}
