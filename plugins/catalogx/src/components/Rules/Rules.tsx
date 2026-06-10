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
        name: {
            label: __('Name', 'catalogx'),
        },
        applicable_for: {
            label: __('Applicable For', 'catalogx'),
            render: (row: any) => {

                const getLabel = (list: any[], id: any, fallback: string) => {
                    if (id === '-1') return `All ${fallback}`;
                    if (!id) return null;

                    const found = list?.find(
                        (item: any) => String(item.value) === String(id)
                    );

                    return found?.label || id;
                };

                const product = getLabel(appLocalizer.products_data, row.product_id, 'Products');
                const category = getLabel(appLocalizer.all_product_categories, row.category_id, 'Categories');
                const brand = getLabel(appLocalizer.product_brands, row.brand_id, 'Brands');

                const lines = [
                    product && `Product: ${product}`,
                    category && `Category: ${category}`,
                    brand && `Brand: ${brand}`,
                ].filter(Boolean);

                return (
                    <div>
                        {lines.map((item: string, index: number) => (
                            <div key={index}>{item}</div>
                        ))}
                    </div>
                );
            }
        },
        for_whom: {
            label: __('For Whom', 'catalogx'),
            render: (row: any) => {

                const getLabel = (list: any[], id: any, fallback: string) => {
                    if (id === '-1') return `All ${fallback}`;
                    if (!id) return null;

                    const found = list?.find(
                        (item: any) => String(item.value) === String(id)
                    );

                    return found?.label || id;
                };

                const user = getLabel(appLocalizer.users_data, row.user_id, 'Users');
                const role = getLabel(appLocalizer.role_array, row.role_id, 'Roles');

                const lines = [
                    user && `User: ${user}`,
                    role && `Role: ${role}`,
                ].filter(Boolean);

                return (
                    <div >
                        {lines.map((item: string, index: number) => (
                            <div key={index}>{item}</div>
                        ))}
                    </div>
                );
            }
        },
        discount: {
            label: __('Rule', 'catalogx'),
            render: (row: any) => {
                const amount = row.amount ?? 0;
                const quantity = Number(row.quantity);
                return `${amount} ${appLocalizer.currency} for min ${quantity ? quantity : ''} quantity`;
            }
        },

        status: {
            label: __('Status', 'catalogx'),
            render: (row: RuleRow) =>
                String(row.active) === '1'
                    ? __('Active', 'catalogx')
                    : __('Suspended', 'catalogx'),
        },
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
                            }else{
                                setopenPopup(true)
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
