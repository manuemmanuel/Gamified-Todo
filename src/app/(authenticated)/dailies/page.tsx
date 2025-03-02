'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { FiPlus, FiStar, FiCheck, FiEdit2, FiAward, FiCpu, FiClock, FiGift, FiZap } from 'react-icons/fi'

interface DailyTask {
  id: string
  title: string
  description?: string
  completed: boolean
  streak: number
  xp_reward: number
  last_completed: string | null
  user_id: string
  created_at: string
}

interface UserStats {
  id: string
  user_id: string
  level: number
  xp: number
  tasks_completed: number
  streak_days: number
}

interface DailyReward {
  id: string
  user_id: string
  last_claimed_at: string
  current_streak: number
}

export default function DailiesPage() {
  const [tasks, setTasks] = useState<DailyTask[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [dailyReward, setDailyReward] = useState<DailyReward | null>(null)
  const [timeUntilReset, setTimeUntilReset] = useState('')
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showRewardClaim, setShowRewardClaim] = useState(false)

  const supabase = createClientComponentClient()

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    xp_reward: 10
  })

  // Calculate time until next reset
  const updateResetTimer = useCallback(() => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const diff = tomorrow.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    setTimeUntilReset(`${hours}h ${minutes}m ${seconds}s`)
  }, [])

  useEffect(() => {
    const timer = setInterval(updateResetTimer, 1000)
    return () => clearInterval(timer)
  }, [updateResetTimer])

  // Check and reset daily tasks at midnight
  useEffect(() => {
    const checkAndResetTasks = async () => {
      const now = new Date()
      const lastReset = localStorage.getItem('lastDailyReset')
      const today = now.toDateString()

      if (lastReset !== today) {
        await resetDailyTasks()
        localStorage.setItem('lastDailyReset', today)
      }
    }

    checkAndResetTasks()
  }, [])

  const resetDailyTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('No user found')
        return
      }

      console.log('Attempting to reset tasks for user:', user.id)
      const { data, error } = await supabase
        .from('tasks')
        .update({ 
          completed: false,
          last_completed: null 
        })
        .eq('user_id', user.id)

      if (error) {
        console.error('Supabase error:', JSON.stringify(error, null, 2))
        throw error
      }

      console.log('Tasks reset successfully:', data)
      await fetchTasks()
    } catch (error) {
      console.error('Full error object:', JSON.stringify(error, null, 2))
      throw error
    }
  }

  // Check for daily reward
  const checkDailyReward = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('No user found in checkDailyReward')
        return
      }

      console.log('Checking daily reward for user:', user.id)
      const { data, error } = await supabase
        .from('daily_rewards')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No reward found, create initial record
          const { data: newReward, error: insertError } = await supabase
            .from('daily_rewards')
            .insert([{
              user_id: user.id,
              last_claimed_at: null,
              current_streak: 0
            }])
            .select()
            .single()

          if (insertError) {
            console.error('Error creating daily reward:', JSON.stringify(insertError, null, 2))
            throw insertError
          }
          setDailyReward(newReward)
          setShowRewardClaim(true)
          return
        }
        console.error('Error checking daily reward:', JSON.stringify(error, null, 2))
        throw error
      }

      const now = new Date()
      const lastClaimed = data?.last_claimed_at ? new Date(data.last_claimed_at) : null
      
      if (!lastClaimed || lastClaimed.toDateString() !== now.toDateString()) {
        setShowRewardClaim(true)
      }
      
      setDailyReward(data)
    } catch (error) {
      console.error('Full error in checkDailyReward:', JSON.stringify(error, null, 2))
    }
  }

  const claimDailyReward = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const reward = {
        user_id: user.id,
        last_claimed_at: new Date().toISOString(),
        current_streak: (dailyReward?.current_streak || 0) + 1
      }

      const { error } = await supabase
        .from('daily_rewards')
        .upsert(reward)

      if (error) throw error

      // Update user stats with reward
      if (userStats) {
        const xpGain = 50 * (dailyReward?.current_streak || 0)
        await supabase
          .from('user_stats')
          .update({ 
            xp: userStats.xp + xpGain,
            streak_days: (userStats.streak_days || 0) + 1
          })
          .eq('user_id', user.id)
      }

      setShowRewardClaim(false)
      fetchUserStats()
      checkDailyReward()
    } catch (error) {
      console.error('Error claiming daily reward:', error)
    }
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('No user found')
      }

      const now = new Date()
      const endTime = new Date(now)
      endTime.setHours(23, 59, 59, 999) // Set to end of current day

      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: newTask.title,
          description: newTask.description,
          xp_reward: newTask.xp_reward,
          user_id: user.id,
          completed: false,
          start_time: now.toISOString(),
          end_time: endTime.toISOString()
        }])

      if (error) throw error

      setIsAddingTask(false)
      setNewTask({
        title: '',
        description: '',
        xp_reward: 10
      })
      await fetchTasks()
    } catch (error) {
      console.error('Full error details:', JSON.stringify(error, null, 2))
      alert(error instanceof Error ? error.message : 'Failed to add task')
    }
  }

  const fetchUserStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('No user found in fetchUserStats')
        return
      }

      console.log('Fetching stats for user:', user.id)
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Supabase error in fetchUserStats:', JSON.stringify(error, null, 2))
        throw error
      }

      console.log('User stats fetched:', data)
      setUserStats(data)
    } catch (error) {
      console.error('Full error in fetchUserStats:', JSON.stringify(error, null, 2))
      // Set default stats if there's an error
      setUserStats({
        id: '',
        user_id: '',
        level: 1,
        xp: 0,
        tasks_completed: 0,
        streak_days: 0
      })
    }
  }

  const fetchTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const handleCompleteTask = async (task: DailyTask) => {
    try {
      const now = new Date()
      const { data, error } = await supabase
        .from('tasks')
        .update({ 
          completed: true,
          end_time: now.toISOString()
        })
        .eq('id', task.id)
        .select()

      if (error) {
        console.error('Supabase error:', JSON.stringify(error, null, 2))
        throw error
      }

      // Update user stats
      const { error: statsError } = await supabase
        .from('user_stats')
        .update({ 
          tasks_completed: userStats ? userStats.tasks_completed + 1 : 1,
          xp: userStats ? userStats.xp + task.xp_reward : task.xp_reward
        })
        .eq('user_id', task.user_id)

      if (statsError) {
        console.error('Stats update error:', JSON.stringify(statsError, null, 2))
      }

      await fetchTasks()
      await fetchUserStats()
    } catch (error) {
      console.error('Full error details:', JSON.stringify(error, null, 2))
    }
  }

  const handleEditTask = async (task: DailyTask) => {
    try {
      setNewTask({
        title: task.title,
        description: task.description || '',
        xp_reward: task.xp_reward
      })
      setIsAddingTask(true)
    } catch (error) {
      console.error('Error editing task:', error)
    }
  }

  const initializeUserStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('No user found')
        return
      }

      // First check if stats already exist
      const { data: existingStats } = await supabase
        .from('user_stats')
        .select()
        .eq('user_id', user.id)
        .single()

      if (existingStats) {
        console.log('Stats already exist for user')
        return
      }

      // Create new stats if none exist
      const { data, error } = await supabase
        .from('user_stats')
        .insert([{
          user_id: user.id,
          level: 1,
          xp: 0,
          tasks_completed: 0,
          streak_days: 0
        }])

      if (error) {
        console.error('Full error details:', JSON.stringify(error, null, 2))
        throw error
      }

      console.log('Stats initialized successfully:', data)
    } catch (error) {
      console.error('Full error in initializeUserStats:', JSON.stringify(error, null, 2))
    }
  }

  useEffect(() => {
    initializeUserStats()
    fetchUserStats()
    fetchTasks()
    checkDailyReward()
  }, [])

  // ... rest of the component code (fetchTasks, handleAddTask, etc.) ...

  return (
    <div className="min-h-screen bg-[#111111] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-[#1a1a1a] p-6 rounded-xl border-2 border-[#44dd44] shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" passHref>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-[#44dd44] font-pixel text-xs md:text-sm 
                           px-4 py-2 border-2 border-[#44dd44] rounded-lg
                           hover:bg-[#44dd44] hover:text-[#111111]
                           transition-colors duration-200"
                >
                  ← Back
                </motion.button>
              </Link>
              <h1 className="text-[#44dd44] font-pixel text-lg md:text-xl">Daily Quests</h1>
            </div>

            {/* Reset Timer */}
            <div className="flex items-center gap-2 bg-[#222222] px-4 py-2 rounded-lg border border-[#44dd44]/30">
              <FiClock className="text-[#44dd44]" />
              <span className="text-[#44dd44] font-pixel text-sm">
                Reset in: {timeUntilReset}
              </span>
            </div>
          </div>

          {/* Stats Bar */}
          {userStats && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#222222] p-4 rounded-lg border border-[#44dd44]/30">
                <div className="flex items-center gap-2">
                  <FiAward className="text-[#44dd44] w-5 h-5" />
                  <span className="text-[#44dd44] font-pixel text-sm">
                    Level {userStats.level}
                  </span>
                </div>
              </div>
              <div className="bg-[#222222] p-4 rounded-lg border border-[#44dd44]/30">
                <div className="flex items-center gap-2">
                  <FiStar className="text-[#44dd44] w-5 h-5" />
                  <span className="text-[#44dd44] font-pixel text-sm">
                    {userStats.xp} XP
                  </span>
                </div>
              </div>
              <div className="bg-[#222222] p-4 rounded-lg border border-[#44dd44]/30">
                <div className="flex items-center gap-2">
                  <FiZap className="text-[#44dd44] w-5 h-5" />
                  <span className="text-[#44dd44] font-pixel text-sm">
                    {userStats.streak_days} Day Streak
                  </span>
                </div>
              </div>
              <div className="bg-[#222222] p-4 rounded-lg border border-[#44dd44]/30">
                <div className="flex items-center gap-2">
                  <FiCheck className="text-[#44dd44] w-5 h-5" />
                  <span className="text-[#44dd44] font-pixel text-sm">
                    {userStats.tasks_completed} Completed
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Daily Reward Claim */}
        <AnimatePresence>
          {showRewardClaim && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#1a1a1a] p-6 rounded-xl border-2 border-[#ffd700] shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FiGift className="text-[#ffd700] w-6 h-6" />
                  <div>
                    <h3 className="text-[#ffd700] font-pixel text-lg">Daily Reward Available!</h3>
                    <p className="text-[#ffd700]/70 text-sm">
                      Streak: {dailyReward?.current_streak || 0} days - 
                      Reward: {50 * (dailyReward?.current_streak || 0)} XP
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={claimDailyReward}
                  className="px-4 py-2 bg-[#ffd700] text-[#111111] rounded-lg font-pixel
                           hover:bg-[#ffed4a] transition-colors duration-200"
                >
                  Claim Reward
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          {/* Tasks List */}
          <div className="bg-[#1a1a1a] p-6 rounded-xl border-2 border-[#44dd44] shadow-lg space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-[#44dd44] font-pixel text-base">Daily Quests</h2>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsAddingTask(true)}
                className="flex items-center gap-2 text-[#44dd44] font-pixel text-xs
                         px-4 py-2 border-2 border-[#44dd44] rounded-lg
                         hover:bg-[#44dd44] hover:text-[#111111]
                         transition-colors duration-200"
              >
                <FiPlus /> New Daily
              </motion.button>
            </div>

            <div className="grid gap-4">
              <AnimatePresence>
                {tasks.map(task => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`bg-[#222222] p-4 rounded-lg border 
                              ${task.completed ? 'border-gray-600' : 'border-[#44dd44]/30'}
                              ${task.completed ? 'opacity-50' : ''} shadow-md`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`font-pixel text-sm mb-2 
                                      ${task.completed ? 'text-gray-400' : 'text-[#44dd44]'}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-gray-400 text-xs mb-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <FiZap className="text-orange-400" />
                            <span className="text-orange-400">{task.streak} day streak</span>
                          </div>
                          <span className="text-[#44dd44]">+{task.xp_reward} XP</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!task.completed && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleCompleteTask(task)}
                              className="p-2 text-[#44dd44] hover:bg-[#44dd44] hover:text-[#111111]
                                       border-2 border-[#44dd44] rounded-lg transition-colors"
                            >
                              <FiCheck />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEditTask(task)}
                              className="p-2 text-blue-400 hover:bg-blue-400 hover:text-[#111111]
                                       border-2 border-blue-400 rounded-lg transition-colors"
                            >
                              <FiEdit2 />
                            </motion.button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Daily Streaks */}
            <div className="bg-[#1a1a1a] p-6 rounded-xl border-2 border-[#44dd44] shadow-lg">
              <h2 className="text-[#44dd44] font-pixel text-base mb-4">Streak Bonuses</h2>
              <div className="space-y-4">
                <div className="bg-[#222222] p-4 rounded-lg border border-[#44dd44]/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiZap className="text-orange-400" />
                      <span className="text-[#44dd44] font-pixel text-sm">3 Day Streak</span>
                    </div>
                    <span className="text-orange-400 font-pixel text-sm">+50% XP</span>
                  </div>
                </div>
                <div className="bg-[#222222] p-4 rounded-lg border border-[#44dd44]/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiZap className="text-orange-400" />
                      <span className="text-[#44dd44] font-pixel text-sm">7 Day Streak</span>
                    </div>
                    <span className="text-orange-400 font-pixel text-sm">+100% XP</span>
                  </div>
                </div>
                <div className="bg-[#222222] p-4 rounded-lg border border-[#44dd44]/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiZap className="text-orange-400" />
                      <span className="text-[#44dd44] font-pixel text-sm">30 Day Streak</span>
                    </div>
                    <span className="text-orange-400 font-pixel text-sm">+200% XP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Tips */}
            <div className="bg-[#1a1a1a] p-6 rounded-xl border-2 border-[#44dd44] shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <FiCpu className="text-[#44dd44]" />
                <h2 className="text-[#44dd44] font-pixel text-base">Daily Tips</h2>
              </div>
              <p className="text-[#44dd44]/70 text-sm">
                Complete all daily tasks before they reset at midnight to maintain your streak!
                Longer streaks give better rewards and bonus XP.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Task Modal */}
      <AnimatePresence>
        {isAddingTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#1a1a1a] p-6 rounded-lg border-2 border-[#44dd44] w-full max-w-md"
            >
              <h2 className="text-[#44dd44] font-pixel text-lg mb-4">New Daily Quest</h2>
              <form onSubmit={handleAddTask} className="space-y-4">
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Quest title"
                  className="w-full bg-[#222222] text-[#44dd44] px-4 py-2 rounded-lg
                           border-2 border-[#333333] focus:border-[#44dd44]
                           outline-none transition-colors"
                />
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Quest description (optional)"
                  className="w-full bg-[#222222] text-[#44dd44] px-4 py-2 rounded-lg
                           border-2 border-[#333333] focus:border-[#44dd44]
                           outline-none transition-colors"
                />
                <input
                  type="number"
                  value={newTask.xp_reward}
                  onChange={(e) => setNewTask({ ...newTask, xp_reward: parseInt(e.target.value) })}
                  placeholder="XP Reward"
                  className="w-full bg-[#222222] text-[#44dd44] px-4 py-2 rounded-lg
                           border-2 border-[#333333] focus:border-[#44dd44]
                           outline-none transition-colors"
                />
                <div className="flex justify-end gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setIsAddingTask(false)}
                    className="px-4 py-2 text-red-500 border-2 border-red-500 rounded-lg
                             hover:bg-red-500 hover:text-[#111111] transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-4 py-2 bg-[#44dd44] text-[#111111] rounded-lg
                             hover:bg-[#66ff66] transition-colors"
                  >
                    Add Quest
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
