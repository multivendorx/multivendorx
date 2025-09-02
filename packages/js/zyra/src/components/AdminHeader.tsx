import React from "react";

// Accepts searchIndex-style items directly
type SearchItem = {
  name?: string;
  desc?: string;
  link: string;
};

type AdminHeaderProps = {
  brandImg: string;
  query: string;
  results?: SearchItem[];
  onSearchChange: (value: string) => void;
  onResultClick: (res: SearchItem) => void;
  onSelectChange: (value: string) => void;
  selectValue: string;
  free?: string;
  pro?: string;
};

const AdminHeader: React.FC<AdminHeaderProps> = ({
  brandImg,
  query,
  results = [],
  onSearchChange,
  onResultClick,
  onSelectChange,
  selectValue,
  free,
  pro = "4.1.23",
}) => {
  return (
    <>
      <div className="admin-header">
        <div className="left-section">
          <img className="brand-logo" src={brandImg} alt="Logo" />

          <div className="version-tag">
            <span className="admin-badge blue">
              <i className="adminlib-adminlib-info"></i> <b>Free:</b> {free}
            </span>
            <span className="admin-badge red">
              <i className="adminlib-pro-tag"></i> Pro: {pro}

            </span>
          </div>
        </div>

        <div className="right-section">
          <div className="search-field" style={{ position: "relative" }}>
            <i className="adminlib-search"></i>
            <input
              type="text"
              placeholder="Search Here"
              value={query}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <select
              value={selectValue}
              onChange={(e) => onSelectChange(e.target.value)}
            >
              <option value="all">All</option>
              <option value="modules">Modules</option>
              <option value="settings">Settings</option>
            </select>

            {/* dropdown render */}
            {results.length > 0 && (
              <ul
                className="search-dropdown"
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  width: "260px",
                  maxHeight: "250px",
                  overflowY: "auto",
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  marginTop: "4px",
                  padding: 0,
                  listStyle: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  zIndex: 1000,
                }}
              >
                {results.map((r, i) => {
                  const name = r.name || "(No name)";
                  const desc = r.desc || "";

                  return (
                    <li
                      key={i}
                      onClick={() => onResultClick(r)}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        fontSize: "14px",
                        color: "#333",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f5f7fa")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <div style={{ fontWeight: 500 }}>
                        {name.length > 60 ? name.substring(0, 60) + "..." : name}
                      </div>
                      {desc && (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#666",
                            marginTop: "2px",
                          }}
                        >
                          {desc.length > 80 ? desc.substring(0, 80) + "..." : desc}
                        </div>
                      )}
                    </li>
                  );
                })}

              </ul>
            )}
          </div>

          {/* start notification */}
          <div className="icon-wrapper notification">
            <i
              className="admin-icon adminlib-notification"
              title="Notifications"
            ></i>
            <div className="dropdown-menu">
              <div className="title">Notification</div>
              <div className="notification">
                <ul>
                  <li>
                    <a href="#">
                      <i className="adminlib-user-network-icon"></i>
                      <span>Congratulation Lettie</span>
                      <span>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Tenetur, blanditiis.</span>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="adminlib-user-network-icon"></i>
                      <span>Congratulation Lettie</span>
                      <span>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Tenetur, blanditiis.</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {/* end notification */}

          <div className="icon-wrapper">
            <i
              className="admin-icon adminlib-plus-circle-o"
              title="Admin support"
            ></i>
          </div>

          <div className="icon-wrapper">
            <i
              className="admin-icon adminlib-user-circle"
              title="Admin support"
            ></i>
            <div className="dropdown-menu">
              <div className="dropdown-body">
                <ul>
                  <li>
                    <a href="#">
                      <i className="adminlib-person"></i>
                      Manage Plan
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="adminlib-user-network-icon"></i>
                      Contact Support
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminHeader;
