import { useState } from 'react';
import {
    Column,
    Container,
    NavigatorHeader,
    ComponentStatusView,
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
                    product && (<span><b>{__('Product:', 'catalogx')}</b> {product}</span>),
                    category && (<span><b>{__('Category:', 'catalogx')}</b> {category}</span>),
                    brand && (<span><b>{__('Brand:', 'catalogx')}</b> {brand}</span>),
                ].filter(Boolean);

                return (
                    <>
                        {lines.map((item: string, index: number) => (item))}
                    </>
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
                    user && (<span><b>{__('User:', 'catalogx')}</b> {user}</span>),
                    role && (<span><b>{__('Role:', 'catalogx')}</b> {role}</span>),
                ].filter(Boolean);

                return (
                    <> {lines.map((item: string, index: number) => (item))} </>
                );
            }
        },
        discount: {
            label: __('Rule', 'catalogx'),
            render: (row: any) => {
                const amount = row.amount ?? 0;
                const quantity = Number(row.quantity);

                const price =
                    row.type === 'percentage'
                        ? `${amount} Percent`
                        : `${amount} ${appLocalizer.currency}`;

                return `${price} for min ${quantity || ''} quantity`;
            }
        },

        status: {
            label: __('Status', 'catalogx'),
            render: (row: RuleRow) =>
                String(row.active) === '1'
                    ? <span className='admin-badge green'>{__('Active', 'catalogx')} </span>
                    : <span className='admin-badge red'>{__('Suspended', 'catalogx')} </span>,
        },
        action: {
            type: 'action',
            label: __('Action', 'catalogx'),
            actions: [
                {
                    label: (row: any) =>
                        row.active === '1'
                            ? __('Suspend', 'catalogx')
                            : __('Activate', 'catalogx'),
                    icon: 'refresh',
                },
                {
                    label: __('Edit', 'catalogx'),
                    icon: 'edit',
                },
                {
                    label: __('Delete', 'catalogx'),
                    icon: 'delete',
                },
            ],
        },
    };
    
    const filters = [
        {
            key: 'applicable_for',
            label: __('Applicable For', 'catalogx'),
            type: 'select',
            options: [
                { label: __('All', 'catalogx'), value: '' },
                { label: __('Product', 'catalogx'), value: 'product' },
                { label: __('Category', 'catalogx'), value: 'category' },
                { label: __('Brand', 'catalogx'), value: 'brand' },
            ],
        },
        {
            key: 'for_whom',
            label: __('For Whom', 'catalogx'),
            type: 'select',
            options: [
                { label: __('All', 'catalogx'), value: '' },
                { label: __('User', 'catalogx'), value: 'user' },
                { label: __('Role', 'catalogx'), value: 'role' },
            ],
        },
    ];

    const defaultTableProps = {
        headers,
        showMenu: false,
        filters,
        rows: dummyRules,
        totalRows: dummyRules.length,
        onRowReorder: () => {},
    };

    tableProps = applyFilters(
        'catalogx_rules_table_props',
        defaultTableProps
    );

    const renderTableContent = () => {
        if (!appLocalizer.khali_dabba) {
            return (
                <div onClick={() => setopenPopup(true)}>
                    <TableCard {...tableProps} />
                </div>
            );
        }

        if (!appLocalizer.active_modules.includes('rules')) {
            return (
                <ComponentStatusView
                    title={__(
                        'Looks like product rules aren’t set up yet!',
                        'catalogx'
                    )}
                    desc={__(
                        'Enable the Rules module to create and manage custom catalog rules for your products.',
                        'catalogx'
                    )}
                    buttonText={__('Enable Now', 'catalogx')}
                    buttonLink={`${appLocalizer.admin_url}#&tab=modules&module=rules`}
                />
            );
        }

        return (
            <>
                <TableCard {...tableProps} />
                {tableProps.popup}
            </>
        );
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
                    {!appLocalizer.khali_dabba ? (
                        <ShowProPopup />
                    ) : (
                        <ShowProPopup moduleName="rules" />
                    )}
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
                            } else {
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
                    {renderTableContent()}
                </Column>
            </Container>
        </div>
    );
};

export default Rules;
