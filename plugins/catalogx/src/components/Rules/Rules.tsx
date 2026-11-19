import { useState } from 'react';
import {
    ColumnComponent,
    ContainerComponent,
    NavigatorHeaderComponent,
    InformationItemComponent
} from '@zyra/components';
import { TableCard } from '@zyra/table';
import { type ProFeature, ProPopupDialog } from '../Popup/Popup';
import ListGate from '../Popup/ListGate';
import useNoRecordsYet from '../Popup/useNoRecordsYet';
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

/** This page, as the Pro card and the Pro popup name it. */
const FEATURE: ProFeature = {
    title: __('Dynamic Pricing Rules', 'catalogx'),
    description: __(
        'Set prices by role, customer, product, category or quantity, and order the rules by priority.',
        'catalogx'
    ),
    icon: 'rules',
};

const Rules = () => {
    const [openPopup, setopenPopup] = useState(false);
    let tableProps: any = {};
    const headers = {
        order_id: {
            label: __('Name', 'catalogx'),
            render: (row) => (
                <InformationItemComponent
                    title={`${row.name}`}
                    badges={[
                        {
                            text: String(row.active) === '1'
                                ? __('Active', 'catalogx')
                                : __('Suspended', 'catalogx'),
                            className: `badge-${String(row.active) === '1' ? 'active' : 'suspended'}`,
                        },
                    ]}
                />
            ),
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
                        {lines.map((item: string, _index: number) => (item))}
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
                    <> {lines.map((item: string, _index: number) => (item))} </>
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
        onRowReorder: () => { },
    };

    const { props: filteredProps, hasNoRecords } = useNoRecordsYet(
        applyFilters(
            'catalogx_rules_table_props',
            defaultTableProps
        ) as typeof defaultTableProps & Record<string, any>
    );
    tableProps = filteredProps;

    /** The sample rows drawn behind every card: the plugin's own, never the filtered (real) props. */
    const sampleTable = (
        <TableCard
            {...defaultTableProps}
            rows={dummyRules.slice(0, 4)}
            totalRows={Math.min(4, dummyRules.length)}
        />
    );

    return (
        <>
            {openPopup && (
                <ProPopupDialog onClose={() => setopenPopup(false)} feature={FEATURE} moduleName="rules" />
            )}
            <NavigatorHeaderComponent
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
                                setopenPopup(true);
                            }
                        },
                    },
                ]}
            />
            {tableProps.addingNewRule && (
                tableProps.addNewRuleForm
            )}
            <ContainerComponent general>
                <ColumnComponent>
                    <ListGate
                        feature={FEATURE}
                        module={{ id: 'rules', name: __('Rules', 'catalogx') }}
                        sample={sampleTable}
                        isEmpty={hasNoRecords && !tableProps.addingNewRule}
                        empty={{
                            heading: __('No pricing rules yet', 'catalogx'),
                            description: __(
                                'A rule changes the price for a role, a customer, a product, a category or a quantity. Add the first one to start.',
                                'catalogx'
                            ),
                            actions: tableProps?.setAddingNewRule ? (
                                <button
                                    type="button"
                                    className="cx-locked-button"
                                    onClick={() =>
                                        tableProps.setAddingNewRule(true)
                                    }
                                >
                                    {__('Add the first rule', 'catalogx')}
                                </button>
                            ) : null,
                            note: __(
                                'A preview with sample rules. Yours show here once you add them.',
                                'catalogx'
                            ),
                        }}
                    >
                        <TableCard {...tableProps} />
                        {tableProps.popup}
                    </ListGate>
                </ColumnComponent>
            </ContainerComponent>
        </>
    );
};

export default Rules;
