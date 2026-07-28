import { __ } from '@wordpress/i18n';
import { Button, Spinner } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { fixWithAi, AnalysisResult } from './api';

interface ChecklistProps {
	title: string;
	results: AnalysisResult[];
	postId: number;
	isPro: boolean;
	shopUrl: string;
	// eslint-disable-next-line no-unused-vars
	onFixed: ( _actionId: string, _response: Awaited< ReturnType< typeof fixWithAi > > ) => void;
}

const STATUS_ICON: Record< AnalysisResult[ 'status' ], string > = {
	pass: '✓',
	warning: '!',
	fail: '✕',
};

/**
 * Renders one of Services\OnPageAnalyzer::analyze()'s check groups
 * ('basic'/'additional'/'title_readability' — mirrors RankMath's own
 * "Basic SEO"/"Additional"/"Title Readability" grouping). Every row that's
 * `fixable` gets a "Fix with AI" button wired to vulopilot-pro's
 * `POST /post-seo/{id}/fix` (Pro-only — free users see an upgrade prompt
 * instead, same posture the SEO tab's FindingsTable "Fix" row action
 * already takes for Free installs).
 */
export default function Checklist( { title, results, postId, isPro, shopUrl, onFixed }: ChecklistProps ) {
	const [ fixingId, setFixingId ] = useState< string | null >( null );
	const [ error, setError ] = useState< string | null >( null );

	if ( 0 === results.length ) {
		return null;
	}

	const handleFix = async ( actionId: string ) => {
		setFixingId( actionId );
		setError( null );

		try {
			const response = await fixWithAi( postId, actionId );
			onFixed( actionId, response );
		} catch ( err ) {
			setError( err instanceof Error ? err.message : String( err ) );
		} finally {
			setFixingId( null );
		}
	};

	return (
		<div className="vulopilot-seo-checklist">
			<h3 className="vulopilot-seo-checklist__title">{ title }</h3>
			{ error && <p className="vulopilot-seo-checklist__error">{ error }</p> }
			<ul className="vulopilot-seo-checklist__list">
				{ results.map( ( result ) => (
					<li
						key={ result.id }
						className={ `vulopilot-seo-checklist__item vulopilot-seo-checklist__item--${ result.status }` }
					>
						<span className="vulopilot-seo-checklist__icon">{ STATUS_ICON[ result.status ] }</span>
						<span className="vulopilot-seo-checklist__message">{ result.message }</span>
						{ result.fixable && result.action_id && 'pass' !== result.status && (
							isPro ? (
								<Button
									variant="secondary"
									size="small"
									isBusy={ fixingId === result.action_id }
									disabled={ null !== fixingId }
									onClick={ () => handleFix( result.action_id as string ) }
								>
									{ fixingId === result.action_id ? <Spinner /> : __( 'Fix with AI', 'vulopilot' ) }
								</Button>
							) : (
								<Button variant="tertiary" size="small" href={ shopUrl } target="_blank" rel="noreferrer">
									{ __( 'Upgrade to fix', 'vulopilot' ) }
								</Button>
							)
						) }
					</li>
				) ) }
			</ul>
		</div>
	);
}
