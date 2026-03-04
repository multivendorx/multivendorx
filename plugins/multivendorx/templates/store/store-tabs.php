<?php

/**
 * Store tabs template.
 *
 * Override this template by copying it to yourtheme/dc-woocommerce-multi-vendor/store/store-tabs.php
 *
 * @package     MultiVendorX/Templates
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */

use MultiVendorX\Utill;

if (! defined('ABSPATH')) {
	exit;
}

$store_id = $args['store_id'];

// Get store tabs.
$store_tabs = MultiVendorX()->store->storeutil->get_store_tabs($store_id);

if (empty($store_tabs)) {
	return;
}

$current_tab = 'products'; // Default.
$request_url = trailingslashit(home_url(add_query_arg(array(), $wp->request)));

// Loop through tabs.
foreach ($store_tabs as $key => $tab) {
	if (! empty($tab['url'])) {
		// Compare current URL with tab URL.
		if (untrailingslashit($tab['url']) === untrailingslashit($request_url)) {
			$current_tab = $key;
			break;
		}
	}
}

?>
<ul class="multivendorx-store-tabs">
	<?php foreach ($store_tabs as $key => $tab) : ?>
		<?php if (! empty($tab['url'])) : ?>
			<li class="multivendorx-store-tab <?php echo esc_attr($key); ?> <?php echo ($current_tab === $key) ? 'active' : ''; ?>">
				<a href="<?php echo esc_url($tab['url']); ?>">
					<?php echo esc_html($tab['title']); ?>
				</a>
			</li>
		<?php endif; ?>
	<?php endforeach; ?>
</ul>


<div class="multivendorx-policies-accordion">
	<?php
	switch ($current_tab) {
		case 'reviews':
			MultiVendorX()->util->get_template('store/store-review.php', array('store_id' => $store_id));
			break;

		case 'policy':
			MultiVendorX()->util->get_template('store/store-policy.php', array('store_id' => $store_id));
			break;

		case 'products':
		default:
			$search_keyword = filter_input(
				INPUT_GET,
				'store_search',
				FILTER_SANITIZE_SPECIAL_CHARS
			);

			$search_keyword = $search_keyword ? trim($search_keyword) : '';
			$paged = get_query_var('paged') ? get_query_var('paged') : 1;

			$args = array(
				'post_type'      => 'product',
				'posts_per_page' => get_option('posts_per_page'),
				'paged'          => $paged,
				'post_status'    => 'publish',
				'meta_query'     => array(
					array(
						'key'     => Utill::POST_META_SETTINGS['store_id'],
						'value'   => $store_id,
						'compare' => '='
					)
				)
			);

			if (! empty($search_keyword)) {
				$args['s'] = $search_keyword;
			}

			$args = apply_filters(
				'multivendorx_store_product_query_args',
				$args,
				$store_id,
				$search_keyword,
				$paged
			);
			
			$products = new WP_Query($args);
	?>

			<div class="woocommerce">
				<form method="get" class="store-product-search" style="margin-bottom:20px;">
					<input
						type="search"
						name="store_search"
						placeholder="<?php esc_attr_e('Search products...', 'multivendorx'); ?>"
						value="<?php echo esc_attr($search_keyword); ?>"
						autocomplete="off" />

					<?php
					// Preserve pagination if needed
					if ($paged > 1) :
					?>
						<input type="hidden" name="paged" value="<?php echo esc_attr($paged); ?>">
					<?php endif; ?>
				</form>
				<?php if ($products->have_posts()) : ?>

					<?php woocommerce_product_loop_start(); ?>

					<?php while ($products->have_posts()) : $products->the_post(); ?>

						<?php
						do_action('woocommerce_shop_loop');
						wc_get_template_part('content', 'product');
						?>

					<?php endwhile; ?>

					<?php woocommerce_product_loop_end(); ?>

					<?php
					echo paginate_links(array(
						'total' => $products->max_num_pages,
					));
					?>

				<?php else : ?>

					<?php do_action('woocommerce_no_products_found'); ?>

				<?php endif; ?>

				<?php wp_reset_postdata(); ?>
			</div>

	<?php
			break;
	}
	?>
</div>