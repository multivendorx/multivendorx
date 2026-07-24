<?php
/**
 * StreamingHttpClient class file.
 *
 * @package VuloPilot
 */

namespace VuloPilot\AIProviders\Support;

use VuloPilotCore\Exceptions\TransientProviderException;

defined( 'ABSPATH' ) || exit;

/**
 * Raw line-at-a-time HTTP streaming, shared by every adapter's
 * send_streaming(). `wp_remote_post()` (WordPress core's own HTTP API,
 * used everywhere else in this codebase) buffers the entire response
 * before returning it — there is no incremental-read callback, so true
 * token-by-token streaming isn't reachable through it. This uses PHP's
 * native `http://`/`https://` stream wrapper directly instead (a real,
 * blocking socket read via `fread()` in a loop), which genuinely does
 * deliver bytes as the server sends them.
 *
 * This class owns only the transport (open a POST stream, split it into
 * lines, hand each line to a callback) — interpreting what a line means
 * (an OpenAI-family `data: {...}` SSE event vs. Ollama's raw NDJSON vs.
 * Gemini's streamed JSON array) is each adapter's own, genuinely
 * provider-specific parsing logic, kept out of this class on purpose.
 *
 * @class       StreamingHttpClient class
 * @version     1.0.0
 * @author      MultiVendorX
 */
class StreamingHttpClient {

    /**
     * @param string                $url      Full request URL.
     * @param array<string, string> $headers  Request headers.
     * @param string                $body     Raw request body (already JSON-encoded).
     * @param callable              $on_line  function( string $line ): void — called once per line, in order.
     * @param int                   $timeout  Seconds.
     * @return void
     *
     * @throws TransientProviderException If the connection can't be opened at all.
     */
    public static function stream_post( string $url, array $headers, string $body, callable $on_line, int $timeout = 60 ): void {
        $header_lines = array();

        foreach ( $headers as $name => $value ) {
            $header_lines[] = "{$name}: {$value}";
        }

        $context = stream_context_create(
            array(
                'http' => array(
                    'method'        => 'POST',
                    'header'        => implode( "\r\n", $header_lines ),
                    'content'       => $body,
                    'timeout'       => $timeout,
                    'ignore_errors' => true,
                ),
            )
        );

        $handle = @fopen( $url, 'rb', false, $context ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged, WordPress.WP.AlternativeFunctions.file_system_operations_fopen -- opening an http(s):// stream for real-time reads, not a local file; WP_Filesystem has no streaming-read API.

        if ( false === $handle ) {
            throw new TransientProviderException(
                sprintf( 'Could not open a streaming connection to %s', $url )
            );
        }

        $buffer = '';

        try {
            while ( ! feof( $handle ) ) {
                $buffer .= fread( $handle, 2048 ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fread -- reading from the http(s):// stream opened above, not a local file.

                while ( false !== ( $newline_pos = strpos( $buffer, "\n" ) ) ) { // phpcs:ignore Generic.CodeAnalysis.AssignmentInCondition.FoundInWhileCondition -- deliberate: pulls each buffered line out in turn, guarded by the explicit `false !==` check.
                    $line   = rtrim( substr( $buffer, 0, $newline_pos ), "\r" );
                    $buffer = substr( $buffer, $newline_pos + 1 );

                    if ( '' !== $line ) {
                        $on_line( $line );
                    }
                }
            }
        } finally {
            fclose( $handle ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose -- closing the http(s):// stream opened above, not a local file.
        }
    }
}
