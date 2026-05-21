import { render, useEffect, useState } from '@wordpress/element';
import {
	RadioControl,
	SelectControl,
	Spinner,
	Notice,
	BaseControl,
	Disabled,
} from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import './tab.scss';

const ProductTab = () => {
	const [linkType, setLinkType] = useState(moowoodleProduct.linkType || '');
	const [linkedItemId, setLinkedItemId] = useState(
		String(moowoodleProduct.linkedItemId || '')
	);

	const [options, setOptions] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!linkType) {
			setOptions([]);

			return;
		}

		setLoading(true);

		const endpoint = 'course' === linkType ? 'courses' : 'cohorts';

		apiFetch({
			path: `/moowoodle/v1/${endpoint}?unlinked_resources_for=${moowoodleProduct.postId}`,
			method: 'GET',
		})
			.then((response) => {
				const formattedOptions = (response.items || []).map((item) => ({
					label: [item.fullname, item.cohort_name]
						.filter(Boolean)
						.join(' || '),

					value: String(item.id),
				}));

				setOptions(formattedOptions);

				if (response.selected_id) {
					setLinkedItemId(String(response.selected_id));
				}
			})
			.catch((error) => {
				console.error('MooWoodle REST API Error:', error);
			})
			.finally(() => {
				setLoading(false);
			});
	}, [linkType]);

	return (
		<>
			<div className="options_group">
				<div className="form-field">
					<label htmlFor="linked_item">
						{__('Link Type', 'moowoodle')}
					</label>
					<RadioControl
						selected={linkType}
						options={[
							{
								label: __('Course', 'moowoodle'),
								value: 'course',
							},
						]}
						onChange={(value) => {
							setLinkType(value);
							setLinkedItemId('');
						}}
					/>

					<Disabled isDisabled={!moowoodleProduct.khali_dabba}>
						<RadioControl
							selected={linkType}
							options={[
								{
									label: moowoodleProduct.khali_dabba
										? __('Cohort', 'moowoodle')
										: __('Cohort Pro', 'moowoodle'),
									value: 'cohort',
								},
							]}
							onChange={(value) => {
								setLinkType(value);
								setLinkedItemId('');
							}}
						/>
					</Disabled>
				</div>
				{loading && (
					<p className="form-field">
						<Spinner />
					</p>
				)}

				{!!linkType && !loading && (
					<p className="form-field">
						<label htmlFor="linked_item">
							{__('Select Item', 'moowoodle')}
						</label>
						<SelectControl
							value={linkedItemId}
							options={[
								{
									label: __('Select an item...', 'moowoodle'),
									value: '',
								},
								...options,
							]}
							onChange={(value) => {
								setLinkedItemId(value);
							}}
						/>
					</p>
				)}

				<Notice
					status="info"
					isDismissible={false}
					actions={[
						{
							label: __('Synchronize Moodle data', 'moowoodle'),
							url: moowoodleProduct.syncUrl,
							variant: 'link',
						},
					]}
				>
					<p>
						{__("Can't find your course or cohort?", 'moowoodle')}
					</p>
				</Notice>
			</div>
			<input type="hidden" name="link_type" value={linkType} />
			<input type="hidden" name="linked_item_id" value={linkedItemId} />

			<input
				type="hidden"
				name="product_meta_nonce"
				value={moowoodleProduct.productMetaNonce}
			/>
		</>
	);
};

document.addEventListener('DOMContentLoaded', () => {
	const container = document.getElementById('moodle-enrollment-mapping-tab');

	if (container) {
		render(<ProductTab />, container);
	}
});
