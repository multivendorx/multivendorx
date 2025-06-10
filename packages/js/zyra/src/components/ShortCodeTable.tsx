/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import '../styles/web/ShortCodeTable.scss';

// Types
interface Option {
	label?: string;
	desc?: string;
}

interface ShortCodeTableProps {
	wrapperClass: string;
	descClass: string;
	description?: string;
	options: Option[]; // Expected format: array of option objects
	optionLabel?: string[]; // Assuming optionLabel is an array
}

const ShortCodeTable: React.FC<ShortCodeTableProps> = (props) => {
	const { wrapperClass, descClass, description, options, optionLabel } =
		props;

	return (
		<main className={wrapperClass}>
			<table className="shortcode-table">
				<thead>
					<tr>
						{optionLabel && optionLabel.length > 0 ? (
							optionLabel.map((label, index) => (
								<th key={index}>{label}</th>
							))
						) : (
							<th>No Labels</th> // Fallback if no labels exist
						)}
					</tr>
				</thead>
				<tbody>
					{options && options.length > 0 ? (
						options.map((option, index) => (
							<tr key={index}>
								<td>
									<code>{option.label}</code>
								</td>
								<td>{option.desc}</td>
							</tr>
						))
					) : (
						<tr>
							<td colSpan={2}>No Options Available</td>
						</tr> // Fallback if no options exist
					)}
				</tbody>
			</table>
			{description && (
				<p
					className={descClass}
					dangerouslySetInnerHTML={{ __html: description }}
				/>
			)}
		</main>
	);
};

export default ShortCodeTable;
