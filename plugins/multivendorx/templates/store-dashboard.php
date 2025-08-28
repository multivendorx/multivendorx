<?php

$all_endpoints = MultiVendorX()->rest->dashboard->all_endpoints();
$current_user = wp_get_current_user();
$role = reset($current_user->roles);
$capability_settings = MultiVendorX()->setting->get_setting($role);

if (get_option('permalink_structure')) {
    $current_page = get_query_var('dashboard_page');
    $current_sub = get_query_var('dashboard_subpage');
} else {
    $current_page = filter_input(INPUT_GET, 'dashboard_page', FILTER_SANITIZE_STRING);
    $current_sub = filter_input(INPUT_GET, 'dashboard_subpage', FILTER_SANITIZE_STRING);
}

function get_endpoint_url($page = '', $sub = '')
{
    if (get_option('permalink_structure')) {
        $url = home_url('/dashboard');
        if ($page && $page !== 'dashboard') {
            $url .= '/' . $page;
        }
        if ($sub) {
            $url .= '/' . $sub;
        }
    } else {
        $url = add_query_arg(array('dashboard' => '1'), home_url('/'));
        if ($page && $page !== 'dashboard') {
            $url = add_query_arg('dashboard_page', $page, $url);
        }
        if ($sub) {
            $url = add_query_arg('dashboard_subpage', $sub, $url);
        }
    }
    return esc_url($url);
}

if (empty($current_page)) {
    $current_page = 'dashboard';
}

// Auto-redirect if submenu exists
if ($current_page && empty($current_sub)) {
    foreach ($all_endpoints as $section) {
        if ($section['slug'] === $current_page && !empty($section['submenu'])) {
            $first_sub = $section['submenu'][0]['slug'];
            wp_safe_redirect(get_endpoint_url($current_page, $first_sub));
            exit;
        }
    }
}

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>

<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
    <div id="store-dashboard">
        <div class="dashboard-tabs-wrapper">
            <div class="logo-wrapper">
                <img src="https://multivendorx.com/wp-content/uploads/2025/06/multivendorx-logo-180x40.png" alt="">
                <i class='adminlib-menu'></i>
            </div>

            <ul class="dashboard-tabs">
                <?php foreach ($all_endpoints as $section): ?>
                    <li
                        class="tab-name <?php echo ($current_page === $section['slug'] && empty($current_sub)) ? 'active' : ''; ?>">
                        <?php if (!empty($section['submenu'])): ?>
                            <a href="#" class="tab" onclick="return false;">
                                <i class="<?php echo esc_html($section['iocn']); ?>"></i>
                                <?php echo esc_html($section['name']); ?>
                            </a>
                        <?php else: ?>
                            <a class="tab" href="<?php echo esc_url(get_endpoint_url($section['slug'])); ?>">
                                <i class="<?php echo esc_html($section['icon']); ?>"></i>
                                <?php echo esc_html($section['name']); ?>
                            </a>
                        <?php endif; ?>
                        <i class="admin-arrow adminlib-pagination-right-arrow"></i>
                    </li>

                    <?php if (!empty($section['submenu'])): ?>
                        <ul class="subtabs">
                            <?php foreach ($section['submenu'] as $submenu): ?>
                                <li
                                    class="<?php echo ($current_page === $section['slug'] && $current_sub === $submenu['slug']) ? 'active' : ''; ?>">
                                    <a href="<?php echo esc_url(get_endpoint_url($section['slug'], $submenu['slug'])); ?>">
                                        <?php echo esc_html($submenu['name']); ?>
                                    </a>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    <?php endif; ?>
                <?php endforeach; ?>
            </ul>
        </div>

        <div class="dashboard-content tab-wrapper">

            <div class="top-navbar">
                <div class="navbar-leftside">
                </div>
                <div class="navbar-rightside">
                    <ul class="navbar-right">
                        <li>
                            <div class="adminlib-icon adminlib-vendor-form-add"></div>
                        </li>
                        <li>
                            <div class="adminlib-icon adminlib-alarm"></div>
                        </li>
                        <li>
                            <div class="adminlib-icon adminlib-crop-free"></div>
                        </li>
                        <li>
                            <div class="adminlib-icon adminlib-contact-form"></div>
                        </li>


                        <li class="dropdown login-user">
                            <a href="" class="dropdown-toggle">
                                <div class="avatar-wrapper">
                                    <i class="adminlib-person"></i>
                                </div>
                            </a>
                            <div class="dropdown-menu">

                                <div class="dropdown-header">
                                    <div class="user-card">
                                        <div class="user-avatar">
                                            <span>MS</span>
                                        </div>
                                        <div class="user-info">
                                            <span class="user-name">Max Smith </span>
                                            <span class="user-email">maxsmith@gmail.com </span>
                                        </div>
                                    </div>
                                </div>

                                <div class="dropdown-body">
                                    <ul>
                                        <li>
                                            <a href="#">
                                                <i class="adminlib-person"></i>
                                                View Profile
                                            </a>
                                        </li>

                                        <li>
                                            <a href="#">
                                                <i class="adminlib-user-network-icon"></i>
                                                Account Setting
                                            </a>
                                        </li>

                                        <li>
                                            <a href="#">
                                                <i class="adminlib-user-network-icon"></i>
                                                WordPress backend
                                            </a>
                                        </li>

                                        <li>
                                            <a href="#">
                                                <i class="adminlib-setting-1"></i>
                                                Storefront
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                <div class="store-wrapper">
                                        <h3>Switch accounts</h3>
                                        <ul>
                                            <li>
                                                <a href="#">
                                                    <i class="adminlib-person"></i>
                                                    View Profile
                                                </a>
                                            </li>

                                            <li>
                                                <a href="#">
                                                    <i class="adminlib-user-network-icon"></i>
                                                    Account Setting
                                                </a>
                                            </li>

                                            <li>
                                                <a href="#">
                                                    <i class="adminlib-user-network-icon"></i>
                                                    WordPress backend
                                                </a>
                                            </li>

                                            <li>
                                                <a href="#">
                                                    <i class="adminlib-user-network-icon"></i>
                                                    WordPress backend
                                                </a>
                                            </li>

                                            <li>
                                                <a href="#">
                                                    <i class="adminlib-user-network-icon"></i>
                                                    WordPress backend
                                                </a>
                                            </li>
                                        </ul>
                                    </div>

                                <div class="dropdown-footer">
                                    <ul>
                                        <li>
                                            <a href="#">
                                                <i class="adminlib-import"></i>
                                                Sign Out
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </li>

                    </ul>
                </div>

            </div>
            <?php
            $div_id = '';
            $allowed = true;

            if ($current_page) {
                foreach ($all_endpoints as $key => $section) {
                    if ($section['slug'] === $current_page) {
                        if (!empty($section['capability'])) {
                            $allowed = false;

                            foreach ($section['capability'] as $cap) {
                                if (current_user_can($cap) && in_array($cap, $capability_settings, true)) {
                                    $allowed = true;
                                    break;
                                }
                            }
                        }

                        if ($current_sub && !empty($section['submenu'])) {
                            foreach ($section['submenu'] as $submenu) {
                                if ($submenu['slug'] === $current_sub) {
                                    if (!empty($submenu['capability'])) {
                                        $allowed = false;

                                        foreach ($submenu['capability'] as $cap) {
                                            if (current_user_can($cap) && in_array($cap, $capability_settings, true)) {
                                                $allowed = true;
                                                break;
                                            }
                                        }
                                    }
                                    $div_id = $submenu['key'];
                                    break;
                                }
                            }
                        } else {
                            $div_id = $key;
                        }
                        break;
                    }
                }

                if ($div_id) {
                    if ($allowed) {
                        $template_file = plugin_dir_path(__FILE__) . $div_id . '.php';
                        if (file_exists($template_file)) {
                            MultiVendorX()->util->get_template('add-product.php');
                        } else {
                            ?>
                            <div class="dashboard1 content-wrapper" id="<?php echo esc_attr($div_id) ?>"><?php echo esc_attr($div_id) ?>
                            </div><?php
                        }
                    } else {
                        echo '<div>You do not have permission to access this section.</div>';
                    }
                }
            }
            ?>
        </div>
    </div>
    <?php wp_footer(); ?>
</body>

</html>