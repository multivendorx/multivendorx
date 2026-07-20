import { FC } from 'react';

const DummyExcludedProducts: FC = () => {
    const products = [1, 2, 3, 4];

    return (
        <ul className="products columns-4">
            {products.map((id) => (
                <li key={id} className="product type-product">
                    <a
                        href="#"
                        className="woocommerce-LoopProduct-link woocommerce-loop-product__link"
                        onClick={(e) => e.preventDefault()}
                    >
                        <img
                            src="https://via.placeholder.com/300x300?text=Product"
                            alt="Excluded Product"
                            className="attachment-woocommerce_thumbnail size-woocommerce_thumbnail"
                        />

                        <h2 className="woocommerce-loop-product__title">
                            Excluded Product {id}
                        </h2>

                        <span className="price">
                            <bdi>$99.00</bdi>
                        </span>
                    </a>
                </li>
            ))}
        </ul>
    );
};

export default DummyExcludedProducts;