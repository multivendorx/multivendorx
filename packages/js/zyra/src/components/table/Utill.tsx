import React from "react";
import { TableRow, TableHeaderConfig } from "./types"; // keep types if you have them

export const renderCell = (
	row: TableRow = {},
	header: TableHeaderConfig = {},
	format = "",
	currencySymbol = ""
) => {
	const value = row[header.key];

	if (!header?.type) return value ?? null;

	switch (header.type) {
		case "product": {
			const { id, name, image, link, sku } = row as any;
			return (
				<a href={link} className="product-wrapper">
					{image ? (
						<img src={image} alt={name} className="product-image" />
					) : (
						<i className="item-icon adminfont-store-inventory" />
					)}
					<span className="details">
						<span className="title">{name}</span>
						{sku && <span className="des">SKU: {sku}</span>}
						{id && <div className="id">#{id}</div>}
					</span>
				</a>
			);
		}

		case "card": {
			const { link, name, description, image, icon, subDescription } =
				row as any;

			const Wrapper: React.ElementType = link ? "a" : "div";

			return (
				<Wrapper {...(link ? { href: link } : {})} className="details-wrapper">
					{image ? (
						<img src={image} alt={name || ""} className="image" />
					) : icon ? (
						<i className={`item-icon ${icon}`} />
					) : null}
					<div className="details">
						{name && <div className="title">{name}</div>}
						{description && <div className="desc">{description}</div>}
						{subDescription && <div className="desc">{subDescription}</div>}
					</div>
				</Wrapper>
			);
		}

		case "status": {
			return (
				<span className={`admin-badge badge-${String(value).toLowerCase()}`}>
					{value}
				</span>
			);
		}

		case "date": {
			if (!value) return null;

			const dateObj = new Date(value);
			if (isNaN(dateObj.getTime())) return <span>{value}</span>;

			const map: Record<string, string> = {
				YYYY: String(dateObj.getFullYear()),
				YY: String(dateObj.getFullYear()).slice(-2),

				MMMM: dateObj.toLocaleString(undefined, { month: "long" }),
				MMM: dateObj.toLocaleString(undefined, { month: "short" }),
				MM: String(dateObj.getMonth() + 1).padStart(2, "0"),

				DD: String(dateObj.getDate()).padStart(2, "0"),
				D: String(dateObj.getDate()),

				HH: String(dateObj.getHours()).padStart(2, "0"),
				mm: String(dateObj.getMinutes()).padStart(2, "0"),
				ss: String(dateObj.getSeconds()).padStart(2, "0"),
			};

			// Use header.format if provided, otherwise default
			const dateFormat = format || "YYYY-MM-DD";

			const formattedDate = dateFormat.replace(
				/YYYY|YY|MMMM|MMM|MM|DD|D|HH|mm|ss/g,
				(token) => map[token] ?? token
			);

			return <span>{formattedDate}</span>;
		}


		case "currency": {
			if (value == null) return null;

			const position = header.currencyPosition === "after" ? "after" : "before";

			// Ensure numeric formatting
			const numberValue =
				typeof value === "number"
					? value
					: parseFloat(value.toString().replace(/[^0-9.-]+/g, ""));

			if (isNaN(numberValue)) return <span>{value}</span>;

			const formatted = numberValue.toFixed(2);

			return <span>{currencySymbol ? (position === "before" ? `${currencySymbol}${formatted}` : `${formatted}${currencySymbol}`) : formatted}</span>;
		}

		default:
			return value ?? null;
	}
};
