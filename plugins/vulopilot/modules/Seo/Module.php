<?php
/**
 * Module class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Seo;

use VuloPilot\Scanners\Basic;

defined( 'ABSPATH' ) || exit;

/**
 * VuloPilot Seo module.
 *
 * Unlike Geo\Module (whose own scanners always run no matter what — see
 * that class's own docblock, since GEO has no whole-category kill switch),
 * this module genuinely gates SEO scanning. All 17 SEO-related scanner
 * classes — Titles (SeoScanner), Schema presence, images/alt text, broken
 * links, plus the 13 checks from SEO-MODULE.md (meta descriptions,
 * canonicals, internal linking, heading structure, thin content, duplicate
 * content, sitemap, robots.txt, OpenGraph/Twitter cards, orphan pages,
 * structured-data validity) — are registered here via
 * `vulopilot_scanner_sources`, not in
 * ScannerRegistry::get_default_scanner_classes(). If this module is
 * deactivated (Settings → Modules), this filter callback is never
 * registered (Modules::load_active_modules() only `new`s a module class
 * when it's active), so none of these scanner classes are instantiated and
 * no new SEO findings get produced by future scans — the same
 * "register a source, don't be instantiated directly" extension point
 * vulopilot-pro's AdvancedSeo module already uses to ADD 2 more scanners on
 * top when its own, separate Pro module is active. Already-stored findings
 * from before deactivation are untouched; this only stops new ones, the
 * same posture as any disabled category/granular flag_* setting.
 *
 * Same Module.php shape module-architecture.md documents, discovered by
 * VuloPilot's own free-plugin `modules/` source (Modules::get_all_modules()'s
 * default, self-registered `VuloPilot` namespace) — no filter registration
 * needed since this module ships in Free itself.
 *
 * @class       Module class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class Module {

    /**
     * Module constructor.
     */
    public function __construct() {
        add_filter( 'vulopilot_scanner_sources', array( $this, 'register_scanners' ) );
    }

    /**
     * @param string[] $scanners Already-registered scanner classes.
     * @return string[]
     */
    public function register_scanners( array $scanners ): array {
        return array_merge(
            $scanners,
            array(
                Basic\SeoScanner::class,
                Basic\SchemaScanner::class,
                Basic\ImagesScanner::class,
                Basic\BrokenLinksScanner::class,
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
            )
        );
    }
}
