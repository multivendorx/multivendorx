<?php

namespace CatalogX\Emails;
defined( 'ABSPATH' ) || exit;


class EmailHTMLConverter {

    /**
     * Convert blocks to HTML.
     *
     * @param array $blocks Array of blocks to convert.
     * @return string HTML string.
     */
    public static function convert( $blocks, $placeholders = array()  ) {
        $html = catalogx_render_blocks_to_html( $blocks );

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
function catalogx_render_blocks_to_html( $blocks ) {
	$html = '';

	foreach ( $blocks as $block ) {
		$html .= catalogx_render_block( $block );
	}

	return $html;
}

/**
 * Render single block.
 */
function catalogx_render_block( $block ) {
	$type  = $block['type'] ?? '';
	$style = catalogx_style_to_string( $block['style'] ?? array() );

	switch ( $type ) {

		case 'heading':
			$level = absint( $block['level'] ?? 1 );

			if ( $level < 1 || $level > 6 ) {
				$level = 1;
			}

			return sprintf(
				'<h%d style="%s">%s</h%d>',
				$level,
				esc_attr( $style ),
				esc_html( $block['text'] ?? '' ),
				$level
			);

		case 'richtext':
			return sprintf(
				'<div style="%s">%s</div>',
				esc_attr( $style ),
				wp_kses_post( $block['html'] ?? '' )
			);

		case 'image':
			return sprintf(
				'<img src="%s" alt="%s" style="%s" />',
				esc_url( $block['src'] ?? '' ),
				esc_attr( $block['alt'] ?? '' ),
				esc_attr( $style )
			);

		case 'button':
			return sprintf(
				'<a href="%s" style="%s;display:inline-block;text-decoration:none;">%s</a>',
				esc_url( $block['url'] ?? '#' ),
				esc_attr( $style ),
				esc_html( $block['text'] ?? __( 'Click', 'catalogx' ) )
			);

		case 'divider':
			return sprintf(
				'<hr style="%s" />',
				esc_attr( $style )
			);

		case 'columns':
			return catalogx_render_columns( $block );

		case 'section':
			return catalogx_render_section( $block );

		default:
			return '';
	}
}

/**
 * Render section.
 */
function catalogx_render_section( $block ) {
	$html = '';

	foreach ( $block['columns'] ?? array() as $column ) {
		foreach ( $column as $nested_block ) {
			$html .= catalogx_render_block( $nested_block );
		}
	}

	return sprintf(
		'<div style="%s">%s</div>',
		esc_attr(
			catalogx_style_to_string(
				$block['style'] ?? array()
			)
		),
		$html
	);
}

/**
 * Render columns.
 */
function catalogx_render_columns( $block ) {
	$columns = $block['columns'] ?? array();

	if ( empty( $columns ) ) {
		return '';
	}

	$html  = sprintf(
		'<table width="100%%" cellpadding="0" cellspacing="0" style="%s"><tr>',
		esc_attr(
			catalogx_style_to_string(
				$block['style'] ?? array()
			)
		)
	);

	foreach ( $columns as $column ) {

		$html .= '<td valign="top" style="padding:10px;">';

		foreach ( $column as $nested_block ) {
			$html .= catalogx_render_block( $nested_block );
		}

		$html .= '</td>';
	}

	$html .= '</tr></table>';

	return $html;
}