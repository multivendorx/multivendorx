import { __ } from '@wordpress/i18n';
import { Analytics, Column, Container, NavigatorHeader } from 'zyra';

const AllInventory = () => {
    const overviewData = [
        {
            icon: "submission-message",
            number: "1",
            text: __("Total Inventories", "multivendorx-pro"),
            iconClass: "primary",
        },
        {
            icon: "publish",
            number: "0",
            text: __("Published", "multivendorx-pro"),
            iconClass: "green",
        },
        {
            icon: "save",
            number: "1",
            text: __("Drafts", "multivendorx-pro"),
            iconClass: "orange",
        },
    ];
    return (
        <>
            <NavigatorHeader
                headerTitle={__('Inventories', 'multivendorx-pro')}
                headerDescription={__('Manage your rental inventory items', 'multivendorx-pro')}
                buttons={[
                    {
                        label: __('Add New Inventory', 'multivendorx-pro'),
                        icon: 'plus',
                    },
                ]}
            />

            <Container general>
                <Column>
                    <Analytics data={overviewData} />
                </Column>
            </Container>
        </>
    );
};

export default AllInventory;
