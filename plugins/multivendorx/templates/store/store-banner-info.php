<?php

/**
 * Template to display the vendor store banner and details.
 *
 * Override this template by copying it to yourtheme/dc-woocommerce-multi-vendor/store/store-banner-info.php
 *
 * @package     MultiVendorX/Templates
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */

use MultiVendorX\store\store;
use MultiVendorX\StoreReview\Util;

$store_id = $args['store_id'];

$store = Store::get_store($store_id);

if (!$store) {
    return;
}

$meta_data = $store->get_all_meta();
$banner = $meta_data['banner'] ?? '';
$profile = $meta_data['image'] ?? '';
$description = $store->get('description');
$template = MultiVendorX()->setting->get_setting('store_banner_template', array());
$selected_template = isset($template['selectedPalette']) ? $template['selectedPalette'] : 'template1';
$branding_settings = MultiVendorX()->setting->get_setting('store_branding_details', array());
$contact_settings = MultiVendorX()->setting->get_setting('store_contact_details', array());
$overall_reviews = Util::get_overall_rating($store->get_id());
$reviews = Util::get_reviews_by_store($store->get_id());
$rating_value = $overall_reviews ? number_format((float) $overall_reviews, 1) : 0;
$review_count = is_array($reviews) ? count($reviews) : 0;
$banner_type = $meta_data['banner_type'] ?? 'static_image';
$banner_video = $meta_data['banner_video'] ?? '';
$banner_slider = $meta_data['banner_slider'] ?? [];
if (is_string($banner_slider)) {
    $banner_slider = json_decode($banner_slider, true) ?: [];
}

?>

<div class="multivendorx-banner <?php echo esc_attr($selected_template); ?>">
    <?php if ($banner_type === 'static_image'): ?>
        <div class="banner-img">
            <?php if (!empty($banner)): ?>
                <img src="<?php echo esc_url($banner); ?>" alt="">
            <?php else: ?>
                <div class="no-banner">1500 X 900</div>
            <?php endif; ?>
        </div>

    <?php elseif ($banner_type === 'slider_image'): ?>
        <div class="banner-slider">
            <?php
            if (!empty($banner_slider)):
                foreach ($banner_slider as $slide):
                    echo '<div class="slide"><img src="' . esc_url($slide) . '" alt=""></div>';
                endforeach;
            else: ?>
                <div class="no-banner">1500 X 900</div>
            <?php endif; ?>
        </div>

    <?php elseif ($banner_type === 'video'): ?>
        <div class="banner-video">
            <?php if (!empty($banner_video)): ?>
                <?php
                $url = trim($banner_video);

                // YouTube URL
                if (preg_match('/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/', $url, $matches)) {
                    $youtube_id = $matches[1];
                ?>
                    <iframe width="100%" height="500"
                        src="https://www.youtube.com/embed/<?php echo esc_attr($youtube_id); ?>?autoplay=1&mute=1&loop=1&playlist=<?php echo esc_attr($youtube_id); ?>"
                        frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>
                    </iframe>
                <?php
                    // Vimeo URL
                } elseif (preg_match('/vimeo\.com\/(\d+)/', $url, $matches)) {
                    $vimeo_id = $matches[1];
                ?>
                    <iframe width="100%" height="500"
                        src="https://player.vimeo.com/video/<?php echo esc_attr($vimeo_id); ?>?autoplay=1&loop=1&muted=1"
                        frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen>
                    </iframe>
                <?php
                    // Direct video file (mp4/webm/etc.)
                } else { ?>
                    <video autoplay muted loop controls style="width:100%; height:auto;">
                        <source src="<?php echo esc_url($url); ?>" type="video/mp4">
                        <?php esc_html_e('Your browser does not support the video tag.', 'multivendorx'); ?>
                    </video>
                <?php } ?>
            <?php else: ?>
                <div class="no-banner"><?php esc_html_e('Video not available', 'multivendorx'); ?></div>
            <?php endif; ?>
        </div>
    <?php endif; ?>


    <div class='banner-right'>
        <div class="social-profile">
            <?php if (!empty($meta_data['facebook'])): ?>
                <a target="_blank" href="<?php echo esc_url($meta_data['facebook']); ?>">
                    <i class="dashicons dashicons-facebook"></i>
                </a>
            <?php endif; ?>

            <?php if (!empty($meta_data['twitter'])): ?>
                <a target="_blank" href="<?php echo esc_url($meta_data['twitter']); ?>">
                    <i class="dashicons dashicons-twitter"></i>
                </a>
            <?php endif; ?>

            <?php if (!empty($meta_data['linkedin'])): ?>
                <a target="_blank" href="<?php echo esc_url($meta_data['linkedin']); ?>">
                    <i class="dashicons dashicons-instagram"></i>
                </a>
            <?php endif; ?>

            <?php if (!empty($meta_data['youtube'])): ?>
                <a target="_blank" href="<?php echo esc_url($meta_data['youtube']); ?>">
                    <i class="dashicons dashicons-youtube"></i>
                </a>
            <?php endif; ?>

            <?php if (!empty($meta_data['instagram'])): ?>
                <a target="_blank" href="<?php echo esc_url($meta_data['instagram']); ?>">
                    <i class="dashicons dashicons-linkedin"></i>
                </a>
            <?php endif; ?>

            <?php do_action('mvx_vendor_store_header_social_link', $store_id); ?>

        </div>
        <div class='multivendorx-butn-area'>
            <?php do_action('mvx_additional_button_at_banner'); ?>
        </div>
    </div>
    <div class='store-details'>
        <?php if (in_array('show_store_logo_next_to_products', $branding_settings, true)): ?>
            <div class='profile'>
                <?php if (!empty($profile)): ?>
                    <div class="multivendorx-profile-img">
                        <img src="<?php echo esc_url($profile); ?>" alt="">
                    </div>
                <?php else: ?>
                    <div class="placeholder">400 x 400</div>
                <?php endif; ?>
            </div>
        <?php endif; ?>

        <div class="details">
            <div class="container">

                <div class="contact-details">
                    <?php if (in_array('show_store_name', $branding_settings, true)): ?>
                        <div class="heading"><?php echo esc_html($store->get('name')); ?></div>

                    <?php endif; ?>
                    <div class="row">
                        <?php
                        // Show email if not hidden.
                        if (in_array('show_store_email', $contact_settings, true) && !empty($meta_data['primary_email']) && ($meta_data['hideEmail'] ?? 'no') === 'no') {
                            echo '<div class="store-email"><i class="dashicons dashicons-email"></i> ' . esc_html($meta_data['primary_email']) . '</div>';
                        }

                        // Show phone if not hidden.
                        if (in_array('show_store_phone', $contact_settings, true) && !empty($meta_data['phone']) && ($meta_data['hidePhone'] ?? 'no') === 'no') {
                            echo '<div class="store-phone"> <i class="dashicons dashicons-phone"></i>' . esc_html($meta_data['phone']) . '</div>';
                        }
                        ?>
                    </div>
                    <?php
                    // Show full address.
                    $address = trim(($meta_data['address'] ?? '') . ' ' . ($meta_data['address_2'] ?? ''));
                    if (in_array('show_store_owner_info', $contact_settings, true) && !empty($address)) {
                        echo '<div class="store-address"> <i class="dashicons dashicons-location"></i>' . esc_html($address) . '</div>';
                    }
                    ?>
                    <?php if (in_array('show_store_description', $branding_settings, true) && !empty($description)) { ?>
                        <div class="description">
                            <?php echo wp_kses_post($description); ?>
                        </div>
                    <?php } ?>
                </div>
                <div class="right-section">
                    <?php
                    if (
                        in_array('show_store_ratings', $branding_settings, true) &&
                        $rating_value > 0
                    ):
                    ?>
                        <div class="store-rating">
                            <i class="dashicons dashicons-star-filled"></i>
                            <i class="dashicons dashicons-star-filled"></i>
                            <i class="dashicons dashicons-star-filled"></i>
                            <i class="dashicons dashicons-star-filled"></i>
                            <i class="dashicons dashicons-star-filled"></i>
                            <?php echo esc_html($rating_value); ?> / 5
                            <span> (<?php echo esc_html($review_count); ?> Review)</span>
                        </div>
                    <?php endif; ?>
                    <?php

                    do_action('mvx_after_vendor_information', $store_id);
                    ?>
                </div>
            </div>
        </div>

    </div>
</div>