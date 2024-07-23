import React, { useState, useEffect } from 'react';
import useAuth from '../useAuth';
import { updateUserBalance, upgradeMining, getLeaderboard, achieveMilestone, getUserAchievements, checkAndRewardDailyLogin, getUserProfile } from '../dataService';
import '../App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faTasks, faUser, faUserFriends, faWallet } from '@fortawesome/free-solid-svg-icons';
import Notification from '../component/Notification';

function HomeScreen() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [miningLevel, setMiningLevel] = useState<number>(1);
  const [nextClaimTime, setNextClaimTime] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [status, setStatus] = useState<string>('Trail Hustler'); // State to control mining status
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showNotification, setShowNotification] = useState<boolean>(false); // State to control notification
  const [dailyRewardClaimed, setDailyRewardClaimed] = useState<boolean>(false); // State to control daily reward notification

  const getMiningStatus = (balance: number): string => {
    if (balance >= 5000) return 'Galactic Miner';
    if (balance >= 4000) return 'Mythical Miner';
    if (balance >= 3500) return 'Legendary Miner';
    if (balance >= 3000) return 'Grandmaster Miner';
    if (balance >= 2500) return 'Master Miner';
    if (balance >= 2000) return 'Expert Miner';
    if (balance >= 1500) return 'Skilled Miner';
    if (balance >= 1000) return 'Apprentice Miner';
    if (balance >= 500) return 'Novice Miner';
    return 'Trail Hustler';
  };

  useEffect(() => {
    const initializeUser = async () => {
      if (user) {
        const userProfile = await getUserProfile(user.id);
        if (userProfile) {
          setBalance(userProfile.balance || 0);
          setMiningLevel(userProfile.mining_level || 1); // Ensure mining level is correctly set
          setStatus(getMiningStatus(userProfile.balance || 0)); // Set initial status based on balance
          if (userProfile.last_claimed) {
            const lastClaimed = new Date(userProfile.last_claimed);
            const nextTime = new Date(lastClaimed.getTime() + 7 * 60 * 60 * 1000); // Set to 7 hours
            setNextClaimTime(nextTime);
            setTimeRemaining(nextTime.getTime() - new Date().getTime());
          }
          setIsLoading(false);
        }
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

  const handleClaim = async () => {
    if (user && timeRemaining <= 0) {
      const reward = miningLevel * 10;
      const newBalance = await updateUserBalance(user.id, reward);
      if (newBalance !== null) {
        setBalance(newBalance);
        setStatus(getMiningStatus(newBalance)); // Update status based on new balance
        const nextTime = new Date();
        const nextClaim = new Date(nextTime.getTime() + 7 * 60 * 60 * 1000); // Set to 7 hours
        setNextClaimTime(nextClaim);
        setTimeRemaining(7 * 60 * 60 * 1000);
        setShowNotification(true); // Show the notification
        setTimeout(() => setShowNotification(false), 5000); // Hide the notification after 5 seconds
      }
    }
  };

  const handleUpgrade = async () => {
    if (user) {
      const upgradeCost = miningLevel * 100;
      const result = await upgradeMining(user.id, upgradeCost);
      if (result !== null) {
        setBalance(result.newBalance);
        setMiningLevel(result.newMiningLevel); // Update the mining level in the state
        setStatus(getMiningStatus(result.newBalance)); // Update status based on new balance
        if (result.newMiningLevel % 5 === 0) {
          await achieveMilestone(user.id, `Reached Mining Level ${result.newMiningLevel}`);
        }
      }
    }
  };
  

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const miningRate = miningLevel * 10; // Tokens per day based on the mining level

  if (isLoading) {
    return  <div className="min-h-screen bg-gradient-to-b from-black flex items-center justify-center">
    <div className="text-center">
      <div className="bg-black p-6 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-purple-400 animate-bounce">Trailblazer</h1>
      </div>
    </div>
  </div>;
  }

  const timeRemainingString = formatTime(timeRemaining);

  return (
    <div className="bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white min-h-screen flex flex-col items-center">
      {/* Header */}
      <header className="w-full bg-gray-900 py-4 shadow-xl text-center">
        <h1 className="text-2xl font-bold text-white">Trail Farm</h1>
      </header>

      {/* Profile and Banner */}
      <div className="w-full flex flex-col items-center p-6 text-center">
      <div className="relative">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-20 h-20 rounded-full mb-4 shadow-lg" />
          ) : (
            <div className="w-20 h-20 rounded-full mb-4 bg-gray-500 flex items-center justify-center text-2xl font-bold shadow-lg">
              {user?.username.charAt(0).toUpperCase()}
            </div>
          )}
          <FontAwesomeIcon icon={faUser} className="absolute -top-2 -right-2 bg-gray-700 text-white p-2 rounded-full shadow-lg" />
        </div>
        <h2 className="text-2xl font-bold mt-4">{user?.username}</h2>
        <p className="text-lg text-gray-400">{status}</p>
        <div className="mt-4">
          <p className="text-4xl font-bold">{balance}</p>
          <p className="text-lg text-gray-400">TRL Tokens</p>
        </div>
      </div>

      {/* Wallet Details */}
      <div className="w-full max-w-md bg-gray-800 p-6 rounded-lg mb-6 shadow-xl text-center">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center border border-gray-600 p-2 rounded-lg">
            <p className="text-sm font-bold text-gray-400">Mining Rate</p>
            <p className="text-lg text-white font-medium">{miningRate} TRL/day</p>
          </div>
          <div className="flex flex-col items-center border border-gray-600 p-2 rounded-lg">
            <p className="text-sm font-bold text-gray-400">Mining Status</p>
            <p className="text-lg text-white font-medium">{status}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full max-w-md bg-gray-800 p-6 rounded-lg mb-6 shadow-xl text-center">
        <button
          className={`bg-gradient-to-r from-green-400 to-blue-500 text-white py-3 px-8 rounded-lg w-full font-semibold transition-all duration-300 ${
            timeRemaining > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'
          }`}
          onClick={handleClaim}
          disabled={timeRemaining > 0}
        >
          {timeRemaining > 0 ? `Claim in ${timeRemainingString}` : 'Claim'}
        </button>
        <button
          className={`bg-gradient-to-r from-purple-400 to-red-500 mt-2 text-white py-3 px-8 rounded-lg w-full font-semibold transition-all duration-300 hover:shadow-xl`}
          onClick={handleUpgrade}
        >
          Upgrade ({miningLevel * 250} TRL)
        </button>
      </div>

      {/* Notification */}
      {showNotification && (
        <Notification
          message={`You've claimed ${miningLevel * 10} tokens!`}
          onClose={() => setShowNotification(false)}
        />
      )}

      {/* Daily Reward Notification */}
      {dailyRewardClaimed && (
        <Notification
          message={`You've received your daily login reward!`}
          onClose={() => setDailyRewardClaimed(false)}
        />
      )}

    </div>
  );
}

export default HomeScreen;
