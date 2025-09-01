import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AdminHeader, Banner, initializeModules } from 'zyra';

import Settings from './components/Settings/Settings';
import Modules from './components/Modules/Modules';
import Store from './components/Store/Store';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import StatusAndTools from './components/StatusAndTools/StatusAndTools';
import SetupWizard from './blocks/setupWizard/SetupWizard';
import WorkBoard from './components/WorkBoard/workboard';
import Memberships from './components/Membership/Membership';

import Brand from './assets/images/mvx-brand-logo.png';
import { searchIndex, SearchItem } from './searchIndex';
import { __ } from '@wordpress/i18n';

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

  return (
    <>
      {currentTab.get('tab') === 'settings' && <Settings id="settings" />}
      {currentTab.get('tab') === 'memberships' && <Memberships />}
      {currentTab.get('tab') === 'status-tools' && <StatusAndTools id="status-tools" />}
      {currentTab.get('tab') === 'modules' && <Modules />}
      {currentTab.get('tab') === 'stores' && <Store />}
      {currentTab.get('tab') === 'work-board' && <WorkBoard />}
      {currentTab.get('tab') === 'dashboard' && <AdminDashboard />}
      {currentTab.get('tab') === 'setup' && <SetupWizard />}
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
      />
      <Route />
    </>
  );
};

export default App;
