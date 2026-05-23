import React, { useEffect, useState } from 'react';

import { __ } from '@wordpress/i18n';

import {
    BasicInputUI,
    ButtonInputUI,
    FormGroup,
    FormGroupWrapper,
    PopupUI,
    SelectInputUI,
} from 'zyra';

import { RuleRow } from './rulesTable';

type RuleFormData = {
    id?: number;

    name: string;

    product_id?: number;
    category_id?: number;
    brand_id?: number;

    user_id?: number;
    role_id?: number;

    amount: string | number;

    type: 'fixed' | 'percentage';

    quantity_enabled: boolean;

    quantity?: string | number;

    active: boolean;
};

interface Props {
    open: boolean;
    onClose: () => void;
    onSave: (rule: RuleRow) => void;
    rule?: RuleRow | null;
}

const defaultForm: RuleFormData = {
    name: '',

    product_id: -1,
    category_id: undefined,
    brand_id: undefined,

    user_id: -1,
    role_id: undefined,

    amount: '',

    type: 'fixed',

    quantity_enabled: false,

    quantity: '',

    active: true,
};

export default function RulePopup({
    open,
    onClose,
    onSave,
    rule,
}: Props) {
    const [applicableFor, setApplicableFor] = useState<
        'product' | 'category' | 'brand'
    >('product');

    const [forWho, setForWho] = useState<
        'user' | 'role'
    >('user');

    const [formData, setFormData] =
        useState<RuleFormData>(defaultForm);

    const [error, setError] = useState<
        Record<
            string,
            {
                type: 'error' | 'success';
                message: string;
            }
        >
    >({});

    const isEditMode = !!rule;

    /**
     * Options
     */
    const productOptions = [
        {
            label: 'All Product',
            value: -1,
        },
        ...(appLocalizer.products_data || []),
    ];

    const categoryOptions = [
        {
            label: 'All Category',
            value: -1,
        },
        ...(appLocalizer.all_product_categories || []),
    ];

    const brandOptions = [
        {
            label: 'All Brand',
            value: -1,
        },
        ...(appLocalizer.product_brands || []),
    ];

    const userOptions = [
        {
            label: 'All User',
            value: -1,
        },
        ...(appLocalizer.users_data || []),
    ];

    const roleOptions = [
        {
            label: 'All Role',
            value: -1,
        },
        ...(appLocalizer.role_array || []),
    ];

    /**
     * Edit mode
     */
    useEffect(() => {
        if (!rule) {
            resetForm();

            return;
        }

        /**
         * Applicable type
         */
        const applicableType =
            rule.applicable_type?.toLowerCase() as
            | 'product'
            | 'category'
            | 'brand';

        setApplicableFor(applicableType);

        /**
         * User type
         */
        const userType =
            rule.user_type?.toLowerCase() as
            | 'user'
            | 'role';

        setForWho(userType);

        /**
         * Find applicable option
         */
        const applicableOption =
            applicableType === 'product'
                ? productOptions.find(
                    (item) =>
                        item.label ===
                        rule.applicable_value
                )
                : applicableType === 'category'
                    ? categoryOptions.find(
                        (item) =>
                            item.label ===
                            rule.applicable_value
                    )
                    : brandOptions.find(
                        (item) =>
                            item.label ===
                            rule.applicable_value
                    );

        /**
         * Find user option
         */
        const userOption =
            userType === 'user'
                ? userOptions.find(
                    (item) =>
                        item.label ===
                        rule.user_value
                )
                : roleOptions.find(
                    (item) =>
                        item.label ===
                        rule.user_value
                );

        /**
         * Discount parsing
         */
        const discountValue =
            rule.discount?.split(' ')[0] || '';

        const discountType =
            rule.discount?.toLowerCase().includes(
                'percentage'
            )
                ? 'percentage'
                : 'fixed';

        setFormData({
            id: rule.id,

            name: rule.name || '',

            product_id:
                applicableType === 'product'
                    ? (applicableOption?.value as number)
                    : undefined,

            category_id:
                applicableType === 'category'
                    ? (applicableOption?.value as number)
                    : undefined,

            brand_id:
                applicableType === 'brand'
                    ? (applicableOption?.value as number)
                    : undefined,

            user_id:
                userType === 'user'
                    ? (userOption?.value as number)
                    : undefined,

            role_id:
                userType === 'role'
                    ? (userOption?.value as number)
                    : undefined,

            amount: discountValue,

            type: discountType,

            quantity_enabled:
                rule.quantity_enabled || false,

            quantity: rule.quantity || '',

            active: rule.status === 'Active',
        });
    }, [rule]);

    /**
     * Form update
     */
    const updateForm = <
        K extends keyof RuleFormData
    >(
        key: K,
        value: RuleFormData[K]
    ) => {
        setFormData((prev) => ({
            ...prev,
            [key]: value,
        }));

        clearFieldError(String(key));
    };

    /**
     * Error handling
     */
    const setFieldError = (
        key: string,
        message: string
    ) => {
        setError((prev) => ({
            ...prev,
            [key]: {
                type: 'error',
                message,
            },
        }));
    };

    const clearFieldError = (key: string) => {
        setError((prev) => {
            const updated = { ...prev };

            delete updated[key];

            return updated;
        });
    };

    const getFieldNotice = (key: string) => {
        const err = error?.[key];

        if (!err?.message) {
            return {
                notice: undefined,
                noticeType: 'error',
            };
        }

        return {
            notice: err.message,
            noticeType: err.type,
        };
    };

    /**
     * Filter changes
     */
    const handleApplicableForChange = (
        value: 'product' | 'category' | 'brand'
    ) => {
        setApplicableFor(value);

        setFormData((prev) => ({
            ...prev,

            product_id:
                value === 'product'
                    ? -1
                    : undefined,

            category_id:
                value === 'category'
                    ? -1
                    : undefined,

            brand_id:
                value === 'brand'
                    ? -1
                    : undefined,
        }));
    };

    const handleForWhoChange = (
        value: 'user' | 'role'
    ) => {
        setForWho(value);

        setFormData((prev) => ({
            ...prev,

            user_id:
                value === 'user'
                    ? -1
                    : undefined,

            role_id:
                value === 'role'
                    ? -1
                    : undefined,
        }));
    };

    /**
     * Validation
     */
    const validateRule = () => {
        let hasError = false;

        if (!formData.name?.trim()) {
            setFieldError(
                'name',
                'Rule name is required'
            );

            hasError = true;
        }

        if (!formData.amount) {
            setFieldError(
                'amount',
                'Discount amount is required'
            );

            hasError = true;
        }

        if (
            formData.type === 'percentage' &&
            Number(formData.amount) > 100
        ) {
            setFieldError(
                'amount',
                'Percentage cannot exceed 100'
            );

            hasError = true;
        }

        if (
            formData.quantity_enabled &&
            (!formData.quantity ||
                Number(formData.quantity) <= 0)
        ) {
            setFieldError(
                'quantity',
                'Quantity is required'
            );

            hasError = true;
        }

        return !hasError;
    };

    /**
     * Reset form
     */
    const resetForm = () => {
        setApplicableFor('product');

        setForWho('user');

        setError({});

        setFormData(defaultForm);
    };

    /**
     * Save
     */
    const handleSaveRule = () => {
        setError({});

        const isValid = validateRule();

        if (!isValid) {
            return;
        }

        const appliedOn =
            applicableFor === 'product'
                ? productOptions.find(
                    (opt) =>
                        opt.value ===
                        formData.product_id
                )?.label
                : applicableFor ===
                    'category'
                    ? categoryOptions.find(
                        (opt) =>
                            opt.value ===
                            formData.category_id
                    )?.label
                    : brandOptions.find(
                        (opt) =>
                            opt.value ===
                            formData.brand_id
                    )?.label;

        const forWhom =
            forWho === 'user'
                ? userOptions.find(
                    (opt) =>
                        opt.value ===
                        formData.user_id
                )?.label
                : roleOptions.find(
                    (opt) =>
                        opt.value ===
                        formData.role_id
                )?.label;

        onSave({
            id: formData.id,

            name: formData.name,

            applicable_type:
                applicableFor
                    .charAt(0)
                    .toUpperCase() +
                applicableFor.slice(1),

            applicable_value:
                String(appliedOn),

            user_type:
                forWho.charAt(0).toUpperCase() +
                forWho.slice(1),

            user_value: String(forWhom),

            applicable_for:
                applicableFor
                    .charAt(0)
                    .toUpperCase() +
                applicableFor.slice(1),

            for_whom: String(forWhom),

            discount: `${formData.amount} ${formData.type === 'fixed'
                ? 'Fixed'
                : 'Percentage'
                }`,

            quantity_enabled:
                formData.quantity_enabled,

            quantity: formData.quantity,

            status: formData.active
                ? 'Active'
                : 'Inactive',
        });

        resetForm();

        onClose();
    };

    return (
        <PopupUI
            open={open}
            width={35}
            onClose={() => {
                resetForm();

                onClose();
            }}
            header={{
                title: isEditMode
                    ? __('Edit Rule', 'catalogx')
                    : __('Add New Rule', 'catalogx'),

                description: __(
                    'Create dynamic pricing rules for your store.',
                    'catalogx'
                ),
            }}
            footer={
                <ButtonInputUI
                    buttons={[
                        {
                            text: __(
                                'Cancel',
                                'catalogx'
                            ),

                            color: 'red',

                            icon: 'close',

                            onClick: () => {
                                resetForm();

                                onClose();
                            },
                        },

                        {
                            text: isEditMode
                                ? __(
                                    'Update Rule',
                                    'catalogx'
                                )
                                : __(
                                    'Add and Activate',
                                    'catalogx'
                                ),

                            icon: 'save',

                            onClick:
                                handleSaveRule,
                        },
                    ]}
                />
            }
        >
            <FormGroupWrapper>
                <FormGroup
                    label={__('Name', 'catalogx')}
                    {...getFieldNotice('name')}
                >
                    <BasicInputUI
                        value={formData.name}
                        onChange={(val) =>
                            updateForm(
                                'name',
                                val as string
                            )
                        }
                    />
                </FormGroup>

                <FormGroup
                    label={__(
                        'Applicable For',
                        'catalogx'
                    )}
                >
                    <SelectInputUI
                        type="single-select"
                        value={applicableFor}
                        options={[
                            {
                                label: 'Product',
                                value: 'product',
                            },

                            {
                                label: 'Category',
                                value: 'category',
                            },

                            {
                                label: 'Brand',
                                value: 'brand',
                            },
                        ]}
                        onChange={(val) =>
                            handleApplicableForChange(
                                val as
                                | 'product'
                                | 'category'
                                | 'brand'
                            )
                        }
                    />
                </FormGroup>

                <FormGroup
                    label={__('Applied On', 'catalogx')}
                >
                    <SelectInputUI
                        type="single-select"
                        value={
                            applicableFor ===
                                'product'
                                ? formData.product_id
                                : applicableFor ===
                                    'category'
                                    ? formData.category_id
                                    : formData.brand_id
                        }
                        options={
                            applicableFor ===
                                'product'
                                ? productOptions
                                : applicableFor ===
                                    'category'
                                    ? categoryOptions
                                    : brandOptions
                        }
                        onChange={(val) => {
                            if (
                                applicableFor ===
                                'product'
                            ) {
                                updateForm(
                                    'product_id',
                                    val as number
                                );
                            }

                            if (
                                applicableFor ===
                                'category'
                            ) {
                                updateForm(
                                    'category_id',
                                    val as number
                                );
                            }

                            if (
                                applicableFor ===
                                'brand'
                            ) {
                                updateForm(
                                    'brand_id',
                                    val as number
                                );
                            }
                        }}
                    />
                </FormGroup>

                <FormGroup
                    label={__('For Who', 'catalogx')}
                >
                    <SelectInputUI
                        type="single-select"
                        value={forWho}
                        options={[
                            {
                                label: 'User',
                                value: 'user',
                            },

                            {
                                label: 'Role',
                                value: 'role',
                            },
                        ]}
                        onChange={(val) =>
                            handleForWhoChange(
                                val as
                                | 'user'
                                | 'role'
                            )
                        }
                    />
                </FormGroup>

                <FormGroup
                    label={__('Name', 'catalogx')}
                >
                    <SelectInputUI
                        type="single-select"
                        value={
                            forWho === 'user'
                                ? formData.user_id
                                : formData.role_id
                        }
                        options={
                            forWho === 'user'
                                ? userOptions
                                : roleOptions
                        }
                        onChange={(val) => {
                            if (forWho === 'user') {
                                updateForm(
                                    'user_id',
                                    val as number
                                );
                            } else {
                                updateForm(
                                    'role_id',
                                    val as number
                                );
                            }
                        }}
                    />
                </FormGroup>

                <FormGroup
                    label={__(
                        'Discount',
                        'catalogx'
                    )}
                    {...getFieldNotice('amount')}
                >
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                '1fr 180px',

                            gap: '12px',
                        }}
                    >
                        <BasicInputUI
                            type="number"
                            value={formData.amount}
                            onChange={(val) =>
                                updateForm(
                                    'amount',
                                    val as string
                                )
                            }
                        />

                        <SelectInputUI
                            type="single-select"
                            value={formData.type}
                            options={[
                                {
                                    label: 'Fixed',
                                    value: 'fixed',
                                },

                                {
                                    label: 'Percentage',
                                    value: 'percentage',
                                },
                            ]}
                            onChange={(val) =>
                                updateForm(
                                    'type',
                                    val as
                                    | 'fixed'
                                    | 'percentage'
                                )
                            }
                        />
                    </div>
                </FormGroup>

                <FormGroup
                    label={__(
                        'Quantity Restriction',
                        'catalogx'
                    )}
                >
                    <input
                        type="checkbox"
                        checked={
                            formData.quantity_enabled
                        }
                        onChange={(e) =>
                            updateForm(
                                'quantity_enabled',
                                e.target.checked
                            )
                        }
                    />
                </FormGroup>

                {formData.quantity_enabled && (
                    <FormGroup
                        label={__(
                            'Quantity',
                            'catalogx'
                        )}
                        {...getFieldNotice(
                            'quantity'
                        )}
                    >
                        <BasicInputUI
                            type="number"
                            value={
                                formData.quantity
                            }
                            onChange={(val) =>
                                updateForm(
                                    'quantity',
                                    val as string
                                )
                            }
                        />
                    </FormGroup>
                )}
            </FormGroupWrapper>
        </PopupUI>
    );
}