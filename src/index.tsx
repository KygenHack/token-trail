import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { SDKProvider } from '@telegram-apps/sdk-react';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { mockTelegramEnv, parseInitData } from '@telegram-apps/sdk';
import { getInitData } from './getInitData';
import { saveInitData } from './dataService';
import useAuth from './useAuth';
import { supabase } from './supabase';

const initDataRaw = getInitData();

if (process.env.REACT_APP_ENV === 'development') {
  mockTelegramEnv({
    themeParams: {
      accentTextColor: '#6ab2f2',
      bgColor: '#17212b',
      buttonColor: '#5288c1',
      buttonTextColor: '#ffffff',
      destructiveTextColor: '#ec3942',
      headerBgColor: '#17212b',
      hintColor: '#708499',
      linkColor: '#6ab3f3',
      secondaryBgColor: '#232e3c',
      sectionBgColor: '#17212b',
      sectionHeaderTextColor: '#6ab3f3',
      subtitleTextColor: '#708499',
      textColor: '#f5f5f5',
    },
    initData: parseInitData(initDataRaw),
    initDataRaw,
    version: '7.2',
    platform: 'tdesktop',
  });
}

const AppWrapper: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const userId = user.id;
      saveInitData(userId, initDataRaw);
    }
  }, [user]);

  return (
    <SDKProvider>
      <App />
    </SDKProvider>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
