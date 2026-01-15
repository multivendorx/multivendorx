import { addFilter } from '@wordpress/hooks';
import { BasicInput, Card, DynamicRowSetting, FormGroup, FormGroupWrapper } from 'zyra';
import { __ } from '@wordpress/i18n';

const Downloadable = ({ product, setProduct, handleChange }) => {
	const downloadTemplate = {
		fields: [
			{
				key: 'name',
				type: 'text',
				label: 'File Name',
				placeholder: 'File name',
			},
			{
				key: 'file',
				type: 'text',
				label: 'File URL',
				placeholder: 'File URL',
			},
			{
				key: 'upload',
				type: 'button',
				label: 'Upload file',
				onClick: ({ row, rowIndex, updateRow }) => {
					const frame = wp.media({
						title: 'Select or Upload File',
						button: { text: 'Use this file' },
						multiple: false,
					});

					frame.on('select', () => {
						const attachment = frame
							.state()
							.get('selection')
							.first()
							.toJSON();
						updateRow({
							file: attachment.url,
							name: attachment.filename,
						});
					});

					frame.open();
				},
			},
		],
	};


	const updateDownloadableFile = (id, key, value) => {
		setProduct((prev) => ({
			...prev,
			downloads: prev.downloads.map((file) =>
				file.id === id ? { ...file, [key]: value } : file
			),
		}));
	};

	const removeDownloadableFile = (uniqueId) => {
		setProduct((prev) => ({
			...prev,
			downloads: prev.downloads.filter((f) => f.id !== uniqueId),
		}));
	};

	const openMediaUploader = (id) => {
		const frame = wp.media({
			title: 'Select or Upload File',
			button: { text: 'Use this file' },
			multiple: false,
		});

		frame.on('select', () => {
			const attachment = frame.state().get('selection').first().toJSON();
			updateDownloadableFile(id, 'file', attachment.url);
			updateDownloadableFile(id, 'name', attachment.filename);
		});

		frame.open();
	};

	const toggleCard = (cardId) => {
		const body = document.querySelector(`#${cardId} .card-body`);
		const arrow = document.querySelector(`#${cardId} .arrow-icon`);

		if (!body || !arrow) {
			return;
		}

		body.classList.toggle('hide-body');
		arrow.classList.toggle('rotate');
	};

	return (
		// <Card contentHeight
		// 	title={__('Downloadable', 'multivendorx')}
		// 	iconName="adminfont-pagination-right-arrow arrow-icon"
		// 	toggle
		// >
		<>
			<FormGroup>
				<DynamicRowSetting
					keyName="downloads"
					template={downloadTemplate}
					value={product.downloads}
					addLabel={__('Add new', 'multivendorx')}
					onChange={(rows) => {
						const cleanedRows = rows.map(({ upload, ...rest }) => rest);

						setProduct((prev) => ({
							...prev,
							downloads: cleanedRows,
						}));
					}}
				/>
			</FormGroup>

			<FormGroup cols={2} label={__('Download limit', 'multivendorx')} htmlFor="download_limit">
				<BasicInput
					name="download_limit"
					type="number"

					value={product.download_limit}
					onChange={(e) =>
						handleChange(
							'download_limit',
							e.target.value
						)
					}
				/>
			</FormGroup>

			<FormGroup cols={2} label={__('Download limit', 'multivendorx')} htmlFor="download_limit">
				<BasicInput
					name="download_expiry"
					type="number"

					value={product.download_expiry}
					onChange={(e) =>
						handleChange(
							'download_expiry',
							e.target.value
						)
					}
				/>
			</FormGroup>
		</>
		// </Card >
	);
};

addFilter(
	'product_downloadable',
	'my-plugin/downloadable',
	(content, product, setProduct, handleChange) => {
		return (
			<>
				{content}
				<Downloadable
					product={product}
					setProduct={setProduct}
					handleChange={handleChange}
				/>
			</>
		);
	},
	10
);
