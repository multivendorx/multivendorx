/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { getApiLink, getApiResponse } from '@zyra/core';
import {
	Sparkles,
	Megaphone,
	Activity,
	Zap,
	Clock,
	BarChart3,
	Lock,
	ChevronDown,
	X,
	Wand2,
	AlertTriangle,
	CheckCircle2,
} from 'lucide-react';
import {
	ResponsiveContainer,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	PieChart,
	Pie,
	Cell,
} from 'recharts';
import { useApiList } from '../../services/useApiList';
import proModulesCatalog from '../../components/Modules';
import { HELP_RESOURCES } from './WelcomeSection';
import { Finding } from '../../components/FindingsTable';
import { DashboardSummary } from '../../dashboard-widgets/types';
import { C } from '../../dashboard-ui/tokens';
import {
	Card,
	Header,
	PillarChip,
	AiBadge,
	BrandBadge,
	SeverityPill,
	EmptyMini,
} from '../../dashboard-ui/components';

interface ActionRunRow {
	id: number;
	action_id: string;
	created_at: string;
}

interface ActivityLogRow {
	id: number;
	message: string;
	severity: string;
	created_at: string;
}

interface ReportRow {
	id: number;
	report_type: string;
	status: string;
}

interface HealthSnapshot {
	snapshot_date: string;
	overall_score: number;
}

interface CrawlerSummaryResponse {
	bot_last_seen: { bot_name: string; last_seen_at: string }[];
	daily_volume: { date: string; total: number }[];
}

const EMPTY_SUMMARY: DashboardSummary = {
	overall_score: 0,
	open_findings: 0,
	critical_findings: 0,
	active_automations: 0,
	ai_jobs_used: 0,
	ai_jobs_quota: 0,
	category_scores: {
		seo: 0,
		performance: 0,
		security: 0,
		accessibility: 0,
		woocommerce: null,
		geo: 0,
	},
	quick_fixes: 0,
	pending_approvals: 0,
	automation_status: { enabled: 0, disabled: 0 },
};

/** No "AI Visibility" 8-metric breakdown exists server-side (the mockup's
 * radar chart), and no Brand Visibility/Share-of-Voice data exists either
 * (readme.txt's own Ahrefs integration is still unimplemented) — both
 * cards below show what's real (the GEO score, category-derived findings
 * counts) and are honest about what isn't, rather than fabricating either
 * data set. */
const navigateTo = (tab: string) => {
	window.location.href = `?page=vulopilot#&tab=${tab}`;
};

/** Same real `?page=vulopilot#&tab=X` navigation WelcomeSection.tsx's
 * "View All" button already uses — not a new mechanism. */
const PILLAR_ROWS: { id: string; label: string; tab: string }[] = [
	{ id: 'seo', label: __('SEO', 'vulopilot'), tab: 'seo' },
	{ id: 'geo', label: __('GEO', 'vulopilot'), tab: 'geo' },
	{
		id: 'performance',
		label: __('Performance', 'vulopilot'),
		tab: 'performance',
	},
	{
		id: 'accessibility',
		label: __('Accessibility', 'vulopilot'),
		tab: 'accessibility',
	},
	{ id: 'security', label: __('Security', 'vulopilot'), tab: 'security' },
	{
		id: 'woocommerce',
		label: __('WooCommerce', 'vulopilot'),
		tab: 'woocommerce',
	},
];

const Overview: React.FC = () => {
	const [summary, setSummary] = useState<DashboardSummary>(EMPTY_SUMMARY);
	const [findings, setFindings] = useState<Finding[]>([]);
	const [pendingApprovals, setPendingApprovals] = useState<ActionRunRow[]>(
		[]
	);
	const [activity, setActivity] = useState<ActivityLogRow[]>([]);
	const [reports, setReports] = useState<ReportRow[]>([]);
	const [crawlerSummary, setCrawlerSummary] =
		useState<CrawlerSummaryResponse | null>(null);

	const [showGettingStarted, setShowGettingStarted] = useState(true);
	// Collapsed by default — only the header row (title + chevron) shows
	// until the user clicks it, per this task's explicit requirement.
	const [gsExpanded, setGsExpanded] = useState(false);
	const [attentionTab, setAttentionTab] = useState<
		'fixes' | 'issues' | 'approval'
	>('issues');
	// "Customize dashboard" starts collapsed too — clicking the header
	// button is the only way to reveal the section-visibility checklist
	// below it.
	const [showCustomize, setShowCustomize] = useState(false);
	const [hiddenSections, setHiddenSections] = useState<Set<string>>(
		new Set()
	);

	const { data: snapshots } = useApiList<HealthSnapshot>(
		'site-health-snapshots',
		{ days: 30 }
	);

	useEffect(() => {
		getApiResponse<DashboardSummary>(
			getApiLink(appLocalizer, 'dashboard'),
			{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
		).then((response) => response && setSummary(response));

		getApiResponse<{ data: Finding[] }>(
			getApiLink(appLocalizer, 'findings?status=open&per_page=50'),
			{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
		).then((response) => response && setFindings(response.data));

		getApiResponse<{ data: ActionRunRow[] }>(
			getApiLink(
				appLocalizer,
				'ai-action-runs?status=pending_approval&per_page=5'
			),
			{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
		).then((response) => response && setPendingApprovals(response.data));

		getApiResponse<{ data: ActivityLogRow[] }>(
			getApiLink(appLocalizer, 'activity-logs?per_page=4'),
			{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
		).then((response) => response && setActivity(response.data));

		getApiResponse<{ data: ReportRow[] }>(
			getApiLink(appLocalizer, 'reports?per_page=5'),
			{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
		).then((response) => response && setReports(response.data));

		getApiResponse<CrawlerSummaryResponse>(
			getApiLink(appLocalizer, 'crawler-traffic/summary'),
			{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
		).then((response) => response && setCrawlerSummary(response));
	}, []);

	const isSectionVisible = (id: string) => !hiddenSections.has(id);
	const toggleSection = (id: string) => {
		setHiddenSections((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const quickFixes = findings.filter((f) => !!f.fix_action_id);
	const crawlerTotal =
		crawlerSummary?.daily_volume.reduce((sum, d) => sum + d.total, 0) ??
		0;

	// The mockup's "Top opportunities" has no real backend equivalent (no
	// per-item point values or opportunity list exist anywhere) — this
	// reuses the one real, honest analog: the pillars with the most room
	// to improve, ranked by their real score.
	const opportunities = PILLAR_ROWS.map((p) => ({
		...p,
		score: summary.category_scores[p.id as keyof typeof summary.category_scores],
	}))
		.filter((p): p is typeof p & { score: number } => typeof p.score === 'number')
		.sort((a, b) => a.score - b.score)
		.slice(0, 5);

	const SECTION_TOGGLES = [
		{ id: 'getting-started', label: __('Getting started', 'vulopilot') },
		{ id: 'attention', label: __('Needs your attention', 'vulopilot') },
		{ id: 'ai-pillars', label: __('GEO & Brand Visibility', 'vulopilot') },
		{ id: 'status-strip', label: __('System status strip', 'vulopilot') },
		{ id: 'timeline', label: __('Health timeline', 'vulopilot') },
		{ id: 'footer-row', label: __('Activity, reports & Pro', 'vulopilot') },
	];

	return (
		<>
			<Header
				title={__('Website Health', 'vulopilot')}
				subtitle={__(
					"Your site's overall health, at a glance.",
					'vulopilot'
				)}
				extra={
					<button
						type="button"
						onClick={() => setShowCustomize(!showCustomize)}
						style={{ color: C.primary, border: `1px solid ${C.primary}` }}
						className={'tw-text-sm tw-font-medium tw-px-4 tw-py-2.5 tw-rounded-xl'}
					>
						{__('Customize dashboard', 'vulopilot')}
					</button>
				}
			/>

			{showCustomize && (
				<Card className="tw-mb-6">
					<h3 style={{ color: C.ink }} className={'tw-text-sm tw-font-semibold tw-mb-3'}>
						{__('Show or hide sections', 'vulopilot')}
					</h3>
					<div className={'tw-flex tw-flex-wrap tw-gap-2'}>
						{SECTION_TOGGLES.map((s) => {
							const visible = isSectionVisible(s.id);
							return (
								<button
									key={s.id}
									type="button"
									onClick={() => toggleSection(s.id)}
									style={{
										color: visible ? C.primary : C.muted,
										background: visible ? C.primarySoft : C.bg,
										border: `1px solid ${visible ? C.primary : C.border}`,
									}}
									className={'tw-text-xs tw-font-medium tw-px-3 tw-py-1.5 tw-rounded-full'}
								>
									{visible
										? `✓ ${s.label}`
										: s.label}
								</button>
							);
						})}
					</div>
				</Card>
			)}

			{isSectionVisible('getting-started') && showGettingStarted && (
				<Card className="tw-mb-6" style={{ background: C.primarySoft, borderColor: C.primary }}>
					<div
						className={'tw-flex tw-items-center tw-justify-between tw-cursor-pointer'}
						onClick={() => setGsExpanded(!gsExpanded)}
					>
						<div className={'tw-flex tw-items-center tw-gap-2'}>
							<Wand2 size={16} style={{ color: C.primary }} />
							<span style={{ color: C.ink }} className={'tw-text-sm tw-font-semibold'}>
								{__('Welcome to VuloPilot — finish setup', 'vulopilot')}
							</span>
						</div>
						<div className={'tw-flex tw-items-center tw-gap-3'}>
							<ChevronDown
								size={16}
								style={{
									color: C.muted,
									transform: gsExpanded ? 'rotate(180deg)' : 'none',
								}}
							/>
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									setShowGettingStarted(false);
								}}
								style={{ color: C.muted }}
							>
								<X size={16} />
							</button>
						</div>
					</div>
					{gsExpanded && (
						<div className={'tw-mt-4 tw-flex tw-flex-wrap tw-gap-3'}>
							{HELP_RESOURCES.map((r) => (
								<a
									key={r.title}
									href={r.href}
									target="_blank"
									rel="noopener noreferrer"
									style={{ color: C.ink, background: C.card, border: `1px solid ${C.border}` }}
									className={'tw-text-xs tw-font-medium tw-px-3 tw-py-2 tw-rounded-lg'}
								>
									{r.title}
								</a>
							))}
							<button
								type="button"
								onClick={() => navigateTo('modules')}
								style={{ color: C.ink, background: C.card, border: `1px solid ${C.border}` }}
								className={'tw-text-xs tw-font-medium tw-px-3 tw-py-2 tw-rounded-lg'}
							>
								{__('Extend: CatalogX, Notifima', 'vulopilot')}
							</button>
						</div>
					)}
				</Card>
			)}

			{/* hero */}
			<Card className="tw-mb-6">
				<div className={'tw-flex tw-flex-col lg:tw-flex-row tw-gap-8'}>
					<div className={'tw-flex tw-items-center tw-gap-6'}>
						<div style={{ position: 'relative' }}>
							<span style={{ color: C.ink }} className={'tw-text-4xl tw-font-bold'}>
								{summary.overall_score}
							</span>
							<span style={{ color: C.muted }} className={'tw-text-sm tw-ml-1'}>
								{__('/ 100', 'vulopilot')}
							</span>
						</div>
						<div>
							<div style={{ color: C.ink }} className={'tw-text-lg tw-font-semibold'}>
								{summary.overall_score >= 80
									? __('Good', 'vulopilot')
									: summary.overall_score >= 50
										? __('Needs work', 'vulopilot')
										: __('Critical', 'vulopilot')}
							</div>
							<p style={{ color: C.muted }} className={'tw-text-sm tw-mt-1 tw-max-w-[220px]'}>
								{summary.open_findings} {__('issues need attention across', 'vulopilot')} {PILLAR_ROWS.length} {__('pillars.', 'vulopilot')}
							</p>
							<div className={'tw-flex tw-gap-2 tw-mt-3 tw-flex-wrap'}>
								<span style={{ color: C.crit, background: C.critSoft }} className={'tw-text-xs tw-font-medium tw-px-2 tw-py-1 tw-rounded-full'}>
									{summary.critical_findings} {__('critical', 'vulopilot')}
								</span>
							</div>
						</div>
					</div>
					<div className={'tw-flex-1 tw-flex tw-flex-wrap tw-gap-3'}>
						{PILLAR_ROWS.map((p) => {
							const score =
								summary.category_scores[
									p.id as keyof typeof summary.category_scores
								];
							if (score === null) {
								return null;
							}
							return (
								<PillarChip
									key={p.id}
									p={{ id: p.id, label: p.label, score }}
									onClick={() => navigateTo(p.tab)}
								/>
							);
						})}
					</div>
				</div>
			</Card>

			{isSectionVisible('attention') && (
				<div className={'tw-grid tw-grid-cols-1 lg:tw-grid-cols-3 tw-gap-6 tw-mb-6'}>
					<Card className="lg:tw-col-span-2">
						<div className={'tw-flex tw-items-center tw-justify-between tw-mb-4 tw-flex-wrap tw-gap-2'}>
							<h3 style={{ color: C.ink }} className={'tw-text-base tw-font-semibold tw-flex tw-items-center tw-gap-2'}>
								<Zap size={16} style={{ color: C.primary }} /> {__('Needs your attention', 'vulopilot')}
							</h3>
							<div className={'tw-flex tw-gap-1 tw-p-1 tw-rounded-lg'} style={{ background: C.bg }}>
								{[
									{ id: 'fixes' as const, label: `${__('Quick fixes', 'vulopilot')} (${quickFixes.length})` },
									{ id: 'issues' as const, label: `${__('Open issues', 'vulopilot')} (${findings.length})` },
									{ id: 'approval' as const, label: __('Pending approval', 'vulopilot') },
								].map((t) => (
									<button
										key={t.id}
										type="button"
										onClick={() => setAttentionTab(t.id)}
										style={{
											background: attentionTab === t.id ? C.card : 'transparent',
											color: attentionTab === t.id ? C.ink : C.muted,
										}}
										className={'tw-text-xs tw-font-medium tw-px-2.5 tw-py-1.5 tw-rounded-md'}
									>
										{t.label}
									</button>
								))}
							</div>
						</div>

						{attentionTab === 'fixes' &&
							(quickFixes.length === 0 ? (
								<EmptyMini
									text={__('No AI-fixable issues right now.', 'vulopilot')}
									cta={__('One-Click Fix is a Pro module.', 'vulopilot')}
								/>
							) : (
								<div className={'tw-space-y-1'}>
									{quickFixes.map((f) => (
										<div
											key={f.id}
											onClick={() => navigateTo(PILLAR_ROWS.find((p) => p.id === f.category)?.tab ?? 'health')}
											className={'tw-flex tw-items-center tw-justify-between tw-py-2 tw-cursor-pointer'}
											style={{ borderBottom: `1px solid ${C.border}` }}
										>
											<span style={{ color: C.ink }} className={'tw-text-sm'}>{f.title}</span>
											<SeverityPill level={f.severity} />
										</div>
									))}
								</div>
							))}

						{attentionTab === 'issues' &&
							(findings.length === 0 ? (
								<EmptyMini text={__('No open issues — nice work.', 'vulopilot')} />
							) : (
								<div className={'tw-space-y-1'}>
									{findings.slice(0, 8).map((f) => (
										<div
											key={f.id}
											onClick={() => navigateTo(PILLAR_ROWS.find((p) => p.id === f.category)?.tab ?? 'health')}
											className={'tw-flex tw-items-center tw-justify-between tw-py-2 tw-cursor-pointer'}
											style={{ borderBottom: `1px solid ${C.border}` }}
										>
											<span style={{ color: C.ink }} className={'tw-text-sm'}>{f.title}</span>
											<SeverityPill level={f.severity} />
										</div>
									))}
								</div>
							))}

						{attentionTab === 'approval' &&
							(pendingApprovals.length === 0 ? (
								<EmptyMini
									text={__('Nothing waiting on you.', 'vulopilot')}
									cta={__('AI actions that need approval before they run will appear here.', 'vulopilot')}
								/>
							) : (
								<div className={'tw-space-y-1'}>
									{pendingApprovals.map((a) => (
										<div
											key={a.id}
											className={'tw-flex tw-items-center tw-justify-between tw-py-2'}
											style={{ borderBottom: `1px solid ${C.border}` }}
										>
											<span style={{ color: C.ink }} className={'tw-text-sm'}>{a.action_id}</span>
											<span style={{ color: C.muted }} className={'tw-text-xs'}>{a.created_at}</span>
										</div>
									))}
								</div>
							))}
					</Card>

					<Card>
						<h3 style={{ color: C.ink }} className={'tw-text-base tw-font-semibold tw-mb-4'}>
							{__('Top opportunities', 'vulopilot')}
						</h3>
						<div className={'tw-space-y-1'}>
							{opportunities.map((o) => (
								<div
									key={o.id}
									onClick={() => navigateTo(o.tab)}
									className={'tw-flex tw-items-center tw-justify-between tw-py-2 tw-cursor-pointer'}
									style={{ borderBottom: `1px solid ${C.border}` }}
								>
									<span style={{ color: C.ink }} className={'tw-text-sm'}>{o.label}</span>
									<span style={{ color: C.warn }} className={'tw-text-xs tw-font-semibold'}>{o.score}/100</span>
								</div>
							))}
						</div>
					</Card>
				</div>
			)}

			{isSectionVisible('ai-pillars') && (
				<div className={'tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-6 tw-mb-6'}>
					<Card className="tw-cursor-pointer" style={{ borderColor: C.ai }} onClick={() => navigateTo('geo')}>
						<div className={'tw-flex tw-items-center tw-justify-between tw-mb-1'}>
							<div className={'tw-flex tw-items-center tw-gap-2'}>
								<Sparkles size={18} style={{ color: C.ai }} />
								<h3 style={{ color: C.ink }} className={'tw-text-base tw-font-semibold'}>
									{__('GEO — AI Visibility', 'vulopilot')}
								</h3>
							</div>
							<AiBadge />
						</div>
						<p style={{ color: C.muted }} className={'tw-text-sm tw-mb-4'}>
							{__('How well AI assistants can find, understand, and cite your site.', 'vulopilot')}
						</p>
						<div className={'tw-flex tw-items-center tw-gap-6'}>
							<div className={'tw-text-center tw-shrink-0'}>
								<div style={{ color: C.ai }} className={'tw-text-4xl tw-font-bold'}>
									{summary.category_scores.geo}
								</div>
								<div style={{ color: C.muted }} className={'tw-text-xs tw-mt-1'}>
									{__('GEO score', 'vulopilot')}
								</div>
							</div>
						</div>
					</Card>

					<Card className="tw-cursor-pointer" style={{ borderColor: C.brand }} onClick={() => navigateTo('brand-visibility')}>
						<div className={'tw-flex tw-items-center tw-justify-between tw-mb-1'}>
							<div className={'tw-flex tw-items-center tw-gap-2'}>
								<Megaphone size={18} style={{ color: C.brand }} />
								<h3 style={{ color: C.ink }} className={'tw-text-base tw-font-semibold'}>
									{__('Brand Visibility', 'vulopilot')}
								</h3>
							</div>
							<BrandBadge />
						</div>
						<p style={{ color: C.muted }} className={'tw-text-sm tw-mb-2'}>
							{__('Off-site mentions & share of voice — predicts AI citations better than backlinks.', 'vulopilot')}
						</p>
						<div className={'tw-flex tw-items-center tw-gap-2 tw-text-xs'} style={{ color: C.muted }}>
							<Lock size={12} />
							{__('Preview — connect Ahrefs to start tracking.', 'vulopilot')}
						</div>
					</Card>
				</div>
			)}

			{isSectionVisible('status-strip') && (
				<div className={'tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-4 tw-mb-6'}>
					<Card>
						<h4 style={{ color: C.ink }} className={'tw-text-sm tw-font-semibold tw-mb-3'}>
							{__('Issue distribution', 'vulopilot')}
						</h4>
						<div style={{ height: 110 }}>
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={[
											{ name: __('Critical', 'vulopilot'), value: summary.critical_findings, color: C.crit },
											{ name: __('Other open', 'vulopilot'), value: Math.max(0, summary.open_findings - summary.critical_findings), color: C.warn },
										]}
										dataKey="value"
										innerRadius={30}
										outerRadius={48}
										paddingAngle={3}
									>
										<Cell fill={C.crit} />
										<Cell fill={C.warn} />
									</Pie>
								</PieChart>
							</ResponsiveContainer>
						</div>
						<div className={'tw-flex tw-justify-center tw-gap-3 tw-mt-1'}>
							<span style={{ color: C.crit }} className={'tw-text-[11px] tw-font-medium'}>{summary.critical_findings}</span>
							<span style={{ color: C.warn }} className={'tw-text-[11px] tw-font-medium'}>{Math.max(0, summary.open_findings - summary.critical_findings)}</span>
						</div>
					</Card>

					<Card className="tw-cursor-pointer" onClick={() => navigateTo('crawler-traffic')}>
						<h4 style={{ color: C.ink }} className={'tw-text-sm tw-font-semibold tw-mb-1 tw-flex tw-items-center tw-gap-1.5'}>
							<Activity size={13} style={{ color: C.ai }} /> {__('Crawler traffic', 'vulopilot')}
						</h4>
						<div style={{ color: C.ink }} className={'tw-text-2xl tw-font-bold tw-mt-2'}>
							{crawlerTotal.toLocaleString()}
						</div>
						<div style={{ color: C.muted }} className={'tw-text-[11px] tw-mt-2'}>
							{crawlerSummary?.bot_last_seen[0]?.bot_name ?? __('No visits yet', 'vulopilot')}
						</div>
					</Card>

					<Card className="tw-cursor-pointer" onClick={() => navigateTo('automation')}>
						<h4 style={{ color: C.ink }} className={'tw-text-sm tw-font-semibold tw-mb-1 tw-flex tw-items-center tw-gap-1.5'}>
							<Zap size={13} style={{ color: C.primary }} /> {__('Automation', 'vulopilot')}
						</h4>
						{summary.automation_status.enabled === 0 && summary.automation_status.disabled === 0 ? (
							<EmptyMini
								text={__('0 enabled · 0 disabled', 'vulopilot')}
								cta={__('Create one from Automation →', 'vulopilot')}
							/>
						) : (
							<div style={{ color: C.ink }} className={'tw-text-2xl tw-font-bold tw-mt-2'}>
								{summary.automation_status.enabled}
								<span style={{ color: C.muted, fontSize: 14 }}> {__('enabled', 'vulopilot')}</span>
							</div>
						)}
					</Card>

					<Card className="tw-cursor-pointer" onClick={() => navigateTo('modules')}>
						<h4 style={{ color: C.ink }} className={'tw-text-sm tw-font-semibold tw-mb-1'}>
							{__('Modules', 'vulopilot')}
						</h4>
						<div style={{ color: C.ink }} className={'tw-text-2xl tw-font-bold tw-mt-2'}>
							{appLocalizer.active_modules.length}
							<span style={{ color: C.muted, fontSize: 14 }}> / {proModulesCatalog.modules.length} {__('active', 'vulopilot')}</span>
						</div>
						<div style={{ color: C.primary }} className={'tw-text-[11px] tw-font-medium tw-mt-2'}>
							{__('Manage modules →', 'vulopilot')}
						</div>
					</Card>
				</div>
			)}

			{isSectionVisible('timeline') && (
				<Card className="tw-mb-6">
					<h3 style={{ color: C.ink }} className={'tw-text-base tw-font-semibold tw-mb-4'}>
						{__('Health timeline', 'vulopilot')}
					</h3>
					{snapshots.length === 0 ? (
						<EmptyMini text={__('Run your first scan to start building a health score history.', 'vulopilot')} />
					) : (
						<div style={{ height: 240 }}>
							<ResponsiveContainer width="100%" height="100%">
								<LineChart data={snapshots}>
									<CartesianGrid stroke={C.border} vertical={false} />
									<XAxis dataKey="snapshot_date" tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
									<YAxis domain={[0, 100]} tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
									<Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}` }} />
									<Line type="monotone" dataKey="overall_score" name={__('Overall', 'vulopilot')} stroke={C.primary} strokeWidth={2.5} dot={false} />
								</LineChart>
							</ResponsiveContainer>
						</div>
					)}
				</Card>
			)}

			{isSectionVisible('footer-row') && (
				<div className={'tw-grid tw-grid-cols-1 lg:tw-grid-cols-3 tw-gap-6'}>
					<Card>
						<h3 style={{ color: C.ink }} className={'tw-text-base tw-font-semibold tw-mb-4 tw-flex tw-items-center tw-gap-2'}>
							<Clock size={16} style={{ color: C.primary }} /> {__('Recent activity', 'vulopilot')}
						</h3>
						{activity.length === 0 ? (
							<EmptyMini text={__('Nothing has happened yet.', 'vulopilot')} />
						) : (
							<div className={'tw-space-y-4'}>
								{activity.map((a) => (
									<div key={a.id} className={'tw-flex tw-items-start tw-gap-3'}>
										<div style={{ background: C.primarySoft, color: C.primary }} className={'tw-rounded-lg tw-p-1.5 tw-mt-0.5'}>
											{a.severity === 'critical' || a.severity === 'high' ? (
												<AlertTriangle size={14} />
											) : (
												<CheckCircle2 size={14} />
											)}
										</div>
										<div>
											<div style={{ color: C.ink }} className={'tw-text-sm'}>{a.message}</div>
											<div style={{ color: C.muted }} className={'tw-text-xs tw-mt-0.5'}>{a.created_at}</div>
										</div>
									</div>
								))}
							</div>
						)}
						<button
							type="button"
							onClick={() => navigateTo('activity')}
							style={{ color: C.primary }}
							className={'tw-text-xs tw-font-medium tw-mt-4'}
						>
							{__('View all activity →', 'vulopilot')}
						</button>
					</Card>

					<Card>
						<h3 style={{ color: C.ink }} className={'tw-text-base tw-font-semibold tw-mb-3 tw-flex tw-items-center tw-gap-2'}>
							<BarChart3 size={16} style={{ color: C.primary }} /> {__('Latest reports', 'vulopilot')}
						</h3>
						{reports.length === 0 ? (
							<EmptyMini
								text={__('No reports yet.', 'vulopilot')}
								cta={__('Generate your first compliance report →', 'vulopilot')}
							/>
						) : (
							<div className={'tw-space-y-1'}>
								{reports.map((r) => (
									<div key={r.id} className={'tw-flex tw-items-center tw-justify-between tw-py-2'} style={{ borderBottom: `1px solid ${C.border}` }}>
										<span style={{ color: C.ink }} className={'tw-text-sm'}>{r.report_type}</span>
										<span style={{ color: C.muted }} className={'tw-text-xs'}>{r.status}</span>
									</div>
								))}
							</div>
						)}
					</Card>

					{!appLocalizer.khali_dabba && (
						<Card style={{ background: C.primarySoft, borderColor: C.primary }}>
							<h3 style={{ color: C.ink }} className={'tw-text-sm tw-font-semibold tw-mb-1'}>
								{__('Free vs Pro', 'vulopilot')}
							</h3>
							<p style={{ color: C.muted }} className={'tw-text-xs tw-mb-3'}>
								{__('Pro unlocks one-click and AI-generated fixes.', 'vulopilot')}
							</p>
							<a
								href={appLocalizer.shop_url}
								target="_blank"
								rel="noopener noreferrer"
								style={{ background: C.primary }}
								className={'tw-block tw-text-center tw-text-white tw-text-xs tw-font-medium tw-px-4 tw-py-2 tw-rounded-lg tw-w-full'}
							>
								{__('Upgrade to Pro', 'vulopilot')}
							</a>
						</Card>
					)}
				</div>
			)}
		</>
	);
};

export default Overview;
