<?php
/**
 * ActionRegistry class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AIActions;

use VuloPilot\Contracts\AI\AIActionInterface;

defined( 'ABSPATH' ) || exit;

/**
 * Same filter-based discovery shape as Scanners\ScannerRegistry,
 * RuleEngine\RuleRegistry, and AIProviders\ProviderRegistry — see any of
 * their docblocks for why this codebase doesn't use Modules.php's
 * folder-scan mechanism for a single-class extension point. Free's own 4
 * built-in actions always run; a Pro module or third party adds more via
 * `vulopilot_ai_action_sources`.
 *
 * @class       ActionRegistry class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class ActionRegistry {

    /**
     * @var array<string, AIActionInterface>
     */
    private array $actions = array();

    /**
     * ActionRegistry constructor.
     */
    public function __construct() {
        add_action( 'init', array( $this, 'register_actions' ), 20 );
    }

    /**
     * @return void
     */
    public function register_actions(): void {
        $action_classes = apply_filters( 'vulopilot_ai_action_sources', $this->get_default_action_classes() );

        foreach ( $action_classes as $action_class ) {
            if ( ! is_string( $action_class ) || ! class_exists( $action_class ) ) {
                continue;
            }

            $action = new $action_class();

            if ( ! $action instanceof AIActionInterface ) {
                continue;
            }

            $this->actions[ $action->get_id() ] = $action;
        }
    }

    /**
     * Free's own always-available actions — the readme's "AI SEO
     * Assistant"/"AI Content Assistant" (BYOK) feature set. The
     * product-specific AI actions (rewrite/generate for WooCommerce
     * products) are Pro business logic ("WooCommerce AI"/"AI Product
     * Optimization" per the readme) — they moved to vulopilot-pro's
     * WooCommerceAi module and register through this same filter.
     *
     * @return string[]
     */
    private function get_default_action_classes(): array {
        return array(
            Actions\GenerateAltAction::class,
            Actions\ImproveReadabilityAction::class,
            Actions\GenerateSchemaAction::class,
            Actions\GenerateBlogAction::class,
            // SEO module (SEO-MODULE.md) — closes MissingMetaDescriptionRule's fix loop.
            Actions\WriteMetaDescriptionAction::class,
            // GEO module (GEO-MODULE.md) — closes FaqOpportunityRule's and
            // MissingSummaryBlockRule's fix loops.
            Actions\GenerateFaqAction::class,
            Actions\GenerateSummaryBlockAction::class,
            // GEO module, second pass — closes the remaining 7 GEO
            // scanners' fix loops (ScannerFixMap previously left these
            // unmapped entirely; see that class's own docblock for why
            // each one is now mapped).
            Actions\GenerateAuthorBioAction::class,
            Actions\CreateTrustPageAction::class,
            Actions\SoftenUnsourcedClaimsAction::class,
            Actions\SplitLongParagraphsAction::class,
            Actions\FixHeadingHierarchyAction::class,
            Actions\NormalizeEntityNamingAction::class,
            // AI SEO Assistant / AI Content Assistant (readme) — closes
            // SeoTitleRewriteRule's fix loop (write-meta-title) and adds
            // the two content-generation actions with no matching scanner/
            // rule (suggest-internal-links, generate-social-content).
            Actions\WriteMetaTitleAction::class,
            Actions\SuggestInternalLinksAction::class,
            Actions\GenerateSocialContentAction::class,
            // AI Content Assistant (readme) — the 3 remaining generation
            // types with no existing action: product descriptions,
            // listing-page excerpts, and comparison pages.
            Actions\GenerateProductDescriptionAction::class,
            Actions\GenerateExcerptAction::class,
            Actions\GenerateComparisonPageAction::class,
            // One-Click Fix coverage pass for the SEO category (Pro's
            // OneClickFix\ScannerFixMap) — closes HeadingStructureScanner's
            // and DuplicateContentScanner's fix loops, the two remaining
            // SEO findings with a genuine, safely-automatable single-post
            // content fix (as opposed to a site-config/structural issue —
            // see ScannerFixMap's own docblock for the rest).
            Actions\AddSubheadingsAction::class,
            Actions\DifferentiateDuplicateTitleAction::class,
        );
    }

    /**
     * @param string $action_id e.g. 'generate-alt'.
     * @return AIActionInterface|null
     */
    public function get_action( string $action_id ): ?AIActionInterface {
        return $this->actions[ $action_id ] ?? null;
    }

    /**
     * @return array<string, AIActionInterface>
     */
    public function get_all_actions(): array {
        return $this->actions;
    }
}
