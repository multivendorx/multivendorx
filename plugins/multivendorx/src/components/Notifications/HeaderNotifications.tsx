import React, { useEffect, useState } from 'react';
import { getApiLink, ItemList, Skeleton } from 'zyra';
import axios from 'axios';
import { __ } from '@wordpress/i18n';

type NotificationItem = {
  id: number;
  icon?: string;
  title: string;
  message: string;
  time: string;
};

const NotificationTabContent: React.FC<{ type: 'notification' | 'activity' }> = ({ type }) => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios({
      method: 'GET',
      url: getApiLink(appLocalizer, 'notifications'),
      headers: { 'X-WP-Nonce': appLocalizer.nonce },
      params: { header: true, type },
    })
      .then(res => {
        setItems(res.data || [])
        setLoading(false);
      })
      .catch(() => {
        setItems([])
        setLoading(false);
      });
  }, [type]);

  const dismissItem = (id: number) => {
    axios.post(getApiLink(appLocalizer, `notifications/${id}`), {
      id,
      is_dismissed: true,
    }, { headers: { 'X-WP-Nonce': appLocalizer.nonce } })
      .then(() => setItems(prev => prev?.filter(i => i.id !== id) || []));
  };

  const markRead = (id: number) => {
    axios.post(getApiLink(appLocalizer, `notifications/${id}`), {
      id,
      is_read: true,
    }, { headers: { 'X-WP-Nonce': appLocalizer.nonce } })
      .then(() => setItems(prev => prev?.filter(i => i.id !== id) || []));
  };

  if (loading) {
    return (
      <>
        <li>
          <div className="item">
            <Skeleton width={400} height={70} />
          </div>
          <div className="item">
            <Skeleton width={400} height={70} />
          </div>
          <div className="item">
            <Skeleton width={400} height={70} />
          </div>
          <div className="item">
            <Skeleton width={400} height={70} />
          </div>
        </li>
      </>
    );
  }

  if (items.length === 0) return <div>{__('No notifications', 'multivendorx')}</div>;

  return (
    <ItemList
      variant="notification"
      items={items.map((item) => ({
        id: item.id,
        title: item.title,
        desc: item.message,
        icon: item.icon,
        time: item.time,
        action: (item) => {
          markRead(item.id)
        }
      }))}
    />

    // <ul className="notification-list">
    //   {items.map(item => (
    //     <li key={item.id}>
    //       <div className="item" onClick={() => markRead(item.id)}>
    //         <i className={item.icon || 'adminfont-user-network-icon green'}></i>
    //         <div className="details">
    //           <span className="heading">{item.title}</span>
    //           <span className="message">{item.message}</span>
    //           <span className="time">{item.time}</span>
    //         </div>
    //         <i
    //           className="check-icon adminfont-cross color-red"
    //           onClick={e => {
    //             e.stopPropagation();
    //             dismissItem(item.id);
    //           }}
    //         />
    //       </div>
    //     </li>
    //   ))}
    // </ul>
  );
};

export default NotificationTabContent;