/* global appLocalizer */
import { useState } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { getApiLink, getApiResponse, sendApiResponse } from '@zyra/core';
import {
	AnalyticsComponent,
	CardComponent,
	FormGroupComponent,
	ModuleGuardComponent,
	NoticeManager,
} from '@zyra/components';
import { ButtonInput, TextInput } from '@zyra/inputs';

interface GeoAiScores {
	entity_coverage: number;
	question_coverage: number;
	answer_completeness: number;
	llm_readability: number;
}

interface GeoScoreResult {
	post_id: number;
	deterministic_score: number | null;
	ai_scores: GeoAiScores;
	overall_score: number;
	suggestions: string[];
	generated_at: string;
}

/**
 * GEO-MODULE.md's "Generate GEO Score" / "Generate AI suggestions"
 * capability, surfaced as its own card above the GEO page's findings
 * table (GEO.tsx). A GEO score is inherently per-post (the same content
 * evaluated for AI-search-engine discoverability), unlike every other
 * page here which lists sitewide findings — so this is a small,
 * self-contained form rather than a table row action, the same
 * "hand-built form against a real REST contract" honesty
 * Settings.tsx's own docblock already models for a page whose data
 * doesn't fit the shared list-page pattern.
 *
 * GET is used on load-by-id (no AI cost, reads a previous result back)
 * and POST is the explicit "Generate" action (a real AI call) — see
 * Controllers/GeoAnalysis.php's docblock for why those are deliberately
 * two different routes/verbs.
 */
const GeoScoreCard = () => {
	const [postId, setPostId] = useState('');
	const [score, setScore] = useState<GeoScoreResult | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [isLoadingExisting, setIsLoadingExisting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadExistingScore = () => {
		const id = parseInt(postId, 10);
		if (!id || id <= 0) {
			NoticeManager.add({
				uniqueKey: 'vulopilot-geo-invalid-post-id',
				type: 'error',
				position: 'notice',
				message: __('Enter a valid post ID.', 'vulopilot'),
			});
			return;
		}

		setIsLoadingExisting(true);
		setError(null);

		getApiResponse<GeoScoreResult>(
			getApiLink(appLocalizer, `geo-analysis/${id}`),
			{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
		)
			.then((response) => {
				if (response) {
					setScore(response);
				} else {
					setError(
						__(
							'No GEO analysis has been generated for this post yet — click "Generate" to run one.',
							'vulopilot'
						)
					);
				}
			})
			.finally(() => setIsLoadingExisting(false));
	};

	const handleGenerate = () => {
		const id = parseInt(postId, 10);
		if (!id || id <= 0) {
			NoticeManager.add({
				uniqueKey: 'vulopilot-geo-invalid-post-id',
				type: 'error',
				position: 'notice',
				message: __('Enter a valid post ID.', 'vulopilot'),
			});
			return;
		}

		setIsGenerating(true);
		setError(null);

		sendApiResponse<GeoScoreResult>(
			appLocalizer,
			getApiLink(appLocalizer, `geo-analysis/${id}`),
			{}
		)
			.then((response) => {
				if (response) {
					setScore(response);
					NoticeManager.add({
						uniqueKey: 'vulopilot-geo-score-generated',
						type: 'success',
						position: 'notice',
						message: __('GEO score generated.', 'vulopilot'),
					});
				} else {
					NoticeManager.add({
						uniqueKey: 'vulopilot-geo-score-failed',
						type: 'error',
						position: 'notice',
						message: __(
							'Could not generate a GEO score. Make sure an AI provider is configured and try again.',
							'vulopilot'
						),
					});
				}
			})
			.finally(() => setIsGenerating(false));
	};

	const isBusy = isGenerating || isLoadingExisting;

	return (
		<CardComponent
			title={__('GEO Score', 'vulopilot')}
			desc={__(
				'Score one post for AI-search-engine discoverability and get AI suggestions to improve it.',
				'vulopilot'
			)}
		>
			<FormGroupComponent
				label={__('Post ID', 'vulopilot')}
				desc={__(
					'The numeric ID of the post or page to analyze.',
					'vulopilot'
				)}
			>
				<TextInput
					type="number"
					value={postId}
					onChange={(value) => setPostId(String(value))}
				/>
			</FormGroupComponent>

			<div className="geo-score-card-actions">
				<ButtonInput
					buttons={{
						text: __('Load existing score', 'vulopilot'),
						icon: 'search',
						onClick: loadExistingScore,
						disabled: isBusy,
					}}
				/>
				<ButtonInput
					buttons={{
						text: isGenerating
							? __('Generating…', 'vulopilot')
							: __('Generate GEO score', 'vulopilot'),
						icon: 'ai',
						onClick: handleGenerate,
						disabled: isBusy,
					}}
				/>
			</div>

			{error && (
				<ModuleGuardComponent
					icon="info"
					title={__('No score yet', 'vulopilot')}
					desc={error}
				/>
			)}

			{score && (
				<div className="geo-score-card-result">
					<AnalyticsComponent
						variant="dashboard"
						cols={5}
						data={[
							{
								icon: 'analytics',
								number: `${score.overall_score}/100`,
								text: __('Overall GEO score', 'vulopilot'),
							},
							{
								icon: 'search-discovery',
								number: `${score.ai_scores.entity_coverage}/100`,
								text: __('Entity coverage', 'vulopilot'),
							},
							{
								icon: 'form-checkboxes',
								number: `${score.ai_scores.question_coverage}/100`,
								text: __('Question coverage', 'vulopilot'),
							},
							{
								icon: 'check',
								number: `${score.ai_scores.answer_completeness}/100`,
								text: __('Answer completeness', 'vulopilot'),
							},
							{
								icon: 'ai',
								number: `${score.ai_scores.llm_readability}/100`,
								text: __('LLM readability', 'vulopilot'),
							},
						]}
					/>

					{null === score.deterministic_score && (
						<p className="geo-score-card-note">
							{__(
								'Structural checks (Semantic Structure, Chunking, FAQ Opportunities, etc.) haven\'t run for this site yet — run a scan to include them in the overall score.',
								'vulopilot'
							)}
						</p>
					)}

					<h3>{__('AI suggestions', 'vulopilot')}</h3>
					<ul className="geo-score-card-suggestions">
						{score.suggestions.map((suggestion, index) => (
							<li key={index}>{suggestion}</li>
						))}
					</ul>

					<p className="geo-score-card-meta">
						{sprintf(
							/* translators: %s is when the score was generated. */
							__('Generated %s', 'vulopilot'),
							score.generated_at
						)}
					</p>
				</div>
			)}
		</CardComponent>
	);
};

export default GeoScoreCard;
