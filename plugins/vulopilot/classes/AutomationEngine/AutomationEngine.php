<?php
/**
 * AutomationEngine class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AutomationEngine;

use VuloPilotCore\ValueObjects\Finding;
use VuloPilotCore\ValueObjects\Recommendation;
use VuloPilot\Repositories\AutomationRepository;
use VuloPilot\Repositories\AutomationRunRepository;
use VuloPilot\Repositories\FindingRepository;
use VuloPilot\RuleEngine\RuleEngine;
use VuloPilot\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * Runs an Automation's actions when a matching Recommendation fires
 * (ARCHITECTURE.md's Prompt 12) — not a standalone condition-tree layer,
 * per RULE-ENGINE.md's "What's not here yet". Every trigger fire, cron or
 * event, routes through the single handle_trigger_fired() entry point via
 * TriggerRegistry::set_on_fire_callback(), so "which automations should
 * react to this" always means the same thing: enabled automations whose
 * `trigger_type` matches the trigger that just fired, whose bound rule
 * (`trigger_config['rule_key']`, a RuleInterface::get_id()) has a matching
 * open Recommendation right now, and that aren't in cooldown.
 *
 * Deliberately reuses RuleEngine\RuleEngine::generate_recommendations()
 * rather than re-implementing rule matching — the Automation Engine only
 * decides *when* to ask and *what to do* with the answer, never how a
 * Finding becomes a Recommendation.
 *
 * @class       AutomationEngine class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class AutomationEngine {

    /**
     * Fallback cooldown (in minutes) when the `automation_cooldown_minutes`
     * setting is missing entirely (e.g. a very old install that predates
     * it) — matches Utill::VULOPILOT_SETTINGS_DEFAULTS's own default so
     * behavior doesn't change for sites that have never touched this
     * setting. The Settings screen's Automation tab is the real, site-wide
     * configurable version of what was a fixed constant in the original
     * pass.
     */
    private const DEFAULT_COOLDOWN_MINUTES = 60;

    /**
     * Findings pulled per periodic ('*') check — bounded per performance.md.
     */
    private const MAX_FINDINGS_PER_CHECK = 200;

    /**
     * Caps how many separate automation_runs one trigger fire (or one
     * manual "Run now" click) can create, even if far more recommendations
     * matched — the same batching discipline performance.md asks for
     * elsewhere, applied to avoid one periodic tick fanning out into an
     * unbounded number of runs (and, for RunAiActionAction specifically, an
     * unbounded number of pending-approval rows for a human to review).
     */
    private const MAX_RUNS_PER_FIRE = 20;

    /**
     * @var TriggerRegistry
     */
    private TriggerRegistry $trigger_registry;

    /**
     * @var ActionRegistry
     */
    private ActionRegistry $action_registry;

    /**
     * @var RuleEngine
     */
    private RuleEngine $rule_engine;

    /**
     * @var AutomationRepository
     */
    private AutomationRepository $automations;

    /**
     * @var AutomationRunRepository
     */
    private AutomationRunRepository $runs;

    /**
     * @var FindingRepository
     */
    private FindingRepository $findings;

    /**
     * @param TriggerRegistry              $trigger_registry Registry whose on-fire callback this engine binds itself to.
     * @param ActionRegistry               $action_registry Registry to resolve automation action ids from.
     * @param RuleEngine                   $rule_engine     Turns currently-open Findings into Recommendations.
     * @param AutomationRepository|null    $automations     Defaults to a new instance (injectable for tests).
     * @param AutomationRunRepository|null $runs            Defaults to a new instance (injectable for tests).
     * @param FindingRepository|null       $findings        Defaults to a new instance (injectable for tests).
     */
    public function __construct(
        TriggerRegistry $trigger_registry,
        ActionRegistry $action_registry,
        RuleEngine $rule_engine,
        ?AutomationRepository $automations = null,
        ?AutomationRunRepository $runs = null,
        ?FindingRepository $findings = null
    ) {
        $this->trigger_registry = $trigger_registry;
        $this->action_registry  = $action_registry;
        $this->rule_engine      = $rule_engine;
        $this->automations      = $automations ?? new AutomationRepository();
        $this->runs             = $runs ?? new AutomationRunRepository();
        $this->findings         = $findings ?? new FindingRepository();

        $this->trigger_registry->set_on_fire_callback( array( $this, 'handle_trigger_fired' ) );
    }

    /**
     * The single entry point every registered TriggerInterface calls
     * through, cron or event-based alike.
     *
     * @param string      $trigger_id  The firing trigger's own get_id().
     * @param string      $object_type '*' for a periodic check across every open finding, or a specific object type.
     * @param string|null $object_ref  The specific object's id, when $object_type isn't '*'.
     * @return void
     */
    public function handle_trigger_fired( string $trigger_id, string $object_type, ?string $object_ref ): void {
        $recommendations = $this->rule_engine->generate_recommendations(
            '*' === $object_type
                ? $this->get_open_findings()
                : $this->get_open_findings( $object_type, $object_ref )
        );

        if ( empty( $recommendations ) ) {
            return;
        }

        foreach ( $this->get_enabled_automations_for_trigger( $trigger_id ) as $automation_row ) {
            $this->maybe_run( $automation_row, $recommendations, $trigger_id, $object_ref );
        }
    }

    /**
     * Runs one automation immediately regardless of trigger/cooldown —
     * backs the "Run now" REST action and ManualTrigger/RestTrigger.
     *
     * @param int $automation_id Automation to run.
     * @return array{run_id: int, executed: int, failed: int, results: array}
     *
     * @throws \InvalidArgumentException If $automation_id doesn't exist.
     * @throws \RuntimeException         If it has no currently-matching recommendation to act on.
     */
    public function run_now( int $automation_id ): array {
        $automation_row = $this->automations->find( $automation_id );

        if ( ! $automation_row ) {
            throw new \InvalidArgumentException( sprintf( 'No automation found for id %d.', $automation_id ) );
        }

        $recommendations = $this->filter_matching_recommendations(
            $automation_row,
            $this->rule_engine->generate_recommendations( $this->get_open_findings() )
        );

        if ( empty( $recommendations ) ) {
            throw new \RuntimeException( __( 'This automation has no currently-open recommendation matching its bound rule.', 'vulopilot' ) );
        }

        $run_ids  = array();
        $executed = 0;
        $failed   = 0;
        $results  = array();

        foreach ( array_slice( $recommendations, 0, self::MAX_RUNS_PER_FIRE ) as $recommendation ) {
            $run = $this->run_automation( $automation_row, $recommendation, 'manual', null );

            $run_ids[] = $run['run_id'];
            $executed += $run['executed'];
            $failed   += $run['failed'];
            $results   = array_merge( $results, $run['results'] );
        }

        return array(
            'run_ids'  => $run_ids,
            'executed' => $executed,
            'failed'   => $failed,
            'results'  => $results,
        );
    }

    /**
     * @param array            $automation_row  A `vulopilot_automations` row.
     * @param Recommendation[] $recommendations All recommendations from the current check (any rule).
     * @param string           $trigger_id      The trigger that produced this check.
     * @param string|null      $trigger_ref_id  The specific object id involved, if any.
     * @return void
     */
    private function maybe_run( array $automation_row, array $recommendations, string $trigger_id, ?string $trigger_ref_id ): void {
        $matches = $this->filter_matching_recommendations( $automation_row, $recommendations );

        if ( empty( $matches ) || $this->is_in_cooldown( $automation_row ) ) {
            return;
        }

        // One run per matching recommendation — a periodic ('*') check can
        // match many different objects (e.g. every image missing alt text);
        // acting on only the first and silently dropping the rest would be
        // a real bug, not just an incomplete pass. Bounded per fire so one
        // trigger tick can't create an unbounded number of rows.
        foreach ( array_slice( $matches, 0, self::MAX_RUNS_PER_FIRE ) as $recommendation ) {
            $this->run_automation( $automation_row, $recommendation, $trigger_id, $trigger_ref_id );
        }
    }

    /**
     * @param array            $automation_row  A `vulopilot_automations` row.
     * @param Recommendation[] $recommendations Candidate recommendations from the current check.
     * @return Recommendation[] Only those matching this automation's bound rule (`trigger_config.rule_key`, unfiltered when absent).
     */
    private function filter_matching_recommendations( array $automation_row, array $recommendations ): array {
        $trigger_config = json_decode( (string) $automation_row['trigger_config'], true );
        $rule_key       = is_array( $trigger_config ) ? ( $trigger_config['rule_key'] ?? null ) : null;

        if ( ! $rule_key ) {
            return $recommendations;
        }

        return array_values(
            array_filter(
                $recommendations,
                static fn( Recommendation $recommendation ) => $recommendation->get_rule_id() === $rule_key
            )
        );
    }

    /**
     * @param array          $automation_row A `vulopilot_automations` row.
     * @param Recommendation $recommendation The specific recommendation this run acts on.
     * @param string         $triggered_by   The firing trigger's id, or 'manual'.
     * @param string|null    $trigger_ref_id The specific object id involved, if any.
     * @return array{run_id: int, executed: int, failed: int, results: array}
     */
    private function run_automation( array $automation_row, Recommendation $recommendation, string $triggered_by, ?string $trigger_ref_id ): array {
        $actions_config = json_decode( (string) $automation_row['actions'], true );
        $actions_config = is_array( $actions_config ) ? $actions_config : array();

        $run_id = $this->runs->insert(
            array(
                'automation_id'  => $automation_row['id'],
                'triggered_by'   => $triggered_by,
                'trigger_ref_id' => $trigger_ref_id,
                'status'         => 'running',
                'started_at'     => current_time( 'mysql', true ),
            )
        );

        $results  = array();
        $executed = 0;
        $failed   = 0;

        foreach ( $actions_config as $action_config ) {
            $action = is_array( $action_config ) ? $this->action_registry->get_action( (string) ( $action_config['type'] ?? '' ) ) : null;

            if ( ! $action ) {
                ++$failed;
                continue;
            }

            $result = $action->execute( $recommendation, is_array( $action_config['config'] ?? null ) ? $action_config['config'] : array() );

            $results[] = $result->to_array();
            $result->is_success() ? ++$executed : ++$failed;
        }

        $this->runs->update(
            $run_id,
            array(
                'status'           => 0 === $executed && $failed > 0 ? 'failed' : 'completed',
                'actions_executed' => $executed,
                'actions_failed'   => $failed,
                'result_log'       => wp_json_encode( $results ),
                'finished_at'      => current_time( 'mysql', true ),
            )
        );

        $this->automations->update( $automation_row['id'], array( 'last_triggered_at' => current_time( 'mysql', true ) ) );

        return array(
            'run_id'   => $run_id,
            'executed' => $executed,
            'failed'   => $failed,
            'results'  => $results,
        );
    }

    /**
     * @param array $automation_row A `vulopilot_automations` row.
     * @return bool
     */
    private function is_in_cooldown( array $automation_row ): bool {
        if ( empty( $automation_row['last_triggered_at'] ) ) {
            return false;
        }

        $last_triggered_at = strtotime( $automation_row['last_triggered_at'] . ' UTC' );

        return $last_triggered_at && ( time() - $last_triggered_at ) < ( $this->get_cooldown_minutes() * MINUTE_IN_SECONDS );
    }

    /**
     * @return int The site's configured `automation_cooldown_minutes` setting.
     */
    private function get_cooldown_minutes(): int {
        $settings = wp_parse_args( get_option( Utill::VULOPILOT_SETTINGS_KEY, array() ), Utill::VULOPILOT_SETTINGS_DEFAULTS );
        $minutes  = absint( $settings['automation_cooldown_minutes'] ?? 0 );

        return $minutes > 0 ? $minutes : self::DEFAULT_COOLDOWN_MINUTES;
    }

    /**
     * @param string $trigger_id The firing trigger's own get_id().
     * @return array<int, array<string, mixed>> Enabled `vulopilot_automations` rows bound to this trigger.
     */
    private function get_enabled_automations_for_trigger( string $trigger_id ): array {
        return array_values(
            array_filter(
                $this->automations->find_all(
                    array(
						'status'   => 'enabled',
						'per_page' => 100,
                    )
                )['data'],
                static fn( array $row ) => $trigger_id === $row['trigger_type']
            )
        );
    }

    /**
     * @param string|null $object_type Scopes the check to one object type, or every open finding when null.
     * @param string|null $object_ref  Scopes the check to one specific object, when $object_type is given.
     * @return Finding[]
     */
    private function get_open_findings( ?string $object_type = null, ?string $object_ref = null ): array {
        $args = array(
            'status'   => 'open',
            'per_page' => self::MAX_FINDINGS_PER_CHECK,
        );

        if ( null !== $object_type ) {
            $args['object_type'] = $object_type;
        }

        if ( null !== $object_ref ) {
            $args['object_ref'] = $object_ref;
        }

        return array_map(
            static function ( array $row ): Finding {
                $meta = json_decode( (string) $row['meta'], true );

                return new Finding(
                    $row['title'],
                    $row['severity'],
                    $row['category'],
                    $row['description'],
                    $row['object_type'],
                    $row['object_ref'],
                    is_array( $meta ) ? $meta : array()
                );
            },
            $this->findings->find_all( $args )['data']
        );
    }
}
