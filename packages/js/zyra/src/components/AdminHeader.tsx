import React, { useState, useRef, useEffect } from "react";

// Accepts searchIndex-style items directly
type SearchItem = {
  icon?: any;
  name?: string;
  desc?: string;
  link: string;
};
interface Notification {
  heading: string;
  message: string;
  time: string;
  icon?: string;
  color?: string;
}

interface DropdownOption {
  value: string;
  label: string;
}

interface NotificationItem {
  heading: string;
  message: string;
  time: string;
  icon?: string;
  color?: string;
  link?: string; // optional for individual notification
}

type AdminHeaderProps = {
  brandImg: string;
  query: string;
  results?: any[];
  onSearchChange: (value: string) => void;
  onResultClick: (res: SearchItem) => void;
  onSelectChange: (value: string) => void;
  selectValue: string;
  free?: string;
  pro?: string;
  showDropdown?: boolean;
  dropdownOptions?: DropdownOption[];

  notifications?: NotificationItem[];
  messages?: NotificationItem[];
  notificationsLink?: string;
  messagesLink?: string;
  showNotifications?: boolean;
  showMessages?: boolean;
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
  pro,
  showDropdown,
  dropdownOptions,
  notificationsLink,
  notifications,
  messagesLink,
  messages,
  showMessages,
  showNotifications
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [contactSupportPopup, setContactSupportPopup] = useState(false);
  const [popupContent, setPopupContent] = useState<string>("Loading...");
  const [isMinimized, setIsMinimized] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
        setNotifOpen(false);
        setMessageOpen(false);
        // setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    if (contactSupportPopup) {
      setPopupContent("Loading...");
      fetch("https://tawk.to/chat/5d2eebf19b94cd38bbe7c9ad/1fsg8cq8n") // or an API endpoint
        .then((res) => res.text())
        .then((html) => setPopupContent(html))
        .catch(() => setPopupContent("Failed to load content."));
    }
  }, [contactSupportPopup]);
  // Open dropdown automatically when there are results
  useEffect(() => {
    setDropdownOpen(results.length > 0);
  }, [results]);

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
              <i className="adminlib-pro-tag"></i> Pro: {pro ? pro : "Not Installed"}
            </span>
          </div>
        </div>

        <div className="right-section">
          <div className="search-field" style={{ position: "relative" }} ref={wrapperRef}>
            <i className="adminlib-search"></i>
            <input
              type="text"
              placeholder="Search Here"
              value={query}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {showDropdown && dropdownOptions && dropdownOptions.length > 0 && (
              <select
                value={selectValue}
                onChange={(e) => onSelectChange(e.target.value)}
              >
                {dropdownOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}


            {/* dropdown render */}
            {dropdownOpen && results.length > 0 && (
              <ul
                className="search-dropdown"
              >
                {results.map((r, i) => {
                  const name = r.name || "(No name)";
                  const desc = r.desc || "";

                  return (
                    <li
                      key={i}
                      onClick={() => {
                        onResultClick(r);
                        setDropdownOpen(false); // close dropdown on click
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f5f7fa")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {r.icon && <i className={r.icon}></i>}
                      <div>
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
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>


          {/* Notifications */}
          {showNotifications && notifications && notifications.length > 0 && (
            <div className="icon-wrapper">
              <i
                className="admin-icon adminlib-notification"
                title="Notifications"
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setProfileOpen(false);
                  setMessageOpen(false);
                }}
              ></i>
              <span className="count">{notifications.length}</span>

              {notifOpen && (
                <div className="dropdown-menu notification">
                  <div className="title">
                    Notifications <span className="admin-badge green">{notifications.length} New</span>
                  </div>
                  <div className="notification">
                    <ul>
                      {notifications.map((item, idx) => (
                        <li key={idx}>
                          <a href={item.link || "#"}>
                            <div className={`icon admin-badge ${item.color || "green"}`}>
                              <i className={item.icon || "adminlib-user-network-icon"}></i>
                            </div>
                            <div className="details">
                              <span className="heading">{item.heading}</span>
                              <span className="message">{item.message}</span>
                              <span className="time">{item.time}</span>
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {notificationsLink && (
                    <div className="footer">
                      <a href={notificationsLink} className="admin-btn btn-purple">
                        <i className="adminlib-eye"></i> View all notifications
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          {showMessages && messages && messages.length > 0 && (
            <div className="icon-wrapper">
              <i
                className="admin-icon adminlib-enquiry"
                title="Messages"
                onClick={() => {
                  setMessageOpen(!messageOpen);
                  setProfileOpen(false);
                  setNotifOpen(false);
                }}
              ></i>
              <span className="count">{messages.length}</span>

              {messageOpen && (
                <div className="dropdown-menu notification">
                  <div className="title">
                    Messages <span className="admin-badge green">{messages.length} New</span>
                  </div>
                  <div className="notification">
                    <ul>
                      {messages.map((msg, idx) => (
                        <li key={idx}>
                          <a href={msg.link || "#"}>
                            <div className={`icon admin-badge ${msg.color || "green"}`}>
                              <i className={msg.icon || "adminlib-user-network-icon"}></i>
                            </div>
                            <div className="details">
                              <span className="heading">{msg.heading}</span>
                              <span className="message">{msg.message}</span>
                              <span className="time">{msg.time}</span>
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {messagesLink && (
                    <div className="footer">
                      <a href={messagesLink} className="admin-btn btn-purple">
                        <i className="adminlib-eye"></i> View all messages
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="icon-wrapper">
            <i
              className="admin-icon adminlib-user-circle"
              title="Admin support"
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotifOpen(false);
              }}
            ></i>
            {profileOpen && (
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
                      <a onClick={(e) => {
                        setContactSupportPopup(true);
                      }}>
                        <i className="adminlib-user-network-icon"></i>
                        Contact Support
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      <div className={`live-chat-wrapper
          ${contactSupportPopup ? "open" : ""}
          ${isMinimized ? "minimized" : ""}`}>
        <i className="adminlib-close"
          onClick={(e) => {
            setContactSupportPopup(false);
          }}></i>
        <i
          className="adminlib-minus icon"
          onClick={() => {
            setIsMinimized(!isMinimized);
            setContactSupportPopup(true);
          }}
        ></i>
        <iframe
          src="https://tawk.to/chat/5d2eebf19b94cd38bbe7c9ad/1fsg8cq8n"
          title="Support Chat"
          style={{
            border: 'none',
            width: '100%',
            height: '35rem',
          }}
          allow="microphone; camera"
        />
      </div>
      {isMinimized &&
        <div onClick={(e) => {
          setContactSupportPopup(true);
          setIsMinimized(false);
        }} className="minimized-icon">
          <i className="admin-icon adminlib-enquiry" title="Messages"></i>
        </div>
      }
    </>
  );
};

export default AdminHeader;
