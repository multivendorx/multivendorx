/**
 * Converts notification email bodies between saved HTML and the legacy email-block shape.
 *
 * zyra 1.0.65 dropped `renderBlocksToHTML`/`htmlToBlocks` (they lived in the removed
 * `@zyra/builders` package). Notification emails are still stored as HTML, so this keeps the
 * exact same output and parsing rules: every email saved before the upgrade loads unchanged,
 * and what is saved now is read the same way by older code.
 */
import type { LegacyEmailBlock } from '@zyra/builderform';

type InlineStyle = Record<string, string | number | undefined | null>;

let nextBlockId = Date.now();
const getId = (): number => nextBlockId++;

// Numbers are rem, as the old converter wrote them.
const styleToString = (style: InlineStyle = {}): string =>
	Object.entries(style)
		.map(([key, val]) => {
			if (val === undefined || val === null) {
				return '';
			}
			const cssKey = key.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
			return typeof val === 'number'
				? `${cssKey}:${val}rem`
				: `${cssKey}:${val}`;
		})
		.filter(Boolean)
		.join(';');

const renderColumns = (block: LegacyEmailBlock): string => {
	const columns = block.columns || [];
	return `
        <table width="100%" cellpadding="0" cellspacing="0" style="${styleToString(block.style as InlineStyle)}">
            <tr>
                ${columns
					.map(
						(column) => `
                    <td valign="top" style="padding:10px;">
                        ${column.map(renderBlock).join('')}
                    </td>
                `
					)
					.join('')}
            </tr>
        </table>
    `;
};

const renderBlock = (block: LegacyEmailBlock): string => {
	const style = styleToString(block.style as InlineStyle);
	const level = block.level || 1;

	switch (block.type) {
		case 'heading':
			return `<h${level} style="${style}">
                ${block.text || ''}
            </h${level}>`;
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

/**
 * Renders legacy email blocks to the HTML stored as a notification's email body.
 *
 * @param blocks Legacy email blocks.
 */
export const renderBlocksToHTML = (blocks: LegacyEmailBlock[]): string =>
	blocks.map(renderBlock).join('');

const parseStyle = (node: Element): Record<string, string> => {
	const style: Record<string, string> = {};
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
			.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
		style[jsKey] = value.trim().replace('rem', '');
	});
	return style;
};

const parseTable = (table: Element): LegacyEmailBlock | null => {
	const rows = Array.from(table.querySelectorAll('tr'));
	if (!rows.length) {
		return null;
	}
	const columns = Array.from(rows[0].children).map((cell) =>
		Array.from(cell.childNodes)
			.map(parseNode)
			.filter((block): block is LegacyEmailBlock => block !== null)
	);
	return {
		id: getId(),
		type: 'columns',
		layout: String(columns.length),
		columns,
		style: parseStyle(table),
	};
};

const parseNode = (node: Node): LegacyEmailBlock | null => {
	if (node.nodeType === Node.TEXT_NODE) {
		const text = (node.textContent || '').trim();
		return text ? { id: getId(), type: 'richtext', html: text } : null;
	}
	if (node.nodeType !== Node.ELEMENT_NODE) {
		return null;
	}

	const element = node as Element;
	const tag = element.tagName.toLowerCase();

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
				level: parseInt(tag[1], 10),
				text: element.textContent || '',
				style: parseStyle(element),
			};
		case 'div':
		case 'p':
			return {
				id: getId(),
				type: 'richtext',
				html: element.innerHTML.trim(),
				style: parseStyle(element),
			};
		case 'img':
			return {
				id: getId(),
				type: 'image',
				src: element.getAttribute('src') || '',
				alt: element.getAttribute('alt') || '',
				style: parseStyle(element),
			};
		case 'a':
			return {
				id: getId(),
				type: 'button',
				text: element.textContent || '',
				url: element.getAttribute('href') || '',
				style: parseStyle(element),
			};
		case 'hr':
			return { id: getId(), type: 'divider', style: parseStyle(element) };
		case 'table':
			return parseTable(element);
		default:
			return null;
	}
};

/**
 * Parses a saved notification email body back into legacy email blocks.
 *
 * @param html Saved email-body HTML.
 */
export const htmlToBlocks = (html: string): LegacyEmailBlock[] => {
	const doc = new DOMParser().parseFromString(html, 'text/html');
	return Array.from(doc.body.children)
		.map(parseNode)
		.filter((block): block is LegacyEmailBlock => block !== null);
};
