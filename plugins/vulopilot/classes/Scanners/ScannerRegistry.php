<?php
/**
 * ScannerRegistry class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Scanners;

use VuloPilot\Contracts\Scanner\ScannerInterface;
use VuloPilot\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * VuloPilot ScannerRegistry class.
 *
 * Collects every registered scanner and instantiates it. Most of Free's own
 * Basic scanners always run; the 17 SEO ones are the one exception —
 * they're registered by modules/Seo/Module.php instead of the hardcoded
 * list below, so SEO scanning is genuinely module-dependent (Settings →
 * Modules). Pro's premium scanners (and any third-party scanner) are added
 * on top the same way, via the `vulopilot_scanner_sources` filter — see
 * SCANNERS.md's "Extension strategy" for the full explanation.
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
     * Settings screen's Accessibility/WooCommerce tabs are category-level
     * kill switches (SCANNERS.md's category list) rather than per-scanner
     * toggles — disabling "WooCommerce" turns off both the original
     * WooCommerceScanner and the 11 Product* scanners from the WooCommerce
     * AI pass, since both share the `woocommerce` category string.
     * Scanners not covered by one of these two toggles (security,
     * performance, links, geo, seo, …) always run; only RestApiScanner has
     * its own dedicated setting, see its own docblock for why. The `geo`
     * and `seo` categories have no kill switch here — each of their
     * scanners reads its own granular flag_* setting directly instead
     * (Scanning → GEO and Scanning → SEO's settings screens have no
     * whole-category "disable" toggle).
     *
     * @return string[] Category strings currently disabled via settings.
     */
    private function get_disabled_categories(): array {
        $settings = wp_parse_args( get_option( Utill::VULOPILOT_SETTINGS_KEY, array() ), Utill::VULOPILOT_SETTINGS_DEFAULTS );

        $toggle_to_category = array(
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
     * Free's own always-available scanners — matches the readme's free
     * feature list (Website Health Monitoring, SEO Optimization,
     * Performance, Accessibility Scanner, WooCommerce Optimization).
     * SecurityScanner/RestApiScanner are the one exception ("Security
     * Monitoring" is Pro-only per the readme) — they moved to
     * vulopilot-pro's SecurityMonitoring module instead.
     *
     * @return string[] Fully-qualified class names implementing ScannerInterface.
     */
    private function get_default_scanner_classes(): array {
        return array(
            // SEO (Titles, Schema, images/alt text, broken links, plus the
            // 13 SEO-MODULE.md checks) moved out of this hardcoded list and
            // into modules/Seo/Module.php's own `vulopilot_scanner_sources`
            // registration — see that class's docblock for why: this is
            // what makes SEO scanning genuinely module-dependent, the same
            // way vulopilot-pro's AdvancedSeo module already adds its own 2
            // extra SEO scanners on top.
            Basic\PerformanceScanner::class,
            Basic\DatabaseScanner::class,
            Basic\WooCommerceScanner::class,
            Basic\AccessibilityScanner::class,
            Basic\PluginsScanner::class,
            Basic\ThemesScanner::class,
            Basic\UpdatesScanner::class,
            Basic\CronScanner::class,
            // GEO module (GEO-MODULE.md) — 9 deterministic checks, category 'geo'.
            Basic\GeoAuthorInfoScanner::class,
            Basic\GeoEeatSignalsScanner::class,
            Basic\GeoTrustSignalsScanner::class,
            Basic\GeoCitationOpportunityScanner::class,
            Basic\GeoSummaryBlockScanner::class,
            Basic\GeoFaqOpportunityScanner::class,
            Basic\GeoChunkingScanner::class,
            Basic\GeoSemanticStructureScanner::class,
            Basic\GeoEntityNamingConsistencyScanner::class,
            // WooCommerce Optimization (readme) — 11 additional checks
            // alongside the original WooCommerceScanner (checkout page),
            // category 'woocommerce'.
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
            // Website Health Monitoring (readme) — closes the PHP Warning
            // Detection/SSL Monitoring/Redirect Analysis/404 Detection gaps.
            Basic\SslMonitoringScanner::class,
            Basic\RedirectAnalysisScanner::class,
            Basic\NotFoundScanner::class,
            Basic\PhpWarningScanner::class,
            // Website Performance (readme) — category 'performance', joins
            // the original PerformanceScanner (autoload bloat).
            Basic\SlowPageScanner::class,
            Basic\LargeImagesScanner::class,
            Basic\HeavyPluginsScanner::class,
            Basic\CacheDetectionScanner::class,
            // Accessibility Scanner (readme) — category 'accessibility',
            // joins the original AccessibilityScanner (duplicate <h1>).
            Basic\FormLabelsScanner::class,
            Basic\AriaAttributesScanner::class,
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
