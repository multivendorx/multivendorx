<?php
/**
 * CustomReport class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Reports\Types;

use VuloPilot\Reports\AbstractReportType;
use VuloPilot\Reports\ReportTypeRegistry;
use VuloPilotCore\ValueObjects\ReportResult;

defined( 'ABSPATH' ) || exit;

/**
 * The "report builder" — merges the output of one or more other registered
 * report types into a single result, one section per included type. Unlike
 * every other Reports\Types\* class, this one is never in
 * ReportTypeRegistry's default list and is never resolved via
 * get_report_type('custom') — it's parameterized per request (which types
 * to include), so Reports\ReportGenerator constructs it directly with the
 * caller's selection instead of pulling a singleton off the registry.
 *
 * @class       CustomReport class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class CustomReport extends AbstractReportType {

    /**
     * @var ReportTypeRegistry
     */
    private ReportTypeRegistry $registry;

    /**
     * @var string[]
     */
    private array $included_type_ids;

    /**
     * @param ReportTypeRegistry $registry          Registry to resolve each included type id against.
     * @param string[]           $included_type_ids Other report types' get_id() values to merge in.
     */
    public function __construct( ReportTypeRegistry $registry, array $included_type_ids ) {
        $this->registry          = $registry;
        $this->included_type_ids = $included_type_ids;
    }

    /**
     * @inheritDoc
     */
    public function get_id(): string {
        return 'custom';
    }

    /**
     * @inheritDoc
     */
    public function get_label(): string {
        return __( 'Custom Report', 'vulopilot' );
    }

    /**
     * @inheritDoc
     */
    public function generate( string $period_start, string $period_end ): ReportResult {
        $summary  = array();
        $sections = array();
        $trend    = array();

        foreach ( $this->included_type_ids as $type_id ) {
            if ( $this->get_id() === $type_id ) {
                continue; // a custom report can't include itself.
            }

            $report_type = $this->registry->get_report_type( $type_id );

            if ( ! $report_type ) {
                continue;
            }

            $result = $report_type->generate( $period_start, $period_end );

            foreach ( $result->get_summary() as $key => $value ) {
                $summary[ "{$type_id}.{$key}" ] = $value;
            }

            foreach ( $result->get_trend() as $key => $value ) {
                $trend[ "{$type_id}.{$key}" ] = $value;
            }

            $sections[ $type_id ] = array(
                'label'    => $result->get_label(),
                'summary'  => $result->get_summary(),
                'sections' => $result->get_sections(),
            );
        }

        return new ReportResult( $this->get_id(), $this->get_label(), $period_start, $period_end, $summary, $sections, $trend );
    }
}
