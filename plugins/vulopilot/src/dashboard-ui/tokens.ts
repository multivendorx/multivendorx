/**
 * Design tokens ported from the supplied dashboard mockup. Kept as plain
 * hex values (used as inline `style` colors, exactly like the mockup)
 * rather than folded into tailwind.config.js's theme — the mockup itself
 * mixes inline `style={{color: C.ink}}` with Tailwind utility classes for
 * layout/spacing throughout, so this preserves that same split 1:1.
 */
export const C = {
	bg: '#F5F4FB',
	card: '#FFFFFF',
	border: '#E8E6F5',
	ink: '#1F1B2E',
	muted: '#716B87',
	primary: '#5B3DF5',
	primarySoft: '#EEEBFF',
	ai: '#0891A8',
	aiSoft: '#E3F7FA',
	good: '#16A34A',
	goodSoft: '#EAF7EE',
	warn: '#B45309',
	warnSoft: '#FDF3E3',
	crit: '#DC2626',
	critSoft: '#FDECEC',
	brand: '#C0207A',
	brandSoft: '#FCE9F2',
};

export interface Metric {
	name: string;
	status: 'good' | 'warn' | 'crit';
	detail: string;
}
