import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DragListView from 'react-drag-listview';
// import { FaPen } from 'react-icons/fa';
import { getApiLink } from '../utils/apiService';

interface Submenu {
  name: string;
  slug: string;
}

interface Endpoint {
  name: string;
  slug: string;
  submenu: Submenu[];
  visible?: boolean; // new for show/hide
}

interface EndpointEditorProps {
  name: string;
  proSetting?: boolean;
  proSettingChanged?: () => boolean;
  apilink: string;
  appLocalizer: Record<string, any>;
  onChange: (data: Record<string, Endpoint>) => void;
}

const EndpointManager: React.FC<EndpointEditorProps> = ({
  name,
  proSetting,
  proSettingChanged,
  apilink,
  appLocalizer,
  onChange,
}) => {
  const [endpoints, setEndpoints] = useState<[string, Endpoint][]>([]);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editSlug, setEditSlug] = useState<string>('');
  const [editName, setEditName] = useState<string>('');

  // Load data
  useEffect(() => {
    axios({
      url: getApiLink(appLocalizer, apilink),
      method: 'GET',
      headers: { 'X-WP-Nonce': appLocalizer.nonce },
    }).then((res) => {
      const typedData = res.data as Record<string, Endpoint>;
      const data = Object.entries(typedData).map(([k, v]) => [
        k,
        { ...v, visible: v.visible !== false }, // default to true if not set
      ]) as [string, Endpoint][];
      setEndpoints(data);
    });
  }, []);

  const autoSave = (updated: [string, Endpoint][]) => {
    setEndpoints(updated);
    onChange(Object.fromEntries(updated) as Record<string, Endpoint>);
  };

  // Main menu drag
  const onDragEnd = (fromIndex: number, toIndex: number) => {
    const updated = [...endpoints];
    const item = updated.splice(fromIndex, 1)[0];
    updated.splice(toIndex, 0, item);
    autoSave(updated);
  };

  const startEdit = (key: string, endpoint: Endpoint) => {
    setEditKey(key);
    setEditName(endpoint.name);
    setEditSlug(endpoint.slug);
  };

  const renderRow = ([key, endpoint]: [string, Endpoint], index: number) => {
    // Submenu drag
    const onSubmenuDragEnd = (fromIndex: number, toIndex: number) => {
      const updated = endpoints.map(([k, item]) => {
        if (k === key) {
          const submenuUpdated = [...item.submenu];
          const moved = submenuUpdated.splice(fromIndex, 1)[0];
          submenuUpdated.splice(toIndex, 0, moved);
          return [k, { ...item, submenu: submenuUpdated }];
        }
        return [k, item];
      }) as [string, Endpoint][];
      autoSave(updated);
    };

    return (
      <div key={key}>
        {editKey === key ? (
          <div>
            {/* Name input */}
            <input
              value={editName}
              onChange={(e) => {
                const newName = e.target.value;
                setEditName(newName);
                const updated = endpoints.map(([k, item]) =>
                  k === editKey
                    ? [k, { ...item, name: newName, slug: editSlug, visible: item.visible }]
                    : [k, item]
                ) as [string, Endpoint][];
                autoSave(updated);
              }}
              placeholder="Name"
            />

            {key !== 'dashboard' && (
              <input
                value={editSlug}
                onChange={(e) => {
                  const newSlug = e.target.value;
                  setEditSlug(newSlug);
                  const updated = endpoints.map(([k, item]) =>
                    k === editKey
                      ? [k, { ...item, name: editName, slug: newSlug, visible: item.visible }]
                      : [k, item]
                  ) as [string, Endpoint][];
                  autoSave(updated);
                }}
                placeholder="Slug"
              />
            )}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              opacity: endpoint.visible === false ? 0.5 : 1,
            }}
          >
            <div>
              <strong>{endpoint.name}</strong>
              {key !== 'dashboard' && <> (<code>{endpoint.slug}</code>)</>}
            </div>

            {/* Show/Hide toggle */}
            <label>
              <input
                type="checkbox"
                checked={endpoint.visible !== false}
                onChange={(e) => {
                  const updated = endpoints.map(([k, item]) =>
                    k === key ? [k, { ...item, visible: e.target.checked }] : [k, item]
                  ) as [string, Endpoint][];
                  autoSave(updated);
                }}
              />
              Show
            </label>

            <button onClick={() => startEdit(key, endpoint)}>
              {/* <FaPen className="text-gray-500" /> */}
            </button>
          </div>
        )}

        {/* Submenu drag list */}
        {endpoint.submenu?.length > 0 && (
          <DragListView
            nodeSelector=".submenu-row"
            handleSelector=".submenu-handle"
            onDragEnd={onSubmenuDragEnd}
          >
            <ul>
              {endpoint.submenu.map((sub, i) => (
                <li key={i} className="submenu-row cursor-move">
                  <span className="submenu-handle">☰</span> {sub.name}
                </li>
              ))}
            </ul>
          </DragListView>
        )}
      </div>
    );
  };

  return (
    <div>
      <h2>Endpoints</h2>
      <DragListView
        nodeSelector=".drag-row"
        handleSelector=".drag-handle"
        onDragEnd={onDragEnd}
      >
        <div>
          {endpoints.map(([key, endpoint], index) => (
            <div key={key} className="drag-row cursor-move">
              {key === 'dashboard' ? (
                <div>{renderRow([key, endpoint], index)}</div>
              ) : (
                <div className="drag-handle">{renderRow([key, endpoint], index)}</div>
              )}
            </div>
          ))}
        </div>
      </DragListView>
    </div>
  );
};

export default EndpointManager;
