<?php

namespace CatalogX\Emails;
defined( 'ABSPATH' ) || exit;


class EmailHTMLConverter {

	/**
	 * Convert email blocks into HTML markup.
	 *
	 * @param array $email_blocks Email blocks.
	 * @param array $placeholders Placeholder replacements.
	 * @return string
	 */
    public static function convert( $email_blocks, $placeholders = array()  ) {
        $html = catalogx_render_blocks_to_html( $email_blocks );

		if ( ! empty( $placeholders ) ) {
		$html = str_replace(
			array_keys( $placeholders ),
			array_values( $placeholders ),
			$html
		);
	}

		return $html;
    }
}


/**
 * Convert style array to inline CSS.
 */
function catalogx_style_to_string( $style = array() ) {
	$css = array();

	foreach ( $style as $key => $value ) {

		if ( null === $value || '' === $value ) {
			continue;
		}

		$css_key = strtolower(
			preg_replace( '/([a-z])([A-Z])/', '$1-$2', $key )
		);

		if ( is_numeric( $value ) ) {
			$css[] = "{$css_key}:{$value}rem";
		} else {
			$css[] = "{$css_key}:{$value}";
		}
	}

	return implode( ';', $css );
}

/**
 * Render all blocks.
 */
function catalogx_render_blocks_to_html( $email_blocks ) {
	$rendered_html = '';

	foreach ( $email_blocks as $email_block ) {
		$rendered_html .= catalogx_render_block( $email_block );
	}

	return $rendered_html;
}

/**
 * Render single block.
 */
function catalogx_render_block( $email_block ) {
	$type  = $email_block['type'] ?? '';
	$style = catalogx_style_to_string( $email_block['style'] ?? array() );

	switch ( $type ) {

		case 'heading':
			$level = absint( $email_block['level'] ?? 1 );

			if ( $level < 1 || $level > 6 ) {
				$level = 1;
			}

			return sprintf(
				'<h%d style="%s">%s</h%d>',
				$level,
				esc_attr( $style ),
				esc_html( $email_block['text'] ?? '' ),
				$level
			);

		case 'richtext':
			return sprintf(
				'<div style="%s">%s</div>',
				esc_attr( $style ),
				wp_kses_post( $email_block['html'] ?? '' )
			);

		case 'image':
			return sprintf(
				'<img src="%s" alt="%s" style="%s" />',
				esc_url( $email_block['src'] ?? '' ),
				esc_attr( $email_block['alt'] ?? '' ),
				esc_attr( $style )
			);

		case 'button':
			return sprintf(
				'<a href="%s" style="%s;display:inline-block;text-decoration:none;">%s</a>',
				esc_url( $email_block['url'] ?? '#' ),
				esc_attr( $style ),
				esc_html( $email_block['text'] ?? __( 'Click', 'catalogx' ) )
			);

		case 'divider':
			return sprintf(
				'<hr style="%s" />',
				esc_attr( $style )
			);

		case 'columns':
			return catalogx_render_columns( $email_block );

		case 'section':
			return catalogx_render_section( $email_block );

		default:
			return '';
	}
}

/**
 * Render section.
 */
function catalogx_render_section( $email_block ) {
	$rendered_html = '';

	foreach ( $email_block['columns'] ?? array() as $column ) {
		foreach ( $column as $nested_block ) {
			$rendered_html .= catalogx_render_block( $nested_block );
		}
	}

	return sprintf(
		'<div style="%s">%s</div>',
		esc_attr(
			catalogx_style_to_string(
				$email_block['style'] ?? array()
			)
		),
		$rendered_html
	);
}

/**
 * Render columns.
 */
function catalogx_render_columns( $email_block ) {
	$columns = $email_block['columns'] ?? array();

	if ( empty( $columns ) ) {
		return '';
	}

	$rendered_html  = sprintf(
		'<table width="100%%" cellpadding="0" cellspacing="0" style="%s"><tr>',
		esc_attr(
			catalogx_style_to_string(
				$email_block['style'] ?? array()
			)
		)
	);

	foreach ( $columns as $column ) {

		$rendered_html .= '<td valign="top" style="padding:10px;">';

		foreach ( $column as $nested_block ) {
			$rendered_html .= catalogx_render_block( $nested_block );
		}

		$rendered_html .= '</td>';
	}

	$rendered_html .= '</tr></table>';

	return $rendered_html;
}