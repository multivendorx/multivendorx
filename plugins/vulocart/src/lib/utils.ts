import clsx, { type ClassValue } from 'clsx';

/**
 * shadcn/ui's usual `cn()` helper is `clsx` + `tailwind-merge` — this repo
 * deliberately has no Tailwind toolchain (styles are plain SCSS per
 * component instead), so `tailwind-merge` isn't useful here and is
 * dropped; `clsx` alone is still the right tool for conditionally joining
 * class names from a `cva()` variant call.
 */
export function cn( ...inputs: ClassValue[] ): string {
	return clsx( ...inputs );
}
