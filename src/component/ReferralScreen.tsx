import React, { useState, useEffect } from 'react';
import useAuth from '../useAuth';
import {
  updateUserBalance,
  upgradeMining,
  getLeaderboard,
  achieveMilestone,
  getUserAchievements,
  checkAndRewardDailyLogin,
  createReferralLink,
  trackReferral,
  getUserReferrals,
} from '../dataService';
import '../App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faUser, faTrophy, faLink, faGift } from '@fortawesome/free-solid-svg-icons';
import Notification from '../component/Notification';

function ReferralScreen() {
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
  const [referralLink, setReferralLink] = useState<string>('');
  const [referralCount, setReferralCount] = useState<number>(0);
  const [referrals, setReferrals] = useState<any[]>([]); // State to store referral list

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
        const dailyReward = await checkAndRewardDailyLogin(user.id);
        if (dailyReward) {
          setBalance(dailyReward.newBalance);
          setDailyRewardClaimed(dailyReward.isNewDay);
        }
        setBalance(user.balance || 0);
        setMiningLevel(user.mining_level || 1);
        setStatus(getMiningStatus(user.balance || 0));
        if (user.last_claimed) {
          const lastClaimed = new Date(user.last_claimed);
          const nextTime = new Date(lastClaimed.getTime() + 7 * 60 * 60 * 1000);
          setNextClaimTime(nextTime);
          setTimeRemaining(nextTime.getTime() - new Date().getTime());
        }
        const referralLink = await createReferralLink(user.id);
        setReferralLink(referralLink);
        const userReferrals = await getUserReferrals(user.id);
        setReferrals(userReferrals);
        setReferralCount(userReferrals.length);
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

  const handleClaim = async () => {
    if (user && timeRemaining <= 0) {
      const reward = miningLevel * 10;
      const newBalance = await updateUserBalance(user.id, reward);
      if (newBalance !== null) {
        setBalance(newBalance);
        setStatus(getMiningStatus(newBalance));
        const nextTime = new Date();
        const nextClaim = new Date(nextTime.getTime() + 7 * 60 * 60 * 1000);
        setNextClaimTime(nextClaim);
        setTimeRemaining(7 * 60 * 60 * 1000);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
      }
    }
  };

  const handleUpgrade = async () => {
    if (user) {
      const upgradeCost = miningLevel * 100;
      const result = await upgradeMining(user.id, upgradeCost);
      if (result !== null) {
        setBalance(result.newBalance);
        setMiningLevel(result.newMiningLevel);
        setStatus(getMiningStatus(result.newBalance));
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

  const miningRate = miningLevel * 10;

  if (isLoading) {
    return  <div className="min-h-screen bg-gradient-main flex items-center justify-center">
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
        <h1 className="text-2xl font-bold text-white">Trail Frens</h1>
      </header>

      {/* Profile and Banner */}
      <div className="w-full flex flex-col items-center p-6 text-center">
        {user?.photoURL ? (
          <img src={user.photoURL} alt="Profile" className="w-20 h-20 rounded-full mb-4 shadow-lg" />
        ) : (
          <div className="w-20 h-20 rounded-full mb-4 bg-gray-500 flex items-center justify-center text-2xl font-bold shadow-lg">
            {user?.username.charAt(0).toUpperCase()}
          </div>
        )}
        <h2 className="text-2xl font-bold mt-2">{user?.username}</h2>
        <p className="text-xl mt-1 text-gray-400">{status}</p>
        <div className="mt-4">
          <p className="text-4xl font-bold">{balance}</p>
          <p className="text-lg text-gray-400">TRL Tokens</p>
        </div>
      </div>

      {/* Referral Link */}
      <div className="w-full flex flex-col items-center p-4">
        <h3 className="text-xl font-bold mb-4">Referral Link</h3>
        <div className="relative w-full">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="w-full p-2 mb-4 text-black text-center rounded-lg"
            onClick={() => navigator.clipboard.writeText(referralLink)}
          />
          <FontAwesomeIcon
            icon={faCopy}
            className="absolute right-2 top-2 cursor-pointer text-gray-500 hover:text-gray-700"
            onClick={() => navigator.clipboard.writeText(referralLink)}
          />
        </div>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full"
          onClick={() => navigator.clipboard.writeText(referralLink)}
        >
          Copy Link
        </button>
      </div>

      {/* Referral List */}
      <div className="w-full flex flex-col items-center p-4">
        <h3 className="text-xl font-bold mb-4">Your Referrals ({referralCount})</h3>
        <table className="table-auto w-full text-left">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-4 py-2 text-left">Referred User ID</th>
              <th className="px-4 py-2 text-left">Referral Date</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((referral, index) => (
              <tr key={index} className="bg-gray-800">
                <td className="border px-4 py-2">{referral.referred_user_id}</td>
                <td className="border px-4 py-2">{new Date(referral.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
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

export default ReferralScreen;
