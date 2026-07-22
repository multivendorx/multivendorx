import { addFilter } from '@wordpress/hooks';
import { FormGroupComponent } from '@zyra/components';
import { TextInput, DynamicRowInput } from '@zyra/inputs';
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
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
						updateDownloadableFile(row.id, 'file', attachment.url);
						updateDownloadableFile(
							row.id,
							'name',
							attachment.filename
						);
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

	return (
		<>
			<FormGroupComponent>
				<DynamicRowInput
					keyName="downloads"
					template={downloadTemplate}
					value={product.downloads}
					emptyText={__(
						'No downloadable files added',
						'multivendorx'
					)}
					addLabel={__('Add new', 'multivendorx')}
					onChange={(rows) => {
						const cleanedRows = rows.map(
							({ upload, ...rest }) => rest
						);

						setProduct((prev) => ({
							...prev,
							downloads: cleanedRows,
						}));
					}}
				/>
			</FormGroupComponent>

			<FormGroupComponent
				cols={6}
				label={__('Download limit', 'multivendorx')}
				htmlFor="download_limit"
			>
				<TextInput
					name="download_limit"
					type="number"
					value={product.download_limit}
					onChange={(value) => handleChange('download_limit', value)}
				/>
			</FormGroupComponent>

			<FormGroupComponent
				cols={6}
				label={__('Download Expiry', 'multivendorx')}
				htmlFor="download_expiry"
			>
				<TextInput
					name="download_expiry"
					type="number"
					value={product.download_expiry}
					onChange={(value) => handleChange('download_expiry', value)}
				/>
			</FormGroupComponent>
		</>
	);
};

addFilter(
	'product_downloadable',
	'multivendorx/downloadable',
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
