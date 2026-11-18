jQuery(function ($) {
    $(document).on(
        'click',
        '.catalogx-vulomail-notice .notice-dismiss',
        function () {
            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: catalogxAdminNotices.action,
                    nonce: catalogxAdminNotices.nonce
                }
            });
        }
    );
});