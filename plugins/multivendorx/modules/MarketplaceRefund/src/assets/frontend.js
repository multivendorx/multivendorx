(function ($) {
    $(document).ready(function () {
        // Refund popup
        $("#multivendorx-myac-order-refund-wrap").hide();
        $("#multivendorx-myac-order-refund-wrap .cust-rr-other").hide();

        // Close refund popup
        $("#multivendorx-myac-order-refund-wrap .popup-close").on("click", function () {
            $("#multivendorx-myac-order-refund-wrap").fadeOut();
        });

        // Outside click
        $("#multivendorx-myac-order-refund-wrap").on("click", function (e) {
            if ($(e.target).is("#multivendorx-myac-order-refund-wrap")) {
                $("#multivendorx-myac-order-refund-wrap").fadeOut();
            }
        });

        $("#multivendorx-myac-order-refund-wrap .multivendorx-popup-content").on("click", function (e) {
            e.stopPropagation();
        });

        // Refund reason
        $("#multivendorx-myac-order-refund-wrap .refund_reason_option input").on("change", function () {
            var reason = $(
                "#multivendorx-myac-order-refund-wrap input[name='refund_reason_option']:checked"
            ).val();

            if (reason === "others") {
                $("#multivendorx-myac-order-refund-wrap .cust-rr-other").show();
            } else {
                $("#multivendorx-myac-order-refund-wrap .cust-rr-other").hide();
            }
        });

        // Open refund popup
        $("#cust-request-refund-btn").on("click", function (e) {
            e.preventDefault();
            $("#multivendorx-myac-order-refund-wrap").slideToggle();
        });


        // Return popup
        $("#multivendorx-myac-order-return-wrap").hide();
        $("#multivendorx-myac-order-return-wrap .cust-rr-other").hide();

        // Close return popup
        $("#multivendorx-myac-order-return-wrap .popup-close").on("click", function () {
            $("#multivendorx-myac-order-return-wrap").fadeOut();
        });

        // Outside click
        $("#multivendorx-myac-order-return-wrap").on("click", function (e) {
            if ($(e.target).is("#multivendorx-myac-order-return-wrap")) {
                $("#multivendorx-myac-order-return-wrap").fadeOut();
            }
        });

        $("#multivendorx-myac-order-return-wrap .multivendorx-popup-content").on("click", function (e) {
            e.stopPropagation();
        });

        // Return reason
        $("#multivendorx-myac-order-return-wrap .return_reason_option input").on("change", function () {
            var reason = $(
                "#multivendorx-myac-order-return-wrap input[name='return_reason_option']:checked"
            ).val();

            if (reason === "others") {
                $("#multivendorx-myac-order-return-wrap .cust-rr-other").show();
            } else {
                $("#multivendorx-myac-order-return-wrap .cust-rr-other").hide();
            }
        });

        // Open return popup
        $("#cust-request-return-btn").on("click", function (e) {
            e.preventDefault();
            $("#multivendorx-myac-order-return-wrap").slideToggle();
        });

    });
})(jQuery);