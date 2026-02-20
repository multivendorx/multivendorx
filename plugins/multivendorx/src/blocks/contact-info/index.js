import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
	TextControl,
	TextareaControl,
	ToggleControl,
	SelectControl,
	PanelBody,
	PanelRow,
} from '@wordpress/components';
import {
	InspectorControls,
	useBlockProps,
	InnerBlocks,
} from '@wordpress/block-editor';

registerBlockType('multivendorx/contact-info', {
	attributes: {
		hideFromGuests: {
			type: 'boolean',
			default: false,
		},
		enableGoogleRecaptcha: {
			type: 'boolean',
			default: false,
		},
		googleRecaptchaType: {
			type: 'string',
			default: 'v2',
		},
		recaptchaV2Scripts: {
			type: 'string',
			default: '',
		},
		recaptchaV3Sitekey: {
			type: 'string',
			default: '',
		},
		recaptchaV3Secretkey: {
			type: 'string',
			default: '',
		},
	},

	edit: ({ attributes, setAttributes }) => {
		const {
			hideFromGuests,
			enableGoogleRecaptcha,
			googleRecaptchaType,
			recaptchaV2Scripts,
			recaptchaV3Sitekey,
			recaptchaV3Secretkey,
		} = attributes;

		const onChangeHideFromGuests = (value) => {
			setAttributes({ hideFromGuests: value });
		};

		const onChangeEnableGoogleRecaptcha = (value) => {
			setAttributes({ enableGoogleRecaptcha: value });
		};

		const onChangeGoogleRecaptchaType = (value) => {
			setAttributes({ googleRecaptchaType: value });
		};

		const onChangeRecaptchaV2Scripts = (value) => {
			setAttributes({ recaptchaV2Scripts: value });
		};

		const onChangeRecaptchaV3Sitekey = (value) => {
			setAttributes({ recaptchaV3Sitekey: value });
		};

		const onChangeRecaptchaV3Secretkey = (value) => {
			setAttributes({ recaptchaV3Secretkey: value });
		};

		const blockProps = useBlockProps();

		const ALLOWED_BLOCKS = [
			'core/heading',
			'core/paragraph',
			'core/button',
			'core/text',
			'core/email',
			'core/textarea',
		];

		const TEMPLATE = [
			[
				'core/heading',
				{
					level: 2,
					content: 'Contact store',
					className: 'contact-form-title',
				},
			],
			[
				'core/paragraph',
				{
					content: 'Do you need more information? Write to us!',
					className: 'contact-form-description',
				},
			],
			[
				'core/paragraph',
				{
					content:
						'<label>Name <input type="text" name="name" class="input-text" required /></label>',
					className:
						' woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide',
				},
			],
			[
				'core/paragraph',
				{
					content:
						'<label>Email <input type="email" name="email" class="input-text" required /></label>',
					className:
						' woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide',
				},
			],
			[
				'core/paragraph',
				{
					content:
						'<label>Message <textarea name="message" class="input-text" rows="4" required></textarea></label>',
					className:
						' woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide',
				},
			],
			[
				'core/button',
				{
					text: 'Send Message',
					className: 'contact-form-submit',
				},
			],
		];

		return (
			<>
				<InspectorControls>
					<PanelBody
						title={__('Visibility Settings')}
						initialOpen={false}
					>
						<PanelRow>
							<ToggleControl
								label={__('Hide from guests')}
								checked={hideFromGuests}
								onChange={onChangeHideFromGuests}
							/>
						</PanelRow>
					</PanelBody>

					<PanelBody
						title={__('Google reCAPTCHA Settings')}
						initialOpen={false}
					>
						<PanelRow>
							<ToggleControl
								label={__('Enable Google Recaptcha')}
								checked={enableGoogleRecaptcha}
								onChange={onChangeEnableGoogleRecaptcha}
							/>
						</PanelRow>

						{enableGoogleRecaptcha && (
							<>
								<PanelRow>
									<SelectControl
										label={__('Google Recaptcha Type')}
										value={googleRecaptchaType}
										options={[
											{
												label: 'reCAPTCHA v2',
												value: 'v2',
											},
											{
												label: 'reCAPTCHA v3',
												value: 'v3',
											},
										]}
										onChange={onChangeGoogleRecaptchaType}
									/>
								</PanelRow>

								{googleRecaptchaType === 'v2' && (
									<PanelRow>
										<TextareaControl
											label={__('Recaptcha Script')}
											value={recaptchaV2Scripts}
											onChange={
												onChangeRecaptchaV2Scripts
											}
											rows={3}
											help={__(
												'Enter the reCAPTCHA v2 script code'
											)}
										/>
									</PanelRow>
								)}

								{googleRecaptchaType === 'v3' && (
									<>
										<PanelRow>
											<TextControl
												label={__('Site Key')}
												value={recaptchaV3Sitekey}
												onChange={
													onChangeRecaptchaV3Sitekey
												}
												help={__(
													'Enter your reCAPTCHA v3 site key'
												)}
											/>
										</PanelRow>
										<PanelRow>
											<TextControl
												label={__('Secret Key')}
												value={recaptchaV3Secretkey}
												onChange={
													onChangeRecaptchaV3Secretkey
												}
												help={__(
													'Enter your reCAPTCHA v3 secret key'
												)}
											/>
										</PanelRow>
									</>
								)}
							</>
						)}
					</PanelBody>
				</InspectorControls>

				<div {...blockProps}>
					<div className="contact-form-block-editor">
						<InnerBlocks
							allowedBlocks={ALLOWED_BLOCKS}
							template={TEMPLATE}
						/>
						{enableGoogleRecaptcha && (
							<div className="recaptcha-preview">
								<p>
									<strong>{__('reCAPTCHA Enabled:')}</strong>{' '}
									{googleRecaptchaType === 'v2' ? 'v2' : 'v3'}
								</p>
							</div>
						)}
					</div>
				</div>
			</>
		);
	},

	save: ({ attributes }) => {
		const {
			hideFromGuests,
			enableGoogleRecaptcha,
			googleRecaptchaType,
			recaptchaV2Scripts,
			recaptchaV3Sitekey,
			recaptchaV3Secretkey,
		} = attributes;

		const blockProps = useBlockProps.save();

		return (
			<div {...blockProps}>
				<form className="woocommerce-form woocommerce-form-login login">
					{hideFromGuests && (
						<div
							className="multivendorx-hide-guests-notice"
							style={{ display: 'none' }}
						>
							{__('This form is hidden from guests.')}
						</div>
					)}

					<InnerBlocks.Content />

					{enableGoogleRecaptcha && (
						<div
							className="multivendorx-recaptcha-settings"
							style={{ display: 'none' }}
						>
							<input
								type="hidden"
								className="multivendorx-recaptcha-enabled"
								value="1"
							/>
							<input
								type="hidden"
								className="multivendorx-recaptcha-type"
								value={googleRecaptchaType}
							/>

							{googleRecaptchaType === 'v2' &&
								recaptchaV2Scripts && (
									<div
										className="multivendorx-recaptcha-v2-script"
										dangerouslySetInnerHTML={{
											__html: recaptchaV2Scripts,
										}}
									/>
								)}

							{googleRecaptchaType === 'v3' && (
								<>
									<input
										type="hidden"
										className="multivendorx-recaptcha-v3-sitekey"
										value={recaptchaV3Sitekey}
									/>
									<input
										type="hidden"
										className="multivendorx-recaptcha-v3-secretkey"
										value={recaptchaV3Secretkey}
									/>
								</>
							)}
						</div>
					)}
				</form>
			</div>
		);
	},
});
