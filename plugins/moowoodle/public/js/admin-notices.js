
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
                    nonce: moowoodleAdminNotices.nonce
                }
            });
        }
    );
});
