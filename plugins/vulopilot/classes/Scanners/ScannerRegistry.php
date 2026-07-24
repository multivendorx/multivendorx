<?php
/**
 * ScannerRegistry class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners;

use VuloPilotCore\Contracts\Scanner\ScannerInterface;
use VuloPilot\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * VuloPilot ScannerRegistry class.
 *
 * Collects every registered scanner and instantiates it. Free's own 14
 * Basic scanners always run; Pro's premium scanners (and any third-party
 * scanner) are added on top via the `vulopilot_scanner_sources` filter —
 * see SCANNERS.md's "Extension strategy" for the full explanation.
 *
 * This intentionally does NOT copy Modules.php's folder-scan/reflection
 * discovery mechanism (module-architecture.md). A module is a whole
 * package (Module.php + Rest.php + Frontend.php + …) discovered by
 * scanning directories for a file with a fixed name; a scanner is a
 * single class implementing one small interface. Folder-scanning would
 * force every scanner into its own directory for no benefit — a plain
 * class-name filter is the simpler mechanism that still gives Pro/
 * third-party code the same "register a source, don't be instantiated
 * directly" extension point module-architecture.md's discovery model is
 * built around.
 *
 * @class       ScannerRegistry class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ScannerRegistry {

    /**
     * Instantiated scanners, keyed by their own get_id().
     *
     * @var array<string, ScannerInterface>
     */
    private array $scanners = array();

    /**
     * ScannerRegistry constructor.
     */
    public function __construct() {
        add_action( 'init', array( $this, 'register_scanners' ), 20 );
    }

    /**
     * Instantiates every registered scanner class and indexes it by id.
     * A scanner class that doesn't exist, or doesn't implement
     * ScannerInterface, is silently skipped rather than fataling the
     * whole registry — one broken third-party registration shouldn't take
     * every other scanner down with it.
     *
     * @return void
     */
    public function register_scanners(): void {
        $scanner_classes     = apply_filters( 'vulopilot_scanner_sources', $this->get_default_scanner_classes() );
        $disabled_categories = $this->get_disabled_categories();

        foreach ( $scanner_classes as $scanner_class ) {
            if ( ! is_string( $scanner_class ) || ! class_exists( $scanner_class ) ) {
                continue;
            }

            $scanner = new $scanner_class();

            if ( ! $scanner instanceof ScannerInterface ) {
                continue;
            }

            if ( in_array( $scanner->get_category(), $disabled_categories, true ) ) {
                continue;
            }

            $this->scanners[ $scanner->get_id() ] = $scanner;
        }
    }

    /**
     * Settings screen's SEO/GEO/Accessibility/WooCommerce tabs are
     * category-level kill switches (SCANNERS.md's category list) rather
     * than per-scanner toggles — disabling "WooCommerce" turns off both
     * the original WooCommerceScanner and the 11 Product* scanners from
     * the WooCommerce AI pass, since both share the `woocommerce` category
     * string. Scanners not covered by one of these four toggles (security,
     * performance, links, …) always run; only RestApiScanner has its own
     * dedicated setting, see its own docblock for why.
     *
     * @return string[] Category strings currently disabled via settings.
     */
    private function get_disabled_categories(): array {
        $settings = wp_parse_args( get_option( Utill::VULOPILOT_SETTINGS_KEY, array() ), Utill::VULOPILOT_SETTINGS_DEFAULTS );

        $toggle_to_category = array(
            'enable_seo_scanning'           => 'seo',
            'enable_geo_scanning'           => 'geo',
            'enable_accessibility_scanning' => 'accessibility',
            'enable_woocommerce_scanning'   => 'woocommerce',
        );

        $disabled = array();

        foreach ( $toggle_to_category as $setting_key => $category ) {
            if ( empty( $settings[ $setting_key ] ) ) {
                $disabled[] = $category;
            }
        }

        return $disabled;
    }

    /**
     * Free's own always-available scanners.
     *
     * @return string[] Fully-qualified class names implementing ScannerInterface.
     */
    private function get_default_scanner_classes(): array {
        return array(
            Basic\BrokenLinksScanner::class,
            Basic\ImagesScanner::class,
            Basic\SeoScanner::class,
            Basic\SchemaScanner::class,
            Basic\PerformanceScanner::class,
            Basic\DatabaseScanner::class,
            Basic\SecurityScanner::class,
            Basic\WooCommerceScanner::class,
            Basic\AccessibilityScanner::class,
            Basic\PluginsScanner::class,
            Basic\ThemesScanner::class,
            Basic\UpdatesScanner::class,
            Basic\CronScanner::class,
            Basic\RestApiScanner::class,
            // SEO module (SEO-MODULE.md) — 13 additional checks alongside
            // the original SeoScanner (Titles) and SchemaScanner (Schema).
            Basic\MetaDescriptionScanner::class,
            Basic\CanonicalUrlScanner::class,
            Basic\InternalLinkingScanner::class,
            Basic\HeadingStructureScanner::class,
            Basic\ThinContentScanner::class,
            Basic\DuplicateContentScanner::class,
            Basic\SitemapScanner::class,
            Basic\RobotsTxtScanner::class,
            Basic\OpenGraphScanner::class,
            Basic\TwitterCardScanner::class,
            Basic\OrphanPageScanner::class,
            Basic\SeoImagesScanner::class,
            Basic\StructuredDataValidationScanner::class,
            // GEO module (GEO-MODULE.md) — 8 deterministic checks, category 'geo'.
            Basic\GeoAuthorInfoScanner::class,
            Basic\GeoEeatSignalsScanner::class,
            Basic\GeoTrustSignalsScanner::class,
            Basic\GeoCitationOpportunityScanner::class,
            Basic\GeoSummaryBlockScanner::class,
            Basic\GeoFaqOpportunityScanner::class,
            Basic\GeoChunkingScanner::class,
            Basic\GeoSemanticStructureScanner::class,
            // WooCommerce AI's Product Intelligence pass (ARCHITECTURE.md's
            // Prompt 11) — 11 additional checks alongside the original
            // WooCommerceScanner (checkout page), category 'woocommerce'.
            Basic\ProductMissingImagesScanner::class,
            Basic\ProductMissingCategoriesScanner::class,
            Basic\ProductMissingTagsScanner::class,
            Basic\ProductMissingDescriptionScanner::class,
            Basic\ProductMissingShortDescriptionScanner::class,
            Basic\ProductSkuIssuesScanner::class,
            Basic\ProductAttributesScanner::class,
            Basic\ProductInventoryHealthScanner::class,
            Basic\ProductPricingScanner::class,
            Basic\ProductDuplicateScanner::class,
            Basic\ProductCompletenessScanner::class,
        );
    }

    /**
     * @param string $scanner_id A scanner's get_id().
     * @return ScannerInterface|null
     */
    public function get_scanner( string $scanner_id ): ?ScannerInterface {
        return $this->scanners[ $scanner_id ] ?? null;
    }

    /**
     * @return array<string, ScannerInterface>
     */
    public function get_all_scanners(): array {
        return $this->scanners;
    }

    /**
     * @param string $category e.g. 'seo', 'security'.
     * @return array<string, ScannerInterface>
     */
    public function get_scanners_by_category( string $category ): array {
        return array_filter(
            $this->scanners,
            static fn( ScannerInterface $scanner ) => $scanner->get_category() === $category
        );
    }
}
