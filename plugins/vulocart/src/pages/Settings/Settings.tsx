/* global vulocartLocalizer */
import { useEffect, useRef, useState } from '@wordpress/element';
import type { JSX } from 'react';
import { __ } from '@wordpress/i18n';
import { useLocation, Link } from 'react-router-dom';
import { getApiLink, getApiResponse, getAvailableSettings, getSettingById } from '@zyra/core';
import { InputRenderer } from '@zyra/inputs';
import { CardComponent, NavigatorComponent } from '@zyra/components';
import { SettingProvider, useSetting } from '../../contexts/SettingContext';
import generalSettings from '../../settings/General';

/**
 * Ported from `vulopilot/src/pages/Settings/Settings.tsx`'s flat-option
 * structure (not multivendorx's per-tab-namespaced one, which doesn't
 * apply — VuloCart has one flat `wp_options` row, Utill::SETTINGS_KEY).
 * `getTemplateData()` below is a direct import rather than a
 * `require.context` scan — there's exactly one settings file today, the
 * same allowance vulopilot's own templateService.ts docblock notes for
 * that case.
 */
const getTemplateData = () => [
	{ name: 'general', type: 'file' as const, content: generalSettings },
];

const Settings = () => {
	const [ isLoading, setIsLoading ] = useState( true );
	const [ error, setError ] = useState< string | null >( null );
	const settingsRef = useRef< Record< string, unknown > >( {} );

	const settingsArray = getAvailableSettings( getTemplateData(), [] );
	const location = new URLSearchParams( useLocation().hash.substring( 1 ) );

	const loadSettings = () => {
		setIsLoading( true );
		setError( null );

		getApiResponse< Record< string, unknown > >(
			getApiLink( vulocartLocalizer, 'settings' ),
			{ headers: { 'X-WP-Nonce': vulocartLocalizer.nonce } }
		)
			.then( ( response ) => {
				if ( ! response ) {
					setError( __( 'Could not load settings.', 'vulocart' ) );
					return;
				}

				settingsRef.current = response;
			} )
			.finally( () => setIsLoading( false ) );
	};

	useEffect( loadSettings, [] );

	const GetForm = ( currentTab: string | null ): JSX.Element | null => {
		// Every hook this function uses must run on every call regardless
		// of currentTab — matches vulopilot's own Settings.tsx docblock on
		// this exact point (an early return before a hook call would make
		// the number of hooks React sees differ between renders).
		const { setting, settingName, setSetting, updateSetting } = useSetting();

		const settingModal = currentTab ? getSettingById( settingsArray, currentTab ) : null;
		const fieldKeys: string[] = ( settingModal?.modal ?? [] ).map(
			( field: { key: string } ) => field.key
		);

		if ( currentTab && settingName !== currentTab ) {
			const tabFields: Record< string, unknown > = {};
			fieldKeys.forEach( ( key ) => {
				tabFields[ key ] = settingsRef.current[ key ];
			} );
			setSetting( currentTab, tabFields );
		}

		useEffect( () => {
			if ( currentTab && settingName === currentTab ) {
				settingsRef.current = { ...settingsRef.current, ...setting };
			}
		}, [ setting, settingName, currentTab ] );

		if ( ! currentTab ) {
			return null;
		}

		return (
			<>
				{ settingName === currentTab ? (
					<InputRenderer
						settings={ settingModal }
						setting={ setting }
						updateSetting={ updateSetting }
					/>
				) : (
					<>{ __( 'Loading…', 'vulocart' ) }</>
				) }
			</>
		);
	};

	if ( error ) {
		return (
			<CardComponent title={ __( 'Settings', 'vulocart' ) }>
				<p>{ error }</p>
			</CardComponent>
		);
	}

	if ( isLoading ) {
		return <CardComponent title={ __( 'Settings', 'vulocart' ) } isLoading />;
	}

	return (
		<SettingProvider>
			<NavigatorComponent
				settingContent={ settingsArray }
				currentSetting={ location.get( 'subtab' ) as string }
				getForm={ GetForm }
				prepareUrl={ ( subTab: string ) =>
					`?page=vulocart#&tab=settings&subtab=${ subTab }`
				}
				appLocalizer={ vulocartLocalizer }
				Link={ Link }
				settingName="Settings"
				className="vulocart-settings"
			/>
		</SettingProvider>
	);
};

export default Settings;
