import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../services/commonFunction';
import {  Skeleton } from 'zyra';

const SpmvProducts: React.FC = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [products, setProducts] = useState([]);
	const [query, setQuery] = useState('');
	const navigate = useNavigate();
	const siteUrl = appLocalizer.site_url.replace(/\/$/, '');
	const basePath = siteUrl.replace(window.location.origin, '');
	const ITEMS_PER_PAGE = 12;
	const [pageIndex, setPageIndex] = useState(0);
	const [newProductId, setNewProductId] = useState(null);
	const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

	useEffect(() => {
		setIsLoading(true);
		axios.get(`${appLocalizer.apiUrl}/wc/v3/products/`,
			{
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: { status: 'publish', per_page: 100, },
			}).then((res) => {
				const filtered = res.data.filter((product) => {
					const meta = product.meta_data?.find((m) => m.key === 'multivendorx_store_id');
					const storeId = meta ? Number(meta.value) : null;
					return storeId !== Number(appLocalizer.store_id);
				});
				setProducts(filtered);
			}).catch(() => {
				setProducts([]);
			}).finally(() => {
				setIsLoading(false);
			});
	}, []);

	useEffect(() => {
		setPageIndex(0);
	}, [query]);

	const filteredProducts = products.filter((p) => {
		const name = p.name?.toLowerCase() || '';
		const category = p.categories?.[0]?.name?.toLowerCase() || '';
		const q = query.toLowerCase();

		return name.includes(q) || category.includes(q);
	});

	const pageCount = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

	const paginatedProducts = filteredProducts.slice(
		pageIndex * ITEMS_PER_PAGE,
		(pageIndex + 1) * ITEMS_PER_PAGE
	);

	const createAutoDraftProduct = () => {
		try {
			const payload = {
				name: 'Auto Draft',
				status: 'draft',
			};

			axios
				.post(`${appLocalizer.apiUrl}/wc/v3/products/`, payload, {
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
				})
				.then((res) => {
					setNewProductId(res.data.id);
				});
		} catch (err) {
			console.error(
				'Error creating auto-draft:',
				err.response?.data || err
			);
		}
	};

	useEffect(() => {
		if (!newProductId) {
			return;
		}

		if (appLocalizer.permalink_structure) {
			navigate(
				`${basePath}/${appLocalizer.dashboard_slug}/products/edit/${newProductId}`
			);
		} else {
			navigate(
				`${basePath}/?page_id=${appLocalizer.dashboard_page_id}&segment=products&element=edit&context_id=${newProductId}`
			);
		}
	}, [newProductId]);

	const duplicateProduct = async (product) => {
		const newProductPayload = {
			name: product.name + ' Copy',
			type: product.type,
			regular_price: product.price,
			description: product.description,
			short_description: product.short_description,
			categories: product.categories,
			images: product.images,
			original_id: product.id,
			meta_data: [
				...(product.meta_data || []),
				{ key: 'multivendorx_store_id', value: appLocalizer.store_id },
			],
		};

		// Create new product via REST API
		const newProduct = await axios.post(
			`${appLocalizer.apiUrl}/wc/v3/products`,
			newProductPayload,
			{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
		);

		if (appLocalizer.permalink_structure) {
			navigate(
				`${basePath}/${appLocalizer.dashboard_slug}/products/edit/${newProduct.data.id}/`
			);
		} else {
			navigate(
				`${basePath}/?page_id=${appLocalizer.dashboard_page_id}&segment=products&element=edit&context_id=${newProduct.data.id}`
			);
		}
	};
	return (
		<>
			<div className="product-category-select-wrapper">
				<div className="header">
					<div className="title">Add listings to your shop</div>

					<div className="search-section-wrapper">
						<div className="search-field">
							<div className="search-section">
								<input
									type="text"
									placeholder="Search by an existing listing"
									className="basic-input"
									value={query}
									onChange={(e) => setQuery(e.target.value)}
								/>
								<i className="adminfont-search"></i>
							</div>
						</div>
					</div>
					<div className="buttons-wrapper center">
						<div className="desc">Search by</div>
						<span className="admin-badge blue">Name</span>
						<span className="admin-badge pink">UPC</span>
						<span className="admin-badge teal">ISBN</span>
						{/* <span className="admin-badge orange">listings</span>
						<span className="admin-badge yellow">marketplace</span> */}
						<div className="desc">to locate the right listing.</div>
					</div>
					<div className="desc">Find and add existing marketplace listings to start selling instantly or <span onClick={createAutoDraftProduct}> Create New listing</span></div>
				</div>
				<div className="product-wrapper">
					{isLoading &&
						Array.from({ length: 10 }).map((_, index) => (
							<div className="product" key={index}>
								<div className="product-header">
									<Skeleton
										variant="rectangular"
										width={40}
										height={40}
										className="product-thumb"
									/>
									<Skeleton
										variant="rectangular"
										width={70}
										height={32}
										style={{ borderRadius: 4 }}
									/>
								</div>
								<div className="name">
									<Skeleton width="80%" height={24} />
								</div>
								<div className="category">
									<Skeleton width="60%" height={20} />
								</div>
								<div className="price">
									<Skeleton width="40%" height={22} />
								</div>
							</div>
						))}


					{!isLoading && paginatedProducts.map((product) => {
						const imageSrc =
							product.images && product.images.length > 0
								? product.images[0].src
								: null;

						return (
							<div className="product" key={product.id}>
								<div className="product-header">
									{imageSrc ? (
										<img
											src={imageSrc}
											alt={product.name}
											className="product-thumb"
										/>
									) : (
										<i className="product-icon adminfont-multi-product"></i>
									)}
									<div
										className="admin-btn btn-blue"
										onClick={() =>
											duplicateProduct(product)
										}
									>
										<i className="adminfont-vendor-form-copy"></i>
										Copy
									</div>
								</div>

								<div className="name">{product.name}</div>

								<div className="category">
									{product.categories?.[0]?.name ||
										'No Category'}
								</div>

								<div className="price">
									{formatCurrency(product.price || '0.00')}
								</div>
							</div>
						);
					})}
					{!isLoading && paginatedProducts.length === 0 && (
						<>
							Not found
						</>
					)}
				</div>
				<div className="admin-pagination">
					{pageCount > 1 && (
						<div className="pagination-arrow">
							<span
								tabIndex={0}
								className={`${pageIndex === 0 ? 'pagination-button-disabled' : ''}`}
								onClick={() => {
									if (pageIndex === 0) return;
									setPageIndex(0);
								}}
							>
								<i className="admin-font adminfont-pagination-prev-arrow"></i>
							</span>

							<span
								tabIndex={0}
								className={`${pageIndex === 0 ? 'pagination-button-disabled' : ''}`}
								onClick={() => {
									if (pageIndex === 0) return;
									setPageIndex((p) => p - 1);
								}}
							>
								<i className="admin-font adminfont-pagination-left-arrow"></i>
							</span>

							<div className="pagination">
								{Array.from({ length: pageCount }, (_, i) => (
									<button
										key={i}
										className={`number-btn ${pageIndex === i ? 'active' : ''
											}`}
										onClick={() => setPageIndex(i)}
									>
										{i + 1}
									</button>
								))}
							</div>

							<span
								tabIndex={0}
								className={`${pageIndex === pageCount - 1
									? 'pagination-button-disabled'
									: ''
									}`}
								onClick={() => {
									if (pageIndex === pageCount - 1) return;
									setPageIndex((p) => p + 1);
								}}
							>
								<i className="admin-font adminfont-pagination-right-arrow"></i>
							</span>

							<span
								tabIndex={0}
								className={`${pageIndex === pageCount - 1
									? 'pagination-button-disabled'
									: ''
									}`}
								onClick={() => {
									if (pageIndex === pageCount - 1) return;
									setPageIndex(pageCount - 1);
								}}
							>
								<i className="admin-font adminfont-pagination-next-arrow"></i>
							</span>
						</div>
					)}
				</div>
			</div>
		</>
	);
};

export default SpmvProducts;
