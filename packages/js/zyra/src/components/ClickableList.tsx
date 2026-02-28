// External Dependencies
import { MouseEvent, FC } from 'react';

// Internal Dependencies
import { FieldComponent } from './types';
import { AdminButtonUI } from './AdminButton';


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
                    position="left"
                    buttons={[
                        {
                            icon: 'plus',
                            text: button.label,
                            color: 'purple',
                            onClick: (e) => {
                                onButtonClick?.(e);
                            },
                        },
                    ]}
                />
            )}
        </div>
    );
};


const ClickableList: FieldComponent = {
    render: ({ field, value, onChange, canAccess, appLocalizer }) => (
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