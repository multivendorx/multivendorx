jQuery(function ($) {
    $(document).on(
        'click',
        '.notifima-vulomail-notice .notice-dismiss',
        function () {
            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: notifimaAdminNotices.action,
                    nonce: notifimaAdminNotices.nonce
                }
            });
        }
    );
});