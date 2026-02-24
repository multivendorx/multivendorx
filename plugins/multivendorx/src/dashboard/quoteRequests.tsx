import { __ } from '@wordpress/i18n';
import { Analytics, Column, Container, NavigatorHeader } from 'zyra';

const QuoteRequests = () => {
    const overviewData = [
        {
            icon: "submission-message",
            number: "1",
            text: __("Total Quotes", "multivendorx-pro"),
            iconClass: "primary",
        },
        {
            icon: "publish",
            number: "0",
            text: __("Pending", "multivendorx-pro"),
            iconClass: "green",
        },
        {
            icon: "save",
            number: "1",
            text: __("Approved", "multivendorx-pro"),
            iconClass: "orange",
        },
        {
            icon: "publish",
            number: "0",
            text: __("Rejected", "multivendorx-pro"),
            iconClass: "green",
        },
    ];
    return (
        <>
            <NavigatorHeader
                headerTitle={__('Quote Requests', 'multivendorx-pro')}
                headerDescription={__('Manage customer quote requests and rental inquiriesManage your rental inventory items', 'multivendorx-pro')}
            />

            <Container general>
                <Column>
                    <Analytics data={overviewData} />
                </Column>
            </Container>
        </>
    );
};

export default QuoteRequests;
