/**
 * External dependencies
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

/**
 * Internal dependencies
 */
import { getApiLink, sendApiResponse } from '../utils/apiService';
import '../styles/web/DoActionBtn.scss';

// Types
interface Task {
	action: string;
	message: string;
	cache?: 'course_id' | 'user_id';
}
interface SyncStatus {
	action: string;
	current: number;
	total: number;
}
interface ApiResponse {
	success?: boolean;
	courses?: { id: number }[];
	data?: {
		users?: { id: number }[];
	};
}
export interface DoActionBtnProps {
	buttonKey: string;
	interval: number;
	proSetting: boolean;
	proSettingChanged: () => boolean;
	value: string;
	description: string;
	apilink: string;
	parameter: string;
	tasks: Task[];
	appLocalizer: Record< string, any >;
}
type TaskStatus = 'running' | 'success' | 'failed';
const DoActionBtn: React.FC< DoActionBtnProps > = ( props ) => {
	const {
		interval,
		proSetting,
		proSettingChanged,
		value,
		description,
		apilink,
		parameter,
		tasks,
		appLocalizer,
	} = props;
	const [ syncStarted, setSyncStarted ] = useState( false );
	const [ syncStatus, setSyncStatus ] = useState< SyncStatus[] >( [] );
	const [ loading, setLoading ] = useState( false );
	const [ taskSequence, setTaskSequence ] = useState<
		{ name: string; message: string; status: TaskStatus }[]
	>( [] );
	const [ testStatus, setTestStatus ] = useState( '' );
	const fetchStatusRef = useRef< NodeJS.Timeout | null >( null );
	const connectTaskStarted = useRef( false );
	const additionalData = useRef< Record< string, any > >( {} );
	const taskNumber = useRef( 0 );
	const sleep = ( time: number ) =>
		new Promise( ( resolve ) => setTimeout( resolve, time ) );
	const fetchSyncStatus = useCallback( () => {
		axios
			.get( getApiLink( appLocalizer, apilink ), {
				headers: { 'X-WP-Nonce': appLocalizer.nonce },
				params: { parameter },
			} )
			.then( ( { data } ) => {
				setSyncStarted( data.running );
				setSyncStatus( data.status || [] );
			} );
	}, [ apilink, parameter, appLocalizer ] );

	const doSequentialTask = useCallback( async () => {
		if ( taskNumber.current >= tasks.length ) {
			setTestStatus( 'Test Successful' );
			setLoading( false );
			connectTaskStarted.current = false;
			return;
		}
		const currentTask = tasks[ taskNumber.current ];
		setTaskSequence( ( seq ) => [
			...seq,
			{
				name: currentTask.action,
				message: currentTask.message,
				status: 'running',
			},
		] );
		await sleep( interval );
		try {
			const response = ( await sendApiResponse(
				appLocalizer,
				getApiLink( appLocalizer, apilink ),
				{
					action: currentTask.action,
					...additionalData.current,
					parameter,
				}
			) ) as ApiResponse;
			let taskStatus: TaskStatus = 'success';
			if ( currentTask.cache === 'course_id' ) {
				const validCourse = response?.courses?.[ 1 ];
				if ( ! validCourse ) taskStatus = 'failed';
				else additionalData.current.course_id = validCourse.id;
			} else if ( currentTask.cache === 'user_id' ) {
				const validUser = response?.data?.users?.[ 0 ];
				if ( ! validUser ) taskStatus = 'failed';
				else additionalData.current.user_id = validUser.id;
			} else if ( ! response?.success ) {
				taskStatus = 'failed';
			}
			setTaskSequence( ( seq ) => {
				const updated = [ ...seq ];
				updated[ updated.length - 1 ] = {
					...updated[ updated.length - 1 ],
					status: taskStatus,
				};
				return updated;
			} );
			if ( taskStatus === 'failed' ) {
				setTestStatus( 'Failed' );
				setLoading( false );
				connectTaskStarted.current = false;
				return;
			}
			taskNumber.current++;
			await doSequentialTask();
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch ( error ) {
			setTaskSequence( ( seq ) => {
				const updated = [ ...seq ];
				updated[ updated.length - 1 ] = {
					...updated[ updated.length - 1 ],
					status: 'failed',
				};
				return updated;
			} );
			setTestStatus( 'Failed' );
			setLoading( false );
			connectTaskStarted.current = false;
		}
	}, [ interval, tasks, apilink, parameter, appLocalizer ] );

	const startConnectionTask = useCallback( async () => {
		if ( connectTaskStarted.current ) return;
		connectTaskStarted.current = true;
		setLoading( true );
		setTaskSequence( [] );
		additionalData.current = {};
		taskNumber.current = 0;
		setTestStatus( '' );
		await doSequentialTask();
	}, [ doSequentialTask ] );

	useEffect( () => {
		if ( syncStarted ) {
			fetchStatusRef.current = setInterval( fetchSyncStatus, interval );
		}

		if ( ! syncStarted && fetchStatusRef.current ) {
			clearInterval( fetchStatusRef.current );
		}

		return () => {
			if ( fetchStatusRef.current ) {
				clearInterval( fetchStatusRef.current );
			}
		};
	}, [ syncStarted, fetchSyncStatus, interval ] );

	useEffect( () => {
		fetchSyncStatus();
	}, [ fetchSyncStatus ] );

	const handleSync = async (
		event: React.MouseEvent< HTMLButtonElement >
	) => {
		event.preventDefault();
		if ( proSettingChanged() ) return;
		if ( parameter === 'test' ) {
			startConnectionTask();
			return;
		}
		setSyncStarted( true );
		try {
			const response = await axios.post(
				getApiLink( appLocalizer, apilink ),
				{ parameter },
				{ headers: { 'X-WP-Nonce': appLocalizer.nonce } }
			);
			if ( response.data ) {
				setSyncStarted( false );
				fetchSyncStatus();
			}
		} catch {
			setSyncStarted( false );
		}
	};
	return (
		<>
			<div className="loader-wrapper">
				<button
					className="admin-btn btn-purple btn-effect"
					onClick={ handleSync }
				>
					{ value }
				</button>
				{ ( loading || syncStarted ) && (
					<div className="loader">
						<div className="three-body-dot"></div>
						<div className="three-body-dot"></div>
						<div className="three-body-dot"></div>
					</div>
				) }
				{ proSetting && <span className="admin-pro-tag">pro</span> }
			</div>
			{ syncStarted && (
				<div className="fetch-display-output success">
					Synchronization started please wait.
				</div>
			) }
			<p
				className="settings-metabox-description"
				dangerouslySetInnerHTML={ { __html: description } }
			></p>
			{ taskSequence.map( ( task, index ) => (
				<div
					key={ index }
					className={ `${ task.status } details-status-row` }
				>
					{ task.message }
					{ task.status !== 'running' && (
						<>
							<div className="status-meta">
								<span className="status-icons">
									<i
										className={ `admin-font ${
											task.status === 'failed'
												? 'adminlib-cross'
												: 'adminlib-icon-yes'
										}` }
									></i>
								</span>
							</div>
							<span
								style={ {
									width: `100%`,
								} }
								className="progress-bar"
							></span>
						</>
					) }
				</div>
			) ) }
			{ testStatus && (
				<div
					className={ `fetch-display-output ${
						testStatus === 'Failed' ? 'failed' : 'success'
					}` }
				>
					{ testStatus === 'Failed' ? (
						<p>
							Test connection failed. Check further details in{ ' ' }
							<Link
								className="errorlog-link"
								to="?page=moowoodle#&tab=settings&subtab=log"
							>
								error log
							</Link>
							.
						</p>
					) : (
						'Test connection successful'
					) }
				</div>
			) }
			{ syncStatus?.length > 0 &&
				syncStatus.map( ( status, idx ) => (
					<div key={ idx } className="details-status-row">
						{ status.action }
						<div className="status-meta">
							<span className="status-icons">
								<i className="admin-font adminlib-icon-yes"></i>
							</span>
							<span>
								{ status.current } / { status.total }
							</span>
						</div>
						<span
							style={ {
								width: `${
									( status.current / status.total ) * 100
								}%`,
							} }
							className="progress-bar"
						></span>
					</div>
				) ) }
		</>
	);
};
export default DoActionBtn;
