/* global dashboard */
jQuery(document).ready(function ($) {
    $(document).on('click', '.switch-store', function (e) {
        e.preventDefault();

        const storeId = $(this).data('store-id');

        $.post(dashboard.ajaxurl, {
            action: 'switch_store',
            store_id: storeId
        }, function (response) {
            if (response.success) {
                window.location.href = response.data.redirect;
            }
        });
    });

    // dashboard sub menu show hide start
    const $allSubtabs = $(".dashboard-tabs .subtabs");
    const $allTabNames = $(".dashboard-tabs .tab-name");
    const $allArrows = $(".dashboard-tabs .admin-arrow");

    // 1️⃣ Hide all subtabs on load
    $allSubtabs.hide();

    // 2️⃣ If a tab-name is active, show its submenu
    $allTabNames.each(function () {
        if ($(this).hasClass("active")) {
            $(this).children(".subtabs").show();
            $(this).find(".admin-arrow").addClass("rotate");
        }
    });

    // 3️⃣ If a submenu item is active, open its parent submenu
    $(".dashboard-tabs .subtabs li.active").each(function () {
        const $subtab = $(this).closest(".subtabs");
        $subtab.show();
        $subtab.prev(".tab").find(".admin-arrow").addClass("rotate");
    });

    // 4️⃣ Toggle submenu on tab click
    $(".dashboard-tabs .tab").on("click", function (e) {
        const $arrow = $(this).find(".admin-arrow.adminlib-pagination-right-arrow");
        const $submenu = $(this).next(".subtabs");

        if ($arrow.length) {
            e.preventDefault();

            // Close other open subtabs & reset arrows
            $allSubtabs.not($submenu).slideUp(200);
            $allArrows.not($arrow).removeClass("rotate");

            // Toggle submenu and arrow
            $submenu.slideToggle(200);
            $arrow.toggleClass("rotate");
        }
    });// dashboard sub menu show hide end

    // my acoount start
    const $dropdown = $(".login-user .dropdown-menu");
    const $avatar = $(".login-user .avatar-wrapper");

    $dropdown.hide();
    $avatar.on("click", function (e) {
        e.stopPropagation();
        $dropdown.toggle();
    });
    $(document).on("click", function (e) {
        if (!$(e.target).closest(".login-user").length) {
            $dropdown.hide();
        }
    }); // my acoount start


    // Product Type tabs start
    $(".tab-titles .title").on("click", function () {
        const targetId = this.id.replace("-tab", "");
        $(".tab-titles .title").removeClass("active");
        $(this).addClass("active");

        $(".tab-content .tab-panel").hide();
        $("#" + targetId).show();

    });  // Product Type tabs end

});
