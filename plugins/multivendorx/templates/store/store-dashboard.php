<?php
/**
 * Template Name: Store Dashboard
 *
 * @package MultiVendorX
 */
use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Store\Store;

$user                 = wp_get_current_user();
$store_dashboard_logo = MultiVendorX()->setting->get_setting( 'store_dashboard_site_logo', array() );
$page_info            = MultiVendorX()->rest->dashboard->get_current_page_and_submenu();
// Count stores excluding the active one.
$active_store = $page_info['active_store'] ?? null;
$store_ids    = $page_info['store_ids'] ?? array();

$available_stores = array_filter(
    $store_ids,
    function ( $id ) use ( $active_store ) {
        // Skip the active store if it exists in the list.
        return $active_store ? ( $id !== $active_store ) : true;
    }
);

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>

<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
    <div id="store-dashboard">
        <div class="dashboard-tabs-wrapper">
            <div class="logo-wrapper">
                <?php if ( ! empty( $store_dashboard_logo ) ) : ?>
                    <img src="<?php echo esc_url( $store_dashboard_logo ); ?>" alt="">
                <?php else : ?>
                    <span class="site-name"><?php echo esc_html( get_bloginfo( 'name' ) ); ?></span>
                <?php endif; ?>
            </div>
            <div class="dashboard-tabs">
                <ul>
                    <?php foreach ( $page_info['all_endpoints'] as $section ) : ?>
                        <?php
                        $has_submenu = ! empty( $section['submenu'] );
                        $is_active   = ( $page_info['current_page'] === $section['slug'] && empty( $page_info['current_sub'] ) );
                        ?>
                        <li class="tab-name <?php echo $is_active ? 'active' : ''; ?>">
                            <a class="tab" <?php echo $has_submenu ? 'href="#" onclick="return false;"' : 'href="' . esc_url( StoreUtil::get_endpoint_url( $section['slug'] ) ) . '"'; ?>>
                                <i class="<?php echo esc_attr( $section['icon'] ); ?>"></i>
                                <span><?php echo esc_html( $section['name'] ); ?></span>
                                <?php if ( $has_submenu ) : ?>
                                    <i class="admin-arrow adminlib-pagination-right-arrow"></i>
                                <?php endif; ?>
                            </a>

                            <?php if ( $has_submenu ) : ?>
                                <ul class="subtabs">
                                    <?php foreach ( $section['submenu'] as $submenu_item ) : ?>
                                        <?php
                                        $sub_active = ( $page_info['current_page'] === $section['slug'] && $page_info['current_sub'] === $submenu_item['slug'] );
                                        ?>
                                        <li class="<?php echo $sub_active ? 'active' : ''; ?>">
                                            <a
                                                href="<?php echo esc_url( StoreUtil::get_endpoint_url( $section['slug'], $submenu_item['slug'] ) ); ?>">
                                                <?php echo esc_html( $submenu_item['name'] ); ?>
                                            </a>
                                        </li>
                                    <?php endforeach; ?>
                                </ul>
                            <?php endif; ?>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>
        </div>

        <div class="dashboard-content tab-wrapper">
            <div class="top-navbar-wrapper">
                <div class="top-navbar">
                    <div class="navbar-leftside">
                        <i class='adminlib-menu toggle-menu-icon'></i>
                    </div>
                    <div class="navbar-rightside">
                        <ul class="navbar-right">
                            <li>
                                <div class="adminlib-icon adminlib-vendor-form-add"></div>
                            </li>
                            <li>
                                <div class="adminlib-icon adminlib-storefront"></div>
                            </li>
                            <li>
                                <div class="adminlib-icon notification adminlib-notification"></div>

                                <div id="notifications"></div>
                                <!-- <div class="dropdown-menu notification"><div class="title">Notifications <span class="admin-badge green">2 New</span></div><div class="notification"><ul><li><a href="/orders"><div class="icon admin-badge blue"><i class="adminlib-cart-icon"></i></div><div class="details"><span class="heading">New Order Received</span><span class="message">Order #1024 has been placed</span><span class="time">1 hour ago</span></div></a></li><li><a href="/reviews"><div class="icon admin-badge yellow"><i class="adminlib-star-icon"></i></div><div class="details"><span class="heading">New Review</span><span class="message">John left a 5-star review</span><span class="time">30 mins ago</span></div></a></li></ul></div><div class="footer"><a href="/notifications" class="admin-btn btn-purple"><i class="adminlib-eye"></i> View all notifications</a></div></div> -->
                            </li>
                            <li id="fullscreenToggle">
                                <div class="adminlib-icon adminlib-crop-free"></div>
                            </li>

                            <li class="dropdown login-user">
                                <div class="avatar-wrapper">
                                    <i class="adminlib-icon adminlib-person"></i>
                                </div>
                                <div class="dropdown-menu">

                                    <div class="dropdown-header">
                                        <div class="user-card">
                                            <div class="user-avatar">
                                                <?php echo get_avatar( $user->ID, 48 ); ?>
                                            </div>
                                            <div class="user-info">
                                                <span
                                                    class="user-name"><?php echo esc_html( $user->display_name ); ?></span>
                                                <span
                                                    class="user-email"><?php echo esc_html( $user->user_email ); ?></span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="dropdown-body">
                                        <ul>
                                            <li>
                                                <a href="#">
                                                    <i class="adminlib-person"></i>
                                                    My Profile
                                                </a>
                                            </li>

                                            <li>
                                                <a href="#">
                                                    <i class="adminlib-setting"></i>
                                                    Account Setting
                                                </a>
                                            </li>
                                        </ul>
                                    </div>

                                    <?php if ( ! empty( $available_stores ) ) : ?>
                                        <div class="dropdown-header">
                                            <h3><i class="adminlib-switch-store"></i>Switch stores</h3>
                                        </div>

                                        <div class="store-wrapper">
                                            <ul>
                                                <?php
                                                foreach ( $available_stores as $store_id ) :
                                                    $store = Store::get_store_by_id( $store_id );
                                                    ?>
                                                    <li>
                                                        <a href="javascript:void(0);" class="switch-store"
                                                            data-store-id="<?php echo esc_attr( $store_id ); ?>">
                                                            <i class="adminlib-storefront"></i>
                                                            <?php echo esc_html( $store->get( 'name' ) ); ?>
                                                        </a>
                                                    </li>
                                                <?php endforeach; ?>
                                            </ul>
                                        </div>
                                    <?php endif; ?>

                                    <div class="footer">
                                        <a class="admin-btn btn-red"
                                            href="<?php echo esc_url( wp_logout_url( get_permalink( (int) MultiVendorX()->setting->get_setting( 'store_dashboard_page' ) ) ) ); ?>">
                                            <i class="adminlib-import"></i>
                                            <?php echo esc_html__( 'Sign Out', 'multivendorx' ); ?>
                                        </a>
                                    </div>
                                </div>
                            </li>

                        </ul>
                    </div>
                </div>
            </div>

            <div class="content-wrapper" id="<?php echo $page_info['id'] ? esc_attr( $page_info['id'] ) : ''; ?>">
                <?php if ( ! empty( $page_info['error_msg'] ) ) { ?>
                    <div class="permission-wrapper">
                        <i class="adminlib-info red"></i>
                        <div class="title"><?php echo wp_kses_post( $page_info['error_msg'] ); ?></div>
                        <div class="admin-btn btn-purple"><?php echo esc_html__( 'Contact Admin', 'multivendorx' ); ?></div>
                    </div>

                <?php } else { ?>
                    <?php
                    if ( ! empty( $page_info['content'] ) ) {
                        echo wp_kses_post( $page_info['content'] );
                    }                    
                    ?>
                <?php } ?>
            </div>

        </div>
    </div>
    <?php wp_footer(); ?>
</body>

</html>