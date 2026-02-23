import "../styles/web/UI/AdminButton.scss";
import React, { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FieldComponent } from "./types";
import { BlockStyle } from "./CanvasEditor/blockStyle";
import { getApiLink, sendApiResponse } from "../utils/apiService";


export interface Task {
    action: string;
    message: string;
    cacheKey?: string;
    successMessage?: string;
    failureMessage?: string;
}

interface SyncStatus {
    action: string;
    current: number;
    total: number;
}

interface DynamicResponse {
    success: boolean;
    running?: boolean;
    status?: SyncStatus[];
    data?: any;
    message?: string;
    [key: string]: any;
}

type TaskStatus = "running" | "success" | "failed";

interface AdditionalData {
    [key: string]: any;
}

type CustomStyle = {
    button_border_size: number;
    button_border_color: string;
    button_background_color: string;
    button_text_color: string;
    button_border_radious: number;
    button_font_size: number;
    button_font_width: number;
    button_margin: number;
    button_padding: number;
    button_border_color_onhover: string;
    button_text_color_onhover: string;
    button_background_color_onhover: string;
    button_text: string;
};

export type ButtonConfig = {
    // Visual
    icon?: string;
    text?: string;
    color?: string;
    children?: React.ReactNode;
    customStyle?: Partial<CustomStyle>;
    disabled?: boolean;
    style?: BlockStyle;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;

    tasks?: Task[];
    apilink?: string;
    apiLink?: string;
    parameter?: string;
    appLocalizer?: any;
    interval?: number;
    successMessage?: string;
    failureMessage?: string;
    onComplete?: (data: any) => void;
    onAllTasksComplete?: (data: any) => void;
    onError?: (error: any) => void;
    onTaskError?: (error: any) => void;
    onTaskComplete?: (task: Task, response: any) => void;
    showProgress?: boolean;
};

const mapBlockStyleToCustomStyle = (style: BlockStyle): Partial<CustomStyle> => ({
    button_background_color: style.backgroundColor,
    button_text_color: style.color,
    button_border_color: style.borderColor,
    button_border_radious: style.borderRadius,
    button_font_size: style.fontSize,
    button_font_width: Number(style.fontWeight),
    button_border_size: style.borderWidth,
    button_padding: style.paddingTop,
    button_margin: style.marginTop,
});

const buildButtonCSSProps = (
    customStyle: Partial<CustomStyle>,
    hovered: boolean
): React.CSSProperties => ({
    border: hovered
        ? `${customStyle.button_border_size}px solid ${customStyle.button_border_color_onhover}`
        : `${customStyle.button_border_size}px solid ${customStyle.button_border_color}`,
    backgroundColor: hovered
        ? customStyle.button_background_color_onhover
        : customStyle.button_background_color,
    color: hovered
        ? customStyle.button_text_color_onhover
        : customStyle.button_text_color,
    borderRadius: `${customStyle.button_border_radious}px`,
    fontSize: `${customStyle.button_font_size}px`,
    fontWeight: customStyle.button_font_width,
    margin: `${customStyle.button_margin}px`,
    padding: `${customStyle.button_padding}px`,
});

const SingleButton: React.FC<{ btn: ButtonConfig }> = ({ btn }) => {
    const [hovered, setHovered] = useState(false);
    const isMounted = Boolean(btn);
    const [syncStarted, setSyncStarted] = useState(false);
    const [syncStatus, setSyncStatus] = useState<SyncStatus[]>([]);
    const [loading, setLoading] = useState(false);
    const [taskSequence, setTaskSequence] = useState<
        {
            name: string;
            message: string;
            status: TaskStatus;
            successMessage?: string;
            failureMessage?: string;
        }[]
    >([]);
    const [processStatus, setProcessStatus] = useState("");
    const [fetchFailed, setFetchFailed] = useState(false);

    const fetchStatusRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const processStarted = useRef(false);
    const additionalData = useRef<AdditionalData>({});
    const taskIndex = useRef(0);

    // ── Early return guard (must be AFTER all hook declarations) ──
    // Keeps hook call count stable while preventing crashes on undefined btn
    if (!isMounted) return null;

    // Resolve prop aliases
    const tasks = btn.tasks ?? [];
    const hasTasks = tasks.length > 0;
    const apilink = btn.apilink ?? btn.apiLink ?? "";
    const parameter = btn.parameter ?? "action";
    const appLocalizer = btn.appLocalizer;
    const interval = btn.interval ?? 1000;
    const successMessage = btn.successMessage ?? "Process completed successfully";
    const failureMessage = btn.failureMessage ?? "Process failed";
    const onComplete = btn.onComplete ?? btn.onAllTasksComplete;
    const onError = btn.onError ?? btn.onTaskError;
    const onTaskComplete = btn.onTaskComplete;
    const showProgress = btn.showProgress ?? hasTasks;

    // ── Helpers ─────────────────────────────────────────────

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const fetchSyncStatus = useCallback(() => {
        if (!appLocalizer || !apilink) return;
        axios
            .get(hasTasks ? apilink : getApiLink(appLocalizer, apilink), {
                headers: { "X-WP-Nonce": appLocalizer.nonce },
                params: { parameter },
            })
            .then(({ data }: { data: DynamicResponse }) => {
                setSyncStarted(data.running || false);
                setSyncStatus(data.status || []);
            })
            .catch(() => {
                setSyncStarted(false);
                setSyncStatus([]);
            });
    }, [appLocalizer, apilink, parameter, hasTasks]);

    const updateTaskStatus = (status: TaskStatus, customMessage?: string) => {
        setTaskSequence((prev) => {
            const updated = [...prev];
            const last = updated.length - 1;
            if (last >= 0) {
                updated[last].status = status;
                if (customMessage) {
                    if (status === "success") updated[last].successMessage = customMessage;
                    else if (status === "failed") updated[last].failureMessage = customMessage;
                }
            }
            return updated;
        });
    };

    const handleTaskResponse = async (
        currentTask: Task,
        response: DynamicResponse
    ): Promise<TaskStatus> => {
        let status: TaskStatus = "success";
        let customMessage = "";

        if (currentTask.cacheKey && response.data !== undefined) {
            additionalData.current[currentTask.cacheKey] = response.data;
        }

        if (!response?.success) {
            status = "failed";
            customMessage =
                currentTask.failureMessage || response?.message || "Task failed";
            if (onError) onError({ task: currentTask, response, error: customMessage });
        } else {
            if (onTaskComplete) onTaskComplete(currentTask, response);
            if (currentTask.successMessage) customMessage = currentTask.successMessage;
        }

        updateTaskStatus(status, customMessage);
        return status;
    };

    const executeSequentialTasks = useCallback(async () => {
        if (taskIndex.current >= tasks.length) {
            setProcessStatus("completed");
            setLoading(false);
            processStarted.current = false;
            if (onComplete) onComplete(additionalData.current);
            return;
        }

        const currentTask = tasks[taskIndex.current];

        setTaskSequence((prev) => [
            ...prev,
            {
                name: currentTask.action,
                message: currentTask.message,
                status: "running",
                successMessage: currentTask.successMessage,
                failureMessage: currentTask.failureMessage,
            },
        ]);

        await sleep(interval);

        try {
            const payload: Record<string, any> = {
                action: currentTask.action,
                parameter,
            };
            Object.entries(additionalData.current).forEach(([key, value]) => {
                if (value !== undefined) payload[key] = value;
            });

            const resolvedUrl = appLocalizer
                ? getApiLink(appLocalizer, apilink)
                : apilink;

            const response = (await sendApiResponse(
                appLocalizer,
                resolvedUrl,
                payload
            )) as DynamicResponse;

            const status = await handleTaskResponse(currentTask, response);
            if (status === "failed") {
                setProcessStatus("failed");
                setLoading(false);
                processStarted.current = false;
                return;
            }

            taskIndex.current++;
            await executeSequentialTasks();
        } catch (error) {
            console.error("Task execution failed:", error);
            updateTaskStatus("failed", "Task execution failed");
            setProcessStatus("failed");
            setLoading(false);
            processStarted.current = false;
            if (onError) onError({ task: currentTask, error });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tasks, interval, appLocalizer, apilink, parameter]);

    const startProcess = useCallback(() => {
        if (processStarted.current) return;
        processStarted.current = true;
        setLoading(true);
        setTaskSequence([]);
        setProcessStatus("");
        setFetchFailed(false);
        additionalData.current = {};
        taskIndex.current = 0;
        executeSequentialTasks();
    }, [executeSequentialTasks]);

    // ── Sync-status polling (non-task mode) ─────────────────
    useEffect(() => {
        if (!hasTasks) {
            if (syncStarted) {
                fetchStatusRef.current = setInterval(fetchSyncStatus, interval);
            } else if (fetchStatusRef.current) {
                clearInterval(fetchStatusRef.current);
                fetchStatusRef.current = null;
            }
        }
        return () => {
            if (fetchStatusRef.current) clearInterval(fetchStatusRef.current);
        };
    }, [syncStarted, fetchSyncStatus, interval, hasTasks]);

    useEffect(() => {
        if (!hasTasks && appLocalizer && apilink) {
            fetchSyncStatus();
        }
    }, [fetchSyncStatus, hasTasks, appLocalizer, apilink]);

    // ── Click handler ────────────────────────────────────────
    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        // No task config — plain onClick
        if (!hasTasks && !appLocalizer) {
            btn.onClick?.(e);
            return;
        }

        if (hasTasks) {
            // Sequential task mode (parameter === 'action' | 'connection_test')
            startProcess();
        } else {
            // Simple sync trigger mode
            setSyncStarted(true);
            setFetchFailed(false);
            try {
                const response = await axios.post(
                    getApiLink(appLocalizer, apilink),
                    { parameter },
                    { headers: { "X-WP-Nonce": appLocalizer.nonce } }
                );
                if (response.data) {
                    setSyncStarted(false);
                    fetchSyncStatus();
                }
            } catch {
                setSyncStarted(false);
                setFetchFailed(true);
            }
        }
    };

    // ── Derived style ────────────────────────────────────────
    const styleFromBlock = btn.style ? mapBlockStyleToCustomStyle(btn.style) : {};
    const customStyle: Partial<CustomStyle> = {
        ...styleFromBlock,
        ...(btn.customStyle ?? {}),
    };
    const buttonCSSProps = buildButtonCSSProps(customStyle, hovered);
    const isDisabled = btn.disabled || loading || syncStarted;
    const label = customStyle.button_text || btn.text || "Click";

    return (
        <div className="do-action-wrapper">
            <div className="loader-wrapper">
                <button
                    className={`admin-btn btn-${btn.color || "purple-bg"}${hasTasks ? " btn-effect" : ""}`}
                    onClick={handleClick}
                    disabled={isDisabled}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    style={buttonCSSProps}
                >
                    {btn.children || (
                        <>
                            {btn.icon && <i className={`adminfont-${btn.icon}`} />}
                            {label}
                        </>
                    )}
                </button>

                {(loading || syncStarted) && (
                    <div className="loader">
                        <div className="three-body-dot" />
                        <div className="three-body-dot" />
                        <div className="three-body-dot" />
                    </div>
                )}
            </div>

            {/* ── Progress UI (previously DoActionBtn JSX) ── */}
            {showProgress && (
                <>
                    {syncStarted && (
                        <div className="fetch-display-output info">
                            Process started, please wait...
                        </div>
                    )}

                    {fetchFailed && (
                        <div className="fetch-display-output failed">
                            {failureMessage}
                        </div>
                    )}

                    {taskSequence.map((task, index) => (
                        <div key={index} className={`${task.status} details-status-row`}>
                            <div className="task-message">
                                <span className="task-text">{task.message}</span>
                                {task.status === "success" && task.successMessage && (
                                    <span className="task-custom-message success">
                                        {task.successMessage}
                                    </span>
                                )}
                                {task.status === "failed" && task.failureMessage && (
                                    <span className="task-custom-message failed">
                                        {task.failureMessage}
                                    </span>
                                )}
                            </div>
                            {task.status !== "running" && (
                                <div className="status-meta">
                                    <span className="status-icons">
                                        <i
                                            className={`admin-font ${task.status === "failed"
                                                    ? "adminlib-cross"
                                                    : "adminlib-icon-yes"
                                                }`}
                                        />
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}

                    {processStatus && (
                        <div
                            className={`fetch-display-output ${processStatus === "failed" ? "failed" : "success"
                                }`}
                        >
                            {processStatus === "failed" ? (
                                <p>
                                    {failureMessage}
                                    {parameter === "connection_test" && (
                                        <>
                                            {" "}Check details in{" "}
                                            <Link
                                                className="errorlog-link"
                                                to="?page=moowoodle#&tab=settings&subtab=log"
                                            >
                                                error log
                                            </Link>
                                            .
                                        </>
                                    )}
                                </p>
                            ) : (
                                successMessage
                            )}
                        </div>
                    )}

                    {syncStatus.length > 0 && (
                        <div className="sync-status-container">
                            {syncStatus.map((status, index) => (
                                <div key={index} className="details-status-row sync-status">
                                    <span className="sync-action">{status.action}</span>
                                    <div className="status-meta">
                                        <span className="status-icons">
                                            <i className="admin-font adminlib-icon-yes" />
                                        </span>
                                        <span className="sync-progress">
                                            {status.current} / {status.total}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

type AdminButtonUIProps = {
    buttons: ButtonConfig | ButtonConfig[];
    wrapperClass?: string;
    position?: "left" | "right" | "center";
};

export const AdminButtonUI: React.FC<AdminButtonUIProps> = ({
    buttons,
    wrapperClass = "",
    position = "left",
}) => {
    const buttonsArray = (Array.isArray(buttons) ? buttons : [buttons]).filter(
        (b): b is ButtonConfig => b != null
    );
    const wrapperClasses = `buttons-wrapper${wrapperClass ? ` ${wrapperClass}` : ""}`;

    return (
        <div className={wrapperClasses} data-position={position}>
            {buttonsArray.map((btn, index) => (
                // Each SingleButton owns its own hook state — no hooks-in-map violation
                <SingleButton key={index} btn={btn} />
            ))}
        </div>
    );
};
const AdminButton: FieldComponent = {
    render: ({ field, onChange, canAccess }) => {
        const baseConfig: Partial<ButtonConfig> = {
            color: field.color ?? "purple-bg",
            style: field.style,
            customStyle: field.customStyle,
            // Task-execution props — forwarded transparently from field config
            tasks: field.tasks,
            apilink: field.apilink ?? field.apiLink,
            apiLink: field.apiLink,
            parameter: field.parameter,
            appLocalizer: field.appLocalizer,
            interval: field.interval,
            successMessage: field.successMessage,
            failureMessage: field.failureMessage,
            onComplete: field.onComplete ?? field.onAllTasksComplete,
            onAllTasksComplete: field.onAllTasksComplete,
            onError: field.onError ?? field.onTaskError,
            onTaskError: field.onTaskError,
            onTaskComplete: field.onTaskComplete,
            showProgress: field.showProgress,
        };

        const resolvedButtons: ButtonConfig[] =
            Array.isArray(field.options) && field.options.length > 0
                ? field.options.map((btn: any) => ({
                    ...baseConfig,
                    text: btn.label,
                    onClick: btn.onClick,
                    disabled: btn.disabled,
                    icon: btn.icon,
                }))
                : [{
                        ...baseConfig,
                        text: field.text || field.placeholder || field.name || "Click",
                        onClick: () => onChange(true),
                        disabled: field.disabled,
                        icon: field.icon,
                    },
                ];

        return (
            <AdminButtonUI
                wrapperClass={field.wrapperClass || ""}
                buttons={resolvedButtons}
                position={field.position || "left"}
            />
        );
    },

    validate: (field, value) => {
        return field.required && !value ? `${field.label} is required` : null;
    },
};

export default AdminButton;