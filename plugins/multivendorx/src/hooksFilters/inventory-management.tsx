import InventoryView from "@/dashboard/InventoryView";
import { addFilter } from "@wordpress/hooks";
import { __ } from "@wordpress/i18n";

addFilter(
    'product_header_buttons',
    'multivendorx-pro/inventory-button',
    (buttons) => [
        ...buttons,
        {
            label: __('Inventory', 'multivendorx'),
            icon: 'archive',
            onClick: () => {
                const { origin } = window.location;

                let newPath;

                if (appLocalizer.permalink_structure) {
                    newPath = `/${appLocalizer.dashboard_slug}/products/inventory/`;
                } else {
                    newPath = `/?page_id=${appLocalizer.dashboard_page_id}&segment=products&element=inventory`;
                }

                window.history.pushState({}, '', origin + newPath);

                // Trigger React update
                window.dispatchEvent(new PopStateEvent('popstate'));
            },
        },
    ],
    20
);

addFilter(
    'multivendorx_product_extra_views',
    'multivendorx-pro/inventory-view',
    (output, element) => {
        const path = location.pathname;
        if (path.includes('/inventory/')) {
           return <InventoryView />;
        }
        return output;
    }
);
addFilter(
    'multivendorx_product_detect_view',
    'multivendorx-pro/inventory-detect',
    (detected, path) => {
        if (path.includes('/inventory/')) {
            return 'inventory';
        }

        return detected;
    }
);