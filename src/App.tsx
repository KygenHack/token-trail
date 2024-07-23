import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { SDKProvider } from '@telegram-apps/sdk-react';
import SplashScreen from './component/SplashScreen';
import HomeScreen from './component/HomeScreen';
import NavBar from './component/NavBar';
import TaskScreen from './component/TaskScreen';
import ReferralScreen from './component/ReferralScreen';
import Notification from './component/Notification';
import useAuth from './useAuth';
import { supabase } from './supabase';
import {
  updateUserBalance,
  upgradeMining,
  getLeaderboard,
  achieveMilestone,
  getUserAchievements,
  checkAndRewardDailyLogin,
} from './dataService';
import './App.css';
import WalletScreen from './component/WalletScreen';
import useLocalStorage from './useLocalStorage'; // Import the custom hook
import useSessionStorage from './useSessionStorage'; // Import the custom hook

const App: React.FC = () => {
  const [userData, setUserData] = useLocalStorage<any | null>('userData', null);
  const [screen, setScreen] = useSessionStorage<'splash' | 'home' | 'categories'>('screen', 'splash');
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [miningLevel, setMiningLevel] = useState<number>(1);
  const [nextClaimTime, setNextClaimTime] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [status, setStatus] = useState<string>('Trail Hustler');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [dailyRewardClaimed, setDailyRewardClaimed] = useState<boolean>(false);

  const getMiningStatus = (balance: number): string => {
    if (balance >= 5000) return 'Galactic Miner';
    if (balance >= 4000) return 'Mythical Miner';
    if (balance >= 3500) return 'Legendary Miner';
    if (balance >= 3000) return 'Grandmaster Miner';
    if (balance >= 2500) return 'Master Miner';
    if (balance >= 2000) return 'Expert Miner';
    if (balance >= 1500) return 'Skilled Miner';
    if (balance >= 1000) return 'Apprentice Miner';
    if ( balance >= 500) return 'Novice Miner';
    return 'Trail Hustler';
  };

  useEffect(() => {
    const initializeUser = async () => {
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error(error);
        } else if (profile) {
          setBalance(profile.balance || 0);
          setMiningLevel(profile.mining_level || 1);
          setStatus(getMiningStatus(profile.balance || 0));
          setUserData(profile);
          if (profile.last_claimed) {
            const lastClaimed = new Date(profile.last_claimed);
            const nextTime = new Date(lastClaimed.getTime() + 7 * 60 * 60 * 1000);
            setNextClaimTime(nextTime);
            setTimeRemaining(nextTime.getTime() - new Date().getTime());
          }
        }

        const dailyReward = await checkAndRewardDailyLogin(user.id);
        if (dailyReward) {
          setBalance(dailyReward.newBalance);
          setDailyRewardClaimed(dailyReward.isNewDay);
        }
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [user]);

  useEffect(() => {
    if (nextClaimTime) {
      const interval = setInterval(() => {
        const timeLeft = nextClaimTime.getTime() - new Date().getTime();
        setTimeRemaining(timeLeft > 0 ? timeLeft : 0);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [nextClaimTime]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const topPlayers = await getLeaderboard();
      setLeaderboard(topPlayers);
    };

    const fetchAchievements = async () => {
      if (user) {
        const userAchievements = await getUserAchievements(user.id);
        setAchievements(userAchievements);
      }
    };

    fetchLeaderboard();
    fetchAchievements();
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => setScreen('home'), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <div className="min-h-screen bg-gradient-to-b from-black flex items-center justify-center">
      <div className="text-center">
        <div className="bg-black p-6 rounded-lg shadow-lg">
          <h1 className="text-4xl font-bold text-purple-400 animate-bounce">Trailblazer</h1>
        </div>
      </div>
    </div>;
  }

  if (screen === 'splash') {
    return <SplashScreen />;
  } else if (screen === 'home') {
    return <HomeScreen />;
  }

  return null;
};

const Root: React.FC = () => {
  return (
    <SDKProvider>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/tasks" element={<TaskScreen />} />
          <Route path="/frens" element={<ReferralScreen />} />
          <Route path="/wallet" element={<WalletScreen />} />
        </Routes>
        <NavBar />
      </Router>
    </SDKProvider>
  );
};

export default Root;
