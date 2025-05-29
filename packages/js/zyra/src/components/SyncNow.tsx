import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import "../styles/web/SyncNow.scss";
import { Link } from "react-router-dom";
import { getApiLink, sendApiResponse } from "./apiService";

type SyncStatus = {
  action: string;
  current: number;
  total: number;
};

type Task = {
  action: string;
  message: string;
  cache?: string;
};

type TaskStep = {
  name: string;
  message: string;
  status: "running" | "success" | "failed";
};

export interface SyncNowProps {
    buttonKey: string;
    interval: number;
    proSetting: boolean;
    proSettingChanged: () => boolean;
    value: string;
    description: string;
    apilink: string;
    parameter: string;
    status?: SyncStatus[];
    tasks?: Task[];
    appLocalizer: Record<string, any>;
}

interface ApiResponse {
  success: boolean;
  courses?: { id: number }[];
  data?: {
    users?: { id: number }[];
  };
}

const SyncNow: React.FC<SyncNowProps> = ({
  appLocalizer,
  interval,
  proSetting,
  proSettingChanged,
  value,
  description,
  apilink,
  parameter,
  status,
  tasks = [],
}) => {
  const [syncStarted, setSyncStarted] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus[]>([]);
  const [buttonClicked, setButtonClicked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [taskSequence, setTaskSequence] = useState<TaskStep[]>([]);
  const [testStatus, setTestStatus] = useState<"" | "Failed" | "Test Successful">("");

  const fetchStatusRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectTaskStarted = useRef<boolean>(false);
  const additionalData = useRef<Record<string, any>>({});
  const taskNumber = useRef<number>(0);

  const sleep = (time: number) => new Promise(resolve => setTimeout(resolve, time));

  const fetchSyncStatus = useCallback(() => {
    axios.get(getApiLink(appLocalizer, apilink), {
      headers: { "X-WP-Nonce": (window as any).appLocalizer?.nonce },
      params: { parameter },
    }).then(({ data }) => {
      setSyncStarted(data.running);
      setSyncStatus(data.status || []);
    });
  }, [apilink, parameter]);

  const doSequentialTask = useCallback(async () => {
    if (taskNumber.current >= tasks.length) {
      setTestStatus("Test Successful");
      setLoading(false);
      connectTaskStarted.current = false;
      return;
    }

    const currentTask = tasks[taskNumber.current];

    setTaskSequence(seq => [
      ...seq,
      { name: currentTask.action, message: currentTask.message, status: "running" },
    ]);

    await sleep(interval);

    try {
      const response = await sendApiResponse<ApiResponse>(
        appLocalizer,
        getApiLink(appLocalizer, apilink),
        { action: currentTask.action, ...additionalData.current, parameter }
      );

      if (!response) {
        setTaskSequence(seq => {
          const updated = [...seq];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            status: "failed",
          };
          return updated;
        });
        setTestStatus("Failed");
        setLoading(false);
        connectTaskStarted.current = false;
        return;
      }

      let taskStatus: "success" | "failed" = "success";

      if (currentTask.cache === "course_id") {
        const validCourse = response?.courses?.[1];
        if (!validCourse) {
          taskStatus = "failed";
        } else {
          additionalData.current["course_id"] = validCourse.id;
        }
      } else if (currentTask.cache === "user_id") {
        const validUser = response?.data?.users?.[0];
        if (!validUser) {
          taskStatus = "failed";
        } else {
          additionalData.current["user_id"] = validUser.id;
        }
      } else if (!response.success) {
        taskStatus = "failed";
      }

      setTaskSequence(seq => {
        const updated = [...seq];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          status: taskStatus,
        };
        return updated;
      });

      if (taskStatus === "failed") {
        setTestStatus("Failed");
        setLoading(false);
        connectTaskStarted.current = false;
        return;
      }

      taskNumber.current++;
      await doSequentialTask();
    } catch (error) {
      setTaskSequence(seq => {
        const updated = [...seq];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          status: "failed",
        };
        return updated;
      });
      setTestStatus("Failed");
      setLoading(false);
      connectTaskStarted.current = false;
    }
  }, [interval, tasks, apilink, parameter]);

  const startConnectionTask = useCallback(async () => {
    if (connectTaskStarted.current) return;

    connectTaskStarted.current = true;
    setLoading(true);
    setTaskSequence([]);
    additionalData.current = {};
    taskNumber.current = 0;
    setTestStatus("");

    await doSequentialTask();
  }, [doSequentialTask]);

  useEffect(() => {
    if (syncStarted) {
      fetchStatusRef.current = setInterval(fetchSyncStatus, interval);
    } else {
      if (fetchStatusRef.current) clearInterval(fetchStatusRef.current);
    }

    return () => {
      if (fetchStatusRef.current) clearInterval(fetchStatusRef.current);
    };
  }, [syncStarted, fetchSyncStatus, interval]);

  useEffect(() => {
    fetchSyncStatus();
  }, [fetchSyncStatus]);

  const handleSync = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (proSettingChanged()) return;

    if (parameter === "test") {
      startConnectionTask();
      return;
    }

    setSyncStarted(true);
    setButtonClicked(true);

    try {
      const response = await axios.post(
        getApiLink(appLocalizer, apilink),
        { parameter },
        { headers: { "X-WP-Nonce": (window as any).appLocalizer?.nonce } }
      );

      if (response.data) {
        setSyncStarted(false);
        fetchSyncStatus();
      }
    } catch {
      setSyncStarted(false);
    }
  };

  return (
    <div className="section-synchronize-now">
      <div className="loader-wrapper">
        <button className="btn-purple btn-effect synchronize-now-button" onClick={handleSync}>
          {value}
        </button>
        {(loading || syncStarted) && (
          <div className="loader">
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
          </div>
        )}
      </div>

      {syncStarted && (
        <div className="fetch-display-output success">
          Synchronization started, please wait.
        </div>
      )}

      <p
        className="settings-metabox-description"
        dangerouslySetInnerHTML={{ __html: description }}
      ></p>

      {proSetting && <span className="admin-pro-tag">pro</span>}

      <div className="fetch-details-wrapper">
        {taskSequence.map((task, idx) => (
          <div key={idx} className={`${task.status} details-status-row`}>
            {task.message}{" "}
            {task.status !== "running" && (
              <i className={`admin-font ${task.status === "failed" ? "adminLib-cross" : "adminLib-icon-yes"}`} />
            )}
          </div>
        ))}
      </div>

      {testStatus && (
        <div className={`fetch-display-output ${testStatus === "Failed" ? "failed" : "success"}`}>
          {testStatus === "Failed" ? (
            <p>
              Test connection failed. Check further details in{" "}
              <Link className="errorlog-link" to="?page=moowoodle#&tab=settings&subtab=log">
                error log
              </Link>.
            </p>
          ) : (
            "Test connection successful"
          )}
        </div>
      )}

      {syncStatus?.length > 0 &&
        syncStatus.map((status, idx) => (
          <div key={idx} className="details-status-row sync-now">
            {status.action}
            <div className="status-meta">
              <span className="status-icons">
                <i className="admin-font adminLib-icon-yes"></i>
              </span>
              <span>
                {status.current} / {status.total}
              </span>
            </div>
            <span
              style={{ width: `${(status.current / status.total) * 100}%` }}
              className="progress-bar"
            ></span>
          </div>
        ))}
    </div>
  );
};

export default SyncNow;
