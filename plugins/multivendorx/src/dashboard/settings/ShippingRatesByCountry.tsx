// import React, { useState, useEffect } from "react";
// import { BasicInput, SelectInput, getApiLink } from "zyra";
// import axios from "axios";

// interface ShippingStateRate {
//     state: string;
//     cost: string;
// }

// interface ShippingCountryRate {
//     country: string;
//     cost: string;
//     states: ShippingStateRate[];
// }

// const ShippingRatesByCountry: React.FC = () => {
//     const [rates, setRates] = useState<ShippingCountryRate[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     // Extract countries and states from appLocalizer
//     const countries: { [key: string]: string } = appLocalizer?.country_list || {};
//     const statesByCountry: {
//         [countryCode: string]: { [stateCode: string]: string } | [];
//     } = appLocalizer?.state_list || {};

//     // Fetch initial shipping rates
//     useEffect(() => {
//         if (!appLocalizer?.store_id) return;

//         const fetchShippingRates = async () => {
//             setLoading(true);
//             setError(null);
//             try {
//                 const response = await axios.get(
//                     getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
//                     {
//                         headers: { "X-WP-Nonce": appLocalizer.nonce },
//                     }
//                 );

//                 const data = response.data || {};
//                 console.log("Fetched data:", data);

//                 let shippingRates: ShippingCountryRate[] = [];

//                 try {
//                     shippingRates =
//                         typeof data.multivendorx_shipping_rates === "string"
//                             ? JSON.parse(data.multivendorx_shipping_rates)
//                             : data.multivendorx_shipping_rates || [];
//                 } catch (e) {
//                     console.error("Failed to parse shipping rates:", e);
//                     shippingRates = [];
//                 }

//                 console.log("Parsed shipping rates:", shippingRates);
//                 setRates(shippingRates);
//             } catch (err) {
//                 console.error("Error fetching shipping rates:", err);
//                 setError("Failed to load shipping rates");
//                 setRates([]);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchShippingRates();
//     }, [appLocalizer?.store_id]);

//     // Auto-save helper
//     const autoSave = async (updatedRates: ShippingCountryRate[]) => {
//         setRates(updatedRates);
//         setError(null);

//         if (!appLocalizer?.store_id) return;

//         try {
//             const saveData = {
//                 multivendorx_shipping_rates: JSON.stringify(
//                     updatedRates.map((rate) => ({
//                         country: rate.country || "",
//                         cost: rate.cost === "" ? "" : rate.cost,
//                         states: (rate.states || []).map((state) => ({
//                             state: state.state || "",
//                             cost: state.cost === "" ? "" : state.cost,
//                         })),
//                     }))
//                 ),

//             };

//             const response = await axios.put(
//                 getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
//                 saveData,
//                 {
//                     headers: {
//                         "X-WP-Nonce": appLocalizer.nonce,
//                         "Content-Type": "application/json",
//                     },
//                 }
//             );

//             if (response.data && response.data.success !== false) {
//                 console.log("Save successful:", response.data);
//             } else {
//                 throw new Error(response.data?.message || "Save failed");
//             }
//         } catch (err) {
//             console.error("Error saving shipping rates:", err);
//             setError("Failed to save shipping rates. Please try again.");
//         }
//     };

//     // Country handlers
//     const handleAddCountry = () => {
//         const newRates = [...rates, { country: "", cost: "", states: [] }];
//         autoSave(newRates);
//     };

//     const handleRemoveCountry = (index: number) => {
//         const newRates = rates.filter((_, i) => i !== index);
//         autoSave(newRates);
//     };

//     const handleCountryChange = (index: number, key: "country" | "cost", val: string) => {
//         const updated = [...rates];
//         updated[index] = { ...updated[index], [key]: val };

//         if (key === "country") {
//             updated[index].states = [];
//         }

//         autoSave(updated);
//     };

//     // State handlers
//     const handleAddState = (countryIndex: number) => {
//         const updated = [...rates];
//         updated[countryIndex].states = [
//             ...updated[countryIndex].states,
//             { state: "", cost: "" },
//         ];
//         autoSave(updated);
//     };

//     const handleStateChange = (
//         countryIndex: number,
//         stateIndex: number,
//         key: keyof ShippingStateRate,
//         val: string
//     ) => {
//         const updated = [...rates];
//         updated[countryIndex].states[stateIndex] = {
//             ...updated[countryIndex].states[stateIndex],
//             [key]: val,
//         };
//         autoSave(updated);
//     };

//     const handleRemoveState = (countryIndex: number, stateIndex: number) => {
//         const updated = [...rates];
//         updated[countryIndex].states = updated[countryIndex].states.filter(
//             (_, i) => i !== stateIndex
//         );
//         autoSave(updated);
//     };

//     if (loading) return <div className="p-4 text-center">Loading shipping rates...</div>;

//     return (
//         <div className="shipping-country-wrapper">
//             {error && (
//                 <div className="">
//                     {error}
//                 </div>
//             )}

//             {rates.length === 0 && !loading ? (
//                 <div className="no-shipping-data">
//                     No shipping rates configured. Add your first country to get started.
//                 </div>

//             ) : (
//                 rates.map((countryItem, index) => {
//                     const countryCode = countryItem.country?.trim()?.toUpperCase() || "";
//                     const rawStates = statesByCountry[countryCode];
//                     const countryStates =
//                         Array.isArray(rawStates) && rawStates.length === 0
//                             ? {} // if empty array, treat as no states
//                             : (rawStates as Record<string, string>) || {};

//                     return (
//                         <div
//                             key={index}
//                             className="shipping-country"
//                         >
//                             <div className="country item">
//                                 <div className="location-icon adminlib-geo-location"></div>
//                                 <SelectInput
//                                     label="Country"
//                                     name={`country-${index}`}
//                                     value={countryItem.country}
//                                     options={[
//                                         { value: "", label: "Select Country" },
//                                         { value: "everywhere", label: "Everywhere Else" },
//                                         ...(Array.isArray(countries)
//                                             ? countries
//                                             : Object.entries(countries).map(([value, label]) => ({
//                                                 value,
//                                                 label,
//                                             }))),
//                                     ]}
//                                     onChange={(opt: any) =>
//                                         opt?.value &&
//                                         handleCountryChange(index, "country", opt.value)
//                                     }
//                                 />

//                                 <BasicInput
//                                     label="Cost"
//                                     type="number"
//                                     name={`cost-${index}`}
//                                     value={countryItem.cost}
//                                     onChange={(e) =>
//                                         handleCountryChange(index, "cost", e.target.value)
//                                     }
//                                     placeholder="0.00"
//                                     min="0"
//                                     step="0.01"
//                                 />

//                                 <span onClick={() => handleRemoveCountry(index)} className="delete-icon adminlib-delete"></span>
//                             </div>

//                             {countryItem.country &&
//                                 Object.keys(countryStates).length > 0 && (
//                                     <div className="state-wrapper">

//                                         <div className="header">
//                                             <div className="left">
//                                                 <div className="title">
//                                                     State/Region Rates
//                                                 </div>
//                                                 <div className="des">
//                                                     State/region rates are added to the Default Shipping Price. Example: If Default Shipping is $5 and State Rate is $3, the total shipping will be $8.
//                                                 </div>
//                                             </div>
//                                             <div className="right">
//                                                 <button
//                                                     type="button"
//                                                     className="admin-btn btn-purple-bg"
//                                                     onClick={() => handleAddState(index)}
//                                                 >
//                                                     <i className="adminlib-plus-circle"></i> Add State/Region
//                                                 </button>
//                                             </div>
//                                         </div>

//                                         {countryItem.states.map((stateItem, sIndex) => (
//                                             <div
//                                                 key={sIndex}
//                                                 className="state item"
//                                             >
//                                                 <SelectInput
//                                                     label="State"
//                                                     name={`state-${index}-${sIndex}`}
//                                                     value={stateItem.state}
//                                                     options={[
//                                                         { value: "", label: "Select State" },
//                                                         ...Object.entries(
//                                                             countryStates
//                                                         ).map(([value, label]) => ({
//                                                             label,
//                                                             value,
//                                                         })),
//                                                     ]}
//                                                     onChange={(opt: any) =>
//                                                         opt?.value &&
//                                                         handleStateChange(
//                                                             index,
//                                                             sIndex,
//                                                             "state",
//                                                             opt.value
//                                                         )
//                                                     }
//                                                 />
//                                                 <BasicInput
//                                                     label="Cost"
//                                                     type="number"
//                                                     name={`state-cost-${index}-${sIndex}`}
//                                                     value={stateItem.cost}
//                                                     onChange={(e) =>
//                                                         handleStateChange(
//                                                             index,
//                                                             sIndex,
//                                                             "cost",
//                                                             e.target.value
//                                                         )
//                                                     }
//                                                     placeholder="0.00"
//                                                     min="0"
//                                                     step="0.01"
//                                                 />
//                                                 <span onClick={() => handleRemoveState(index, sIndex)} className="delete-icon adminlib-delete"></span>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 )}
//                         </div>
//                     );
//                 })
//             )}

//             <button
//                 type="button"
//                 className="admin-btn btn-purple-bg"
//                 onClick={handleAddCountry}
//             >
//                 <i className="adminlib-plus-circle"></i> Add Country
//             </button>
//         </div>
//     );
// };

// export default ShippingRatesByCountry;


import React, { useState, useEffect } from "react";
import axios from "axios";
import { DynamicRowSetting, getApiLink } from "zyra";

interface ShippingStateRate {
    state: string;
    cost: string;
}

interface ShippingCountryRate {
    country: string;
    cost: string;
    states: ShippingStateRate[];
}

const ShippingRatesByCountry: React.FC = () => {
    const [rates, setRates] = useState<ShippingCountryRate[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const countries = appLocalizer?.country_list || {};
    const statesByCountry = appLocalizer?.state_list || {};

    useEffect(() => {
        if (!appLocalizer?.store_id) return;

        const fetchShippingRates = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(
                    getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
                    { headers: { "X-WP-Nonce": appLocalizer.nonce } }
                );

                let shippingRates = [];
                try {
                    shippingRates =
                        typeof response.data.multivendorx_shipping_rates === "string"
                            ? JSON.parse(response.data.multivendorx_shipping_rates)
                            : response.data.multivendorx_shipping_rates || [];
                } catch {
                    shippingRates = [];
                }

                setRates(
                    shippingRates.map((r: any) => ({
                        country: r.country || "",
                        cost: r.cost || "",
                        states: Array.isArray(r.states)
                            ? r.states
                            : [],
                    }))
                );
            } catch {
                setError("Failed to load shipping rates");
            } finally {
                setLoading(false);
            }
        };

        fetchShippingRates();
    }, []);

    const autoSave = async (updatedRates: ShippingCountryRate[]) => {
        setRates(updatedRates);
        try {
            await axios.put(
                getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
                {
                    multivendorx_shipping_rates: JSON.stringify(updatedRates),
                },
                {
                    headers: {
                        "X-WP-Nonce": appLocalizer.nonce,
                        "Content-Type": "application/json",
                    },
                }
            );
        } catch {
            setError("Failed to save shipping rates.");
        }
    };

    /** FIX COUNTRY OPTIONS */
    const countryOptions = Array.isArray(countries)
        ? countries.map((item: any) => ({
            label: item.label?.label || item.label,
            value: item.label?.value || item.value,
        }))
        : Object.entries(countries).map(([value, label]) => ({
            label,
            value,
        }));

    const countryTemplate = {
        fields: [
            {
                key: "country",
                type: "select",
                label: "Country",
                placeholder: "Select Country",
                options: [
                    { label: "Everywhere Else", value: "everywhere" },
                    ...countryOptions,
                ],
            },
            {
                key: "cost",
                type: "number",
                label: "Cost",
                placeholder: "0.00",
            },
        ],
    };


    const stateTemplate = {
        fields: [
            {
                key: "state",
                type: "select",
                label: "State",
                placeholder: "Select State",
                options: [],
            },
            {
                key: "cost",
                type: "number",
                label: "Cost",
                placeholder: "0.00",
            },
        ],
    };

    if (loading) return <div>Loading shipping rates...</div>;
    console.log('ct', countryOptions)
    return (
        <div className="shipping-country-wrapper">
            {error && <div className="mvx-error">{error}</div>}

            <DynamicRowSetting
                keyName="country-rates"
                template={countryTemplate}
                value={rates}
                addLabel="Add Country"
                onChange={(updatedCountries: any) => {
                    const fixed = updatedCountries.map((r) => ({
                        ...r,
                        states: r.states || [],
                    }));
                    autoSave(fixed);
                }}
                /** Render nested states inside the country row */
                childrenRenderer={(countryRow: { country: string; states: unknown; }, countryIndex: string | number) => {
                    const code = countryRow.country?.toUpperCase() || "";
                    const raw = statesByCountry[code];

                    const stateOptions = raw
                        ? Object.entries(raw).map(([value, label]) => ({
                            value,
                            label,
                        }))
                        : [];

                    if (stateOptions.length === 0) return null;

                    return (
                        <div className="state-inner-box">
                            <h4 className="state-title">State / Region Rates</h4>

                            <DynamicRowSetting
                                keyName={`state-rates-${countryIndex}`}
                                template={{
                                    fields: [
                                        {
                                            ...stateTemplate.fields[0],
                                            options: stateOptions,
                                        },
                                        stateTemplate.fields[1],
                                    ],
                                }}
                                value={countryRow.states}
                                addLabel="Add State/Region"
                                onChange={(updatedStates: any) => {
                                    const clone = [...rates];
                                    clone[countryIndex].states = updatedStates;
                                    autoSave(clone);
                                }}
                            />
                        </div>
                    );
                }}
            />
        </div>
    );
};

export default ShippingRatesByCountry;
