import { addFilter } from '@wordpress/hooks';
import { useRef, useState } from 'react';
import {
	SelectInputUI,
	Card,
	FormGroup,
	FormGroupWrapper,
	useOutsideClick
} from 'zyra';
import { __ } from '@wordpress/i18n';

const PublishingSection = ({ product, setProduct, starFill, setstarFill, handleChange }) => {
	const [isEditingVisibility, setIsEditingVisibility] = useState(false);
	const [isEditingStatus, setIsEditingStatus] = useState(false);
	const visibilityRef = useRef<HTMLDivElement | null>(null);

	const VISIBILITY_LABELS: Record<string, string> = {
		visible: 'Shop and search results',
		catalog: 'Shop only',
		search: 'Search results only',
		hidden: 'Hidden',
	};

	const STATUS_LABELS: Record<string, string> = {
		draft: __('Draft', 'multivendorx'),
		publish: __('Published', 'multivendorx'),
		pending: __('Submit', 'multivendorx'),
	};

	useOutsideClick(visibilityRef, () => setIsEditingVisibility(false));

	return (
		<Card
			contentHeight
			title={__('Publishing', 'multivendorx')}
			action={
				<>
					<label
						onClick={() => setstarFill((prev) => !prev)}
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
										setIsEditingVisibility(
											(prev) => !prev
										);
										setIsEditingStatus(false);
									}}
								>
									<span className="catalog-visibility-value">
										{
											VISIBILITY_LABELS[
												product
													.catalog_visibility
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
											label: 'Shop and search results',
										},
										{
											key: 'catalog',
											value: 'catalog',
											label: 'Shop only',
										},
										{
											key: 'search',
											value: 'search',
											label: 'Search results only',
										},
										{
											key: 'hidden',
											value: 'hidden',
											label: 'Hidden',
										},
									]}
									value={
										product.catalog_visibility
									}
									onChange={(selected) => {
										handleChange(
											'catalog_visibility',
											selected.value
										);
										setIsEditingVisibility(
											false
										);
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
					<div className="catalog-visibility">
						{!isEditingStatus && (
							<div
								onClick={() => {
									setIsEditingStatus(
										(prev) => !prev
									);
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
									{
										key: 'draft',
										value: 'draft',
										label: __(
											'Draft',
											'multivendorx'
										),
									},
									{
										key: 'publish',
										value: 'publish',
										label: __(
											'Published',
											'multivendorx'
										),
									},
									{
										key: 'pending',
										value: 'pending',
										label: __(
											'Submit',
											'multivendorx'
										),
									},
								]}
								value={product.status}
								onChange={(selected) =>
									handleChange(
										'status',
										selected.value
									)
								}
							/>
						)}
					</div>
				</FormGroup>

				<FormGroup
					row
					label={__('Cataloged at', 'multivendorx')}
					htmlFor="status"
				>
					<div className="catalog-visibility">
						<span className="catalog-visibility-value">
							{product?.date_created}{' '}
							<i className="adminfont-arrow-down-up" />
						</span>
					</div>
				</FormGroup>
			</FormGroupWrapper>
		</Card>
	);
};

addFilter(
	'multivendorx_product_before_image_section',
	'multivendorx/publishing_section',
	(content,product,setProduct,handleChange,modules,starFill,setstarFill,) => {
		return (
			<>
				{content}
				<PublishingSection product={product} setProduct={setProduct} starFill={starFill} setstarFill={setstarFill} handleChange={handleChange} />
			</>
		);
	},
	10
);
