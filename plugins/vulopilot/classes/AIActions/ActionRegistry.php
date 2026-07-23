<?php
/**
 * ActionRegistry class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AIActions;

use VuloPilotCore\Contracts\AI\AIActionInterface;

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
