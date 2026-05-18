import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
	ButtonInputUI,
	PopupUI,
	TextAreaUI,
	getApiLink,
	Skeleton,
	useOutsideClick,
} from 'zyra';
import { __ } from '@wordpress/i18n';
import { addFilter, applyFilters, removeFilter } from '@wordpress/hooks';
import axios from 'axios';
import AiField from './AIField';
import './index.scss';

interface AIButtonSectionProps {
	product: any;
	setProduct: (p: any) => void;
}

const AI_STORAGE_KEY = 'multivendorx_ai_product_suggestions';

const StorageHelper = (() => {
	let cache: Record<string, any> = {};

	try {
		const stored = localStorage.getItem(AI_STORAGE_KEY);
		cache = stored ? JSON.parse(stored) : {};
	} catch (e) {
		console.error('Failed to initialize AI storage cache', e);
	}

	return {
		get: (productId: string | number) => cache[productId],
		save: (productId: string | number, data: any) => {
			cache[productId] = data;
			try {
				localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(cache));
			} catch (e) {
				console.error('Save failed', e);
			}
		},
		remove: (productId: string | number) => {
			if (productId in cache) {
				delete cache[productId];
				try {
					localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(cache));
				} catch (e) {
					console.error('Remove failed', e);
				}
			}
		},
	};
})();

const LoadingSkeleton: React.FC = () => {
	return (
		<div className="ai-content-wrapper">
			<div className="section">
				<div className="product-details">
					<div className="skeleton-wrapper name">
						<div className="title">Product Name</div>
						{[1, 2, 3].map((index) => (
							<div key={index} className="ai-item skeleton-item">
								<div className="desc">
									<Skeleton width="90%" height="1.25rem" />
								</div>
							</div>
						))}
					</div>
					<div className="skeleton-wrapper short-description">
						<div className="title">Short Description</div>
						{[1, 2, 3].map((index) => (
							<div key={index} className="ai-item skeleton-item">
								<div className="desc">
									<Skeleton width="95%" height="2rem" />
								</div>
							</div>
						))}
					</div>
				</div>
				<div className="image-section">
					<div className="img-skeleton">
						<Skeleton width="100%" height="300px" />
					</div>
				</div>
			</div>
			<div className="skeleton-wrapper description">
				<div className="title">Description</div>
				{[1, 2, 3].map((index) => (
					<div key={index} className="ai-item skeleton-item">
						<div className="desc">
							<Skeleton width="100%" height="3rem" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

const AIButtonSection: React.FC<AIButtonSectionProps> = ({
	product,
	setProduct,
	setFeaturedImage,
}) => {
	const [showPopup, setShowPopup] = useState(false);
	const [AIRefresh, setAIRefresh] = useState(0);
	const [loading, setLoading] = useState(false);
	const [userPrompt, setUserPrompt] = useState('');
	const [AISuggestions, setAISuggestions] = useState<any>(null);
	const productId = product?.id;
	const [showAIPrompt, setShowAIPrompt] = useState(false);
	const [currentImage, setCurrentImage] = useState(null);
	const [selected, setSelected] = useState({
		name: null as number | null,
		short: null as number | null,
		desc: null as number | null,
	});

	// Ref for the AI prompt container
	const aiPromptRef = useRef<HTMLDivElement>(null);

	useOutsideClick(aiPromptRef, () => {
		setShowAIPrompt(false);
	});

	const generateSuggestions = useCallback(async () => {
		if (!userPrompt.trim()) {
			return;
		}
		setLoading(true);

		try {
			const response = await axios.post(
				getApiLink(appLocalizer, 'intelligence'),
				null,
				{
					headers: { 'X-WP-Nonce': appLocalizer.nonce },
					params: {
						endpoint: 'suggestions',
						user_prompt: userPrompt,
					},
				}
			);

			if (response.data?.productName) {
				const clean = (arr: string[]) =>
					(arr || []).filter((s) => s?.trim());
				const newSuggestions = {
					productName: clean(response.data.productName),
					shortDescription: clean(response.data.shortDescription),
					productDescription: clean(response.data.productDescription),
				};

				setAISuggestions(newSuggestions);
				StorageHelper.save(productId, newSuggestions);
				setAIRefresh((prev) => prev + 1);

				setSelected({
					name: newSuggestions.productName?.length > 0 ? 0 : null,
					short:
						newSuggestions.shortDescription?.length > 0 ? 0 : null,
					desc:
						newSuggestions.productDescription?.length > 0
							? 0
							: null,
				});
			}
			// if (response.data?.success === false) {
			//     NoticeManager.add({
			//         message: response.data.message,
			//         type: 'error'
			//     });
			// }
		} catch (err) {
			console.error('AI Generation Error', err);
		} finally {
			setLoading(false);
		}
	}, [userPrompt, productId]);

	const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			if (userPrompt.trim() && !loading) {
				generateSuggestions();
			}
		}
	};

	const openPopup = useCallback(() => {
		const saved = StorageHelper.get(productId);
		if (saved) {
			setAISuggestions(saved);
			setSelected({
				name: saved.productName?.length > 0 ? 0 : null,
				short: saved.shortDescription?.length > 0 ? 0 : null,
				desc: saved.productDescription?.length > 0 ? 0 : null,
			});
		} else {
			setAISuggestions(null);
			setUserPrompt('');
			setSelected({
				name: null,
				short: null,
				desc: null,
			});
		}
		setShowPopup(true);
	}, [productId]);

	useEffect(() => {
		const B_HOOK = 'multivendorx/add-ai-button';
		const F_HOOK = 'multivendorx/ai-field-suggestion';

		addFilter('multivendorx_product_button', B_HOOK, (buttons) => [
			{
				label: __('Generate with AI', 'multivendorx'),
				icon: 'ai',
				color: 'border-purple',
				onClick: openPopup,
			},
			...buttons,
		]);

		addFilter(
			'multivendorx_product_field_suggestions',
			F_HOOK,
			(existing, props) => {
				if (
					['name', 'short_description', 'description'].includes(
						props.field
					)
				) {
					return (
						<>
							{existing}
							<AiField
								product={props.product}
								setProduct={props.setProduct}
								field={props.field}
								openGeneratePopup={openPopup}
								AIRefresh={AIRefresh}
							/>
						</>
					);
				}
				return existing;
			}
		);

		return () => {
			removeFilter('multivendorx_product_button', B_HOOK);
			removeFilter('multivendorx_product_field_suggestions', F_HOOK);
		};
	}, [productId, AIRefresh, openPopup]);

	const toggleSingle = (type: 'name' | 'short' | 'desc', index: number) => {
		setSelected((prev) => ({
			...prev,
			[type]: prev[type] === index ? null : index,
		}));
	};

	const resetSelection = () => {
		setSelected({
			name: null,
			short: null,
			desc: null,
		});
	};

	const handleRegenerate = () => {
		StorageHelper.remove(productId);
		resetSelection();
		setAISuggestions(null);
		setUserPrompt('');
		setAIRefresh((prev) => prev + 1);
		setShowAIPrompt(false);
	};

	const handleAppendSelected = () => {
		const updatedProduct = { ...product };

		if (selected.name !== null && AISuggestions?.productName) {
			updatedProduct.name = AISuggestions.productName[selected.name];
		}

		if (selected.short !== null && AISuggestions?.shortDescription) {
			updatedProduct.short_description =
				AISuggestions.shortDescription[selected.short];
		}

		if (selected.desc !== null && AISuggestions?.productDescription) {
			updatedProduct.description =
				AISuggestions.productDescription[selected.desc];
		}
		if (currentImage) {
			setFeaturedImage({
				id: parseInt(currentImage.id),
				src: currentImage.url,
				thumbnail: currentImage.thumbnail,
			});
		}
		setProduct(updatedProduct);
		setShowPopup(false);
	};

	const hasSuggestions =
		AISuggestions &&
		(AISuggestions.productName?.length > 0 ||
			AISuggestions.shortDescription?.length > 0 ||
			AISuggestions.productDescription?.length > 0);

	return (
		<PopupUI
			open={showPopup}
			onClose={() => setShowPopup(false)}
			position="lightbox"
			width={50}
			height={80}
			header={{
				icon: 'ai',
				title: __('Create Product With AI', 'multivendorx'),
			}}
			footer={
				hasSuggestions ? (
					<ButtonInputUI
						wrapperClass="append-section"
						buttons={[
							{
								icon: 'plus-circle',
								text: 'Append Selected',
								color: 'green',
								onClick: handleAppendSelected,
								disabled:
									selected.name === null &&
									selected.short === null &&
									selected.desc === null,
							},
							{
								icon: 'close',
								text: 'Clear All',
								color: 'red',
								onClick: handleRegenerate,
							},
						]}
					/>
				) : null
			}
		>
			{loading ? (
				<LoadingSkeleton />
			) : hasSuggestions ? (
				<div className="ai-content-wrapper">
					<div className="section">
						<div className="product-details">
							{/* product name */}
							<div className="text-wrapper name">
								<div className="title">{__('Product Name', 'multivendorx')}</div>
								{AISuggestions.productName?.map(
									(name: string, index: number) => (
										<div
											key={index}
											className={`ai-item ${selected.name === index ? 'selected' : ''}`}
											onClick={() =>
												toggleSingle('name', index)
											}
										>
											{name}
											{selected.name === index && (
												<i className="check-icon adminfont-check-fill" />
											)}
										</div>
									)
								)}
							</div>
							{/* Short Description */}
							<div className="text-wrapper short-description">
								<div className="title">{__('Short Description', 'multivendorx')}</div>
								{AISuggestions.shortDescription?.map(
									(text: string, index: number) => (
										<div
											key={index}
											className={`ai-item ${selected.short === index ? 'selected' : ''}`}
											onClick={() =>
												toggleSingle('short', index)
											}
										>
											{text}
											{selected.short === index && (
												<i className="check-icon adminfont-check-fill" />
											)}
										</div>
									)
								)}
							</div>
						</div>

						
						{applyFilters(
							'multivendorx_ai_product_image_section',
							<i className="adminfont-image image-placeholder" />,
							{
								product,
								productId,
								currentImage,
								setCurrentImage,
							}
						)}
					</div>
					<div className="text-wrapper description">
						<div className="title">{__('Description', 'multivendorx')}</div>
						{AISuggestions.productDescription?.map(
							(text: string, index: number) => (
								<div
									key={index}
									className={`ai-item ${selected.desc === index ? 'selected' : ''}`}
									onClick={() => toggleSingle('desc', index)}
								>
									{text}
									{selected.desc === index && (
										<i className="check-icon adminfont-check-fill" />
									)}
								</div>
							)
						)}
					</div>
				</div>
			) : (
				<div className="empty-icon">
					<i className="adminfont-ai" />
					<div className="title">
						{__(
							'What product would you like to create?',
							'multivendorx'
						)}
					</div>
				</div>
			)}

			{!showAIPrompt && (
				<div className="ai-wrapper prompt-wrapper">
					<div className="prompt-input">
						<TextAreaUI
							name="ai_prompt"
							value={userPrompt}
							onChange={setUserPrompt}
							onKeyPress={handleKeyPress}
							placeholder={__(
								'Enter product idea...',
								'multivendorx'
							)}
							rows={5}
						/>
						<span
							onClick={generateSuggestions}
							className={`adminfont-send ${userPrompt.trim() && !loading ? 'active' : ''}`}
							style={{
								cursor:
									userPrompt.trim() && !loading
										? 'pointer'
										: 'not-allowed',
								opacity:
									userPrompt.trim() && !loading ? 1 : 0.5,
							}}
						></span>
					</div>
				</div>
			)}
		</PopupUI>
	);
};

export default AIButtonSection;
