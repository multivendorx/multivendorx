import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import QuoteListTable from './QuoteListTable';

const EditBlock = () => {
    const blockProps = useBlockProps();
    return (
        <div { ...blockProps } id="request-quote-list">
            { QuoteListTable() }
        </div>
    );
};

registerBlockType( 'catalogx/quote-cart', {
    apiVersion: 2,
    title: 'Quote Cart',
    icon: 'cart',
    category: 'catalogx',
    supports: {
        html: false,
    },
    edit: EditBlock,
    save() {
        return <div id="request-quote-list"></div>;
    },
} );


