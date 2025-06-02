import React from "react";
import { __ } from "@wordpress/i18n";
import { ProPopup } from "zyra";

const proPopupContent = {
    proUrl: typeof appLocalizer !== "undefined" ? appLocalizer.shop_url : "#",
    title: __(
        "Boost to MooWoodle Pro to access premium features!",
        "moowoodle"
    ),
    messages: [
        __(
            "Convenient Single Sign-On for Moodle™ and WordPress Login.",
            "moowoodle"
        ),
        __("Create steady income through course subscriptions.", "moowoodle"),
        __(
            "Increase earnings by offering courses in groups, variations, or individually.",
            "moowoodle"
        ),
        __("Select and sync courses with flexibility.", "moowoodle"),
        __("Easily synchronize courses in bulk.", "moowoodle"),
        __(
            "Seamless, One-Password Access to Moodle™ and WordPress.",
            "moowoodle"
        ),
        __("Choose which user information to synchronize.", "moowoodle"),
        __(
            "Automatic User Synchronization for Moodle™ and WordPress.",
            "moowoodle"
        ),
    ],
};

const ShowProPopup: React.FC = () => {
    return <ProPopup {...proPopupContent} />;
};

export default ShowProPopup;
