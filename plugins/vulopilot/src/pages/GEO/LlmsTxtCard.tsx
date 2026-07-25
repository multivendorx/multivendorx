/* global appLocalizer */
import { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { getApiLink, getApiResponse, sendApiResponse } from '@zyra/core';
import { CardComponent, FormGroupComponent } from '@zyra/components';
import { ButtonInput, ToggleInput } from '@zyra/inputs';

interface SettingsResponse {
	enable_llms_txt?: string[] | boolean;
}

interface LlmsTxtPreviewResponse {
	content: string;
}

/**
 * readme.txt's "llms.txt Generation & Management" — a free feature (no
 * AI cost), so unlike GeoScoreCard this lives directly in Free's GEO.tsx,
 * not behind the `vulopilot_geo_score_card` Pro filter. The live file
 * itself is served by GeoAnalysis\LlmsTxtGenerator's own rewrite rule;
 * this card only toggles the `enable_llms_txt` setting (through the same
 * `/settings` route every other toggle in this plugin uses — checkbox
 * fields round-trip as zyra's `[]`/`['enabled']` wire shape, see
 * Controllers/Settings.php's own docblock) and previews the generated
 * content via `/llms-txt/preview` without needing to leave wp-admin.
 */
const LlmsTxtCard = () => {
	const [isEnabled, setIsEnabled] = useState(true);
	const [preview, setPreview] = useState<string | null>(null);
	const [isLoadingPreview, setIsLoadingPreview] = useState(false);

	useEffect(() => {
		getApiResponse<SettingsResponse>(
			getApiLink(appLocalizer, 'settings'),
			{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
		).then((response) => {
			if (response) {
				setIsEnabled(
					Array.isArray(response.enable_llms_txt)
						? response.enable_llms_txt.includes('enabled')
						: !!response.enable_llms_txt
				);
			}
		});
	}, []);

	const handleToggle = (value: string) => {
		const next = 'on' === value;
		setIsEnabled(next);

		sendApiResponse(appLocalizer, getApiLink(appLocalizer, 'settings'), {
			setting: { enable_llms_txt: next },
		});
	};

	const handlePreview = () => {
		setIsLoadingPreview(true);

		getApiResponse<LlmsTxtPreviewResponse>(
			getApiLink(appLocalizer, 'llms-txt/preview'),
			{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
		)
			.then((response) => {
				if (response) {
					setPreview(response.content);
				}
			})
			.finally(() => setIsLoadingPreview(false));
	};

	return (
		<CardComponent
			title={__('llms.txt', 'vulopilot')}
			desc={__(
				'A Markdown index of your key pages, served at /llms.txt for AI systems to read instead of crawling your whole site.',
				'vulopilot'
			)}
		>
			<FormGroupComponent label={__('Enabled', 'vulopilot')}>
				<ToggleInput
					options={[
						{ key: 'on', value: 'on', label: __('On', 'vulopilot') },
						{ key: 'off', value: 'off', label: __('Off', 'vulopilot') },
					]}
					value={isEnabled ? 'on' : 'off'}
					onChange={handleToggle}
				/>
			</FormGroupComponent>

			<div className="llms-txt-card-actions">
				<ButtonInput
					buttons={{
						text: isLoadingPreview
							? __('Loading…', 'vulopilot')
							: __('Preview', 'vulopilot'),
						icon: 'search',
						onClick: handlePreview,
						disabled: isLoadingPreview,
					}}
				/>
				<a
					href={`${appLocalizer.site_url}/llms.txt`}
					target="_blank"
					rel="noopener noreferrer"
				>
					{__('View live file', 'vulopilot')}
				</a>
			</div>

			{null !== preview && <pre className="llms-txt-card-preview">{preview}</pre>}
		</CardComponent>
	);
};

export default LlmsTxtCard;
