import { addFilter, applyFilters } from '@wordpress/hooks';
import {
	MultiCheckBoxUI,
	SelectInputUI,
	Card,
	BasicInputUI,
	FormGroup,
	FormGroupWrapper,
    ButtonInputUI,
} from 'zyra';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import axios from 'axios';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Attributes = ({ product, setProduct, productFields }) => {
    const [showAttributeSelect, setShowAttributeSelect] = useState(false);
    const [existingAttributes, setExistingAttributes] = useState([]);
    const [selectedAttribute, setSelectedAttribute] = useState(null);
    const [attribute, setAttribute] = useState([]);
    const [productAttributes, setProductAttributes] = useState([]);
    const [tempOptions, setTempOptions] = useState<Record<number, string>>({});

     useEffect(() => {
        if (!selectedAttribute || selectedAttribute.value === 0) return;

        const alreadyExists = attribute.some((v) => v.id === selectedAttribute.value);
        if (alreadyExists) return;

        axios
            .get(`${appLocalizer.apiUrl}/wc/v3/products/attributes/${selectedAttribute.value}/terms`, {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
            })
            .then((res) => {
                setAttribute((prev) => [
                    ...prev,
                    {
                        id: selectedAttribute.value,
                        name: selectedAttribute.label,
                        options: res.data.map((t: any) => t.name),
                        isEditing: true,
                    },
                ]);
            });
    }, [selectedAttribute]);

    useEffect(() => {
        axios
            .get(`${appLocalizer.apiUrl}/wc/v3/products/attributes`, {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
            })
            .then((res) => setExistingAttributes(res.data));
    }, []);

    useEffect(() => {
        if (!product) return;

        if (product.attributes && product.attributes.length > 0) {
            const formatted = product.attributes.map((attr: any) => ({
                id: attr.id || 0,
                name: attr.name,
                options: attr.options || [],
                isEditing: false,
            }));
            setAttribute(formatted);
            setProductAttributes(product.attributes);
        } else {
            setAttribute([]);
            setProductAttributes([]);
        }
    }, [product]);
     const addAttribute = () => {
        setAttribute((prev) => [...prev, { id: 0, name: '', options: [], isEditing: true }]);
    };
    const deleteAttribute = (vIndex: number) => {
        setAttribute((prev) => {
            const updated = prev.filter((_, i) => i !== vIndex);
            saveAttributesToServer(updated, false);
            return updated;
        });
    };
    const handleAddNewOption = (vIndex: number) => {
        const value = tempOptions[vIndex]?.trim();
        if (!value) return;
        setAttribute((prev) => {
            const updated = [...prev];
            updated[vIndex].options = [...updated[vIndex].options, value];
            return updated;
        });
        setTempOptions((prev) => ({ ...prev, [vIndex]: '' }));
    };
    const handleTempOptionChange = (vIndex: number, value: string) => {
        setTempOptions((prev) => ({ ...prev, [vIndex]: value }));
    };
    const saveEditAttribute = (vIndex: number, isEditing: boolean) => {
        setAttribute((prev) => {
            const updated = [...prev];
            updated[vIndex] = { ...updated[vIndex], isEditing };
            if (!isEditing) {
                // User clicked "Save" — persist and auto-generate variations
                saveAttributesToServer(updated, true);
            }
            return updated;
        });
    };
    const updateAttribute = (index: number, key: string, value: any) => {
        const updated = [...attribute];
        updated[index][key] = value;
        setAttribute(updated);
    };
     const deleteOption = (vIndex: number, oIndex: number) => {
        const updated = [...attribute];
        updated[vIndex].options = updated[vIndex].options.filter((_, i) => i !== oIndex);
        setAttribute(updated);
    };
    const generateVariationsFromAttributes = (formattedAttributes) => {
        if (!product?.id || !formattedAttributes?.length) return;

        const attributesWithOptions = formattedAttributes.filter((attr) => attr.options && attr.options.length > 0);
        if (!attributesWithOptions.length) return;

        const optionSets = attributesWithOptions.map((attr) =>
            attr.options.map((opt) => ({ id: attr.id, option: opt }))
        );

        const combinations = generateCombinations(optionSets);

        // Step 1: fetch all existing variations
        axios
            .get(`${appLocalizer.apiUrl}/wc/v3/products/${product.id}/variations`, {
                headers: { 'X-WP-Nonce': appLocalizer.nonce },
            })
            .then((res) => {
                const existingIds = res.data.map((v) => v.id);

                // Step 2: delete all existing variations sequentially
                const deleteChain = existingIds.reduce(
                    (chain, id) => chain.then(() => deleteOneVariation(id)),
                    Promise.resolve()
                );

                // Step 3: after all deleted, create fresh combinations
                deleteChain.then(() => {
                    const createChain = combinations.reduce(
                        (chain, combo) => chain.then(() => createOneVariation(combo)),
                        Promise.resolve()
                    );

                    // Step 4: refresh list when all created
                    createChain.then(() => fetchVariations());
                });
            })
            .catch(() => {
                // If fetching existing fails, just create all combos directly
                const createChain = combinations.reduce(
                    (chain, combo) => chain.then(() => createOneVariation(combo)),
                    Promise.resolve()
                );
                createChain.then(() => fetchVariations());
            });
    };
    const saveAttributesToServer = (updatedVariant: any[], autoGenerate: boolean) => {
        const formattedAttributes = updatedVariant.map((item) => ({
            id: item.id || 0,
            name: item.name,
            options: item.options,
            variation: true,
            visible: true,
        }));

        setProductAttributes(formattedAttributes);
        setProduct({ ...product, attributes: formattedAttributes });

        axios
            .post(
                `${appLocalizer.apiUrl}/wc/v3/products/${product.id}`,
                { attributes: formattedAttributes },
                { headers: { 'X-WP-Nonce': appLocalizer.nonce } }
            )
            .then(() => {
                if (autoGenerate) {
                    generateVariationsFromAttributes(formattedAttributes);
                }
            })
            .catch((err) => console.error('Attribute save error:', err));
    };
	return (
        <Card  title={ applyFilters( 'multivendorx_product_attributes_title', __( 'Attributes', 'multivendorx' ) ) } desc="lorem ipsum dolor sit amet lorem ipsum dolor sit amet ">
                {productFields.includes('attribute') && (
                    <>
                        <div className="variation-title-wrapper">
                            {__('Attributes', 'multivendorx')}
                            <div className="add-dropdown-wrapper">
                                {!showAttributeSelect && (
                                    <ButtonInputUI
                                        position="right"
                                        buttons={[
                                            {
                                                icon: 'plus',
                                                text: __('Add variants Like size or color', 'multivendorx'),
                                                color: 'purple',
                                                onClick: () => setShowAttributeSelect(true),
                                            },
                                        ]}
                                    />
                                )}

                                {showAttributeSelect && (
                                    <div className="search-field">
                                        <SelectInputUI
                                            name="attribute"
                                            type="single-select"
                                            size={12}
                                            options={existingAttributes.map((attr) => ({
                                                label: attr.name,
                                                value: attr.id,
                                            }))}
                                            value={selectedAttribute?.value}
                                            onChange={(selected) => {
                                                const match = existingAttributes.find((a) => a.id === selected);
                                                setSelectedAttribute({ label: match.name, value: match.id });
                                            }}
                                        />
                                        <ButtonInputUI
                                            position="right"
                                            buttons={[
                                                {
                                                    icon: 'plus',
                                                    text: __('Add New Attribute', 'multivendorx'),
                                                    color: 'purple',
                                                    onClick: addAttribute,
                                                },
                                            ]}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {attribute.map((variation, vIndex) => (
                    <>
                        <div className="variant-wrapper" key={variation.id || vIndex}>
                            {variation.isEditing && (
                                <div className="edit-wrapper">
                                    <ButtonInputUI
                                        wrapperClass="edit"
                                        buttons={[
                                            {
                                                icon: 'delete',
                                                text: __('Delete', 'multivendorx'),
                                                color: 'red',
                                                onClick: () => deleteAttribute(vIndex),
                                            },
                                            {
                                                icon: 'active',
                                                text: __('Save', 'multivendorx'),
                                                color: 'green',
                                                onClick: () => saveEditAttribute(vIndex, false),
                                            },
                                        ]}
                                    />

                                    <div className="variant">
                                        <div className="drag-icon">
                                            <i className="adminfont-drag"></i>
                                        </div>
                                        <BasicInputUI
                                            placeholder="Add Attribute"
                                            value={variation.name}
                                            onChange={(value) => updateAttribute(vIndex, 'name', value)}
                                        />
                                    </div>

                                    <div className="option-wrapper">
                                        <FormGroupWrapper>
                                            <FormGroup label={__('Option value', 'multivendorx')} />
                                        </FormGroupWrapper>

                                        {variation.options.map((opt, oIndex) => (
                                            <div className="variant" key={oIndex}>
                                                <div className="drag-icon">
                                                    <i className="adminfont-drag"></i>
                                                </div>
                                                <BasicInputUI
                                                    value={opt}
                                                    onChange={(value) => {
                                                        const updated = [...variation.options];
                                                        updated[oIndex] = value;
                                                        updateAttribute(vIndex, 'options', updated);
                                                    }}
                                                />
                                                <span
                                                    className="admin-badge red adminfont-delete"
                                                    onClick={() => deleteOption(vIndex, oIndex)}
                                                />
                                            </div>
                                        ))}

                                        <div className="add-new">
                                            <div
                                                className="add-input"
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddNewOption(vIndex);
                                                    }
                                                }}
                                            >
                                                <BasicInputUI
                                                    placeholder="Add another value"
                                                    value={tempOptions[vIndex] || ''}
                                                    onChange={(value) => handleTempOptionChange(vIndex, value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleAddNewOption(vIndex);
                                                        }
                                                    }}
                                                />
                                            </div>

                                            <ButtonInputUI
                                                buttons={{
                                                    icon: 'plus',
                                                    text: __('Add New', 'multivendorx'),
                                                    color: 'purple',
                                                    onClick: () => handleAddNewOption(vIndex),
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!variation.isEditing && (
                                <div className="variant-show">
                                    <div className="left-section">
                                        <div className="attributes">
                                            {variation.name || __('No variant name', 'multivendorx')}
                                        </div>
                                        <div className="variantion-wrapper">
                                            {variation.options.map((opt, idx) => (
                                                <div className="admin-badge blue" key={idx}>
                                                    {opt}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="right-section">
                                        <ButtonInputUI
                                            buttons={{
                                                icon: 'edit',
                                                text: __('Edit', 'multivendorx'),
                                                color: 'purple',
                                                onClick: () => saveEditAttribute(vIndex, true),
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ))}
                {applyFilters(
						'multivendorx_add_product_variations',
						null,
						product,
						setProduct,
						productFields,
					)}
            </Card>

	);
};

addFilter(
	'multivendorx_add_product_middle_section',
	'multivendorx/inventory',
	(content, product, setProduct, handleChange, productFields) => {
		return (
			<>
				{content}
				{productFields.includes('inventory') && (
					<Attributes
						product={product}
						setProduct={setProduct}
						handleChange={handleChange}
                        productFields = {productFields}
					/>
				)}
			</>
		);
	},
	10
);
