import { TableRow } from "./types";

export const renderCell = (cell: TableRow) => {
	if (!cell) return null;
	switch (cell.type) {
		case 'product': {
			const { id, name, image, link, sku } = cell.data || {};
			return (
				<a href={link} className="product-wrapper">
					{image && (
						<img
							src={image}
							alt={name}
							className="product-image"
						/>
					)}
					<i className="item-icon adminfont-store-inventory" />
					<span className="details">
						<span className="title">{name}</span>
						{sku && <span className="des">SKU: {sku}</span>}
						{id && <div className="id">#{id}</div>}
					</span>
				</a>
			);
		}

		default:
			return cell.display ?? null;
	}
};
