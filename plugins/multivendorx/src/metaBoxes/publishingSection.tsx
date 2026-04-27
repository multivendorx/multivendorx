/* global appLocalizer */
import { addFilter } from '@wordpress/hooks';
import { useRef, useState, useEffect } from 'react';
import {
	SelectInputUI,
	Card,
	FormGroup,
	FormGroupWrapper,
	useOutsideClick,
} from 'zyra';
import { __ } from '@wordpress/i18n';
import { formatDate } from '@/services/commonFunction';

const PublishingSection = ({ product, setProduct, handleChange }) => {
	const [isEditingVisibility, setIsEditingVisibility] = useState(false);
	const [isEditingStatus, setIsEditingStatus] = useState(false);
	const visibilityRef = useRef<HTMLDivElement | null>(null);
	const [starFill, setStarFill] = useState(false);

	useEffect(() => {
		setStarFill(product.featured);
	}, []);

	useEffect(() => {
		setProduct((prev) => ({
			...prev,
			featured: starFill,
		}));
	}, [starFill]);

	const VISIBILITY_LABELS: Record<string, string> = {
		visible: __('Shop and search results', 'multivendorx'),
		catalog: __('Shop only', 'multivendorx'),
		search: __('Search results only', 'multivendorx'),
		hidden: __('Hidden', 'multivendorx'),
	};

	const STATUS_LABELS: Record<string, string> = {
		draft: __('Draft', 'multivendorx'),
		publish: __('Published', 'multivendorx'),
		pending: __('Submit', 'multivendorx'),
	};


	return (
		<Card
			title={__('Publishing', 'multivendorx')}
			action={
				<>
					<label
						onClick={() => setStarFill((prev) => !prev)}
						style={{ cursor: 'pointer' }}
						className="field-wrapper"
					>
						{__('Featured product', 'multivendorx')}
						<i
							className={`star-icon ${starFill || product?.featured ? 'adminfont-star' : 'adminfont-star-o'}`}
						/>
					</label>
				</>
			}
		>
			<FormGroupWrapper>
				<FormGroup
					row
					label={__('Catalog Visibility', 'multivendorx')}
					htmlFor="catalog-visibility"
				>
					<div ref={visibilityRef}>
						<div className="catalog-visibility">
							{!isEditingVisibility && (
								<div
									onClick={() => {
										setIsEditingVisibility((prev) => !prev);
										setIsEditingStatus(false);
									}}
								>
									<span className="catalog-visibility-value">
										{
											VISIBILITY_LABELS[
												product.catalog_visibility
											]
										}
									</span>
									<i className="adminfont-arrow-down-up" />
								</div>
							)}
							{isEditingVisibility && (
								<SelectInputUI
									name="catalog_visibility"
									size="14rem"
									options={[
										{
											key: 'visible',
											value: 'visible',
											label: __(
												'Shop and search results',
												'multivendorx'
											),
										},
										{
											key: 'catalog',
											value: 'catalog',
											label: __(
												'Shop only',
												'multivendorx'
											),
										},
										{
											key: 'search',
											value: 'search',
											label: __(
												'Search results only',
												'multivendorx'
											),
										},
										{
											key: 'hidden',
											value: 'hidden',
											label: __('Hidden', 'multivendorx'),
										},
									]}
									value={product.catalog_visibility}
									onChange={(value) => {
										handleChange(
											'catalog_visibility',
											value
										);
										setIsEditingVisibility(false);
									}}
								/>
							)}
						</div>
					</div>
				</FormGroup>
				<FormGroup
					row
					label={__('Product Status', 'multivendorx')}
					htmlFor="status"
				>
					<div ref={visibilityRef}>
						<div className="catalog-visibility">
							{!isEditingStatus && (
								<div
									onClick={() => {
										setIsEditingStatus((prev) => !prev);
										setIsEditingVisibility(false);
									}}
								>
									<span className="catalog-visibility-value">
										{STATUS_LABELS[product.status]}
									</span>
									<i className="adminfont-arrow-down-up" />
								</div>
							)}
							{isEditingStatus && (
								<SelectInputUI
									name="status"
									wrapperClass="fit-content"
									options={[
										...(appLocalizer.current_user?.allcaps
											?.publish_products
											? [
													{
														key: 'publish',
														value: 'publish',
														label: __(
															'Published',
															'multivendorx'
														),
													},
												]
											: []),
										{
											key: 'draft',
											value: 'draft',
											label: __('Draft', 'multivendorx'),
										},
										{
											key: 'pending',
											value: 'pending',
											label: __('Submit', 'multivendorx'),
										},
									]}
									value={product.status}
									onChange={(value) => {
										handleChange('status', value);
										setIsEditingStatus(false);
									}}
								/>
							)}
						</div>
					</div>
				</FormGroup>

				<FormGroup
					row
					label={__('Cataloged at', 'multivendorx')}
					htmlFor="status"
				>
					<div className="catalog-visibility">
						<span className="catalog-visibility-value">
							{formatDate(product?.date_created)}
							{/* <i className="adminfont-arrow-down-up" /> */}
						</span>
					</div>
				</FormGroup>
			</FormGroupWrapper>
		</Card>
	);
};

addFilter(
	'multivendorx_add_product_right_section',
	'multivendorx/publishing_section',
	(content, product, setProduct, handleChange) => {
		return (
			<>
				{content}
				<PublishingSection
					product={product}
					setProduct={setProduct}
					handleChange={handleChange}
				/>
			</>
		);
	},
	20
);
