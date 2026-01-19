import React from 'react';
import "../../styles/web/UI/MiniCard.scss";
import { Skeleton } from '@mui/material';

type MiniCardItem = {
	iconClass?: string;
	title: string;
	description?: string;
};

type MiniCardProps = {
	className?: string;
	header?: React.ReactNode;
	title?: React.ReactNode;
	background?: boolean;
	border?: boolean;
	width?: string;
	value?: React.ReactNode;
	description?: React.ReactNode;
	items?: MiniCardItem[];
	children?: React.ReactNode;
	isLoading?: boolean;
	cols?:number;
};

const MiniCard: React.FC<MiniCardProps> = ({
	className = '',
	header,
	title,
	value,
	description,
	items,
	children,
	background,
	border,
	cols,
	isLoading = false,
}) => {
	return (
		<div className={`mini-card ${className} ${background ? 'background' : ''} ${border ? 'border' : ''}`} data-cols={cols}>
			{header && <div className="mini-card-header">{header}</div>}

			{title && <h3 className="mini-card-title">{title}</h3>}

			{value && <div className="mini-card-value">
				{isLoading ? <Skeleton variant="text" width={100} /> : value}
			</div>}

			{description && (
				<p className="mini-card-description">{description}</p>
			)}

			{items && items.length > 0 && (
				<div className="mini-card-items">
					{items.map((item, index) => (
						<div className="mini-card-item" key={index}>
							{item.iconClass && (
								<i className={item.iconClass}></i>
							)}
							<div className="content">
								<h3>{item.title}</h3>
								{item.description && (
									<p>{item.description}</p>
								)}
							</div>
						</div>
					))}
				</div>
			)}

			{children && (
				<div className="mini-card-content">{children}</div>
			)}
		</div>
	);
};

export default MiniCard;