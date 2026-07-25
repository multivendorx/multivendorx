/* global appLocalizer */
import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { getApiLink, sendApiResponse } from '@zyra/core';
import { NoticeManager } from '@zyra/components';
import {
	CheckCircle2,
	AlertTriangle,
	XCircle,
	ChevronRight,
	Search,
} from 'lucide-react';
import { C, Metric } from './tokens';

const STATUS = {
	good: { color: C.good, bg: C.goodSoft, Icon: CheckCircle2, label: __('Good', 'vulopilot') },
	warn: { color: C.warn, bg: C.warnSoft, Icon: AlertTriangle, label: __('Warning', 'vulopilot') },
	crit: { color: C.crit, bg: C.critSoft, Icon: XCircle, label: __('Critical', 'vulopilot') },
};

export function ScoreRing({
	score,
	size = 168,
	stroke = 14,
	color = C.primary,
	track = C.primarySoft,
}: {
	score: number;
	size?: number;
	stroke?: number;
	color?: string;
	track?: string;
}) {
	const r = (size - stroke) / 2;
	const circ = 2 * Math.PI * r;
	const offset = circ - (score / 100) * circ;
	return (
		<div style={{ width: size, height: size, position: 'relative' }}>
			<svg width={size} height={size}>
				<circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
				<circle
					cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
					strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
					transform={`rotate(-90 ${size / 2} ${size / 2})`}
				/>
			</svg>
			<div style={{ position: 'absolute', inset: 0 }} className={'tw-flex tw-flex-col tw-items-center tw-justify-center'}>
				<span style={{ color: C.ink }} className={'tw-text-4xl tw-font-bold tw-leading-none'}>{score}</span>
				<span style={{ color: C.muted }} className={'tw-text-xs tw-mt-1'}>{__('/ 100', 'vulopilot')}</span>
			</div>
		</div>
	);
}

export function StatusPill({ status }: { status: 'good' | 'warn' | 'crit' }) {
	const s = STATUS[status];
	const { Icon } = s;
	return (
		<span
			style={{ color: s.color, background: s.bg }}
			className={'tw-inline-flex tw-items-center tw-gap-1 tw-text-xs tw-font-medium tw-px-2 tw-py-1 tw-rounded-full'}
		>
			<Icon size={13} /> {s.label}
		</span>
	);
}

export function MetricRow({ name, status, detail }: Metric) {
	return (
		<div className={'tw-flex tw-items-center tw-justify-between tw-py-3'} style={{ borderBottom: `1px solid ${C.border}` }}>
			<span style={{ color: C.ink }} className={'tw-text-sm tw-font-medium'}>{name}</span>
			<div className={'tw-flex tw-items-center tw-gap-3'}>
				<span style={{ color: C.muted }} className={'tw-text-xs'}>{detail}</span>
				<StatusPill status={status} />
			</div>
		</div>
	);
}

export function PillarChip({
	p,
	onClick,
}: {
	p: { id: string; label: string; score: number };
	onClick: () => void;
}) {
	const color = p.score >= 90 ? C.good : p.score >= 70 ? C.warn : C.crit;
	return (
		<button
			type="button"
			onClick={onClick}
			style={{ background: C.card, border: `1px solid ${C.border}` }}
			className={'tw-flex-1 tw-min-w-[140px] tw-rounded-xl tw-p-4 tw-text-left tw-transition-colors hover:tw-border-[--primary]'}
		>
			<div className={'tw-flex tw-items-center tw-justify-between tw-mb-2'}>
				<span style={{ color: C.muted }} className={'tw-text-xs tw-font-medium tw-uppercase tw-tracking-wide'}>{p.label}</span>
				<ChevronRight size={14} style={{ color: C.muted }} />
			</div>
			<div className={'tw-flex tw-items-end tw-gap-2'}>
				<span style={{ color: C.ink }} className={'tw-text-2xl tw-font-bold tw-leading-none'}>{p.score}</span>
				<div style={{ background: C.border }} className={'tw-flex-1 tw-h-1.5 tw-rounded-full tw-mb-1 tw-overflow-hidden'}>
					<div style={{ width: `${p.score}%`, background: color }} className={'tw-h-full tw-rounded-full'} />
				</div>
			</div>
		</button>
	);
}

export function Card({
	children,
	className = '',
	style = {},
	onClick,
}: {
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
	onClick?: () => void;
}) {
	return (
		<div
			style={{ background: C.card, border: `1px solid ${C.border}`, ...style }}
			className={`tw-rounded-2xl tw-p-6 ${className}`}
			onClick={onClick}
		>
			{children}
		</div>
	);
}

/* eslint-disable no-unused-vars -- named param on a type-only call signature; base no-unused-vars doesn't recognize TS call-signature parameters */
export function Toggle({
	checked,
	onChange,
	disabled = false,
}: {
	checked: boolean;
	onChange: (value: boolean) => void;
	disabled?: boolean;
}) {
	/* eslint-enable no-unused-vars */
	return (
		<button
			type="button"
			onClick={() => !disabled && onChange(!checked)}
			style={{ background: checked ? C.primary : C.border, opacity: disabled ? 0.5 : 1 }}
			className={'tw-w-10 tw-h-6 tw-rounded-full tw-relative tw-shrink-0 tw-transition-colors'}
		>
			<span
				style={{ transform: checked ? 'translateX(17px)' : 'translateX(3px)', background: '#fff' }}
				className={'tw-absolute tw-top-1 tw-w-4 tw-h-4 tw-rounded-full tw-transition-transform'}
			/>
		</button>
	);
}

const SEVERITY: Record<string, { color: string; bg: string }> = {
	critical: { color: C.crit, bg: C.critSoft },
	high: { color: C.crit, bg: C.critSoft },
	medium: { color: C.warn, bg: C.warnSoft },
	low: { color: C.muted, bg: C.bg },
	info: { color: C.muted, bg: C.bg },
};

export function SeverityPill({ level }: { level: string }) {
	const s = SEVERITY[level] ?? SEVERITY.low;
	return (
		<span style={{ color: s.color, background: s.bg }} className={'tw-text-[11px] tw-font-semibold tw-uppercase tw-tracking-wide tw-px-2 tw-py-1 tw-rounded-md tw-shrink-0'}>
			{level}
		</span>
	);
}

export function EmptyMini({ text, cta }: { text: string; cta?: string }) {
	return (
		<div className={'tw-py-6 tw-text-center'}>
			<p style={{ color: C.muted }} className={'tw-text-xs'}>{text}</p>
			{cta && <p style={{ color: C.primary }} className={'tw-text-xs tw-font-medium tw-mt-1'}>{cta}</p>}
		</div>
	);
}

export function AiBadge() {
	return (
		<span
			style={{ color: C.ai, background: C.aiSoft }}
			className={'tw-inline-flex tw-items-center tw-gap-1 tw-text-[11px] tw-font-semibold tw-px-2 tw-py-0.5 tw-rounded-full tw-uppercase tw-tracking-wide'}
		>
			{__('VuloPilot exclusive', 'vulopilot')}
		</span>
	);
}

export function BrandBadge() {
	return (
		<span
			style={{ color: C.brand, background: C.brandSoft }}
			className={'tw-inline-flex tw-items-center tw-gap-1 tw-text-[11px] tw-font-semibold tw-px-2 tw-py-0.5 tw-rounded-full tw-uppercase tw-tracking-wide'}
		>
			{__('Off-site · via Ahrefs', 'vulopilot')}
		</span>
	);
}

/**
 * "Run scan" is wired to the real `POST /scans` endpoint — same call and
 * same success/error notices Dashboard.tsx's own handleRunScan already
 * uses — rather than the supplied mockup's decorative button, since every
 * page under dashboard-ui/ reuses this one Header.
 */
export function Header({
	title,
	subtitle,
	extra,
}: {
	title?: string;
	subtitle?: string;
	extra?: React.ReactNode;
}) {
	const [isScanning, setIsScanning] = useState(false);

	const handleRunScan = () => {
		setIsScanning(true);

		sendApiResponse(appLocalizer, getApiLink(appLocalizer, 'scans'), {
			scanner_id: 'all',
			trigger_type: 'manual',
		})
			.then((response) => {
				NoticeManager.add({
					uniqueKey: 'vulopilot-scan-started',
					type: response ? 'success' : 'error',
					position: 'float',
					message: response
						? __(
								'Scan started — results will appear here shortly.',
								'vulopilot'
							)
						: __(
								'Could not start a scan. Please try again.',
								'vulopilot'
							),
				});
			})
			.finally(() => setIsScanning(false));
	};

	return (
		<div className={'tw-flex tw-items-start tw-justify-between tw-mb-6 tw-flex-wrap tw-gap-3'}>
			<div>
				<h1 style={{ color: C.ink }} className={'tw-text-2xl tw-font-bold'}>{title}</h1>
				<p style={{ color: C.muted }} className={'tw-text-sm tw-mt-1'}>{subtitle}</p>
			</div>
			<div className={'tw-flex tw-items-center tw-gap-2'}>
				{extra}
				<button
					type="button"
					onClick={handleRunScan}
					disabled={isScanning}
					style={{ background: C.primary, opacity: isScanning ? 0.7 : 1 }}
					className={'tw-flex tw-items-center tw-gap-2 tw-text-white tw-text-sm tw-font-medium tw-px-4 tw-py-2.5 tw-rounded-xl hover:tw-opacity-90'}
				>
					<Search size={15} /> {isScanning ? __('Scanning…', 'vulopilot') : __('Run scan', 'vulopilot')}
				</button>
			</div>
		</div>
	);
}
