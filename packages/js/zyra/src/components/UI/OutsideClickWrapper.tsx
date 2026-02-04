import React, { useEffect, useRef } from 'react';

type OutsideClickWrapperProps = {
	children: React.ReactNode;
	onOutsideClick: () => void;
	enabled?: boolean;
};

const OutsideClickWrapper: React.FC<OutsideClickWrapperProps> = ({
	children,
	onOutsideClick,
	enabled = true,
}) => {
	const wrapperRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!enabled) return;

		const handleClickOutside = (event: MouseEvent) => {
			if (
				wrapperRef.current &&
				!wrapperRef.current.contains(event.target as Node)
			) {
				onOutsideClick();
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [enabled, onOutsideClick]);

	return <div ref={wrapperRef}>{children}</div>;
};

export default OutsideClickWrapper;
