import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ReactSortable } from 'react-sortablejs';
import '../../styles/web/Emailtemplate.scss';

export type EmailBlock =
    | TextBlock
    | ImageBlock
    | ButtonBlock
    | DividerBlock
    | ColumnsBlock
    | HeadingBlock;

type EmailBlockPatch< T extends EmailBlock = EmailBlock > = Omit<
    Partial< T >,
    'type' | 'id'
>;

interface BaseBlock {
    id: number;
    type: string;
}

// EmailBlockSettings.tsx
interface EmailBlockSettingsProps {
    block: EmailBlock;
    onChange: ( patch: EmailBlockPatch ) => void;
}

interface BlockStyle {
    backgroundColor?: string;
    padding?: number;
    textAlign?: 'left' | 'center' | 'right';
}

export interface TextBlock extends BaseBlock {
    type: 'text';
    html: string;
    style?: BlockStyle;
}

export interface HeadingBlock extends BaseBlock {
    type: 'heading';
    text: string;
    level: 1 | 2 | 3;
    style?: BlockStyle;
}

export interface ButtonBlock extends BaseBlock {
    type: 'button';
    text: string;
    url?: string;
    style?: {
        backgroundColor?: string;
        color?: string;
        align?: 'left' | 'center' | 'right';
    };
}

export interface ColumnsBlock extends BaseBlock {
    type: 'columns';
    layout: '1' | '2-50' | '2-66' | '3' | '4';
    columns: EmailBlock[][];
    style?: {
        backgroundColor?: string;
        padding?: number;
    };
}

export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    previewText?: string;
    blocks: EmailBlock[];
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
    // -------------------------
    // ORDER PLACED (existing)
    // -------------------------
    {
        id: 'order-placed',
        name: 'Order Placed (Formal)',
        subject: 'Order Successfully Placed',
        previewText: 'Your order has been received',
        blocks: [
            {
                id: 1,
                type: 'heading',
                text: 'Order Confirmation',
                level: 2,
            },
            {
                id: 2,
                type: 'text',
                html: `
          <p>Dear Customer,</p>
          <p>
            We are pleased to inform you that your order has been placed
            successfully. Our team will begin processing the order shortly.
          </p>
          <p>Thank you for choosing our service.</p>
        `,
            },
            { id: 3, type: 'divider' },
            {
                id: 4,
                type: 'text',
                html: `
          <p><strong>Order Number:</strong> {{order_id}}</p>
          <p><strong>Order Date:</strong> {{order_date}}</p>
        `,
            },
            {
                id: 5,
                type: 'button',
                text: 'View Order Details',
                url: '{{order_url}}',
            },
        ],
    },

    // -------------------------
    // ORDER SHIPPED
    // -------------------------
    {
        id: 'order-shipped',
        name: 'Order Shipped',
        subject: 'Your Order Has Been Shipped',
        previewText: 'Your order is on the way',
        blocks: [
            {
                id: 1,
                type: 'heading',
                text: 'Order Shipped',
                level: 2,
            },
            {
                id: 2,
                type: 'text',
                html: `
          <p>Dear Customer,</p>
          <p>
            We are happy to inform you that your order has been shipped
            and is currently in transit.
          </p>
        `,
            },
            {
                id: 3,
                type: 'text',
                html: `
          <p><strong>Tracking Number:</strong> {{tracking_number}}</p>
          <p><strong>Courier:</strong> {{shipping_provider}}</p>
        `,
            },
            {
                id: 4,
                type: 'button',
                text: 'Track Your Order',
                url: '{{tracking_url}}',
            },
        ],
    },

    // -------------------------
    // ORDER DELIVERED
    // -------------------------
    {
        id: 'order-delivered',
        name: 'Order Delivered',
        subject: 'Your Order Has Been Delivered',
        previewText: 'We hope you enjoy your purchase',
        blocks: [
            {
                id: 1,
                type: 'heading',
                text: 'Order Delivered Successfully',
                level: 2,
            },
            {
                id: 2,
                type: 'text',
                html: `
          <p>Dear Customer,</p>
          <p>
            We are pleased to inform you that your order has been delivered.
            We hope the product meets your expectations.
          </p>
        `,
            },
            {
                id: 3,
                type: 'button',
                text: 'View Order',
                url: '{{order_url}}',
            },
        ],
    },

    // -------------------------
    // PAYMENT FAILED
    // -------------------------
    {
        id: 'payment-failed',
        name: 'Payment Failed',
        subject: 'Payment Could Not Be Processed',
        previewText: 'Action required to complete your order',
        blocks: [
            {
                id: 1,
                type: 'heading',
                text: 'Payment Failed',
                level: 2,
            },
            {
                id: 2,
                type: 'text',
                html: `
          <p>Dear Customer,</p>
          <p>
            Unfortunately, we were unable to process your payment
            for the recent order.
          </p>
          <p>
            Please update your payment details to proceed.
          </p>
        `,
            },
            {
                id: 3,
                type: 'button',
                text: 'Retry Payment',
                url: '{{payment_url}}',
            },
        ],
    },

    // -------------------------
    // STORE / ACCOUNT APPROVED
    // -------------------------
    {
        id: 'account-approved',
        name: 'Account Approved',
        subject: 'Your Account Has Been Approved',
        previewText: 'You can now access your dashboard',
        blocks: [
            {
                id: 1,
                type: 'heading',
                text: 'Account Approved',
                level: 2,
            },
            {
                id: 2,
                type: 'text',
                html: `
          <p>Dear {{user_name}},</p>
          <p>
            We are pleased to inform you that your account has been
            successfully approved.
          </p>
        `,
            },
            {
                id: 3,
                type: 'button',
                text: 'Go to Dashboard',
                url: '{{dashboard_url}}',
            },
        ],
    },

    // -------------------------
    // PASSWORD RESET
    // -------------------------
    {
        id: 'password-reset',
        name: 'Password Reset',
        subject: 'Reset Your Password',
        previewText: 'Password reset request received',
        blocks: [
            {
                id: 1,
                type: 'heading',
                text: 'Password Reset Request',
                level: 2,
            },
            {
                id: 2,
                type: 'text',
                html: `
          <p>Dear User,</p>
          <p>
            We received a request to reset your password.
            Please click the button below to proceed.
          </p>
        `,
            },
            {
                id: 3,
                type: 'button',
                text: 'Reset Password',
                url: '{{reset_password_url}}',
            },
        ],
    },

    // -------------------------
    // ORDER CANCELLED
    // -------------------------
    {
        id: 'order-cancelled',
        name: 'Order Cancelled',
        subject: 'Your Order Has Been Cancelled',
        previewText: 'Order cancellation confirmation',
        blocks: [
            {
                id: 1,
                type: 'heading',
                text: 'Order Cancelled',
                level: 2,
            },
            {
                id: 2,
                type: 'text',
                html: `
          <p>Dear Customer,</p>
          <p>
            This email is to inform you that your order
            has been cancelled as per your request.
          </p>
        `,
            },
            {
                id: 3,
                type: 'text',
                html: `
          <p><strong>Order Number:</strong> {{order_id}}</p>
        `,
            },
        ],
    },
];

const CommonStyleControls = ( {
    style = {},
    onChange,
}: {
    style?: any;
    onChange: ( style: any ) => void;
} ) => (
    <>
        <label>Background</label>
        <input
            type="color"
            value={ style.backgroundColor || '#ffffff' }
            onChange={ ( e ) =>
                onChange( { ...style, backgroundColor: e.target.value } )
            }
        />

        <label>Padding</label>
        <input
            type="number"
            min={ 0 }
            value={ style.padding ?? 0 }
            onChange={ ( e ) =>
                onChange( { ...style, padding: Number( e.target.value ) } )
            }
        />
    </>
);

const EmailBlockSettings: React.FC< EmailBlockSettingsProps > = ( {
    block,
    onChange,
} ) => {
    switch ( block.type ) {
        case 'text':
            return (
                <>
                    <label>Text HTML</label>
                    <textarea
                        value={ block.html }
                        onChange={ ( e ) =>
                            onChange( { html: e.target.value } )
                        }
                    />
                    <CommonStyleControls
                        style={ block.style }
                        onChange={ ( style ) => onChange( { style } ) }
                    />
                </>
            );

        case 'image':
            return (
                <>
                    <label>Image URL</label>
                    <input
                        value={ block.src }
                        onChange={ ( e ) =>
                            onChange( { src: e.target.value } )
                        }
                    />
                </>
            );

        case 'columns':
            return (
                <>
                    <label>Layout</label>
                    <select
                        value={ block.layout }
                        onChange={ ( e ) => {
                            const newLayout = e.target
                                .value as ColumnsBlock[ 'layout' ];
                            const count = getColumnCount( newLayout );

                            const newColumns = Array.from(
                                { length: count },
                                ( _, i ) => block.columns[ i ] || []
                            );

                            onChange( {
                                layout: newLayout,
                                columns: newColumns,
                            } );
                        } }
                    >
                        <option value="1">1 Column</option>
                        <option value="2-50">50 / 50</option>
                        <option value="2-66">66 / 34</option>
                        <option value="3">3 Columns</option>
                        <option value="4">4 Columns</option>
                    </select>
                </>
            );

        default:
            return <div>No settings</div>;
    }
};

const EMAIL_BLOCKS = [
    { id: 'text', icon: 'adminfont-text', value: 'text', label: 'Text' },
    { id: 'image', icon: 'adminfont-image', value: 'image', label: 'Image' },
    {
        id: 'button',
        icon: 'adminfont-button',
        value: 'button',
        label: 'Button',
    },
    {
        id: 'divider',
        icon: 'adminfont-divider',
        value: 'divider',
        label: 'Divider',
    },
    {
        id: 'columns',
        icon: 'adminfont-columns',
        value: 'columns',
        label: 'Columns',
    },
];

const createBlock = ( type: string ): EmailBlock => {
    const id = Date.now();

    switch ( type ) {
        case 'text':
            return { id, type: 'text', html: 'Your text here' };

        case 'heading':
            return { id, type: 'heading', text: 'Heading', level: 2 };

        case 'image':
            return { id, type: 'image', src: '' };

        case 'button':
            return { id, type: 'button', text: 'Click Here' };

        case 'divider':
            return { id, type: 'divider' };

        case 'columns':
            return {
                id,
                type: 'columns',
                layout: '2-50',
                columns: [ [], [] ],
            };

        default:
            throw new Error( 'Unknown block' );
    }
};

const TextBlockView: React.FC< {
    block: TextBlock;
    onChange: ( html: string ) => void;
} > = ( { block, onChange } ) => {
    return (
        <div
            className="email-text"
            style={ {
                backgroundColor: block.style?.backgroundColor,
                padding: block.style?.padding,
                textAlign: block.style?.textAlign,
            } }
            contentEditable
            suppressContentEditableWarning
            onBlur={ ( e ) => onChange( e.currentTarget.innerHTML ) }
            dangerouslySetInnerHTML={ { __html: block.html } }
        />
    );
};

const ImageBlockView: React.FC< {
    block: ImageBlock;
    onChange: ( src: string ) => void;
} > = ( { block, onChange } ) => {
    return (
        <div className="email-image">
            { block.src ? (
                <img src={ block.src } alt="" />
            ) : (
                <input
                    type="file"
                    accept="image/*"
                    onChange={ ( e ) => {
                        const file = e.target.files?.[ 0 ];
                        if ( ! file ) {
                            return;
                        }
                        const url = URL.createObjectURL( file );
                        onChange( url );
                    } }
                />
            ) }
        </div>
    );
};

const normalizeBlock = ( item: any ): EmailBlock => {
    // Already a real block (reorder case)
    if ( item.type ) {
        return item;
    }

    // Dropped from sidebar
    return createBlock( item.value );
};

const getColumnCount = ( layout: ColumnsBlock[ 'layout' ] ) => {
    switch ( layout ) {
        case '1':
            return 1;
        case '2-50':
        case '2-66':
            return 2;
        case '3':
            return 3;
        case '4':
            return 4;
        default:
            return 2;
    }
};

const BlockRenderer: React.FC< {
    block: EmailBlock;
    onChange: ( patch: Partial< EmailBlock > ) => void;
    onSelect?: () => void;
} > = ( { block, onChange, onSelect } ) => {
    return (
        <div className="form-field" onClick={ onSelect }>
            <div className="drag-handle">⋮⋮</div>

            { block.type === 'heading' && <h2>{ block.text }</h2> }

            { block.type === 'text' && (
                <TextBlockView
                    block={ block }
                    onChange={ ( html ) => onChange( { html } ) }
                />
            ) }

            { block.type === 'image' && (
                <ImageBlockView
                    block={ block }
                    onChange={ ( src ) => onChange( { src } ) }
                />
            ) }

            { block.type === 'divider' && <hr /> }

            { block.type === 'columns' && (
                <ColumnsBlockView
                    block={ block }
                    onChange={ ( columns ) => onChange( { columns } ) }
                    onSelectBlock={ onSelect! }
                />
            ) }
        </div>
    );
};

const ColumnsBlockView: React.FC< {
    block: ColumnsBlock;
    onChange: ( columns: EmailBlock[][] ) => void;
    onSelectBlock: ( block: EmailBlock ) => void;
} > = ( { block, onChange, onSelectBlock } ) => {
    return (
        <div
            className={ `email-columns layout-${ block.layout }` }
            style={ {
                backgroundColor: block.style?.backgroundColor,
                padding: block.style?.padding,
            } }
        >
            { block.columns.map( ( col, colIndex ) => (
                <div key={ colIndex } className="email-column-wrapper">
                    <div className="column-label">Column { colIndex + 1 }</div>

                    <ReactSortable
                        list={ col }
                        setList={ ( newList ) => {
                            const updated = [ ...block.columns ];
                            updated[ colIndex ] = newList.map( normalizeBlock );
                            onChange( updated );
                        } }
                        group={ { name: 'email', pull: true, put: true } }
                        className="email-column"
                        animation={ 150 }
                        handle=".drag-handle"
                        fallbackOnBody
                        swapThreshold={ 0.65 }
                    >
                        { col.map( ( child, childIndex ) => (
                            <BlockRenderer
                                block={ child }
                                onSelect={ () => onSelectBlock( child ) }
                                onChange={ ( patch ) => {
                                    const updated = [ ...block.columns ];
                                    updated[ colIndex ][ childIndex ] = {
                                        ...updated[ colIndex ][ childIndex ],
                                        ...patch,
                                    };
                                    onChange( updated );
                                } }
                            />
                        ) ) }
                    </ReactSortable>
                </div>
            ) ) }
        </div>
    );
};

// Main Page Builder Component
const EmailTemplate: React.FC = () => {
    const [ templates, setTemplates ] =
        useState< EmailTemplate[] >( EMAIL_TEMPLATES );

    const [ activeTemplateId, setActiveTemplateId ] = useState< string >(
        EMAIL_TEMPLATES[ 0 ].id
    );

    const [ openBlock, setOpenBlock ] = useState< EmailBlock | null >( null );

    const activeTemplate = templates.find(
        ( t ) => t.id === activeTemplateId
    )!;

    const updateBlocks = ( blocks: EmailBlock[] ) => {
        setTemplates( ( prev ) =>
            prev.map( ( tpl ) =>
                tpl.id === activeTemplateId ? { ...tpl, blocks } : tpl
            )
        );
    };

    const [ activeTab, setActiveTab ] = useState( 'blocks' );

    const updateBlock = ( index: number, patch: Partial< EmailBlock > ) => {
        const updated = [ ...activeTemplate.blocks ];
        updated[ index ] = { ...updated[ index ], ...patch } as EmailBlock;
        updateBlocks( updated );
    };

    return (
        <div className="registration-from-wrapper email-builder">
            { /* LEFT PANEL */ }
            <div className="elements-wrapper">
                <div className="tab-titles">
                    <div
                        className="title"
                        onClick={ () => setActiveTab( 'blocks' ) }
                    >
                        Blocks
                    </div>
                    <div
                        className="title"
                        onClick={ () => setActiveTab( 'templates' ) }
                    >
                        Templates
                    </div>
                </div>

                { activeTab === 'blocks' && (
                    <ReactSortable
                        list={ EMAIL_BLOCKS }
                        setList={ () => {} }
                        sort={ false }
                        group={ { name: 'email', pull: 'clone', put: false } }
                        className="email-block-sidebar"
                    >
                        { EMAIL_BLOCKS.map( ( item ) => (
                            <div
                                key={ item.value }
                                className="email-block-item"
                            >
                                <i className={ item.icon } />
                                <span>{ item.label }</span>
                            </div>
                        ) ) }
                    </ReactSortable>
                ) }

                { activeTab === 'templates' && (
                    <aside className="template-list">
                        { templates.map( ( tpl ) => (
                            <div
                                key={ tpl.id }
                                className={ `template-item ${
                                    tpl.id === activeTemplateId ? 'active' : ''
                                }` }
                                onClick={ () => setActiveTemplateId( tpl.id ) }
                            >
                                { tpl.name }
                            </div>
                        ) ) }
                    </aside>
                ) }
            </div>

            { /* CENTER CANVAS */ }
            <div className="registration-form-main-section email-canvas">
                <input
                    className="email-subject"
                    value={ activeTemplate.subject }
                    placeholder="Email Subject"
                    onChange={ ( e ) =>
                        setTemplates( ( prev ) =>
                            prev.map( ( tpl ) =>
                                tpl.id === activeTemplateId
                                    ? { ...tpl, subject: e.target.value }
                                    : tpl
                            )
                        )
                    }
                />

                <ReactSortable
                    list={ activeTemplate.blocks }
                    setList={ ( newList ) => {
                        const normalized = newList.map( normalizeBlock );
                        updateBlocks( normalized );
                    } }
                    group={ {
                        name: 'email',
                        pull: true,
                        put: true,
                    } }
                    handle=".drag-handle"
                    animation={ 150 }
                    fallbackOnBody
                    swapThreshold={ 0.65 }
                    className="email-canvas-sortable"
                >
                    { activeTemplate.blocks.map( ( block, index ) => (
                        <BlockRenderer
                            key={ block.id }
                            block={ block }
                            onSelect={ () => setOpenBlock( block ) }
                            onChange={ ( patch ) =>
                                updateBlock( index, patch )
                            }
                        />
                    ) ) }
                </ReactSortable>
            </div>

            { /* RIGHT SETTINGS */ }
            <div className="registration-edit-form-wrapper">
                { openBlock && (
                    <EmailBlockSettings
                        block={ openBlock }
                        onChange={ ( patch ) => {
                            const index = activeTemplate.blocks.findIndex(
                                ( b ) => b.id === openBlock.id
                            );
                            if ( index >= 0 ) {
                                updateBlock( index, patch );
                                setOpenBlock( {
                                    ...openBlock,
                                    ...patch,
                                } );
                            }
                        } }
                    />
                ) }
            </div>
        </div>
    );
};

export default EmailTemplate;
