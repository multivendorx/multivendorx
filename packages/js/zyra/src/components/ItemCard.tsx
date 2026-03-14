// External Dependencies
import React from "react";

export interface ItemCardProps {
    id?: string | number;
    title?: string;
    description?: string;
    subDescription?: string;

    image?: string;
    icon?: string;

    link?: string;
    sku?: string;

    className?: string;

    onClick?: (item: ItemCardProps, e: React.MouseEvent) => void;
}

export const ItemCardUI: React.FC<ItemCardProps> = (props) => {

    const {
        id,
        title,
        description,
        subDescription,
        image,
        icon,
        link,
        sku,
        className,
        onClick
    } = props;

    const Wrapper: React.ElementType = link ? "a" : "div";

    const wrapperProps: any = {
        className: `item-card ${className || ""}`,
    };

    if (link) {
        wrapperProps.href = link;
    }

    if (onClick) {
        wrapperProps.onClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            onClick(props, e);
        };
    }

    return (
        <Wrapper {...wrapperProps}>
            {image ? (
                <img src={image} alt={title || ""} className="image" />
            ) : icon ? (
                <i className={`item-icon ${icon}`} />
            ) : null}

            <div className="details">
                {title && <div className="title">{title}</div>}

                {description && <div className="des">{description}</div>}

                {subDescription && <div className="des">{subDescription}</div>}

                {sku && <div className="des">SKU: {sku}</div>}

                {id && <div className="id">#{id}</div>}
            </div>
        </Wrapper>
    );
};