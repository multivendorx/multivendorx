import { render, useEffect, useState } from '@wordpress/element';
import { RadioControl, SelectControl, Spinner } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

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
			path: `/moowoodle/v1/${endpoint}?product_tab=true&post_id=${moowoodleProduct.postId}`,
		})
			.then((response) => {
				const formattedOptions = response.items.map((item) => ({
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
				// eslint-disable-next-line no-console
				console.error('MooWoodle REST API Error:', error);
			})
			.finally(() => {
				setLoading(false);
			});
	}, [linkType]);

	return (
		<>
			<p className="form-field moowoodle-link-type-field">
				<RadioControl
					label="Link Type"
					selected={linkType}
					options={[
						{
							label: __( 'Course', 'moowoodle' ),
							value: 'course',
						},
						{
							label: moowoodleProduct.khali_dabba
								? __( 'Cohort', 'moowoodle' )
								: __( 'Cohort Pro', 'moowoodle' ),

							value: 'cohort',

							disabled: !moowoodleProduct.khali_dabba,
						},
					]}
					onChange={(value) => {
						setLinkType(value);

						setLinkedItemId('');
					}}
				/>
			</p>

			{loading && (
				<p className="form-field">
					<Spinner />
				</p>
			)}

			{!!linkType && !loading && (
				<p id="dynamic-link-select" className="form-field show">
					<SelectControl
						label="Select Item"
						value={linkedItemId}
						options={[
							{
								label: __( 'Select an item...', 'moowoodle' ),
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

			<p>
				<span>
					Can't find your course or cohort?
					<a
						href={moowoodleProduct.syncUrl}
						target="_blank"
						rel="noreferrer"
					>
						Synchronize Moodle data from here.
					</a>
				</span>
			</p>

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
	const container = document.getElementById('moowoodle-react-product-tab');

	if (container) {
		render(<ProductTab />, container);
	}
});
