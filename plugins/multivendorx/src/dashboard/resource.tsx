import React, { useState, useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { AdminButtonUI, Analytics, Column, Container, FormGroup, FormGroupWrapper, NavigatorHeader, PopupUI, SelectInputUI, ToggleSettingUI } from 'zyra';

const Resource = () => {
    const [AddResource, setAddResource] = useState(false);
    const overviewData = [
        {
            icon: "booking1",
            number: "8",
            text: __("Total Resources", "multivendorx-pro"),
            iconClass: "primary",
        },
        {
            icon: "booking",
            number: "5",
            text: __("Available", "multivendorx-pro"),
            iconClass: "green",
        },
        {
            icon: "pending",
            number: "2",
            text: __("In Use", "multivendorx-pro"),
            iconClass: "orange",
        },
        {
            icon: "user-circle",
            number: "1",
            text: __("Maintenance", "multivendorx-pro"),
            iconClass: "red",
        },
    ];
    return (
        <>
            <NavigatorHeader
                headerTitle={__('Resources Management', 'multivendorx-pro')}
                headerDescription={__('Manage and organize your resources and parent products', 'multivendorx-pro')}
                buttons={[
                    {
                        label: __('Export', 'multivendorx-pro'),
                        icon: 'export',
                        // onClick: () => { setAddResource(true); },
                        color: 'purple'
                    },
                    {
                        label: __('Add Resource', 'multivendorx-pro'),
                        icon: 'plus',
                        onClick: () => { setAddResource(true); },
                    },
                ]}
            />

            <Container general>
                <Column>
                    <Analytics
                        data={overviewData}
                    />
                </Column>
            </Container>

            {AddResource && (
                <PopupUI
                    open={AddResource}
                    onClose={() => setAddResource(false)}
                    width={37}
                    height="85%"
                    header={{
                        icon: 'coupon',
                        title: __('Add Resource', 'multivendorx-pro'),
                        description: __(
                            'You can create a new booking for a customer here. This form will create a booking for the user, and optionally an associated order.',
                            'multivendorx-pro'
                        ),
                    }}
                    footer={
                        <AdminButtonUI
                            buttons={[
                                {
                                    icon: 'contact-form',
                                    text: __('Cancel', 'multivendorx-pro'),
                                    color: 'red',
                                },
                                {
                                    icon: 'save',
                                    text: __('Create Resources', 'multivendorx-pro'),
                                },
                            ]}
                        />
                    }
                >
                    <>
                        
                    </>
                </PopupUI>
            )}
        </>
    );
};

export default Resource;
