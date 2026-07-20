// ==============================
// TYPES (minimal required)
// ==============================

export type BlockType =
    | 'richtext'
    | 'heading'
    | 'image'
    | 'button'
    | 'divider'
    | 'columns'
    | 'section';

export interface Block {
    id: number;
    type: BlockType;
    text?: string;
    html?: string;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    src?: string;
    alt?: string;
    url?: string;
    style?: Record<string, any>;
    columns?: Block[][];
}

// ==============================
// STYLE → INLINE CSS
// ==============================

const styleToString = (style: Record<string, any> = {}) => {
    return Object.entries(style)
        .map(([key, val]) => {
            if (val === undefined || val === null) {
                return '';
            }

            const cssKey = key.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());

            if (typeof val === 'number') {
                return `${cssKey}:${val}rem`;
            }

            return `${cssKey}:${val}`;
        })
        .filter(Boolean)
        .join(';');
};

// ==============================
// MAIN FUNCTION
// ==============================

export const renderBlocksToHTML = (blocks: Block[]): string => {
    return blocks.map(renderBlock).join('');
};

// ==============================
// BLOCK RENDERER
// ==============================

const renderBlock = (block: Block): string => {
    const style = styleToString(block.style);

    switch (block.type) {
        case 'heading':
            return `<h${block.level || 1} style="${style}">
                ${block.text || ''}
            </h${block.level || 1}>`;

        case 'richtext':
            return `<div style="${style}">
                ${block.html || ''}
            </div>`;

        case 'image':
            return `<img src="${block.src || ''}" alt="${block.alt || ''}" style="${style}" />`;

        case 'button':
            return `<a href="${block.url || '#'}" style="${style};display:inline-block;text-decoration:none;">
                ${block.text || 'Click'}
            </a>`;

        case 'divider':
            return `<hr style="${style}" />`;

        case 'columns':
            return renderColumns(block);

        case 'section':
            return `<div style="${style}">
                ${(block.columns || []).flat().map(renderBlock).join('')}
            </div>`;

        default:
            return '';
    }
};

// ==============================
// COLUMNS (TABLE FOR EMAIL)
// ==============================

const renderColumns = (block: Block): string => {
    const cols = block.columns || [];

    return `
        <table width="100%" cellpadding="0" cellspacing="0" style="${styleToString(block.style)}">
            <tr>
                ${cols
                    .map(
                        (col) => `
                    <td valign="top" style="padding:10px;">
                        ${col.map(renderBlock).join('')}
                    </td>
                `
                    )
                    .join('')}
            </tr>
        </table>
    `;
};

let blockId = Date.now();

const getId = () => blockId++;

export const htmlToBlocks = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const blocks: any[] = [];

    Array.from(doc.body.children).forEach((node) => {
        const block = parseNode(node);
        if (block) {
            blocks.push(block);
        }
    });

    return blocks;
};

// ==============================
// PARSER
// ==============================

const parseNode = (node: any): any => {
    if (node.nodeType === 3) {
        // text node
        const text = node.textContent.trim();
        if (!text) {
            return null;
        }

        return {
            id: getId(),
            type: 'richtext',
            html: text,
        };
    }

    if (node.nodeType !== 1) {
        return null;
    }

    const tag = node.tagName.toLowerCase();

    switch (tag) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
            return {
                id: getId(),
                type: 'heading',
                level: parseInt(tag[1]),
                text: node.textContent,
                style: parseStyle(node),
            };

        case 'div':
        case 'p':
            return {
                id: getId(),
                type: 'richtext',
                html: node.innerHTML.trim(),
                style: parseStyle(node),
            };

        case 'img':
            return {
                id: getId(),
                type: 'image',
                src: node.getAttribute('src'),
                alt: node.getAttribute('alt'),
                style: parseStyle(node),
            };

        case 'a':
            return {
                id: getId(),
                type: 'button',
                text: node.textContent,
                url: node.getAttribute('href'),
                style: parseStyle(node),
            };

        case 'hr':
            return {
                id: getId(),
                type: 'divider',
                style: parseStyle(node),
            };

        case 'table':
            return parseTable(node);

        default:
            return null;
    }
};

// ==============================
// TABLE → COLUMNS
// ==============================

const parseTable = (table: HTMLElement) => {
    const rows = Array.from(table.querySelectorAll('tr'));

    if (!rows.length) {
        return null;
    }

    const columns: any[][] = [];

    const firstRow = rows[0];
    const cells = Array.from(firstRow.children);

    cells.forEach((cell, index) => {
        const colBlocks: any[] = [];

        cell.childNodes.forEach((child) => {
            const parsed = parseNode(child);
            if (parsed) {
                colBlocks.push(parsed);
            }
        });

        columns.push(colBlocks);
    });

    return {
        id: getId(),
        type: 'columns',
        layout: String(columns.length),
        columns,
        style: parseStyle(table),
    };
};

// ==============================
// STYLE PARSER
// ==============================

const parseStyle = (node: HTMLElement) => {
    const style: any = {};
    const styleAttr = node.getAttribute('style');

    if (!styleAttr) {
        return style;
    }

    styleAttr.split(';').forEach((rule) => {
        const [key, value] = rule.split(':');
        if (!key || !value) {
            return;
        }

        const jsKey = key
            .trim()
            .replace(/-([a-z])/g, (_, char) => char.toUpperCase());

        style[jsKey] = value.trim().replace('rem', '');
    });

    return style;
};
