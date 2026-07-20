import { registerBlockType } from '@wordpress/blocks';
import {
    InspectorControls,
    useBlockProps,
} from '@wordpress/block-editor';
import {
    PanelBody,
    CheckboxControl,
} from '@wordpress/components';

import DummyExcludedProducts from './DummyExcludedProducts';

const OPTIONS = [
    { label: 'Products', value: 'products' },
    { label: 'Categories', value: 'categories' },
    { label: 'Tags', value: 'tags' },
    { label: 'Brands', value: 'brands' },
];

const EditBlock = ({ attributes, setAttributes }) => {
    const { includeTypes = [] } = attributes;

    const handleChange = (value, checked) => {
        const updated = checked
            ? [...includeTypes, value]
            : includeTypes.filter((item) => item !== value);

        setAttributes({
            includeTypes: updated,
        });
    };

    return (
        <>
            <InspectorControls>
                <PanelBody title="Excluded Products" initialOpen={true}>
                    {OPTIONS.map((option) => (
                        <CheckboxControl
                            key={option.value}
                            label={option.label}
                            checked={includeTypes.includes(option.value)}
                            onChange={(checked) =>
                                handleChange(option.value, checked)
                            }
                        />
                    ))}
                </PanelBody>
            </InspectorControls>

            <div {...useBlockProps()}>
                <DummyExcludedProducts />
            </div>
        </>
    );
};

registerBlockType('catalogx/excluded-products', {
    apiVersion: 2,
    title: 'Excluded Products',
    icon: 'products',
    category: 'catalogx',
    supports: {
        html: false,
    },
    attributes: {
        includeTypes: {
            type: 'array',
            default: [],
        },
    },
    edit: EditBlock,
    save({ attributes }) {
        return (
            <div
                id="catalogx-excluded-products"
                data-attributes={JSON.stringify(attributes)}
            />
        );
    },
});