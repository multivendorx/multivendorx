import DistanceByZoneShipping from "@/dashboard/settings/DistanceByZoneShipping";
import ShippingRatesByCountry from "@/dashboard/settings/ShippingRatesByCountry";
import { __ } from "@wordpress/i18n";
import axios from "axios";
import { useEffect, useState } from "react";
import { BasicInput, getApiLink, SuccessNotice, ToggleSetting } from "zyra";

const ShippingSettings = ({ id, data }: { id: string | null; data: any }) => {
    const [formData, setFormData] = useState<{ [key: string]: any }>({}); // Use 'any' for simplicity here
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        axios.get(getApiLink(appLocalizer, `store/${id}`), {
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        }).then((res) => {
            const data = res.data || {};

            // Step 2a: parse distance_rules
            if (typeof data.distance_rules === 'string') {
                try {
                    data.distance_rules = JSON.parse(data.distance_rules);
                } catch (err) {
                    data.distance_rules = []; // fallback to empty array
                }
            }

            // Optional: parse multivendorx_shipping_rates if needed
            if (typeof data.multivendorx_shipping_rates === 'string') {
                try {
                    data.multivendorx_shipping_rates = JSON.parse(data.multivendorx_shipping_rates);
                } catch (err) {
                    data.multivendorx_shipping_rates = [];
                }
            }

            setFormData(prev => ({ ...prev, ...data }));
        });
    }, [id]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const updated = { ...formData, [name]: value };
        setFormData(updated);
        autoSave(updated);
    };

    const handleToggleChange = (value: string, name?: string) => {
        setFormData((prev) => {
            const updated = {
                ...(prev || {}),
                [name || 'shipping_options']: value,
            };
            autoSave(updated);
            return updated;
        });
    };

    const autoSave = (updatedData: Record<string, unknown>) => {
        axios({
            method: 'PUT',
            url: getApiLink(appLocalizer, `store/${id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: updatedData,
        }).then((res) => {
            if (res.data.success) {
                setSuccessMsg('Store saved successfully!');
            }
        });
    };

    return (
        <>
            <SuccessNotice message={successMsg} />
            <div className="container-wrapper">
                <div className="card-wrapper w-65">
                    <div className="card-content">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    {__('Method type', 'multivendorx')}
                                </div>
                            </div>
                        </div>
                        {/* Only show ToggleSetting if shipping_methods has options */}
                        {appLocalizer.shipping_methods && appLocalizer.shipping_methods.length > 0 && (
                            <>
                                <div className="form-group-wrapper">
                                    <div className="form-group">
                                        <ToggleSetting
                                            wrapperClass="setting-form-input"
                                            descClass="settings-metabox-description"
                                            description="Choose your preferred payment method."
                                            options={appLocalizer.shipping_methods}
                                            value={formData.shipping_options || ""}
                                            onChange={(value: any) => handleToggleChange(value, 'shipping_options')}
                                        />
                                    </div>
                                </div>
                                {/* //zone by shipping */}
                                {formData.shipping_options === 'shipping_by_zone' && <DistanceByZoneShipping id={id} />}

                                {/* country wise shipping */}
                                {formData.shipping_options === 'shipping_by_country' && (
                                    <>
                                        <div className="form-group-title-wrapper">
                                            <div className="title">
                                                {__('Default Shipping Rules', 'multivendorx')}
                                            </div>
                                            <div className="des">
                                                {__('Set base rates that apply to all orders', 'multivendorx')}
                                            </div>
                                        </div>

                                        {/* Default Shipping Price */}
                                        <div className="form-group-wrapper">
                                            <div className="form-group">
                                                <label htmlFor="multivendorx_shipping_type_price">
                                                    {__('Default Shipping Price ($)', 'multivendorx')}
                                                </label>
                                                <BasicInput
                                                    type="number"
                                                    name="multivendorx_shipping_type_price"
                                                    wrapperClass="setting-form-input"
                                                    descClass="settings-metabox-description"
                                                    placeholder={__('0.00', 'multivendorx')}
                                                    value={formData.multivendorx_shipping_type_price || ''}
                                                    onChange={handleChange}
                                                />
                                                <div className="settings-metabox-description">
                                                    {__('This is the shipping cost applied to every order.', 'multivendorx')}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Per Product Additional Price */}
                                        <div className="form-group-wrapper">
                                            <div className="form-group">
                                                <label htmlFor="multivendorx_additional_product">
                                                    {__('Per Product Additional Price ($)', 'multivendorx')}
                                                </label>
                                                <BasicInput
                                                    type="number"
                                                    name="multivendorx_additional_product"
                                                    wrapperClass="setting-form-input"
                                                    descClass="settings-metabox-description"
                                                    placeholder={__('0.00', 'multivendorx')}
                                                    value={formData.multivendorx_additional_product || ''}
                                                    onChange={handleChange}
                                                />
                                                <div className="settings-metabox-description">
                                                    {__('This amount will be added to the Default Shipping Price for each additional product type in the cart. Example: If Default Shipping is $5 and this is set to $2, a customer buying Product A and Product B will pay $5 (for Product A) + $2 (for Product B) = $7 total shipping.', 'multivendorx')}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Per Qty Additional Price */}
                                        <div className="form-group-wrapper">
                                            <div className="form-group">
                                                <label htmlFor="multivendorx_additional_qty">
                                                    {__('Per Qty Additional Price ($)', 'multivendorx')}
                                                </label>
                                                <BasicInput
                                                    type="number"
                                                    name="multivendorx_additional_qty"
                                                    wrapperClass="setting-form-input"
                                                    descClass="settings-metabox-description"
                                                    placeholder={__('0.00', 'multivendorx')}
                                                    value={formData.multivendorx_additional_qty || ''}
                                                    onChange={handleChange}
                                                />
                                                <div className="settings-metabox-description">
                                                    {__('This amount will be added to the Default Shipping Price for each additional quantity of the same product. Example: If Default Shipping is $5 and this is set to $1, a customer buying 3 units of Product A will pay $5 (first unit) + $1 (second unit) + $1 (third unit) = $7 total shipping.', 'multivendorx')}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Free Shipping Minimum Order Amount */}
                                        <div className="form-group-wrapper">
                                            <div className="form-group">
                                                <label htmlFor="free_shipping_amount">
                                                    {__('Free Shipping Minimum Order Amount ($)', 'multivendorx')}
                                                </label>
                                                <BasicInput
                                                    type="number"
                                                    name="free_shipping_amount"
                                                    wrapperClass="setting-form-input"
                                                    descClass="settings-metabox-description"
                                                    placeholder={__('NO Free Shipping', 'multivendorx')}
                                                    value={formData.free_shipping_amount || ''}
                                                    onChange={handleChange}
                                                />
                                                <div className="settings-metabox-description">
                                                    {__('If the customer\'s order total exceeds this amount, shipping becomes free. Leave this field empty if you do not want to offer free shipping.', 'multivendorx')}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Local Pickup Cost */}
                                        <div className="form-group-wrapper">
                                            <div className="form-group">
                                                <label htmlFor="local_pickup_cost">
                                                    {__('Local Pickup Cost ($)', 'multivendorx')}
                                                </label>
                                                <BasicInput
                                                    type="number"
                                                    name="local_pickup_cost"
                                                    wrapperClass="setting-form-input"
                                                    descClass="settings-metabox-description"
                                                    placeholder={__('0.00', 'multivendorx')}
                                                    value={formData.local_pickup_cost || ''}
                                                    onChange={handleChange}
                                                />
                                                <div className="settings-metabox-description">
                                                    {__('This is the fee customers need to pay if they choose Local Pickup as the delivery option.', 'multivendorx')}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form-group-title-wrapper">
                                            <div className="title">
                                                {__('Country-Specific Rates', 'multivendorx')}
                                            </div>
                                            <div className="des">
                                                {__('Country-specific rates will be added to the Default Shipping Price. If state/region rates are defined, the final shipping cost will be State Rate + Default Shipping Price.', 'multivendorx')}
                                            </div>
                                        </div>

                                        <ShippingRatesByCountry />
                                    </>
                                )}

                                {formData.shipping_options === 'shipping_by_distance' && (
                                    <>
                                        <div className="form-group-title-wrapper">
                                            <div className="title">
                                                {__('Distance-wise Shipping Configuration', 'multivendorx')}
                                            </div>
                                        </div>

                                        {/* Default Cost */}
                                        <div className="form-group-wrapper">
                                            <div className="form-group">
                                                <label htmlFor="distance_default_cost">
                                                    {__('Default Cost ($) *', 'multivendorx')}
                                                </label>
                                                <BasicInput
                                                    type="number"
                                                    name="distance_default_cost"
                                                    wrapperClass="setting-form-input"
                                                    descClass="settings-metabox-description"
                                                    placeholder={__('0.00', 'multivendorx')}
                                                    value={formData.distance_default_cost || ''}
                                                    onChange={handleChange}
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                        </div>

                                        {/* Max Distance */}
                                        <div className="form-group-wrapper">
                                            <div className="form-group">
                                                <label htmlFor="distance_max_km">
                                                    {__('Max Distance (km)', 'multivendorx')}
                                                </label>
                                                <BasicInput
                                                    type="number"
                                                    name="distance_max_km"
                                                    wrapperClass="setting-form-input"
                                                    descClass="settings-metabox-description"
                                                    placeholder={__('0', 'multivendorx')}
                                                    value={formData.distance_max_km || ''}
                                                    onChange={handleChange}
                                                    min="0"
                                                    step="0.1"
                                                />
                                            </div>
                                        </div>

                                        {/* Local Pickup Cost */}
                                        <div className="form-group-wrapper">
                                            <div className="form-group">
                                                <label htmlFor="distance_local_pickup_cost">
                                                    {__('Local Pickup Cost ($) (Optional)', 'multivendorx')}
                                                </label>
                                                <BasicInput
                                                    type="number"
                                                    name="distance_local_pickup_cost"
                                                    wrapperClass="setting-form-input"
                                                    descClass="settings-metabox-description"
                                                    placeholder={__('0.00', 'multivendorx')}
                                                    value={formData.distance_local_pickup_cost || ''}
                                                    onChange={handleChange}
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                        </div>

                                        {/* Distance-Cost Rules */}
                                        <div className="form-group-wrapper">
                                            <div className="form-group">
                                                <label>{__('Distance-Cost Rules', 'multivendorx')}</label>
                                                <div className="shipping-country-wrapper">
                                                    {(formData.distance_rules || []).map((rule: any, index: number) => (
                                                        <div key={index} className="shipping-country rule">
                                                            <div className="item">
                                                                <BasicInput
                                                                    type="number"
                                                                    placeholder={__('Up to km', 'multivendorx')}
                                                                    value={rule.max_distance || ''}
                                                                    onChange={(e) => {
                                                                        const updatedRules = [...(formData.distance_rules || [])];
                                                                        updatedRules[index] = { ...updatedRules[index], max_distance: e.target.value };
                                                                        setFormData({ ...formData, distance_rules: updatedRules });
                                                                        autoSave({ ...formData, distance_rules: updatedRules });
                                                                    }}
                                                                    min="0"
                                                                    step="0.1"
                                                                />
                                                                <BasicInput
                                                                    type="number"
                                                                    placeholder={__('Cost $', 'multivendorx')}
                                                                    value={rule.cost || ''}
                                                                    onChange={(e) => {
                                                                        const updatedRules = [...(formData.distance_rules || [])];
                                                                        updatedRules[index] = { ...updatedRules[index], cost: e.target.value };
                                                                        setFormData({ ...formData, distance_rules: updatedRules });
                                                                        autoSave({ ...formData, distance_rules: updatedRules });
                                                                    }}
                                                                    min="0"
                                                                    step="0.01"
                                                                />
                                                                <span
                                                                    className="delete-icon adminlib-delete"
                                                                    onClick={() => {
                                                                        const updatedRules = (formData.distance_rules || []).filter((_, i) => i !== index);
                                                                        setFormData({ ...formData, distance_rules: updatedRules });
                                                                        autoSave({ ...formData, distance_rules: updatedRules });
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button
                                                    type="button"
                                                    className="admin-btn btn-purple-bg"
                                                    onClick={() => {
                                                        const updatedRules = [...(formData.distance_rules || []), { max_distance: '', cost: '' }];
                                                        setFormData({ ...formData, distance_rules: updatedRules });
                                                        autoSave({ ...formData, distance_rules: updatedRules });
                                                    }}
                                                >
                                                    <i className="adminlib-plus-circle"></i> {__('Add Rule', 'multivendorx')}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ShippingSettings;