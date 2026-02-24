import React, { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import { getApiLink } from '../utils/apiService';
import {AdminButtonUI} from './AdminButton';
import {ItemListUI} from './ItemList';


interface Task {
    action: string;
    message: string;
    cacheKey?: string;
    successMessage?: string;
    failureMessage?: string;
}

interface SequentialTaskExecutorProps {
    buttonKey: string;
    value: string;
    apilink: string;
    parameter: string;
    interval: number;
    appLocalizer: any;
    successMessage?: string;
    failureMessage?: string;
    tasks: Task[];
    onComplete?: (data: any) => void;
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
    value,
    apilink,
    parameter,
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

    // Refs for tracking state (exactly like original)
    const processStarted = useRef(false);
    const additionalData = useRef<Record<string, any>>({});
    const taskIndex = useRef(0);

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
        const cacheKey = currentTask.cacheKey;

        // Store response data if cacheKey exists
        if (cacheKey && response.data) {
            additionalData.current[cacheKey] = response.data;
        }

        // Determine message and trigger callbacks
        const message = isSuccess
            ? currentTask.successMessage || response?.message || 'Task completed'
            : currentTask.failureMessage || response?.message || 'Task failed';

        if (isSuccess) {
            onTaskComplete?.(currentTask, response);
        } else {
            onError?.({ task: currentTask, response, error: message });
        }

        // Update UI
        updateTaskStatus(isSuccess ? 'success' : 'failed', message);

        return isSuccess ? 'success' : 'failed';
    };

    const executeSequentialTasks = useCallback(async () => {
    if (taskIndex.current >= tasks.length) {
        setProcessStatus('completed');
        setLoading(false);
        processStarted.current = false;
        onComplete?.(additionalData.current);
        return;
    }

    const currentTask = tasks[taskIndex.current];

    // Add task to sequence
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
        // Define payload HERE before using it
        const payload: Record<string, any> = {
            [parameter]: currentTask.action
        };

        // Add cached data
        Object.entries(additionalData.current).forEach(([key, value]) => {
            if (value) {
                payload[key] = value;
            }
        });

        // Try using axios directly
        const response = await axios.post(
            getApiLink(appLocalizer, apilink),
            payload,
            { 
                headers: { 
                    'X-WP-Nonce': appLocalizer.nonce,
                    'Content-Type': 'application/json',
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
}, [tasks, interval, appLocalizer, apilink, parameter, onComplete, onError, onTaskComplete]);

    const startProcess = useCallback(() => {
        if (processStarted.current) return;
        
        processStarted.current = true;
        setLoading(true);
        setTaskSequence([]);
        setProcessStatus('');
        additionalData.current = {};
        taskIndex.current = 0;
        executeSequentialTasks();
    }, [executeSequentialTasks]);

    const handleButtonClick = (e: React.MouseEvent) => {
        e.preventDefault();
        startProcess();
    };

    // Convert taskSequence to ItemList items
    const getItemListItems = () => {
        return taskSequence.map((task, index) => ({
            id: `task-${index}`,
            title: task.message,
            desc: task.status === 'running' ? 'Processing...' :
                task.status === 'success' && task.successMessage ? task.successMessage :
                    task.status === 'failed' && task.failureMessage ? task.failureMessage :
                        task.message,
            icon: task.status === 'failed' ? 'cross' :
                task.status === 'success' ? 'yes' :
                    task.status === 'running' ? 'spinner' : 'pending',
            className: `task-status-${task.status}`,
        }));
    };

    return (
        <div className="do-action-wrapper">
            <div className="loader-wrapper">
                <AdminButtonUI
                    buttons={[{
                        text: value,
                        color: 'purple-bg',
                        onClick: handleButtonClick,
                        disabled: loading,
                        icon: loading ? 'spinner' : 'play',
                        children: null,
                        customStyle: {},
                        style: {},
                    }]}
                    wrapperClass=""
                    position="left"
                />
                
                {loading && (
                    <div className="loader">
                        <div className="three-body-dot" />
                    </div>
                )}
            </div>

            {/* Task Progress Display */}
            {taskSequence.length > 0 && (
                <div className="tasks-container">
                    <ItemListUI
                        items={getItemListItems()}
                        className="task-list"
                        background={true}
                        border={true}
                    />
                </div>
            )}

            {/* Process Completion Status */}
            {processStatus && (
                <div className={`fetch-display-output ${processStatus === 'failed' ? 'failed' : 'success'}`}>
                    {processStatus === 'failed' ? failureMessage : successMessage}
                </div>
            )}
        </div>
    );
};

export default SequentialTaskExecutor;