<?php
/**
 * JsonExporter class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Reports\Exporters;

use VuloPilotCore\Contracts\Report\ReportExporterInterface;
use VuloPilotCore\ValueObjects\ReportResult;

defined( 'ABSPATH' ) || exit;

/**
 * Renders a ReportResult as pretty-printed JSON — a straight dump of
 * ReportResult::to_array(), the full-fidelity export format (unlike csv/pdf,
 * nothing is flattened or reshaped).
 *
 * @class       JsonExporter class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class JsonExporter implements ReportExporterInterface {

    /**
     * @inheritDoc
     */
    public function get_format(): string {
        return 'json';
    }

    /**
     * @inheritDoc
     *
     * @throws \RuntimeException When $file_path can't be written.
     */
    public function export( ReportResult $result, string $file_path ): void {
        $written = file_put_contents( $file_path, (string) wp_json_encode( $result->to_array(), JSON_PRETTY_PRINT ) ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents -- writing to VuloPilot's own controlled reports directory (Reports\ReportGenerator resolves $file_path under wp-content/uploads/vulopilot-reports/), not arbitrary user-supplied paths.

        if ( false === $written ) {
            throw new \RuntimeException( esc_html( sprintf( 'Could not write %s.', $file_path ) ) );
        }
    }
}
