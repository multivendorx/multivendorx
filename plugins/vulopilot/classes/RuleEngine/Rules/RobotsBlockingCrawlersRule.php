<?php
/**
 * RobotsBlockingCrawlersRule class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\RuleEngine\Rules;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Impact;
use VuloPilotCore\ValueObjects\Recommendation;
use VuloPilotCore\ValueObjects\RuleType;

defined( 'ABSPATH' ) || exit;

/**
 * Turns Scanners\Basic\RobotsTxtScanner's "robots.txt blocks every
 * crawler" HIGH-severity Finding into a critical recommendation.
 * Deliberately NOT fixable — unlike MissingMetaDescriptionRule/
 * MissingFeaturedImageRule, automatically rewriting a site's robots.txt
 * (a single file controlling crawl access to the entire site) is exactly
 * the kind of high-blast-radius change no AIAction here should make
 * unattended; a site owner needs to look at the file and understand why
 * that rule is there before it's removed, the same reasoning
 * License/LicenseManager.php's vendored-code handling applies to "don't
 * automate what's too risky to get wrong."
 *
 * @class       RobotsBlockingCrawlersRule class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class RobotsBlockingCrawlersRule extends AbstractBasicRule {

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'robots-blocking-crawlers';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'robots.txt is blocking search engines', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function get_type(): string {
        return RuleType::CRITICAL;
    }

    /**
     * @inheritDoc
     */
    public function get_priority(): int {
        return 95;
    }

    /**
     * @inheritDoc
     */
    public function get_categories(): array {
        return array( 'seo' );
    }

    /**
     * @inheritDoc
     */
    public function get_tags(): array {
        return array( 'seo', 'indexing' );
    }

    /**
     * @inheritDoc
     */
    public function get_estimated_impact(): string {
        return Impact::HIGH;
    }

    /**
     * @inheritDoc
     */
    public function get_estimated_time_minutes(): int {
        return 10;
    }

    /**
     * @inheritDoc
     */
    public function applies_to( Finding $finding ): bool {
        // Matched on the `blocks_all_crawlers` meta key RobotsTxtScanner
        // attaches only to this specific finding — RobotsTxtScanner's
        // other finding (robots.txt unreachable) and every other
        // category-'seo' scanner sharing object_type 'url' (SchemaScanner,
        // SitemapScanner, OpenGraphScanner, …) would otherwise collide.
        return 'seo' === $finding->get_category() && array_key_exists( 'blocks_all_crawlers', $finding->get_meta() );
    }

    /**
     * @inheritDoc
     */
    public function get_recommendation( Finding $finding ): Recommendation {
        return new Recommendation(
            $this->get_id(),
            __( 'Review and fix robots.txt', 'vulopilot' ),
            __( 'robots.txt is currently telling every search engine not to crawl any page on this site. If unintentional, this can remove the site from search results entirely.', 'vulopilot' ),
            $this->get_type(),
            $this->get_priority(),
            $this->get_categories(),
            $this->get_tags(),
            $this->is_fixable(),
            $this->requires_ai(),
            $this->get_estimated_impact(),
            $this->get_estimated_time_minutes(),
            $finding->get_object_type(),
            $finding->get_object_ref()
        );
    }
}
