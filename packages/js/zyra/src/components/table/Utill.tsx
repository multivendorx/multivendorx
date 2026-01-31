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
		case 'card': {
			const {
				link,
				name,
				description,
				image,
				icon,
			} = cell.data || {};

			const Wrapper: React.ElementType = link ? 'a' : 'div';

			return (
				<Wrapper
					{...(link ? { href: link } : {})}
					className="card-cell"
				>
					<div className="card-cell-content">
						{name && (
							<div className="card-cell-name">{name}</div>
						)}

						{description && (
							<div className="card-cell-description">
								{description}
							</div>
						)}
					</div>

					{image ? (
						<img
							src={image}
							alt={name || ''}
							className="card-cell-image"
						/>
					) : icon ? (
						<i className={`item-icon ${icon}`} />
					) : null}
				</Wrapper>
			);
		}



		default:
			return cell.display ?? null;
	}
};
