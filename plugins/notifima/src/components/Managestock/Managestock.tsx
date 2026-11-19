/* global appLocalizer */
import { MultiCheckboxInput } from '@zyra/inputs';
import {
    ColumnComponent,
    ContainerComponent,
    InformationItemComponent,
    NavigatorHeaderComponent,
} from '@zyra/components';
import PreviewTable from '../Popup/PreviewTable';
import { __ } from '@wordpress/i18n';
import { defaultCategoryCounts, dummyProducts } from './ManagestockUtil';


/** No-op handler for the sample rows' controls: LockedPreview makes the sample inert. */
const noop = () => undefined;

/** The sample rows drawn behind a preview card: a few, as the preview fades out below them. */
const SAMPLE_ROWS = dummyProducts.slice(0, 4);

const Managestock = () => {
    const headers = {
        product: {
            label: __('Product', 'notifima'),
            width: '35%',
            render: (row) => (
                <InformationItemComponent
                    title={row.name}
                    avatar={{
                        iconClass: 'single-product',
                    }}
                    descriptions={[
                        {
                            label: __('SKU', 'notifima'),
                            value: row.sku || '—',
                        },
                    ]}
                    badges={[
                        {
                            text: row.type,
                            className: `badge-${row.type?.toLowerCase()}`,
                        },
                        {
                            className: 'blue',
                            text: `${row.subscriber_no || 0} ${row.subscriber_no === 1 ? 'Subscriber' : 'Subscribers'
                                }`,
                        },
                    ]}
                />
            ),
        },

        // Same four columns as Notifima Pro's table (Headers.tsx), so the preview matches what Pro unlocks.
        price: {
            label: __('Price', 'notifima'),
            render: (row) =>
                row.sale_price ? (
                    <>
                        <del>{row.regular_price}</del> <span>{row.sale_price}</span>
                    </>
                ) : (
                    <span>{row.regular_price || '—'}</span>
                ),
        },
        stock: {
            label: __('Stock', 'notifima'),
            render: (row) => (
                <div className="nf-cell-stack">
                    <div className="nf-cell-line">
                        <span className="nf-cell-label">
                            {__('Track', 'notifima')}
                        </span>
                        <MultiCheckboxInput
                            look="toggle"
                            modules={[]}
                            options={[
                                {
                                    key: `enabled-${row.id}`,
                                    value: 'enabled',
                                },
                            ]}
                            value={row.manage_stock ? ['enabled'] : []}
                            onChange={noop}
                        />
                    </div>
                    {row.manage_stock && (
                        <>
                            <div className="nf-cell-line">
                                <span className="nf-cell-label">
                                    {__('Qty', 'notifima')}
                                </span>
                                <span>{row.stock_quantity ?? 0}</span>
                            </div>
                            <div className="nf-cell-line">
                                <span className="nf-cell-label">
                                    {__('Backorders', 'notifima')}
                                </span>
                                <span>{row.backorders}</span>
                            </div>
                        </>
                    )}
                </div>
            ),
        },
        status: {
            label: __('Availability', 'notifima'),
            type: 'status',
            statusClass: (row) => `${row.status_class}`
        },
    };

    const buttonActions = [
        {
            label: __('Download CSV', 'notifima'),
            icon: 'download',
            onClickWithQuery: noop,
        },
    ];

    const filters = [
        {
            key: 'product_type',
            label: __('Select Product Type', 'notifima'),
            type: 'select',
            options: [
                {
                    label: __('Simple', 'notifima'),
                    value: 'simple',
                },
                {
                    label: __('Variable', 'notifima'),
                    value: 'variable',
                },
            ],
        },
    ];

    const defaultTableProps = {
        headers,
        buttonActions,
        categoryCounts: defaultCategoryCounts,
        filters,
        expandable: true,
        expandText: __('View variations', 'notifima'),
        expandedText: __('Viewing', 'notifima'),
        search: {
            placeholder: __('Search...', 'notifima'),
            size: 8,
            options: [
                {
                    label: __('Select', 'notifima'),
                    value: '',
                },
                {
                    label: __('Product Name', 'notifima'),
                    value: 'name',
                },
                {
                    label: __('SKU', 'notifima'),
                    value: 'sku',
                },
            ],
        },
        rows: dummyProducts,
        totalRows: dummyProducts.length,
    };

    const previewTable = (
        <PreviewTable
            defaultTableProps={defaultTableProps}
            filterHook="notifima_manage_stock_table_props"
            sampleRows={SAMPLE_ROWS}
            proFeature={{
                title: __('Manage Stock', 'notifima'),
                description: __(
                    'Edit stock, prices and backorders for every product and variation in one table, and import or export it as a CSV.',
                    'notifima'
                ),
                icon: 'store-analytics',
            }}
            empty={{
                feature: {
                    title: __('Manage Stock', 'notifima'),
                    description: __(
                        'Every WooCommerce product and variation shows here, with its stock, prices and how many shoppers are waiting for it.',
                        'notifima'
                    ),
                    icon: 'store-analytics',
                },
                heading: __('No products yet', 'notifima'),
                actions: (
                    <a
                        className="nf-locked-button"
                        href={`${appLocalizer.admin_url}post-new.php?post_type=product`}
                    >
                        {__('Add a product', 'notifima')}
                    </a>
                ),
                note: __(
                    'A preview with sample products. Yours show here once you add them.',
                    'notifima'
                ),
            }}
        />
    );

    return (
        <>
            <NavigatorHeaderComponent
                headerIcon="store-analytics"
                headerDescription={__(
                    'Manage product inventory, monitor stock availability, and update stock settings for simple and variable products.',
                    'notifima'
                )}
                headerTitle={__('Manage Stock', 'notifima')}
                buttons={headerButtons}
            />
            <ContainerComponent general>
                <ColumnComponent>
                    {previewTable}
                </ColumnComponent>
            </ContainerComponent>
        </>
    );
};

export default Managestock;