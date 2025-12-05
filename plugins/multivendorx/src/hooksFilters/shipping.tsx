import { useEffect, useState } from "react";
import axios from "axios";
import { addFilter } from "@wordpress/hooks";
import { BasicInput, SelectInput } from "zyra";

const ShippingCard = ({ product, handleChange }) => {
    const [shippingClasses, setShippingClasses] = useState([]);

    useEffect(() => {
        axios
            .get(`${appLocalizer.apiUrl}/wc/v3/products/shipping_classes`, {
                headers: { "X-WP-Nonce": appLocalizer.nonce },
            })
            .then((res) => {
                const options = res.data.map((cls) => ({
                    value: cls.slug,
                    label: cls.name,
                }));

                setShippingClasses(options);
            });
    }, []);

    const toggleCard = (cardId) => {
        const body = document.querySelector(`#${cardId} .card-body`);
        const arrow = document.querySelector(`#${cardId} .arrow-icon`);

        if (!body || !arrow) return;

        body.classList.toggle("hide-body");
        arrow.classList.toggle("rotate");
    };

    return (
        <div className="card" id="card-shipping">
            <div className="card-header">
                <div className="left">
                    <div className="title">Shipping</div>
                </div>

                <div className="right">
                    <i
                        className="adminlib-pagination-right-arrow arrow-icon"
                        onClick={() => toggleCard("card-shipping")}
                    ></i>
                </div>
            </div>

            <div className="card-body">
                <div className="form-group-wrapper">
                    <div className="form-group">
                        <label>Weight ({appLocalizer.weight_unit})</label>

                        <BasicInput
                            name="weight"
                            value={product.weight}
                            onChange={(e) =>
                                handleChange("weight", e.target.value)
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label>Shipping classes</label>

                        <SelectInput
                            name="shipping_class"
                            options={shippingClasses}
                            value={product.shipping_class}
                            onChange={(selected) =>
                                handleChange("shipping_class", selected.value)
                            }
                        />
                    </div>
                </div>

                <div className="form-group-wrapper">
                    <div className="form-group">
                        <label>
                            Dimensions ({appLocalizer.dimension_unit})
                        </label>

                        <BasicInput
                            name="product_length"
                            value={product.product_length}
                            placeholder="Length"
                            onChange={(e) =>
                                handleChange(
                                    "product_length",
                                    e.target.value
                                )
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label></label>

                        <BasicInput
                            name="product_width"
                            value={product.product_width}
                            placeholder="Width"
                            onChange={(e) =>
                                handleChange(
                                    "product_width",
                                    e.target.value
                                )
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label></label>

                        <BasicInput
                            name="product_height"
                            value={product.product_height}
                            placeholder="Height"
                            onChange={(e) =>
                                handleChange(
                                    "product_height",
                                    e.target.value
                                )
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

addFilter(
    "product_shipping",
    "my-plugin/shipping",
    (content, product, handleChange) => {
        return (
            <>
                {content}
                <ShippingCard
                    product={product}
                    handleChange={handleChange}
                />
            </>
        );
    },
    10
);
