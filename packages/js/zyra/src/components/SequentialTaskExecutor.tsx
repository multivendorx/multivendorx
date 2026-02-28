import React, { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { getApiLink } from '../utils/apiService';
import { AdminButtonUI } from './AdminButton';
import { ItemListUI } from './ItemList';

interface Task {
    action: string;
    message: string;
    successMessage?: string;
    failureMessage?: string;

    // ⭐ ADDED: Generic dependency injection
    requiresResponeData?: boolean;
}

interface SequentialTaskExecutorProps {
    buttonText: string;
    apilink: string;
    action: string;
    interval: number;
    appLocalizer: any;
    successMessage?: string;
    failureMessage?: string;
    tasks: Task[];
    onComplete?: () => void;
    onError?: (error: any) => void;
    onTaskComplete?: (task: Task, response: any) => void;
}

interface DynamicResponse {
    success: boolean;
    data?: any;
    message?: string;
    [key: string]: any;
}

const SequentialTaskExecutor: React.FC<SequentialTaskExecutorProps> = ({
    buttonText,
    apilink,
    action,
    interval,
    appLocalizer,
    successMessage,
    failureMessage,
    tasks,
    onComplete,
    onError,
    onTaskComplete,
}) => {
    const [loading, setLoading] = useState(false);
    const [taskSequence, setTaskSequence] = useState<{
        message: string;
        status: 'running' | 'success' | 'failed';
        successMessage?: string;
        failureMessage?: string;
    }[]>([]);
    const [processStatus, setProcessStatus] = useState('');

    const processStarted = useRef(false);
    const taskIndex = useRef(0);

    // ⭐ ADDED: Import context storage
    const lastResult = useRef<string>('');

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const updateTaskStatus = (status: 'running' | 'success' | 'failed', customMessage?: string) => {
        setTaskSequence((prev) => {
            const updated = [...prev];
            const lastTask = updated[updated.length - 1];

            if (lastTask) {
                lastTask.status = status;
                if (customMessage) {
                    lastTask[status === 'success' ? 'successMessage' : 'failureMessage'] = customMessage;
                }
            }
            return updated;
        });
    };

    const handleTaskResponse = async (currentTask: Task, response: DynamicResponse) => {
        const isSuccess = response?.success === true;

        const message = isSuccess
            ? currentTask.successMessage || response?.message || 'Task completed'
            : currentTask.failureMessage || response?.message || 'Task failed';

        if (isSuccess) {
            // ⭐ ADDED: Store successful task data into context
            if (isSuccess && response?.data !== undefined) {
                lastResult.current = response.data;
            }

            onTaskComplete?.(currentTask, response);
        } else {
            onError?.({ task: currentTask, response, error: message });
        }

        updateTaskStatus(isSuccess ? 'success' : 'failed', message);

        return isSuccess ? 'success' : 'failed';
    };

    const executeSequentialTasks = useCallback(async () => {
        if (taskIndex.current >= tasks.length) {
            setProcessStatus('completed');
            setLoading(false);
            processStarted.current = false;
            onComplete?.();
            return;
        }

        const currentTask = tasks[taskIndex.current];

        setTaskSequence((prev) => [
            ...prev,
            {
                message: currentTask.message,
                status: 'running',
                successMessage: currentTask.successMessage,
                failureMessage: currentTask.failureMessage,
            },
        ]);

        await sleep(interval);

        try {
            // ⭐ UPDATED: Payload now supports generic injection
            const payload: Record<string, any> = {
                action: currentTask.action
            };

            if (currentTask.requiresResponeData) {
                payload.responseData = lastResult.current;
            }

            const response = await axios.post(
                getApiLink(appLocalizer, apilink),
                payload,
                { 
                    headers: { 
                        'X-WP-Nonce': appLocalizer.nonce,
                    } 
                }
            );

            const formattedResponse = {
                success: response.data?.success === true,
                data: response.data?.data,
                message: response.data?.message,
                ...response.data
            };

            const status = await handleTaskResponse(currentTask, formattedResponse);

            if (status === 'failed') {
                setProcessStatus('failed');
                setLoading(false);
                processStarted.current = false;
                return;
            }

            taskIndex.current++;
            await executeSequentialTasks();
        } catch (error) {
            console.error('Task execution failed:', error);
            updateTaskStatus('failed', 'Task execution failed');
            setProcessStatus('failed');
            setLoading(false);
            processStarted.current = false;
            onError?.({ task: currentTask, error });
        }
    }, [tasks, interval, appLocalizer, apilink, action, onComplete, onError, onTaskComplete]);

    const startProcess = useCallback(() => {
        if (processStarted.current) return;

        processStarted.current = true;
        setLoading(true);
        setTaskSequence([]);
        setProcessStatus('');
        taskIndex.current = 0;

        // ⭐ ADDED: Reset context on new run
        lastResult.current = {};

        executeSequentialTasks();
    }, [executeSequentialTasks]);

    const handleButtonClick = (e: React.MouseEvent) => {
        e.preventDefault();
        startProcess();
    };

    const getItemListItems = () => {
        return taskSequence.map((task, index) => ({
            id: `task-${index}`,
            title: task.message,
            desc: task.status,
            icon: task.status,
            className: `task-status-${task.status}`,
        }));
    };

    return (
        <div className="do-action-wrapper">
            <div className="loader-wrapper">
                <AdminButtonUI
                    buttons={[{
                        text: buttonText,
                        color: 'purple-bg',
                        onClick: handleButtonClick,
                        disabled: loading,
                        icon: loading ? 'spinner' : 'play'
                    }]}
                    position="left"
                />

                {loading && (
                    <div className="loader">
                        <div className="three-body-dot" />
                    </div>
                )}
            </div>

            {taskSequence.length > 0 && (
                <ItemListUI
                    items={getItemListItems()}
                    className="task-list"
                />
            )}

            {processStatus && (
                <div className={`fetch-display-output ${processStatus === 'failed' ? 'failed' : 'success'}`}>
                    {processStatus === 'failed' ? failureMessage : successMessage}
                </div>
            )}
        </div>
    );
};

export default SequentialTaskExecutor;
