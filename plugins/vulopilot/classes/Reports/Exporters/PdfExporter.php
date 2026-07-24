<?php
/**
 * PdfExporter class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\Reports\Exporters;

use Dompdf\Dompdf;
use Dompdf\Options;
use VuloPilotCore\Contracts\Report\ReportExporterInterface;
use VuloPilotCore\ValueObjects\ReportResult;

defined( 'ABSPATH' ) || exit;

/**
 * Renders a ReportResult as a real PDF via dompdf (the standard
 * dependency-minimal way to turn HTML into a PDF from PHP — no headless
 * browser available in a WordPress plugin context). Remote resource
 * loading is explicitly disabled (`isRemoteEnabled`), since this only ever
 * renders VuloPilot's own generated markup, never third-party HTML.
 *
 * @class       PdfExporter class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class PdfExporter implements ReportExporterInterface {

    /**
     * @inheritDoc
     */
    public function get_format(): string {
        return 'pdf';
    }

    /**
     * @inheritDoc
     *
     * @throws \RuntimeException When $file_path can't be written.
     */
    public function export( ReportResult $result, string $file_path ): void {
        $options = new Options();
        $options->set( 'isRemoteEnabled', false );
        $options->set( 'isHtml5ParserEnabled', true );

        $dompdf = new Dompdf( $options );
        $dompdf->loadHtml( $this->build_html( $result ), 'UTF-8' );
        $dompdf->setPaper( 'A4', 'portrait' );
        $dompdf->render();

        $written = file_put_contents( $file_path, $dompdf->output() ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents -- writing to VuloPilot's own controlled reports directory (Reports\ReportGenerator resolves $file_path under wp-content/uploads/vulopilot-reports/), not arbitrary user-supplied paths.

        if ( false === $written ) {
            throw new \RuntimeException( esc_html( sprintf( 'Could not write %s.', $file_path ) ) );
        }
    }

    /**
     * @param ReportResult $result The generated report data.
     * @return string Full HTML document dompdf renders.
     */
    private function build_html( ReportResult $result ): string {
        $html  = '<html><head><meta charset="utf-8"><style>' . $this->get_styles() . '</style></head><body>';
        $html .= '<h1>' . esc_html( $result->get_label() ) . '</h1>';
        $html .= '<p class="period">' . esc_html( $result->get_period_start() . ' — ' . $result->get_period_end() ) . '</p>';

        $html .= '<h2>' . esc_html__( 'Summary', 'vulopilot' ) . '</h2><table class="kv">';
        foreach ( $result->get_summary() as $key => $value ) {
            $html .= '<tr><th>' . esc_html( $this->label_for( (string) $key ) ) . '</th><td>' . esc_html( $this->stringify( $value ) ) . '</td></tr>';
        }
        $html .= '</table>';

        if ( ! empty( $result->get_trend() ) ) {
            $html .= '<h2>' . esc_html__( 'Trend vs. previous period', 'vulopilot' ) . '</h2><table class="rows"><tr><th>'
                . esc_html__( 'Metric', 'vulopilot' ) . '</th><th>' . esc_html__( 'Current', 'vulopilot' ) . '</th><th>'
                . esc_html__( 'Previous', 'vulopilot' ) . '</th><th>' . esc_html__( 'Change', 'vulopilot' ) . '</th></tr>';

            foreach ( $result->get_trend() as $key => $trend_row ) {
                $change = null === $trend_row['change_percent'] ? '—' : $trend_row['change_percent'] . '%';

                $html .= '<tr><td>' . esc_html( $this->label_for( (string) $key ) ) . '</td><td>' . esc_html( $this->stringify( $trend_row['current'] ) )
                    . '</td><td>' . esc_html( $this->stringify( $trend_row['previous'] ) ) . '</td><td>' . esc_html( $change ) . '</td></tr>';
            }

            $html .= '</table>';
        }

        foreach ( $result->get_sections() as $section_key => $section_value ) {
            $html .= '<h2>' . esc_html( $this->label_for( (string) $section_key ) ) . '</h2>';
            $html .= $this->render_section( $section_value );
        }

        return $html . '</body></html>';
    }

    /**
     * @param array<mixed, mixed> $section_value One section's value.
     * @return string HTML table (or an empty-state paragraph).
     */
    private function render_section( array $section_value ): string {
        if ( empty( $section_value ) ) {
            return '<p class="empty">' . esc_html__( 'No data for this period.', 'vulopilot' ) . '</p>';
        }

        if ( $this->is_row_list( $section_value ) ) {
            $html = '<table class="rows"><tr>';

            foreach ( array_keys( $section_value[0] ) as $header ) {
                $html .= '<th>' . esc_html( $this->label_for( (string) $header ) ) . '</th>';
            }

            $html .= '</tr>';

            foreach ( $section_value as $row ) {
                $html .= '<tr>';

                foreach ( $row as $cell ) {
                    $html .= '<td>' . esc_html( $this->stringify( $cell ) ) . '</td>';
                }

                $html .= '</tr>';
            }

            return $html . '</table>';
        }

        $html = '<table class="kv">';

        foreach ( $section_value as $key => $value ) {
            $html .= '<tr><th>' . esc_html( $this->label_for( (string) $key ) ) . '</th><td>' . esc_html( $this->stringify( $value ) ) . '</td></tr>';
        }

        return $html . '</table>';
    }

    /**
     * @param array<mixed, mixed> $value A section's value.
     * @return bool True when $value is a sequential list of associative-array rows.
     */
    private function is_row_list( array $value ): bool {
        if ( array() === $value ) {
            return false;
        }

        return array_keys( $value ) === range( 0, count( $value ) - 1 ) && is_array( reset( $value ) );
    }

    /**
     * @param string $key A summary/section/trend key, e.g. 'critical_findings'.
     * @return string Human-readable label, e.g. 'Critical Findings'.
     */
    private function label_for( string $key ): string {
        return ucwords( str_replace( '_', ' ', $key ) );
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

    /**
     * @return string Inline CSS for the rendered PDF.
     */
    private function get_styles(): string {
        return 'body{font-family:sans-serif;font-size:12px;color:#222;}'
            . 'h1{font-size:20px;margin-bottom:4px;}'
            . 'h2{font-size:15px;margin-top:20px;border-bottom:1px solid #ccc;padding-bottom:2px;}'
            . 'table{width:100%;border-collapse:collapse;margin-bottom:10px;}'
            . 'th,td{border:1px solid #ccc;padding:4px 8px;text-align:left;font-size:11px;}'
            . '.period{color:#666;margin-top:0;}'
            . '.empty{color:#999;font-style:italic;}';
    }
}
