import { useEffect, useState } from 'react';
import { getInitData } from './getInitData';
import { saveInitData, getUserProfile } from './dataService';

const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const initDataRaw = getInitData();

  useEffect(() => {
    const authenticateWithTelegram = async () => {
      if (initDataRaw) {
        console.log('Init data raw:', initDataRaw);
        const userData = parseInitData(initDataRaw);

        if (userData) {
          console.log('Parsed user data:', userData);

          // Save initialization data to Supabase
          await saveInitData(parseInt(userData.id, 10), initDataRaw);

          // Fetch user profile data from Supabase
          const userProfile = await getUserProfile(parseInt(userData.id, 10));

          // Set user state with profile data
          setUser({ ...userData, ...userProfile });
        }
      }
    };

    authenticateWithTelegram();
  }, [initDataRaw]);

  return { user };
};

const parseInitData = (initDataRaw: string) => {
  try {
    const params = new URLSearchParams(initDataRaw);
    const user = JSON.parse(params.get('user') || '{}');
    return {
      id: user.id.toString() || '',
      username: user.username || '',
      photo_url: user.photo_url || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
    };
  } catch (error) {
    console.error('Error parsing init data:', error);
    return null;
  }
};

export default useAuth;
