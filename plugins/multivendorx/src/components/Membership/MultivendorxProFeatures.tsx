import React, { useState } from 'react';
import { MultiCheckboxTable } from 'zyra';

const MultivendorxProFeatures: React.FC = () => {
	/**
	 * Each checkbox column must exist in `setting`
	 * and store an array of row keys
	 */
	const [setting, setSetting] = useState<Record<string, string[]>>({
		product_create: [],
		product_edit: [],
		product_delete: [],
	});

	/**
	 * Columns definition
	 * - First column = description (text only)
	 * - Rest = checkbox columns
	 */
	const columns = [
		{
			key: 'description',
			label: 'Description',
			type: 'description',
		},
		{
			key: 'product_create',
			label: 'Create',
		},
		{
			key: 'product_edit',
			label: 'Edit',
		},
		{
			key: 'product_delete',
			label: 'Delete',
		},
	];

	/**
	 * Rows definition
	 * - key = row identifier
	 * - label = first column (name)
	 * - description = description column
	 */
	const rows = [
		{
			key: 'simple',
			label: 'Simple Product',
			description:
				'Allows vendors to create and manage simple products.',
		},
		{
			key: 'variable',
			label: 'Variable Product',
			description:
				'Allows vendors to manage products with variations.',
		},
		{
			key: 'grouped',
			label: 'Grouped Product',
			description:
				'Allows vendors to sell multiple related products together.',
		},
	];

	/**
	 * Required props for MultiCheckboxTable
	 */
	const storeTabSetting = {
		products: ['simple', 'variable', 'grouped'],
	};

	const modules = ['products'];

	const handleChange = (key: string, value: string[]) => {
		setSetting((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const handleModuleChange = (module: string) => {
		console.log('Enable module:', module);
	};

	const handleProChanged = () => {
		alert('This is a Pro feature');
	};

	return (
		<>
			<h2>MultiVendorX – Product Permission Matrix</h2>

			<MultiCheckboxTable
				rows={rows}
				columns={columns}
				setting={setting}
				onChange={handleChange}
				storeTabSetting={storeTabSetting}
				modules={modules}
				moduleChange={handleModuleChange}
				proSetting={false}
				proChanged={handleProChanged}
				khali_dabba={true}
			/>

		</>
	);
};

export default MultivendorxProFeatures;
