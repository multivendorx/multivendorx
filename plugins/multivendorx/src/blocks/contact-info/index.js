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
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';

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
						<h2>{__('Contact store', 'multivendorx')}</h2>
						<p>
							{__(
								'Do you need more information? Write to us!',
								'multivendorx'
							)}
						</p>

						<p className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
							<label>
								{__('Name', 'multivendorx')}
								<input
									type="text"
									name="name"
									className="input-text"
									required
								/>
							</label>
						</p>

						<p className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
							<label>
								{__('Email', 'multivendorx')}
								<input
									type="email"
									name="email"
									className="input-text"
									required
								/>
							</label>
						</p>

						<p className="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
							<label>
								{__('Message', 'multivendorx')}
								<textarea
									name="message"
									className="input-text"
									rows="4"
									required
								></textarea>
							</label>
						</p>

						<button type="submit" className="contact-form-submit">
							{__('Send Message', 'multivendorx')}
						</button>

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
			<div
				{...blockProps}
				className="multivendorx-contact-info-wrapper"
				data-hide-from-guests={hideFromGuests}
				data-enable-google-recaptcha={
					enableGoogleRecaptcha
				}
				data-google-recaptcha-type={
					googleRecaptchaType
				}
				data-recaptcha-v2-scripts={
					recaptchaV2Scripts
				}
				data-recaptcha-v3-sitekey={
					recaptchaV3Sitekey
				}
				data-recaptcha-v3-secretkey={
					recaptchaV3Secretkey
				}
			>
				<div className="multivendorx-contact-info"></div>
			</div>
		);
	},
});
