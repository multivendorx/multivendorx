// External Dependencies
import { MouseEvent, FC } from 'react';

// Internal Dependencies
import { FieldComponent } from './types';
import AdminButtonUI from './UI/AdminButton';


interface ClickableItem {
    name: string;
    url?: string;
}

interface ButtonItem {
    label: string;
    url?: string;
}

interface ClickableListProps {
    items?: ClickableItem[];
    button?: ButtonItem;
    desc?: string;
    wrapperClass?: string;
    onItemClick?: (item: ClickableItem) => void;
    onButtonClick?: (e: MouseEvent) => void;
}


export const ClickableListUI: FC<ClickableListProps> = ({
    items = [],
    button,
    desc,
    wrapperClass,
    onItemClick,
    onButtonClick,
}) => {
    return (
        <div className={`clickable-list-wrapper ${wrapperClass || ''}`}>
            {/* Items */}
            <ul className="clickable-items">
                {items.map((item, idx) => (
                    <li
                        key={idx}
                        className={`clickable-item admin-badge blue ${
                            item.url ? 'has-link' : ''
                        }`}
                        onClick={() => {
                            if (item.url) {
                                onItemClick?.(item);
                            }
                        }}
                    >
                        {item.name}
                    </li>
                ))}
            </ul>

            {/* Bottom Button */}
            {button?.label && (
                <AdminButtonUI
                    wrapperClass="left"
                    buttons={[
                        {
                            icon: 'plus',
                            text: button.label,
                            className: 'purple',
                            onClick: (e) => {
                                e.preventDefault();
                                onButtonClick?.(e);
                            },
                        },
                    ]}
                />
            )}

            {/* Description */}
            {desc && (
                <div className="settings-metabox-description">
                    {desc}
                </div>
            )}
        </div>
    );
};


const ClickableList: FieldComponent = {
    render: ({ field, canAccess }) => (
        <ClickableListUI
            wrapperClass={field.wrapperClass}
            items={field.items}
            button={field.button}
            desc={field.desc}
            onItemClick={(item) => {
                if (!canAccess || !item.url) return;
                window.open(item.url, '_self');
            }}
            onButtonClick={() => {
                if (!canAccess || !field.button?.url) return;
                window.open(field.button.url, '_blank');
            }}
        />
    ),

    validate: () => {
        return null;
    },
};

export default ClickableList;
