import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InnerBlocks,
	InspectorControls,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	ColorPalette,
	SelectControl,
	ToggleControl,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';

// Template 1: Store Header
const TEMPLATE_1 = [
	['multivendorx/store-social-icons', { align: 'right' }],
	['multivendorx/store-logo', {}],
	['multivendorx/store-name', {}],
	[
		'core/group',
		{
			layout: {
				type: 'flex',
				flexWrap: 'nowrap',
				justifyContent: 'start',
				alignItems: 'center',
				orientation: 'horizontal',
			},
			style: {
				spacing: {
					blockGap: '1.25rem',
				},
			},
		},
		[
			['multivendorx/store-email', {}],
			['multivendorx/store-phone', {}],
			['multivendorx/store-address', {}],
		],
	],
	['multivendorx/store-description', {}],
	['core/spacer', { height: '1.25rem' }],
	['multivendorx/store-engagement-tools', { align: 'right' }],
];

// Template 2: Contact Focused
const TEMPLATE_2 = [
	['multivendorx/store-logo', {}],
	['core/spacer', { height: '30px' }],
	['multivendorx/store-name', {}],
	['core/spacer', { height: '30px' }],
	[
		'core/columns',
		{},
		[
			[
				'core/column',
				{ width: '33.33%' },
				[['multivendorx/store-email', {}]],
			],
			[
				'core/column',
				{ width: '33.33%' },
				[['multivendorx/store-phone', {}]],
			],
			[
				'core/column',
				{ width: '33.33%' },
				[['multivendorx/store-social-icons', {}]],
			],
		],
	],
	['core/spacer', { height: '30px' }],
	['multivendorx/store-engagement-tools', {}],
];

// Template 3: Simple Hero
const TEMPLATE_3 = [
	['multivendorx/store-name', {}],
	['core/spacer', { height: '15px' }],
	[
		'core/paragraph',
		{
			content: __(
				'Welcome to our store. We offer the best products with excellent customer service.',
				'multivendorx'
			),
			align: 'center',
		},
	],
	['core/spacer', { height: '30px' }],
	[
		'core/buttons',
		{
			align: 'center',
		},
		[
			[
				'core/button',
				{
					text: __('Browse Products', 'multivendorx'),
					className: 'is-style-fill',
				},
			],
			[
				'core/button',
				{
					text: __('Contact Us', 'multivendorx'),
					className: 'is-style-outline',
				},
			],
		],
	],
	['core/spacer', { height: '30px' }],
	['multivendorx/store-social-icons', {}],
];

// Empty template for reset
const EMPTY_TEMPLATE = [];

// Map templates
const TEMPLATES = {
	'template-1': TEMPLATE_1,
	'template-2': TEMPLATE_2,
	'template-3': TEMPLATE_3,
	empty: EMPTY_TEMPLATE,
};

const ALLOWED_BLOCKS = [
	'core/heading',
	'core/paragraph',
	'core/buttons',
	'core/button',
	'core/columns',
	'core/column',
	'core/row',
	'core/image',
	'core/spacer',
	'multivendorx/store-name',
	'multivendorx/store-email',
	'multivendorx/store-phone',
	'multivendorx/store-address',
	'multivendorx/store-social-icons',
	'multivendorx/store-engagement-tools',
	'multivendorx/store-logo',
];

registerBlockType('multivendorx/store-banner', {
	attributes: {
		height: {
			type: 'string',
			default: 'auto',
		},
		minHeight: {
			type: 'string',
			default: '18.75rem',
		},
		overlayColor: {
			type: 'string',
			default: '#000000',
		},
		overlayOpacity: {
			type: 'number',
			default: 30,
		},
		contentColor: {
			type: 'string',
			default: '#ffffff',
		},
		align: {
			type: 'string',
		},
		backgroundPosition: {
			type: 'string',
			default: 'center',
		},
		contentPosition: {
			type: 'string',
			default: 'center center',
		},
		template: {
			type: 'string',
			default: 'template-1',
		},
		innerContentEnabled: {
			type: 'boolean',
			default: true,
		},
	},

	edit: ({ attributes, setAttributes, clientId }) => {
		const {
			height,
			minHeight,
			overlayColor,
			overlayOpacity,
			contentColor,
			backgroundPosition,
			contentPosition,
			template,
			innerContentEnabled,
		} = attributes;

		const { replaceInnerBlocks } = useDispatch(blockEditorStore);
		const { getBlocks } = useSelect((select) => ({
			getBlocks: select(blockEditorStore).getBlocks,
		}));

		const bannerImage =
			'http://localhost:8889/wp-content/plugins/woocommerce/assets/images/pattern-placeholders/table-wood-house-chair-floor-window.jpg';

		const blockProps = useBlockProps({
			className: `multivendorx-store-banner template-${template} ${innerContentEnabled ? 'has-inner-content' : 'no-inner-content'}`,
			style: {
				height: height,
				minHeight: minHeight,
				backgroundImage: `url(${bannerImage})`,
				backgroundSize: 'cover',
				backgroundPosition: backgroundPosition,
				backgroundRepeat: 'no-repeat',
				position: 'relative',
				display: 'flex',
			},
		});

		const [justifyContent, alignItems] = contentPosition.split(' ');

		// Overlay style
		const overlayStyle = {
			position: 'absolute',
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			backgroundColor: overlayColor,
			opacity: overlayOpacity / 100,
		};

		const contentContainerStyle = {
			position: 'relative',
			zIndex: 2,
			width: '100%',
			display: 'flex',
			flexDirection: 'column',
			padding: '40px',
			color: contentColor,
			justifyContent: justifyContent || 'center',
			alignItems: alignItems || 'center',
		};

		// Get current template
		const currentTemplate = TEMPLATES[template] || TEMPLATE_1;

		// Function to handle template change
		const handleTemplateChange = (newTemplate) => {
			// Set the template attribute
			setAttributes({ template: newTemplate });

			// Only replace inner blocks if inner content is enabled
			if (innerContentEnabled) {
				replaceInnerBlocks(
					clientId,
					TEMPLATES[newTemplate] || TEMPLATE_1
				);
			}
		};

		return (
			<>
				<InspectorControls>
					<PanelBody
						title={__('Banner Settings', 'multivendorx')}
						initialOpen={true}
					>
						<ToggleControl
							label={__('Inner Banner Content', 'multivendorx')}
							checked={innerContentEnabled}
							onChange={(value) =>
								setAttributes({ innerContentEnabled: value })
							}
							help={__(
								'Enable to show content blocks inside the banner',
								'multivendorx'
							)}
						/>

						<SelectControl
							label={__('Template', 'multivendorx')}
							value={template}
							onChange={handleTemplateChange}
							options={[
								{ label: __('Template 1', 'multivendorx'), value: 'template-1' },
								{ label: __('Template 2', 'multivendorx'), value: 'template-2' },
								{ label: __('Template 3', 'multivendorx'), value: 'template-3' },
								{ label: __('Custom', 'multivendorx'), value: 'empty' },
							]}
						/>

						<SelectControl
							label={__('Content Position', 'multivendorx')}
							value={contentPosition}
							onChange={(value) =>
								setAttributes({ contentPosition: value })
							}
							options={[
								{
									label: __('Center Center', 'multivendorx'),
									value: 'center center',
								},
								{
									label: __('Center Left', 'multivendorx'),
									value: 'center flex-start',
								},
								{
									label: __('Center Right', 'multivendorx'),
									value: 'center flex-end',
								},
								{
									label: __('Top Center', 'multivendorx'),
									value: 'flex-start center',
								},
								{
									label: __('Top Left', 'multivendorx'),
									value: 'flex-start flex-start',
								},
								{
									label: __('Top Right', 'multivendorx'),
									value: 'flex-start flex-end',
								},
								{
									label: __('Bottom Center', 'multivendorx'),
									value: 'flex-end center',
								},
								{
									label: __('Bottom Left', 'multivendorx'),
									value: 'flex-end flex-start',
								},
								{
									label: __('Bottom Right', 'multivendorx'),
									value: 'flex-end flex-end',
								},
							]}
						/>

						<SelectControl
							label={__('Height', 'multivendorx')}
							value={height}
							onChange={(value) => setAttributes({ height: value })}
							options={[
								{ label: __('Small (18.75rem)', 'multivendorx'), value: '18.75rem' },
								{ label: __('Medium (25rem)', 'multivendorx'), value: '25rem' },
								{ label: __('Large (500px)', 'multivendorx'), value: '500px' },
								{ label: __('Extra Large (600px)', 'multivendorx'), value: '600px' },
								{ label: __('Auto', 'multivendorx'), value: 'auto' },
							]}
						/>

						<SelectControl
							label={__('Min Height', 'multivendorx')}
							value={minHeight}
							onChange={(value) => setAttributes({ minHeight: value })}
							options={[
								{ label: __('Small (200px)', 'multivendorx'), value: '200px' },
								{ label: __('Medium (18.75rem)', 'multivendorx'), value: '18.75rem' },
								{ label: __('Large (25rem)', 'multivendorx'), value: '25rem' },
								{ label: __('Extra Large (500px)', 'multivendorx'), value: '500px' },
							]}
						/>

						<SelectControl
							label={__('Background Position', 'multivendorx')}
							value={backgroundPosition}
							onChange={(value) =>
								setAttributes({ backgroundPosition: value })
							}
							options={[
								{ label: __('Center', 'multivendorx'), value: 'center' },
								{ label: __('Top', 'multivendorx'), value: 'top' },
								{ label: __('Bottom', 'multivendorx'), value: 'bottom' },
								{ label: __('Left', 'multivendorx'), value: 'left' },
								{ label: __('Right', 'multivendorx'), value: 'right' },
								{ label: __('Top Left', 'multivendorx'), value: 'top left' },
								{ label: __('Top Right', 'multivendorx'), value: 'top right' },
								{ label: __('Bottom Left', 'multivendorx'), value: 'bottom left' },
								{ label: __('Bottom Right', 'multivendorx'), value: 'bottom right' },
							]}
						/>

						<div style={{ marginTop: 20 }}>
							<label>{__('Content Text Color', 'multivendorx')}</label>
							<ColorPalette
								value={contentColor}
								onChange={(color) =>
									setAttributes({ contentColor: color })
								}
							/>
						</div>

						<div style={{ marginTop: 20 }}>
							<label>{__('Overlay Color', 'multivendorx')}</label>
							<ColorPalette
								value={overlayColor}
								onChange={(color) =>
									setAttributes({ overlayColor: color })
								}
							/>
						</div>

						<RangeControl
							label={__('Overlay Opacity (%)', 'multivendorx')}
							value={overlayOpacity}
							onChange={(value) =>
								setAttributes({ overlayOpacity: value })}
							min={0}
							max={100}
							step={5}
						/>
					</PanelBody>
				</InspectorControls>
				<div {...blockProps}>
					<div style={overlayStyle}></div>
					{innerContentEnabled ? (
						<div style={contentContainerStyle}>
							<InnerBlocks
								template={currentTemplate}
								allowedBlocks={ALLOWED_BLOCKS}
								orientation="vertical"
								renderAppender={
									template === 'empty'
										? InnerBlocks.ButtonBlockAppender
										: false
								}
							/>
						</div>
					) : (
						<div
							style={{
								position: 'relative',
								zIndex: 2,
								width: '100%',
								height: '100%',
								minHeight: minHeight,
							}}
						>
							{/* Empty container when inner content is disabled */}
						</div>
					)}
				</div>
			</>
		);
	},

	save: ({ attributes }) => {
		const {
			height,
			minHeight,
			overlayColor,
			overlayOpacity,
			contentColor,
			template,
			innerContentEnabled,
		} = attributes;

		const blockProps = useBlockProps.save({
			className: `multivendorx-store-banner template-${template} ${innerContentEnabled ? 'has-inner-content' : 'no-inner-content'}`,
			style: {
				height: height,
				minHeight: minHeight,
				position: 'relative',
				display: 'flex',
				overflow: 'hidden',
			},
		});

		const overlayStyle = {
			position: 'absolute',
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			backgroundColor: overlayColor,
			opacity: overlayOpacity / 100,
		};

		const contentContainerStyle = {
			position: 'relative',
			zIndex: 2,
			width: '100%',
			display: 'flex',
			flexDirection: 'column',
			padding: '40px',
			color: contentColor,
		};

		return (
			<div {...blockProps}>
				<div style={overlayStyle}></div>
				{innerContentEnabled ? (
					<div style={contentContainerStyle}>
						<InnerBlocks.Content />
					</div>
				) : (
					<div
						style={{
							position: 'relative',
							zIndex: 2,
							width: '100%',
							height: '100%',
							minHeight: minHeight,
						}}
					></div>
				)}
			</div>
		);
	},
});
