
jQuery(function ($) {
    $(document).on(
        'click',
        '.moowoodle-vulomail-notice .notice-dismiss',
        function () {
            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: moowoodleAdminNotices.action,
                    nonce: moowoodleAdminNotices.nonce,
                    notice_type: 'vulomail'
                }
            });
        }
    );
    $(document).on(
        'click',
        '.moowoodle-pro-update-notice',
        function () {
            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: moowoodleAdminNotices.action,
                    nonce: moowoodleAdminNotices.nonce,
                    notice_type: 'pro_update'
                }
            });
        }
    );
});
