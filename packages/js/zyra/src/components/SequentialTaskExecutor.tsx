import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FieldComponent, ZyraVariable } from './fieldUtils';
import { getApiLink } from '../utils/apiService';
import { ButtonInputUI } from './ButtonInput';
import { Notice } from './Notice';
import '../styles/web/SequentialTaskExecutor.scss';
interface Task {
    action: string;
    message: string;
    successMessage?: string;
    failureMessage?: string;
    previousResponseData?: string[];
}

interface SequentialTaskExecutorProps {
    buttonText: string;
    buttonIcon: string;
    apilink: string;
    parameter?: string;
    action: string;
    interval: number;
    successMessage?: string;
    failureMessage?: string;
    tasks: Task[];
    onComplete?: () => void;
    onError?: (error: unknown) => void;
    onTaskComplete?: (task: Task, response: unknown) => void;
}

export const SequentialTaskExecutorUI: React.FC<SequentialTaskExecutorProps> = ({
    buttonText,
    buttonIcon,
    apilink,
    action,
    parameter,
    interval,
    successMessage,
    failureMessage,
    tasks,
    onComplete,
    onError,
    onTaskComplete,
}) => {
    const [loading, setLoading] = useState(false);
    const [processStatus, setProcessStatus] = useState('');
    const [syncStarted, setSyncStarted] = useState(false);
    const [syncStatus, setSyncStatus] = useState([]);

    const taskIndex = useRef(0);
    const fetchStatusRef = useRef<NodeJS.Timeout | null>(null);
    const allResponses = useRef({});

    const [currentCompletedIndex, setCurrentCompletedIndex] = useState(0);

    useEffect(() => {
        if (currentCompletedIndex < syncStatus.length) {
            const timer = setTimeout(() => {
                setCurrentCompletedIndex((prev) => prev + 1);
            }, interval);

            return () => clearTimeout(timer);
        }
    }, [currentCompletedIndex, syncStatus]);

    const executeSequentialTasks = async () => {
        setLoading(true);
        if (taskIndex.current >= tasks.length) {
            setLoading(false);
            setProcessStatus('completed');
            onComplete?.();
            return;
        }

        const currentTask = tasks[taskIndex.current];

        try {
            const payload: Record<string, unknown> = {};

            if (action) {
                payload.action = currentTask.action;
            }
            if (parameter) {
                payload.parameter = parameter;
            }

            if (currentTask.previousResponseData?.length) {
                currentTask.previousResponseData.forEach((taskName: string) => {
                    payload[taskName] = allResponses.current[taskName];
                });
            }

            const response = await axios.post(
                getApiLink(ZyraVariable, apilink),
                payload,
                {
                    headers: {
                        'X-WP-Nonce': ZyraVariable.nonce,
                    },
                }
            );

            allResponses.current[currentTask.action] = response.data;
            setSyncStatus((prev) => [
                ...prev,
                {
                    action: currentTask.message,
                    status: 'success',
                },
            ]);
            onTaskComplete?.(currentTask, response);
            taskIndex.current++;
            await executeSequentialTasks();

        } catch (error) {
            console.error('Task execution failed:', error);
            setProcessStatus('failed');
            setLoading(false);
            onError?.({ task: currentTask, error });
        }
    };

    const executeNormalTasks = () => {
        setLoading(true);

        axios
            .post(
                getApiLink(ZyraVariable, apilink),
                {
                    parameter,
                },
                {
                    headers: {
                        'X-WP-Nonce': ZyraVariable.nonce,
                    },
                }
            )
            .then((response) => {
                setProcessStatus(response.data === true ? 'success' : 'failed');
                setLoading(false);
            })
            .catch((error) => {
                console.error('Task execution failed:', error);
                setProcessStatus('failed');
                setLoading(false);
            })
    };

    const fetchSyncStatus = () => {
        axios
            .get(getApiLink(ZyraVariable, apilink), {
                headers: { 'X-WP-Nonce': ZyraVariable.nonce },
                params: { parameter },
            })
            .then(({ data }) => {
                setSyncStarted(data.running);
                setSyncStatus(data.status || []);
            });
    };

    useEffect(() => {
        fetchSyncStatus();
    }, []);

    useEffect(() => {
        if (syncStarted) {
            fetchStatusRef.current = setInterval(fetchSyncStatus, interval);
        } else if (fetchStatusRef.current) {
            clearInterval(fetchStatusRef.current);
            fetchStatusRef.current = null;
        }

        return () => {
            if (fetchStatusRef.current) {
                clearInterval(fetchStatusRef.current);
            }
        };
    }, [syncStarted, fetchSyncStatus, interval]);

    const handleButtonClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (tasks && tasks.length > 0) {
            executeSequentialTasks();
        } else {
            setSyncStarted(true);
            executeNormalTasks();
        }
    };


    return (
        <>
            <div className="loader-wrapper">
                <ButtonInputUI
                    buttons={[
                        {
                            text: buttonText,
                            color: 'purple-bg',
                            onClick: handleButtonClick,
                            disabled: loading,
                            icon: buttonIcon || 'import',
                        },
                    ]}
                    position="left"
                />

                {loading && (
                    <div className="multivendorx-loader"></div>
                )}
            </div>

            <div className='sequential-task-executor'>
                {syncStatus &&
                    syncStatus.length > 0 &&
                    syncStatus.map((status, idx) => (
                        <div key={idx} className={`sequential-task ${processStatus}`} style={{ ['--progress-time' as string]: `${interval / 1000}s`,}}>
                            {status.action}
                            <div className="status-wrapper">
                                <span className="status-icons">
                                    {processStatus === 'failed' && (                                    
                                        <i className={`failed-icon adminfont-error`} />                                    
                                    )}
                                    {processStatus === 'completed' && (                                    
                                        <i className={`completed-icon adminfont-check`} />
                                    )}
                                </span>
                                {status.total && (
                                    <span>
                                        {status.current} / {status.total}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
            </div>

            {processStatus && (
                <Notice
                    type={processStatus === 'failed' ? 'error' : 'success'}
                    displayPosition="inline-notice"
                    message={
                        processStatus === 'failed'
                            ? failureMessage
                            : successMessage
                    }
                />
            )}
        </>
    );
};
const SequentialTaskExecutor: FieldComponent = {
    render: ({ field }) => (
        <SequentialTaskExecutorUI
            buttonText={field.buttonText}
            buttonIcon={field.buttonIcon}
            apilink={field.apilink}
            parameter={field.parameter}
            action={field.action}
            interval={field.interval}
            successMessage={field.successMessage}
            failureMessage={field.failureMessage}
            tasks={field.tasks}
            onComplete={field.onComplete}
            onError={field.onError}
            onTaskComplete={field.onTaskComplete}
        />
    ),
};

export default SequentialTaskExecutor;