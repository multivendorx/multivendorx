/* global appLocalizer */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { __ } from '@wordpress/i18n';
import { PopupUI } from 'zyra';
import './index.scss';

const AI_STORAGE_KEY = 'multivendorx_ai_product_suggestions';

interface AIFieldProps {
	product: any;
	setProduct: (p: any) => void;
	field: 'name' | 'short_description' | 'description';
	openGeneratePopup: () => void;
	AIRefresh: number;
}

// Moved outside to prevent re-creation on every render
const FIELD_MAP: Record<string, string> = {
	name: 'productName',
	short_description: 'shortDescription',
	description: 'productDescription',
};

// Header title mapping
const HEADER_TITLE_MAP: Record<string, string> = {
	name: 'Product Name',
	short_description: 'Product Short Description',
	description: 'Product Description',
};

const AIField: React.FC<AIFieldProps> = ({
	product,
	setProduct,
	field,
	openGeneratePopup,
	AIRefresh,
}) => {
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const [popupOpen, setPopupOpen] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	// Memoize the product key to avoid re-calculation
	const productKey = useMemo(() => product?.id, [product?.id]);

	useEffect(() => {
		try {
			const product = localStorage.getItem(AI_STORAGE_KEY);
			if (!product) {
				setSuggestions([]);
				return;
			}

			const parsed = JSON.parse(product);
			const productData = parsed[productKey];
			const storageKey = FIELD_MAP[field];

			if (productData?.[storageKey]?.length) {
				// Filter out empty strings once during load
				setSuggestions(
					productData[storageKey].filter((s: string) => s?.trim())
				);
			} else {
				setSuggestions([]);
			}
		} catch (e) {
			console.error('Error parsing AI suggestions', e);
			setSuggestions([]);
		}
	}, [productKey, field, AIRefresh]);

	// Check current product value to set selected index
	useEffect(() => {
		if (suggestions.length > 0 && product?.[field]) {
			const currentValue = product[field];
			const index = suggestions.findIndex(
				(suggestion) => suggestion === currentValue
			);
			setSelectedIndex(index !== -1 ? index : null);
		} else {
			setSelectedIndex(null);
		}
	}, [suggestions, product, field]);

	// Use useCallback for the selection handler
	const handleSelect = useCallback(
		(value: string, index: number) => {
			setSelectedIndex(index);
			setProduct((prev: any) => ({
				...prev,
				[field]: value,
			}));
			setPopupOpen(false);
		},
		[field, setProduct]
	);

	return (
		<PopupUI
			position="menu-dropdown"
			tooltipName="Suggestion"
			toggleIcon="ai"
			width={25}
			open={popupOpen}
			onOpen={() => {
				setPopupOpen(true);
				if (!suggestions.length) {
					openGeneratePopup();
				}
			}}
			onClose={() => setPopupOpen(false)}
		>
			<div className="ai-suggestions-wrapper">
				{suggestions.length > 0 && (
					<div className="text-wrapper">
						<div className="title">{`Select ${HEADER_TITLE_MAP[field]}`}</div>
						{suggestions.map((item, index) => (
							<div
								key={`${productKey}-${index}`}
								className={`ai-item ${selectedIndex === index ? 'selected' : ''}`}
								onClick={() => handleSelect(item, index)}
							>
								{item}
								{selectedIndex === index && (
									<i className="check-icon adminfont-check-fill" />
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</PopupUI>
	);
};

export default AIField;
