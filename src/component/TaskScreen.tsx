import React, { useState, useEffect } from 'react';
import useAuth from '../useAuth';
import { updateUserBalance, getUserAchievements, checkAndRewardDailyLogin, getAirdropTasks, completeTask } from '../dataService';
import { supabase } from '../supabase';
import '../App.css';
import TaskConfirmation from '../component/TaskConfirmation';
import TaskItem from './Taskitems';

function TaskScreen() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [tasks, setTasks] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string>('');
  const [loadingTask, setLoadingTask] = useState<string | null>(null);
  const [confirmTask, setConfirmTask] = useState<{ id: string, points: number, link: string } | null>(null);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  useEffect(() => {
    const initializeUser = async () => {
      if (user) {
        const dailyReward = await checkAndRewardDailyLogin(user.id);
        if (dailyReward) {
          setBalance(dailyReward.newBalance);
        }
        setBalance(user.balance || 0);
        setIsLoading(false);
      }
    };

    const fetchTasks = async () => {
      const airdropTasks = await getAirdropTasks();
      setTasks(airdropTasks);
    };

    const fetchAchievements = async () => {
      if (user) {
        const userAchievements = await getUserAchievements(user.id);
        setAchievements(userAchievements);
      }
    };

    const fetchCompletedTasks = async () => {
      if (user) {
        const { data: completedTaskData, error: completedTaskError } = await supabase
          .from('completed_tasks')
          .select('task_id')
          .eq('user_id', user.id);

        if (completedTaskError) {
          console.error('Error fetching completed tasks:', completedTaskError.message);
        } else {
          setCompletedTasks(completedTaskData.map((task: { task_id: string }) => task.task_id));
        }
      }
    };

    initializeUser();
    fetchTasks();
    fetchAchievements();
    fetchCompletedTasks();
  }, [user]);

  const handleCompleteTask = (taskId: string, taskPoints: number, taskLink: string) => {
    setLoadingTask(taskId);
    window.open(taskLink, '_blank');
    setConfirmTask({ id: taskId, points: taskPoints, link: taskLink });
    setNotificationMessage('Have you completed this task?');
    setShowNotification(true);
  };

  const handleConfirmTask = async () => {
    if (confirmTask && user) {
      const { id, points } = confirmTask;
      const result = await completeTask(user.id, id, points);
      if (result !== null) {
        setBalance(result.newBalance);
        setCompletedTasks([...completedTasks, id]);
        setNotificationMessage(`You've earned ${points} points!`);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
      }
    }
    setLoadingTask(null);
    setConfirmTask(null);
    setWarningMessage(null);
  };

  const handleDeductPoints = async () => {
    if (confirmTask && user) {
      const { points } = confirmTask;
      const newBalance = balance - points;
      if (newBalance < 0) {
        setWarningMessage('Insufficient balance to deduct points.');
        setNotificationMessage('Insufficient balance to deduct points.');
        return;
      }
      await updateUserBalance(user.id, -points);
      setBalance(newBalance);
      setNotificationMessage(`You've been deducted ${points} points for not completing the task.`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    }
    setLoadingTask(null);
    setConfirmTask(null);
    setWarningMessage(null);
  };

  if (isLoading) {
    return  <div className="min-h-screen bg-gradient-to-b from-black flex items-center justify-center">
    <div className="text-center">
      <div className="bg-black p-6 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-purple-400 animate-bounce">Trailblazer</h1>
      </div>
    </div>
  </div>;
  }

  return (
    <div className="bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white min-h-screen flex flex-col items-center">
      {/* Header */}
      <header className="w-full bg-gray-900 py-4 shadow-xl text-center">
        <h1 className="text-xl font-bold text-white">Trail Task</h1>
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
        <h2 className="text-2xl font-bold mt-4">{user?.username}</h2>
        <div className="mt-4">
          <p className="text-4xl font-bold">{balance}</p>
          <p className="text-lg text-gray-400">TRL Tokens</p>
        </div>
      </div>

      {/* Task List */}
      <div className="w-full max-w-md bg-gray-800 p-6 rounded-lg mb-6 shadow-xl">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            description={task.description}
            details={task.details} // Pass the details prop
            points={task.points}
            completed={completedTasks.includes(task.id)}
            onClick={() => handleCompleteTask(task.id, task.points, task.link)}
            loading={loadingTask === task.id}
          />
        ))}
      </div>

      {/* Notification */}
      {showNotification && (
        <TaskConfirmation
          message={notificationMessage}
          onClose={() => setShowNotification(false)}
          onConfirm={handleConfirmTask}
          showConfirm={!!confirmTask}
          warningMessage={warningMessage || undefined}
          deductPoints={handleDeductPoints}
        />
      )}
    </div>
  );
}

export default TaskScreen;
