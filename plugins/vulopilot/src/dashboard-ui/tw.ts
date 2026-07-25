const PREFIX = 'tw-';

/**
 * Prefixes every class in a plain Tailwind class string with `tw-`
 * (tailwind.config.js's `prefix`), preserving variant modifiers
 * (`hover:`, `lg:`, ...) and arbitrary-value classes (`min-w-[140px]`).
 * Lets every page under dashboard-ui/ paste class strings straight out of
 * the supplied mockup unchanged instead of hand-prefixing each one —
 * mechanical, low-error-risk fidelity to the source design.
 */
export function tw(classString: string): string {
	return classString
		.split(/\s+/)
		.filter(Boolean)
		.map((cls) => {
			const lastColon = cls.lastIndexOf(':');
			if (lastColon === -1) {
				return `${PREFIX}${cls}`;
			}
			return `${cls.slice(0, lastColon + 1)}${PREFIX}${cls.slice(
				lastColon + 1
			)}`;
		})
		.join(' ');
}
