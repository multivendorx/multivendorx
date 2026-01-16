import React, { useState, useEffect } from 'react';
import { addFilter } from '@wordpress/hooks';
import { Card, getApiLink } from 'zyra';
import axios from 'axios';
import { __ } from '@wordpress/i18n';

const AICard = () => {
	const [aiSuggestions, setAiSuggestions] = useState({
		productName: [],
		shortDescription: [],
		productDescription: [],
	});
	const [userPrompt, setUserPrompt] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [hasSuggestions, setHasSuggestions] = useState(false);

	// Function to update product fields (will be passed from parent)
	const updateProductField = (field, value) => {
		// Map the field names to match what AddProduct expects
		let fieldName = field;
		if (field === 'productName') {
			fieldName = 'name';
		}
		if (field === 'shortDescription') {
			fieldName = 'short_description';
		}
		if (field === 'productDescription') {
			fieldName = 'description';
		}

		const event = new CustomEvent('ai-suggestion-selected', {
			detail: { field: fieldName, value },
		});
		window.dispatchEvent(event);
	};

	// Fetch suggestions from the API
	const fetchSuggestions = (promptText) => {
		if (!promptText || promptText.trim() === '') {
			setError('Please enter a prompt!');
			return;
		}

		setIsLoading(true);
		setError('');
		setHasSuggestions(false);

		// Clear suggestions while loading
		setAiSuggestions({
			productName: [],
			shortDescription: [],
			productDescription: [],
		});

		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, 'ai-assistant'),
			headers: {
				'X-WP-Nonce': appLocalizer.nonce,
				'Content-Type': 'application/json',
			},
			params: {
				endpoint: 'suggestions',
				user_prompt: promptText,
			},
		})
			.then((response) => {
				if (response.data && response.data.productName) {
					// Filter out empty suggestions
					const newSuggestions = {
						productName: response.data.productName.filter(
							(s) => s && s.trim()
						),
						shortDescription: response.data.shortDescription.filter(
							(s) => s && s.trim()
						),
						productDescription:
							response.data.productDescription.filter(
								(s) => s && s.trim()
							),
					};

					setAiSuggestions(newSuggestions);

					// Check if we have any actual suggestions
					const hasAnySuggestions =
						newSuggestions.productName.length > 0 ||
						newSuggestions.shortDescription.length > 0 ||
						newSuggestions.productDescription.length > 0;

					setHasSuggestions(hasAnySuggestions);
				} else {
					const errorMsg =
						response.data?.message ||
						'Failed to fetch suggestions. Check API keys.';
					setError(errorMsg);
					setHasSuggestions(false);
				}
				setIsLoading(false);
			})
			.catch((error) => {
				const errorMsg =
					error.response?.data?.message ||
					'Network error or server failed.';
				setError(errorMsg);
				setHasSuggestions(false);
				setIsLoading(false);
			});
	};

	const handleSendPrompt = () => {
		fetchSuggestions(userPrompt);
	};

	const handleSuggestionClick = (field, suggestion) => {
		updateProductField(field, suggestion);

		// Remove the clicked suggestion from the list
		setAiSuggestions((prev) => {
			// Ensure the field exists and is an array
			if (!prev[field] || !Array.isArray(prev[field])) {
				return prev;
			}
			return {
				...prev,
				[field]: prev[field].filter((s) => s !== suggestion),
			};
		});

		// Check if all suggestions are now empty
		const remainingSuggestions =
			aiSuggestions.productName.filter((s) => s !== suggestion).length +
			aiSuggestions.shortDescription.filter((s) => s !== suggestion)
				.length +
			aiSuggestions.productDescription.filter((s) => s !== suggestion)
				.length;

		if (remainingSuggestions === 0) {
			setHasSuggestions(false);
		}
	};

	// Reset suggestions when prompt is cleared
	useEffect(() => {
		if (!userPrompt.trim()) {
			setAiSuggestions({
				productName: [],
				shortDescription: [],
				productDescription: [],
			});
			setHasSuggestions(false);
			setError('');
		}
	}, [userPrompt]);
	const groupedSuggestions = [];

	const maxLength = Math.max(
		aiSuggestions.productName.length,
		aiSuggestions.shortDescription.length,
		aiSuggestions.productDescription.length
	);

	for (let i = 0; i < maxLength; i++) {
		groupedSuggestions.push({
			title: aiSuggestions.productName[i],
			shortDescription: aiSuggestions.shortDescription[i],
			description: aiSuggestions.productDescription[i],
		});
	}

	return (
		<Card contentHeight
			className="theme-bg"
			title={__('AI assist', 'multivendorx')}
			desc={__('Get help creating your product listing', 'multivendorx')}
			// iconName="adminfont-pagination-right-arrow arrow-icon"
			// toggle
		>
			<div className="ai-assist-wrapper">
				{/* Error */}
				{error && (
					<div className="error-message">
						{error}
					</div>
				)}

				{/* Welcome */}
				{/* {!hasSuggestions && !isLoading && !error && (
					<div className="assistant-welcome">
						<div className="welcome-icon">
							<i className="adminfont-ai"></i>
						</div>
						<div className="welcome-title">
							{__('How can I help?', 'multivendorx')}
						</div>
					</div>
				)} */}

				{/* Loading */}
				{isLoading && (
					<div className="assistant-loading">
						<div className="loading-spinner"></div>
						<p>{__('Generating suggestions...', 'multivendorx')}</p>
					</div>
				)}

				{/* Suggestions */}
				{hasSuggestions && (
					<div className="suggestions-wrapper">
						{groupedSuggestions.map((item, index) => (
							<div
								className="box clickable-suggestion"
								key={`product-${index}`}
							>
								<h4>{__('Suggestions', 'multivendorx')} {index + 1}</h4>

								{item.title && (
									<div
										className="title"
										onClick={() =>
											handleSuggestionClick(
												'productName',
												item.title
											)
										}
									>
										{__('Product Name:', 'multivendorx')}
										<span>{item.title}</span>
										<i className="adminfont-arrow-right"></i>
									</div>
								)}

								{item.shortDescription && (
									<div
										className="title"
										onClick={() =>
											handleSuggestionClick(
												'productName',
												item.shortDescription
											)
										}
									>
										{__('Short Description:', 'multivendorx')}
										<span>{item.shortDescription}</span>
										<i className="adminfont-arrow-right"></i>
									</div>
								)}

								{item.description && (
									<div
										className="title"
										onClick={() =>
											handleSuggestionClick(
												'productName',
												item.description
											)
										}
									>
										{__('Description:', 'multivendorx')}
										<span>{item.description}</span>
										<i className="adminfont-arrow-right"></i>
									</div>
								)}
							</div>
						))}

						{/* Product Name */}
						{aiSuggestions.productName.length > 0 && (
							<div className="suggestion-category">
								<h4>{__('Product Name Suggestions', 'multivendorx')}</h4>
								{aiSuggestions.productName.map((suggestion, index) => (
									<div
										className="box clickable-suggestion"
										key={`name-sugg-${index}`}
										onClick={() =>
											handleSuggestionClick(
												'productName',
												suggestion
											)
										}
									>
										<span>{suggestion}</span>
										<i className="adminfont-arrow-right"></i>
									</div>
								))}
							</div>
						)}

						{/* Short Description */}
						{aiSuggestions.shortDescription.length > 0 && (
							<div className="suggestion-category">
								<h4>
									{__('Product Short Description Suggestions', 'multivendorx')}
								</h4>
								{aiSuggestions.shortDescription.map((suggestion, index) => (
									<div
										className="box clickable-suggestion"
										key={`short-desc-sugg-${index}`}
										onClick={() =>
											handleSuggestionClick(
												'shortDescription',
												suggestion
											)
										}
									>
										<span>{suggestion}</span>
										<i className="adminfont-arrow-right"></i>
									</div>
								))}
							</div>
						)}

						{/* Description */}
						{aiSuggestions.productDescription.length > 0 && (
							<div className="suggestion-category">
								<h4>
									{__('Product Description Suggestions', 'multivendorx')}
								</h4>
								{aiSuggestions.productDescription.map((suggestion, index) => (
									<div
										className="box clickable-suggestion"
										key={`desc-sugg-${index}`}
										onClick={() =>
											handleSuggestionClick(
												'productDescription',
												suggestion
											)
										}
									>
										<span>{suggestion}</span>
										<i className="adminfont-arrow-right"></i>
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{/* Prompt Input */}
				<div className="sender-wrapper">
					<textarea
						type="text"
						placeholder={__('Write the prompt...', 'multivendorx')}
						value={userPrompt}
						onChange={(e) => setUserPrompt(e.target.value)}
						onKeyPress={(e) => {
							if (e.key === 'Enter' && !isLoading) {
								handleSendPrompt();
							}
						}}
						disabled={isLoading}
					/>
				</div>
				<div className="admin-btn btn-purple-bg" onClick={!isLoading ? handleSendPrompt : undefined}>
					{/* <i className="adminfont-mail"></i> */}
					<i
						className={`adminfont-send ${isLoading ? 'loading' : ''
							}`}
						style={{
							cursor: isLoading ? 'not-allowed' : 'pointer',
						}}
					></i>
					Generate with AI
				</div>
			</div>
		</Card>

	);
};

// Modified filter to use React component
addFilter(
	'product_ai_assist',
	'my-plugin/ai-assist-card',
	(content, product) => {
		return (
			<>
				{content}
				<AICard product={product} />
			</>
		);
	},
	10
);
