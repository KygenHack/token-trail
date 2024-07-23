import { supabase } from './supabase';

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

export const saveInitData = async (userId: number, initData: any) => {
  const params = new URLSearchParams(initData);
  const userParam = params.get('user');
  if (!userParam) {
    console.error('Error: Missing user parameter.');
    return;
  }

  const user = JSON.parse(userParam);
  const { username, photo_url, first_name, last_name } = user;

  if (!username || !first_name || !last_name) {
    console.error('Error: Missing required user fields.');
    return;
  }

  // Check if the user already exists
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('id, mining_level, status, lifestyle_level')
    .eq('id', userId)
    .single();

  if (fetchError) {
    console.error('Error checking existing user:', fetchError.message);
    return;
  }

  // Only set initial values if the user does not exist
  const payload = {
    id: userId,
    init_data: initData,
    username,
    photo_url,
    first_name,
    last_name,
    mining_level: existingUser ? existingUser.mining_level : 1,
    status: existingUser ? existingUser.status : 'Trail Hustler',
    lifestyle_level: existingUser ? existingUser.lifestyle_level : 1,
  };

  const { data, error } = await supabase
    .from('users')
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    console.error('Error saving initialization data:', error.message);
  } else {
    console.log('Initialization data saved successfully:', data);
  }
};



export const checkAndRewardDailyLogin = async (userId: number) => {
  const now = new Date();
  const { data: userData, error: fetchError } = await supabase
    .from('users')
    .select('last_login, balance')
    .eq('id', userId)
    .single();

  if (fetchError) {
    console.error('Error fetching user data:', fetchError.message);
    return null;
  }

  const lastLogin = new Date(userData?.last_login);
  const isNewDay = now.getDate() !== lastLogin.getDate() || now.getMonth() !== lastLogin.getMonth() || now.getFullYear() !== lastLogin.getFullYear();

  let newBalance = userData?.balance || 0;
  if (isNewDay) {
    const dailyReward = 100; // Example daily reward
    newBalance += dailyReward;

    const { data, error } = await supabase
      .from('users')
      .update({ last_login: now, balance: newBalance })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user login data:', error.message);
      return null;
    }
  }

  return { newBalance, isNewDay };
};

export const getUserProfile = async (userId: number) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error.message);
    return null;
  }
  console.log('Fetched user profile:', data);
  return data;
};



export const updateUserBalance = async (userId: number, amount: number) => {
  const now = new Date();
  const claimingInterval = 7 * 60 * 60 * 1000; // 7 hours

  const { data: userData, error: fetchError } = await supabase
    .from('users')
    .select('balance, last_claimed, mining_level')
    .eq('id', userId)
    .single();

  if (fetchError) {
    console.error('Error fetching user data:', fetchError.message);
    return null;
  }

  const lastClaimed = new Date(userData?.last_claimed);
  if (lastClaimed.getTime() + claimingInterval > now.getTime()) {
    console.error('Error: You can only claim once every 7 hours.');
    return null;
  }

  const currentBalance = userData?.balance || 0;
  const newBalance = currentBalance + amount;
  const newStatus = getMiningStatus(newBalance);

  const { data, error } = await supabase
    .from('users')
    .update({ balance: newBalance, last_claimed: now, status: newStatus })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user balance:', error.message);
    return null;
  }
  return newBalance;
};

export const upgradeMining = async (userId: number, upgradeCost: number) => {
  console.log(`Fetching user data for userId: ${userId}`);
  
  const { data: userData, error: fetchError } = await supabase
    .from('users')
    .select('balance, mining_level')
    .eq('id', userId)
    .single();

  if (fetchError) {
    console.error('Error fetching user data:', fetchError.message);
    return null;
  }

  console.log('User data fetched:', userData);

  const currentBalance = userData?.balance || 0;
  const currentMiningLevel = userData?.mining_level || 1;

  if (currentBalance < upgradeCost) {
    console.error('Not enough balance to upgrade.');
    return null;
  }

  const newBalance = currentBalance - upgradeCost;
  const newMiningLevel = currentMiningLevel + 1;
  const newStatus = getMiningStatus(newBalance);

  console.log('Updating user data with new values:', { newBalance, newMiningLevel, newStatus });

  const { data, error } = await supabase
    .from('users')
    .update({ balance: newBalance, mining_level: newMiningLevel, status: newStatus })
    .eq('id', userId);

  if (error) {
    console.error('Error upgrading mining level:', error.message);
    return null;
  } else {
    console.log('Mining level upgraded successfully:', data);
  }
  return { newBalance, newMiningLevel };
};


export const getLeaderboard = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('username, balance')
    .order('balance', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error getting leaderboard:', error.message);
    return [];
  }
  return data || [];
};

export const achieveMilestone = async (userId: number, description: string) => {
  const payload = {
    user_id: userId,
    description,
    achieved: true,
  };

  const { data, error } = await supabase
    .from('achievements')
    .insert(payload);

  if (error) {
    console.error('Error achieving milestone:', error.message);
  }
  return data;
};

export const getUserAchievements = async (userId: number) => {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user achievements:', error.message);
    return [];
  }
  return data || [];
};

export const getAirdropTasks = async () => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*');

  if (error) {
    console.error('Error fetching airdrop tasks:', error.message);
    return [];
  }
  return data || [];
};

export const completeTask = async (userId: number, taskId: string, taskPoints: number) => {
  const { data: userData, error: fetchError } = await supabase
    .from('users')
    .select('balance')
    .eq('id', userId)
    .single();

  if (fetchError) {
    console.error('Error fetching user data:', fetchError.message);
    return null;
  }

  const currentBalance = userData?.balance || 0;
  const newBalance = currentBalance + taskPoints;

  const { data: updateData, error: updateError } = await supabase
    .from('users')
    .update({ balance: newBalance })
    .eq('id', userId);

  if (updateError) {
    console.error('Error updating user balance:', updateError.message);
    return null;
  }

  const taskCompletionPayload = {
    user_id: userId,
    task_id: taskId,
  };

  const { data: taskData, error: taskError } = await supabase
    .from('completed_tasks')
    .insert(taskCompletionPayload);

  if (taskError) {
    console.error('Error marking task as completed:', taskError.message);
    return null;
  }

  return { newBalance };
};

export const createReferralLink = async (userId: number) => {
  const referralLink = `https://t.me/TrailCrypto_Bot/app?startapp=${userId}`;
  return referralLink;
};

export const trackReferral = async (referrerId: number, referredUserId: number) => {
  const referrer = await getUserProfile(referrerId);
  if (!referrer) {
    console.error('Error: Referrer not found.');
    return null;
  }
  const rewardPoints = 100; // Example reward points
  const newBalance = referrer.balance + rewardPoints;
  await updateUserBalance(referrerId, newBalance);
  return newBalance;
};


// Add this function to dataService.ts
export const getUserReferrals = async (userId: number) => {
  const { data, error } = await supabase
    .from('referrals')
    .select('referred_user_id, created_at')
    .eq('referrer_id', userId);

  if (error) {
    console.error('Error fetching user referrals:', error.message);
    return [];
  }
  return data || [];
};
