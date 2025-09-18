import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AdminHeader, Banner, initializeModules } from 'zyra';

import Settings from './components/Settings/Settings';
import Modules from './components/Modules/modules';
import Store from './components/Store/store';
import AdminDashboard from './components/AdminDashboard/adminDashboard';
import StatusAndTools from './components/StatusAndTools/statusAndTools';
import SetupWizard from './blocks/setupWizard/SetupWizard';
import CustomerServices from './components/CustomerService/customerServices';
import Memberships from './components/Membership/membership';

import Brand from './assets/images/mvx-brand-logo.png';
import { searchIndex, SearchItem } from './searchIndex';
import { __ } from '@wordpress/i18n';
import Notification from './components/Notifications/notification';
import Announcements from './components/Announcements/announcements';
import Knowledgebase from './components/Knowledgebase/knowledgebase';
import Blogs from './components/Blogs/blogs';
import Commission from './components/Commission/commission';
import TransactionHistory from './components/TransactionHistory/transactionHistory';
import Analytics from './components/Analytics/Analytics';
import Advertisement from './components/Advertisement/Advertisement';
import HelpSupport from './components/HelpSupport/HelpSupport';

localStorage.setItem('force_multivendorx_context_reload', 'true');

interface Products {
  title: string;
  description: string;
}

const products: Products[] = [
  {
    title: __('Double Opt-In', 'notifima'),
    description: __('Experience the power of Double Opt-In for our Stock Alert Form!', 'notifima'),
  },
  {
    title: __('Your Subscription Hub', 'notifima'),
    description: __('Easily monitor and download lists of out-of-stock subscribers.', 'notifima'),
  },
];

const Route = () => {
  const currentTab = new URLSearchParams(useLocation().hash);
  const tab = currentTab.get("tab") || "dashboard";

  return (
    <>
      {tab === 'settings' && <Settings id="settings" />}
      {tab === 'memberships' && <Memberships />}
      {tab === 'status-tools' && <StatusAndTools id="status-tools" />}
      {tab === 'modules' && <Modules />}
      {tab === 'stores' && <Store />}
      {tab === 'commissions' && <Commission />}
      {tab === 'customer-support' && <CustomerServices />}
      {tab === 'actions-items' && <Notification />}
      {tab === 'dashboard' && <AdminDashboard />}
      {tab === 'announcement' && <Announcements />}
      {tab === 'knowledgebase' && <Knowledgebase />}
      {tab === 'transaction-history' && <TransactionHistory />}
      {tab === 'blogs' && <Blogs />}
      {tab === 'setup' && <SetupWizard />}
      {tab === 'analytics' && <Analytics />}
      {tab === 'advertisement' && <Advertisement />}
      {tab === 'help-support' && <HelpSupport />}
    </>
  );
};

const App = () => {
  const currentTabParams = new URLSearchParams(useLocation().hash);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [selectValue, setSelectValue] = useState('all');

  // Highlight active tab in sidebar
  useEffect(() => {
    document.querySelectorAll('#toplevel_page_multivendorx>ul>li>a').forEach((menuItem) => {
      const menuItemUrl = new URL((menuItem as HTMLAnchorElement).href);
      const menuItemHashParams = new URLSearchParams(menuItemUrl.hash.substring(1));

      if (menuItem.parentNode) {
        (menuItem.parentNode as HTMLElement).classList.remove('current');
      }
      if (menuItemHashParams.get('tab') === currentTabParams.get('tab')) {
        (menuItem.parentNode as HTMLElement).classList.add('current');
      }
    });
  }, [currentTabParams]);

  useEffect(() => {
    initializeModules(appLocalizer, 'multivendorx', 'free', 'modules');
  }, []);

  // 🔹 Search handlers
  const handleSearchChange = (value: string) => {
    setQuery(value);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    const lowerValue = value.toLowerCase();

    const filtered = searchIndex.filter((item) => {
      // Filter by dropdown selection
      if (selectValue !== 'all' && item.tab !== selectValue) return false;

      // Case-insensitive search
      const name = item.name?.toLowerCase() || '';
      const desc = item.desc?.toLowerCase() || '';
      return name.includes(lowerValue) || desc.includes(lowerValue);
    });

    setResults(filtered);
  };

  const handleSelectChange = (value: string) => {
    setSelectValue(value);

    // Re-run search for current query whenever dropdown changes
    if (query.trim()) {
      handleSearchChange(query);
    } else {
      setResults([]);
    }
  };

  const handleResultClick = (item: SearchItem) => {
    window.location.hash = item.link;
    setQuery('');
    setResults([]);
  };

  return (
    <>
      <Banner
        products={products}
        isPro={appLocalizer.khali_dabba}
        proUrl={appLocalizer.pro_url}
        tag="Why Premium"
        buttonText="View Pricing"
        bgCode="#852aff"
        textCode="#fff"
        btnCode="#fff"
        btnBgCode="#e35047"
      />
      <AdminHeader
        brandImg={Brand}
        query={query}
        results={results}
        onSearchChange={handleSearchChange}
        onResultClick={handleResultClick}
        onSelectChange={handleSelectChange}
        selectValue={selectValue}
        free={appLocalizer.freeVersion}
        showDropdown={true} 
        dropdownOptions={[
          { value: 'all', label: 'All' },
          { value: 'modules', label: 'Modules' },
          { value: 'settings', label: 'Settings' },
        ]}
        showMessages={true}
        notifications={[
          {
            heading: "New Order Received",
            message: "Order #1024 has been placed",
            time: "1 hour ago",
            icon: "adminlib-cart-icon",
            color: "blue",
            link: "/orders"
          },
          {
            heading: "New Review",
            message: "John left a 5-star review",
            time: "30 mins ago",
            icon: "adminlib-star-icon",
            color: "yellow",
            link: "/reviews"
          }
        ]}
        notificationsLink="/notifications"
        showNotifications={true}
        messages={[
          {
            heading: "Support Ticket #123",
            message: "Customer reported an issue",
            time: "15 mins ago",
            icon: "adminlib-user-network-icon",
            color: "red",
            link: "/tickets/123"
          }
        ]}
        messagesLink="/messages"
      />
      <Route />
    </>
  );
};

export default App;