window.addEventListener('DOMContentLoaded', () => {
	document
	.querySelectorAll('.multivendorx-contact-info-wrapper')
	.forEach((wrapper) => {
			const hideFromGuests =
				wrapper.dataset.hideFromGuests === 'true';

			const enableGoogleRecaptcha =
				wrapper.dataset.enableGoogleRecaptcha === 'true';

			const googleRecaptchaType =
				wrapper.dataset.googleRecaptchaType || 'v2';

			const recaptchaV2Scripts =
				wrapper.dataset.recaptchaV2Scripts || '';

			const recaptchaV3Sitekey =
				wrapper.dataset.recaptchaV3Sitekey || '';

			const recaptchaV3Secretkey =
				wrapper.dataset.recaptchaV3Secretkey || '';

			const root = wrapper.querySelector(
				'.multivendorx-contact-info'
			);

			if (!root) {
				return;
			}

			root.innerHTML = `
				<form
					class="woocommerce-form woocommerce-form-login login multivendorx-contact-form"
					method="post"
					action=""
				>
					${
						hideFromGuests
							? `
							<div style="display:none;">
								This form is hidden from guests.
							</div>
						`
							: ''
					}

					<h2>Contact store</h2>

					<p>
						Do you need more information? Write to us!
					</p>

					<p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
						<label for="contact-name">
							Name
							<span class="required">*</span>
						</label>

						<input
							type="text"
							name="contact_name"
							id="contact-name"
							class="input-text"
							required
						/>
					</p>

					<p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
						<label for="contact-email">
							Email
							<span class="required">*</span>
						</label>

						<input
							type="email"
							name="contact_email"
							id="contact-email"
							class="input-text"
							required
						/>
					</p>

					<p class="woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide">
						<label for="contact-message">
							Message
							<span class="required">*</span>
						</label>

						<textarea
							name="contact_message"
							id="contact-message"
							class="input-text"
							rows="4"
							required
						></textarea>
					</p>

					<input
						type="hidden"
						name="multivendorx_contact_form"
						value="1"
					/>

					<input
						type="hidden"
						name="store_id"
						value=""
					/>

					<button
						type="submit"
						class="contact-form-submit"
					>
						Send Message
					</button>

					${
						enableGoogleRecaptcha
							? `
							<div
								class="multivendorx-recaptcha-settings"
								style="display:none;"
							>
								<input
									type="hidden"
									class="multivendorx-recaptcha-enabled"
									value="1"
								/>

								<input
									type="hidden"
									class="multivendorx-recaptcha-type"
									value="${googleRecaptchaType}"
								/>

								${
									googleRecaptchaType === 'v2' &&
									recaptchaV2Scripts
										? `
										<div class="multivendorx-recaptcha-v2-script">
											${recaptchaV2Scripts}
										</div>
									`
										: ''
								}

								${
									googleRecaptchaType === 'v3'
										? `
										<input
											type="hidden"
											class="multivendorx-recaptcha-v3-sitekey"
											value="${recaptchaV3Sitekey}"
										/>

										<input
											type="hidden"
											class="multivendorx-recaptcha-v3-secretkey"
											value="${recaptchaV3Secretkey}"
										/>
									`
										: ''
								}
							</div>
						`
							: ''
					}
				</form>
			`;
		});
});