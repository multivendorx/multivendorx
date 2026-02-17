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
			const { ann, modules = [], settings = {} } = cell.data || {};

			if (!ann) return null;

			// Helper to check if a value should be shown (exists and is not "0.00" or 0)
			const hasValue = (val: any) => val !== undefined && val !== null && parseFloat(val) !== 0;

			const rows = [
				{ label: 'Store Earning', value: ann.storeEarning, show: (ann.storeEarning) },
				{
					label: 'Shipping',
					value: ann.shippingAmount,
					show: modules.includes('store-shipping') && (ann.shippingAmount),
					prefix: '+'
				},
				{
					label: 'Tax',
					value: ann.taxAmount,
					show: (ann.taxAmount) && settings?.give_tax !== 'no_tax',
					prefix: '+'
				},
				{
					label: 'Shipping Tax',
					value: ann.shippingTaxAmount,
					show: (ann.shippingTaxAmount),
					prefix: '+'
				},
				{
					label: 'Gateway Fee',
					value: ann.gatewayFee,
					show: modules.includes('marketplace-gateway') && (ann.gatewayFee),
					prefix: '-'
				},
				{
					label: 'Facilitator Fee',
					value: ann.facilitatorFee,
					show: modules.includes('facilitator') && (ann.facilitatorFee),
					prefix: '-'
				},
				{
					label: 'Platform Fee',
					value: ann.platformFee,
					show: modules.includes('marketplace-fee') && (ann.platformFee),
					prefix: '-'
				},
			].filter(row => row.show);
			if (rows.length === 0) {
				return <span>-</span>;
			}

			return (
				<ul className="details">
					{rows.map((row, index) => (
						<li key={index}>
							<div className="item">
								<div className="des">{row.label}{row.prefix}{row.value}</div>
							</div>
						</li>
					))}
				</ul>
			);
		}

		default:
			return cell.display ?? null;
	}
};
