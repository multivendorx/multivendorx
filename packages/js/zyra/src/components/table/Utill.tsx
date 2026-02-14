import React from "react";
import { TableRow } from "./types";

export const renderCell = (cell: TableRow) => {
	if (!cell) return null;
	switch (cell.type) {
		case 'product': {
			const { id, name, image, link, sku } = cell.data || {};
			return (
				<a href={link} className="product-wrapper">
					{image ? (
						<img
							src={image}
							alt={name}
							className="product-image"
						/>
					) : (<i className="item-icon adminfont-store-inventory" />)}
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
				subDescription
			} = cell.data || {};

			const Wrapper: React.ElementType = link ? 'a' : 'div';

			return (
				<Wrapper
					{...(link ? { href: link } : {})}
					className="details-wrapper"
				>
					{image ? (
						<img
							src={image}
							alt={name || ''}
							className="image"
						/>
					) : icon ? (
						<i className={`item-icon ${icon}`} />
					) : null}
					<div className="details">
						{name && (
							<div className="title">{name}</div>
						)}

						{description && (
							<div className="desc">
								{description}
							</div>
						)}
						{subDescription && (
							<div className="desc">
								{subDescription}
							</div>
						)}
					</div>
				</Wrapper>
			);
		}
		case 'commission': {
			const { items = [] } = cell.data || {};
			const [isExpanded, setIsExpanded] = React.useState(false);

			if (!items.length) return null;

			return (
				<ul className={`commission-details ${isExpanded ? '' : 'overflow'}`}>
					{items.map((item, idx) => (
						<li key={idx}>
							<div className="item">
								<div className="des">{item.label}</div>
								<div className="title">
									{item.isPositive ? '+' : '-'} {item.value}
								</div>
							</div>
						</li>
					))}

					{items.length > 2 && (
						<span
							className="more-btn"
							onClick={() => setIsExpanded(prev => !prev)}
						>
							{isExpanded ? (
								<>
									Less <i className="adminfont-arrow-up"></i>
								</>
							) : (
								<>
									More <i className="adminfont-arrow-down"></i>
								</>
							)}
						</span>
					)}
				</ul>
			);
		}

		default:
			return cell.display ?? null;
	}
};
