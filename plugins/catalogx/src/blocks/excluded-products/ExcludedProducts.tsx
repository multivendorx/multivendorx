import { FC, useEffect, useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';

/* global excludedProducts */

interface Product {
    id: number;
    name: string;
    permalink?: string;
    images?: { src: string }[];
    categories?: { slug: string }[];
    price_html?: string;
    average_rating?: number;
}

interface Props {
    attributes: {
        includeTypes?: string[];
    };
}

const ExcludedProducts: FC<Props> = ({ attributes }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        setLoading(true);

        axios
            .get(`${excludedProducts.apiUrl}/wc/v3/products`, {
                headers: {
                    'X-WP-Nonce': excludedProducts.nonce,
                },
                params: {
                    page,
                    per_page: 12,
                    exclude__types: attributes.includeTypes,
                },
            })
            .then((response) => {
                setProducts(response.data || []);
                setTotalPages(
                    Number(response.headers['x-wp-totalpages']) || 1
                );
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [page, attributes.includeTypes]);

    if (loading) {
        return <p>{__('Loading products...', 'catalogx')}</p>;
    }

    return (
        <>
            {products.length ? (
                <ul className="products columns-4">
                    {products.map((product) => (
                        <li
                            key={product.id}
                            className={`product type-product post-${product.id}`}
                        >
                            <a
                                href={product.permalink}
                                className="woocommerce-LoopProduct-link woocommerce-loop-product__link"
                            >
                                <img
                                    src={
                                        product.images?.[0]?.src ||
                                        excludedProducts.placeholder_url
                                    }
                                    alt={product.name}
                                    className={
                                        product.images?.[0]?.src
                                            ? 'attachment-woocommerce_thumbnail size-woocommerce_thumbnail'
                                            : 'woocommerce-placeholder wp-post-image'
                                    }
                                />

                                <h2 className="woocommerce-loop-product__title">
                                    {product.name}
                                </h2>

                                {product.price_html && (
                                    <span
                                        className="price"
                                        dangerouslySetInnerHTML={{
                                            __html: product.price_html,
                                        }}
                                    />
                                )}
                            </a>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>
                    {__(
                        'No excluded products found.',
                        'catalogx'
                    )}
                </p>
            )}

            {totalPages > 1 && (
                <nav className="woocommerce-pagination">
                    <ul className="page-numbers">
                        <li>
                            <button
                                type="button"
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                            >
                                {__('Previous', 'catalogx')}
                            </button>
                        </li>

                        <li>
                            <span className="page-numbers current">
                                {page} / {totalPages}
                            </span>
                        </li>

                        <li>
                            <button
                                type="button"
                                disabled={page === totalPages}
                                onClick={() => setPage(page + 1)}
                            >
                                {__('Next', 'catalogx')}
                            </button>
                        </li>
                    </ul>
                </nav>
            )}
        </>
    );
};

export default ExcludedProducts;