import React from "react";
import { TableRow } from "./types";

export const renderCell = (cell, type = '', row = {}) => {
	if (!cell) return null;
	switch (type) {
		case 'product': {
			const { id, name, image, link, sku } = row;
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
			} = row;

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
		case 'status': {
			return (
				<span className={`admin-badge badge-${String(cell).toLowerCase()}`}>
					{cell}
				</span>
			);
		}

		default:
			return cell ?? null;
	}
};