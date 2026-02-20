import React from 'react';
import "../styles/web/UI/ItemList.scss";
interface Item {
    id?: string;
    title?: string;
    icon?: string;
    img?: string;
    link?: string;
    tags?: React.ReactNode;
    targetBlank?: boolean;
    action?: (item: Item) => void;
    onApprove?: (item: Item) => void;
    onReject?: (item: Item) => void;
    desc?: string;
    value?: string;
    className?: string;
}

export interface ItemListProps {
    items: Item[];
    className?: string;
    background?: boolean;
    border?: boolean;
}

const ItemList: React.FC<ItemListProps> = ({ items, background, border, className }) => {

    return (
        <div className={`item-list ${className || 'default'}`}>

            {items && items.map((item, index) => {
                const handleClick = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (item.action) item.action(item);
                };

                return (
                    <>
                        {item.link ? (
                            <a
                                href={item.link}
                                target={item.targetBlank ? "_blank" : "_self"}
                                className="item"
                            >
                                {item.icon && <i className={`item-icon ${item.icon}`}></i>}
                                {item.title}
                            </a>
                        ) : (
                            <div
                                className={`item ${background ? 'background' : ''} ${border ? 'border' : ''}`}
                                onClick={() => {
                                    item.action?.();
                                }}
                            >
                                {item.icon && <i className={`item-icon adminfont-${item.icon}`}></i>}
                                {item.img && <img src={item.img} alt="" />}

                                <div className="details">
                                    <div className="title">{item.title}</div>
                                    {item.value && <div className="value">{item.value} </div>}
                                    {item.desc && <div className="desc">{item.desc}</div>}
                                </div>

                                {className === 'notification' && (
                                    <>
                                        <i
                                            className="check-icon adminfont-check color-green"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                item.onApprove?.(item);
                                            }}
                                        />
                                        <i
                                            className="check-icon adminfont-cross color-red"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                item.onReject?.(item);
                                            }}
                                        />
                                    </>
                                )}

                                {item.tags && <div className="tags"> {item.tags} </div>}
                            </div>
                        )}
                    </>
                );
            })}

        </div>
    );
};

export default ItemList;
