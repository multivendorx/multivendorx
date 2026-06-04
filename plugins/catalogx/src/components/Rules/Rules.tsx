import { useState } from 'react';
import {
    Column,
    Container,
    InfoItem,
    NavigatorHeader,
    PopupUI,
    TableCard,
} from 'zyra';
import ShowProPopup from '../Popup/Popup';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import { dummyRules } from './RulesUtil';
export interface RuleRow {
    id?: number;
    name?: string;
    applicable_type?: 'Product' | 'Category' | 'Brand';
    applicable_value?: string;
    user_type?: 'User' | 'Role';
    user_value?: string;
    applicable_for?: string;
    for_whom?: string;
    discount?: string;
    quantity_enabled?: boolean;
    quantity?: string | number;
    status?: string;
    product_id?: number;
    category_id?: number;
    brand_id?: number;
    user_id?: number;
    role_id?: string;
    amount?: number;
    type?: 'fixed' | 'percentage';
    active?: number;
}

const Rules = () => {
    const [openPopup, setopenPopup] = useState(false);
    let tableProps: any = {};
    const headers = {
        name: { label: __('Name', 'catalogx'), render: (row: RuleRow) => <InfoItem title={row.name} /> },
        applicable_for: { label: __('Applicable For', 'catalogx') },
        for_whom: { label: __('For Whom', 'catalogx') },
        discount: { label: __('Discount', 'catalogx') },
        quantity: { label: __('Quantity', 'catalogx'), render: (row: RuleRow) => (row.quantity_enabled ? row.quantity : '-') },
        status: { label: __('Status', 'catalogx'), type: 'status', statusClass: (row: RuleRow) => String(row.status).toLowerCase() },
    };

    const defaultTableProps = {
        headers,

        rows: dummyRules,
        totalRows: dummyRules.length,
    };

    tableProps = applyFilters(
        'catalogx_rules_table_props',
        defaultTableProps
    );

    const handleTableWrapperClick = () => {
        if (!appLocalizer.khali_dabba) {
            setopenPopup(true);
        }
    };


    return (
        <div>
            {openPopup && (
                <PopupUI
                    position="lightbox"
                    open={openPopup}
                    onClose={() => setopenPopup(false)}
                    width={31.25}
                    height="auto"
                >
                    <ShowProPopup />
                </PopupUI>
            )}
            <NavigatorHeader
                headerIcon="rules"
                headerDescription={__(
                    'Create and manage rules to control product visibility, pricing behavior, and catalog conditions.',
                    'catalogx'
                )}
                headerTitle={__('Rules', 'catalogx')}
                buttons={[
                    {
                        label: __('Add New Rule', 'catalogx'),
                        icon: 'plus',
                        onClick: () => {
                            if (tableProps?.setAddingNewRule) {
                                tableProps.setAddingNewRule(true);
                            }
                        },
                    },
                ]}
            />
            {tableProps.addingNewRule && tableProps.addingNewRule && (
                tableProps.addNewRuleForm
            )}
            <Container general>
                <Column>
                    <div onClick={handleTableWrapperClick}>
                        <TableCard {...tableProps} />
                        {tableProps.popup}
                    </div>
                </Column>
            </Container>
        </div>
    );
};

export default Rules;
