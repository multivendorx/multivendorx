import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	BlockControls,
	AlignmentToolbar,
	InspectorControls,
} from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	ColorPalette,
	ColorIndicator,
	SelectControl,
	__experimentalNumberControl as NumberControl,
	Placeholder,
} from '@wordpress/components';
// import { image } from '@wordpress/icons';

registerBlockType('multivendorx/store-logo', {
	attributes: {
		overlayColor: {
			type: 'string',
		},
		customOverlayColor: {
			type: 'string',
		},
		dimRatio: {
			type: 'number',
			default: 0,
		},
		height: {
			type: 'number',
			default: 100,
		},
		width: {
			type: 'number',
			default: 100,
		},
		aspectRatio: {
			type: 'string',
			default: '1:1',
		},
	},

	edit: ({ attributes, setAttributes }) => {
		const {
			overlayColor,
			customOverlayColor,
			dimRatio,
			height,
			width,
			aspectRatio,
		} = attributes;

		const blockProps = useBlockProps({
			className: 'multivendorx-store-logo-block',
			style: {
				display: 'inline-block',
				maxWidth: '100%',
			},
		});

		// Calculate image dimensions based on aspect ratio
		let imgWidth = width;
		let imgHeight = height;

		if (aspectRatio === '1:1') {
			imgHeight = width;
		} else if (aspectRatio === '16:9') {
			imgHeight = (width / 16) * 9;
		} else if (aspectRatio === '4:3') {
			imgHeight = (width / 4) * 3;
		} else if (aspectRatio === '3:2') {
			imgHeight = (width / 3) * 2;
		}

		// Calculate overlay style
		const overlayStyle = {
			position: 'absolute',
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			backgroundColor: overlayColor || customOverlayColor,
			opacity: dimRatio / 100,
		};

		return (
			<>
				<BlockControls>
					<AlignmentToolbar
						value={attributes.align}
						onChange={(nextAlign) => {
							setAttributes({ align: nextAlign });
						}}
					/>
				</BlockControls>

				<InspectorControls>
					<PanelBody
						title={__('Dimensions', 'multivendorx')}
						initialOpen={true}
					>
						<SelectControl
							label={__('Aspect ratio', 'multivendorx')}
							value={aspectRatio}
							options={[
								{
									label: __('Square - 1:1', 'multivendorx'),
									value: '1:1',
								},
								{
									label: __('16:9', 'multivendorx'),
									value: '16:9',
								},
								{
									label: __('4:3', 'multivendorx'),
									value: '4:3',
								},
								{
									label: __('3:2', 'multivendorx'),
									value: '3:2',
								},
								{
									label: __('Custom', 'multivendorx'),
									value: 'custom',
								},
							]}
							onChange={(value) =>
								setAttributes({ aspectRatio: value })
							}
						/>

						<NumberControl
							label={__('Width', 'multivendorx')}
							value={width}
							onChange={(value) =>
								setAttributes({ width: parseInt(value) || 100 })
							}
							min={50}
							max={500}
							step={10}
						/>

						{aspectRatio === 'custom' && (
							<NumberControl
								label={__('Height', 'multivendorx')}
								value={height}
								onChange={(value) =>
									setAttributes({
										height: parseInt(value) || 100,
									})
								}
								min={50}
								max={500}
								step={10}
							/>
						)}
					</PanelBody>

					<PanelBody
						title={__('Color', 'multivendorx')}
						initialOpen={false}
					>
						<div style={{ marginBottom: '1.25rem' }}>
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									marginBottom: '10px',
								}}
							>
								<label>{__('Overlay', 'multivendorx')}</label>
								{(overlayColor || customOverlayColor) && (
									<ColorIndicator
										colorValue={
											overlayColor || customOverlayColor
										}
									/>
								)}
							</div>
							<ColorPalette
								value={overlayColor || customOverlayColor}
								onChange={(color) => {
									if (color) {
										setAttributes({
											overlayColor: color,
											customOverlayColor: undefined,
										});
									} else {
										setAttributes({
											overlayColor: undefined,
											customOverlayColor: undefined,
										});
									}
								}}
							/>
						</div>

						<RangeControl
							label={__('Overlay opacity', 'multivendorx')}
							value={dimRatio}
							onChange={(value) =>
								setAttributes({ dimRatio: value })
							}
							min={0}
							max={100}
							step={10}
						/>
					</PanelBody>
				</InspectorControls>

				<div {...blockProps}>
					<div
						className="placeholder"
						style={{
							width: `${imgWidth}px`,
							height: `${imgHeight}px`,
						}}
					>
						{__('SN', 'multivendorx')}
						{dimRatio > 0 &&
							(overlayColor || customOverlayColor) && (
								<div style={overlayStyle}></div>
							)}
					</div>
				</div>
			</>
		);
	},

	save: ({ attributes }) => {
		const {
			overlayColor,
			customOverlayColor,
			dimRatio,
			height,
			width,
			aspectRatio,
		} = attributes;

		// Calculate image dimensions based on aspect ratio for save
		let imgWidth = width;
		let imgHeight = height;

		if (aspectRatio === '1:1') {
			imgHeight = width;
		} else if (aspectRatio === '16:9') {
			imgHeight = (width / 16) * 9;
		} else if (aspectRatio === '4:3') {
			imgHeight = (width / 4) * 3;
		} else if (aspectRatio === '3:2') {
			imgHeight = (width / 3) * 2;
		}

		const blockProps = useBlockProps.save({
			style: {
				display: 'inline-block',
				maxWidth: '100%',
			},
		});

		// Calculate overlay style for save
		const overlayStyle = {
			position: 'absolute',
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			backgroundColor: overlayColor || customOverlayColor,
			opacity: dimRatio / 100,
		};

		return (
			<div {...blockProps}>
				<div
					className="multivendorx-store-logo-container"
					style={{
						position: 'relative',
						display: 'inline-block',
						width: `${imgWidth}px`,
						height: `${imgHeight}px`,
					}}
				>
					<div
						className="multivendorx-store-logo-placeholder"
						style={{
							width: '100%',
							height: '100%',
							display: 'block',
							backgroundColor: '#f0f0f0',
							position: 'relative',
						}}
					></div>
					{dimRatio > 0 && (overlayColor || customOverlayColor) && (
						<div style={overlayStyle}></div>
					)}
				</div>
			</div>
		);
	},
});
document.addEventListener('DOMContentLoaded', () => {
	const storeName = StoreInfo?.storeDetails?.storeName || '';
	const storeLogo = StoreInfo?.storeDetails?.storeLogo || '';

	const fallbackText = storeName
		? storeName.substring(0, 2).toUpperCase()
		: '';

	document
		.querySelectorAll('.multivendorx-store-logo-container')
		.forEach((container) => {
			// 🔹 FIRST priority: image
			if (storeLogo) {
				const img = document.createElement('img');
				img.src = storeLogo;
				img.alt = storeName;
				img.style.width = '100%';
				img.style.height = '100%';
				img.style.objectFit = 'cover';
				img.style.position = 'absolute';
				img.style.top = '0';
				img.style.left = '0';

				container.appendChild(img);
				return;
			}

			container.innerHTML = `
                <div class="placeholder">
                    ${fallbackText}
                </div>
            `;
		});
});
