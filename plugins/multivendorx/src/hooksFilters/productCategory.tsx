import { addFilter } from '@wordpress/hooks';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
	
	Card,
	FormGroupWrapper,
} from 'zyra';
import { __ } from '@wordpress/i18n';

const ProductCategorysection = ({ product, setProduct, selectedCats, setSelectedCats, selectedChild, setSelectedChild, selectedSub, setSelectedSub, selectedCat, setSelectedCat }) => {
	const [categories, setCategories] = useState([]);
	const isPyramidEnabled =
		appLocalizer.settings_databases_value['product-preferencess']
		?.category_selection_method === 'yes';
	const wrapperRef = useRef(null);

	const handleCategoryClick = (catId) => {
		if (!isPyramidEnabled) {
			return;
		}
		setSelectedCat(catId);
		setSelectedSub(null);
		setSelectedChild(null);
	};

	const handleSubClick = (subId) => {
		if (!isPyramidEnabled) {
			return;
		}
		setSelectedSub(subId);
		setSelectedChild(null);
	};

	const handleChildClick = (childId) => {
		if (!isPyramidEnabled) {
			return;
		}
		setSelectedChild(childId);
	};

	// Breadcrumb path click resets below levels
	const handlePathClick = (level) => {
		if (!isPyramidEnabled) {
			return;
		}
		if (level === 'category') {
			setSelectedSub(null);
			setSelectedChild(null);
		}
		if (level === 'sub') {
			setSelectedChild(null);
		}
	};

	const printPath = () => {
		if (!isPyramidEnabled) {
			return;
		}
		const cat = treeData.find((c) => c.id === selectedCat);

		const sub = cat?.children?.find((s) => s.id === selectedSub);

		const child = sub?.children?.find((c) => c.id === selectedChild);

		return (
			<>
				{cat && (
					<span onClick={() => handlePathClick('category')}>
						{cat.name}
					</span>
				)}

				{sub && (
					<>
						{' / '}
						<span onClick={() => handlePathClick('sub')}>
							{sub.name}
						</span>
					</>
				)}

				{child && (
					<>
						{' / '}
						<span>{child.name}</span>
					</>
				)}
			</>
		);
	};

	// Reset all
	const resetSelection = () => {
		setSelectedCat(null);
		setSelectedSub(null);
		setSelectedChild(null);
	};

	const [treeData, setTreeData] = useState([]);

	const buildTree = (list, parent = 0) =>
		list
			.filter((item) => item.parent === parent)
			.map((item) => ({
				id: item.id,
				name: item.name,
				children: buildTree(list, item.id),
			}));

	useEffect(() => {
		if (categories.length) {
			setTreeData(buildTree(categories));
		}
	}, [categories]);

	const preselectCategory = (savedId) => {
		for (const cat of treeData) {
			if (cat.id === savedId) {
				setSelectedCat(cat.id);
				return;
			}

			for (const sub of cat.children) {
				if (sub.id === savedId) {
					setSelectedCat(cat.id);
					setSelectedSub(sub.id);
					return;
				}

				for (const child of sub.children) {
					if (child.id === savedId) {
						setSelectedCat(cat.id);
						setSelectedSub(sub.id);
						setSelectedChild(child.id);
						return;
					}
				}
			}
		}
	};

	useEffect(() => {
		if (!isPyramidEnabled) {
			return;
		}
		const id = selectedChild || selectedSub || selectedCat;

		if (id) {
			setProduct((prev) => ({
				...prev,
				categories: [{ id: Number(id) }],
			}));
		}
	}, [selectedCat, selectedSub, selectedChild]);

	const preselectedRef = useRef(false);

	useEffect(() => {
		if (preselectedRef.current) {
			return;
		}

		if (treeData.length && product?.categories?.length) {
			const savedId = product.categories[0].id;
			preselectCategory(savedId);
			preselectedRef.current = true;
		}
	}, [treeData, product]);

	useEffect(() => {
		axios
			.get(`${appLocalizer.apiUrl}/wc/v3/products/categories`, {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: {
					per_page: 100,
				},
			})
			.then((res) => setCategories(res.data));
	}, []);

	useEffect(() => {
		if (product && product.categories) {
			setSelectedCats(product.categories.map((c) => c.id));
		}
	}, [product]);

	const toggleCategory = (id) => {
		setSelectedCats((prev) =>
			prev.includes(id)
				? prev.filter((item) => item !== id)
				: [...prev, id]
		);
	};

	const buildCategoryTree = (categories) => {
		const map = {};
		const roots = [];

		categories.forEach((cat) => {
			map[cat.id] = { ...cat, children: [] };
		});

		categories.forEach((cat) => {
			if (cat.parent === 0) {
				roots.push(map[cat.id]);
			} else if (map[cat.parent]) {
				map[cat.parent].children.push(map[cat.id]);
			}
		});

		return roots;
	};

	const CategoryItem = ({ category, selectedCats, toggleCategory }) => {
		return (
			<li className={category.parent === 0 ? 'category' : 'sub-category'}>
				<input
					type="checkbox"
					checked={selectedCats.includes(category.id)}
					onChange={() => toggleCategory(category.id)}
				/>
				{category.name}

				{category.children?.length > 0 && (
					<ul>
						{category.children.map((child) => (
							<CategoryItem
								key={child.id}
								category={child}
								selectedCats={selectedCats}
								toggleCategory={toggleCategory}
							/>
						))}
					</ul>
				)}
			</li>
		);
	};

	const CategoryTree = ({ categories, selectedCats, toggleCategory }) => {
		const nestedCategories = buildCategoryTree(categories);
		return (
			<div className="category-wrapper">
				<ul>
					{nestedCategories.map((cat) => (
						<CategoryItem
							key={cat.id}
							category={cat}
							selectedCats={selectedCats}
							toggleCategory={toggleCategory}
						/>
					))}
				</ul>
			</div>
		);
	};

	return (
		<Card contentHeight title={__('Category', 'multivendorx')}>
			{appLocalizer.settings_databases_value[
				'product-preferencess'
			]?.category_selection_method === 'yes' ? (
				<>
					<div className="category-breadcrumb-wrapper">
						<div className="category-breadcrumb">
							{printPath()}
						</div>

						{(selectedCat ||
							selectedSub ||
							selectedChild) && (
							<button
								onClick={resetSelection}
								className="admin-btn btn-red"
							>
								{__('Reset', 'multivendorx')}
							</button>
						)}
					</div>

					<FormGroupWrapper>
						<div
							className="category-wrapper template2"
							ref={wrapperRef}
						>
							<ul className="settings-form-group-radio">
								{treeData.map((cat) => (
									<React.Fragment key={cat.id}>
										<li
											className={`category ${
												selectedCat ===
												cat.id
													? 'radio-select-active'
													: ''
											}`}
											style={{
												display:
													selectedCat ===
														null ||
													selectedCat ===
														cat.id
														? 'block'
														: 'none',
											}}
											onClick={() =>
												handleCategoryClick(
													cat.id
												)
											}
										>
											<label>
												{cat.name}
											</label>
										</li>
										{selectedCat === cat.id &&
											cat.children?.length >
												0 && (
												<ul className="settings-form-group-radio">
													{cat.children.map(
														(sub) => (
															<React.Fragment
																key={
																	sub.id
																}
															>
																<li
																	className={`sub-category ${
																		selectedSub ===
																		sub.id
																			? 'radio-select-active'
																			: ''
																	}`}
																	style={{
																		display:
																			!selectedSub ||
																			selectedSub ===
																				sub.id
																				? 'block'
																				: 'none',
																	}}
																	onClick={() =>
																		handleSubClick(
																			sub.id
																		)
																	}
																>
																	<label>
																		{
																			sub.name
																		}
																	</label>
																</li>

																{selectedSub ===
																	sub.id &&
																	sub
																		.children
																		?.length >
																		0 && (
																		<ul className="settings-form-group-radio">
																			{sub.children.map(
																				(
																					child
																				) => (
																					<li
																						key={
																							child.id
																						}
																						className={`sub-category ${
																							selectedChild ===
																							child.id
																								? 'radio-select-active'
																								: ''
																						}`}
																						style={{
																							display:
																								!selectedChild ||
																								selectedChild ===
																									child.id
																									? 'block'
																									: 'none',
																						}}
																						onClick={() =>
																							handleChildClick(
																								child.id
																							)
																						}
																					>
																						<label>
																							{
																								child.name
																							}
																						</label>
																					</li>
																				)
																			)}
																		</ul>
																	)}
															</React.Fragment>
														)
													)}
												</ul>
											)}
									</React.Fragment>
								))}
							</ul>
						</div>
					</FormGroupWrapper>
				</>
			) : (
				<FormGroupWrapper>
					<CategoryTree
						categories={categories}
						selectedCats={selectedCats}
						toggleCategory={toggleCategory}
					/>
				</FormGroupWrapper>
			)}
		</Card>
	);
};

addFilter(
	'product_category_section',
	'my-plugin/product_category',
	(content, product, setProduct, selectedCats, setSelectedCats, selectedChild, setSelectedChild, selectedSub, setSelectedSub, selectedCat, setSelectedCat) => {
		return (
			<>
				{content}
				<ProductCategorysection product={product} setProduct={setProduct} selectedCats={selectedCats} setSelectedCats={setSelectedCats} 
					selectedChild={selectedChild} setSelectedChild={setSelectedChild} selectedSub={selectedSub} setSelectedSub={setSelectedSub} selectedCat={selectedCat} setSelectedCat={setSelectedCat}/>
			</>
		);
	},
	10
);
