<?php
/**
 * CsvExporter class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Reports\Exporters;

use VuloPilotCore\Contracts\Report\ReportExporterInterface;
use VuloPilotCore\ValueObjects\ReportResult;

defined( 'ABSPATH' ) || exit;

/**
 * Renders a ReportResult as CSV: a summary block, then one labeled block
 * per section — either a header row + data rows (a section that's a list
 * of same-shaped rows, e.g. "top findings") or a two-column key/value block
 * (a section that's a flat map, e.g. "findings by severity").
 *
 * @class       CsvExporter class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class CsvExporter implements ReportExporterInterface {

    /**
     * @inheritDoc
     */
    public function get_format(): string {
        return 'csv';
    }

    /**
     * @inheritDoc
     *
     * @throws \RuntimeException When $file_path can't be opened for writing.
     */
    public function export( ReportResult $result, string $file_path ): void {
        // phpcs:disable WordPress.WP.AlternativeFunctions.file_system_operations_fopen, WordPress.WP.AlternativeFunctions.file_system_operations_fclose -- writing to VuloPilot's own controlled reports directory (Reports\ReportGenerator resolves $file_path under wp-content/uploads/vulopilot-reports/), not arbitrary user-supplied paths; WP_Filesystem's FTP-credential fallback isn't relevant to a value we control end-to-end.
        $handle = fopen( $file_path, 'w' );

        if ( false === $handle ) {
            throw new \RuntimeException( esc_html( sprintf( 'Could not open %s for writing.', $file_path ) ) );
        }

        $this->write_row( $handle, array( $result->get_label() ) );
        $this->write_row( $handle, array( __( 'Period', 'vulopilot' ), $result->get_period_start(), $result->get_period_end() ) );
        $this->write_row( $handle, array() );

        $this->write_row( $handle, array( __( 'Summary', 'vulopilot' ) ) );
        foreach ( $result->get_summary() as $key => $value ) {
            $this->write_row( $handle, array( $key, $this->stringify( $value ) ) );
        }
        $this->write_row( $handle, array() );

        foreach ( $result->get_sections() as $section_key => $section_value ) {
            $this->write_row( $handle, array( ucwords( str_replace( '_', ' ', $section_key ) ) ) );
            $this->write_section( $handle, $section_value );
            $this->write_row( $handle, array() );
        }

        fclose( $handle );
        // phpcs:enable
    }

    /**
     * Thin fputcsv() wrapper that always passes the delimiter/enclosure/escape
     * arguments explicitly — PHP's fputcsv() default escape character is
     * deprecated as of PHP 8.1 (PHPCompatibility.ParameterValues.RemovedProprietaryCSVEscaping),
     * so every call site in this class routes through here instead of
     * repeating the same three literal arguments everywhere.
     *
     * @param resource $handle Open file handle from export().
     * @param array    $row    One row's cell values.
     * @return void
     */
    private function write_row( $handle, array $row ): void {
        fputcsv( $handle, $row, ',', '"', '\\' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fputcsv -- see export()'s own justification; same controlled file.
    }

    /**
     * @param resource $handle        Open file handle from export().
     * @param array    $section_value One section's value.
     * @return void
     */
    private function write_section( $handle, array $section_value ): void {
        if ( empty( $section_value ) ) {
            return;
        }

        if ( $this->is_row_list( $section_value ) ) {
            $this->write_row( $handle, array_keys( $section_value[0] ) );

            foreach ( $section_value as $row ) {
                $this->write_row( $handle, array_map( array( $this, 'stringify' ), array_values( $row ) ) );
            }

            return;
        }

        foreach ( $section_value as $key => $value ) {
            $this->write_row( $handle, array( $key, $this->stringify( $value ) ) );
        }
    }

    /**
     * @param array $value A section's value.
     * @return bool True when $value is a sequential list of associative-array rows.
     */
    private function is_row_list( array $value ): bool {
        if ( array() === $value ) {
            return false;
        }

        return array_keys( $value ) === range( 0, count( $value ) - 1 ) && is_array( reset( $value ) );
    }

    /**
     * @param mixed $value A single cell value.
     * @return string
     */
    private function stringify( $value ): string {
        if ( is_array( $value ) ) {
            return (string) wp_json_encode( $value );
        }

        return (string) $value;
    }
}
