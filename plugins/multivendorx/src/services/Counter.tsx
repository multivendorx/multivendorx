import React, { useEffect, useRef, useState } from 'react';

export interface CounterProps {
	value: number;
	duration?: number;
}

const Counter: React.FC<CounterProps> = ({ value, duration = 1200 }) => {
	const [count, setCount] = useState(0);
	const hasAnimated = useRef(false);
	const rafRef = useRef<number | null>(null);

	useEffect(() => {
		if (hasAnimated.current) {
			// After first animation, lock value
			setCount(value);
			return;
		}

		hasAnimated.current = true;

		const startValue = 0;
		const endValue = value;
		const startTime = performance.now();

		const animate = (time: number) => {
			const progress = Math.min((time - startTime) / duration, 1);
			const next = Math.floor(
				startValue + (endValue - startValue) * progress
			);

			setCount(next);

			if (progress < 1) {
				rafRef.current = requestAnimationFrame(animate);
			}
		};

		rafRef.current = requestAnimationFrame(animate);

		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, [value, duration]);

	return <>{count}</>;
};

export default React.memo(Counter);
