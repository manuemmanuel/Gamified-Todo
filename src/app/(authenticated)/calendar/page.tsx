'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { dateFnsLocalizer, Calendar } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, addMinutes } from 'date-fns'
import { enUS } from 'date-fns/locale/en-US'
import { motion, AnimatePresence } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'

// Dynamically import Calendar
const DnDCalendar = dynamic(
  () => import('react-big-calendar/lib/addons/dragAndDrop').then((mod) => 
    mod.default(require('react-big-calendar').Calendar)
  ),
  { ssr: false }
)

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS }
})

interface Task {
  id: string
  title: string
  description: string
  start_time: Date
  end_time: Date
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'completed'
  category: 'work' | 'study' | 'fitness' | 'personal' | 'other'
  reminder_time?: Date
}

const CATEGORIES = [
  { value: 'work', label: 'Work', color: '#4444dd' },
  { value: 'study', label: 'Study', color: '#dd44dd' },
  { value: 'fitness', label: 'Fitness', color: '#44dd44' },
  { value: 'personal', label: 'Personal', color: '#dddd44' },
  { value: 'other', label: 'Other', color: '#888888' }
]

// Client-only wrapper
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted ? <>{children}</> : <div className="min-h-screen p-4 bg-[#111111]"></div>
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [defaultView, setDefaultView] = useState('month')
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchTasks()
    setDefaultView(window.innerWidth < 640 ? 'day' : 'month')
  }, [])

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('calendar_tasks')
        .select('*')
        .order('start_time', { ascending: true })

      if (error) throw error

      setTasks(data.map(task => ({
        ...task,
        start_time: new Date(task.start_time),
        end_time: new Date(task.end_time),
        reminder_time: task.reminder_time ? new Date(task.reminder_time) : undefined
      })))
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const eventStyleGetter = (event: any) => {
    const category = CATEGORIES.find(cat => cat.value === event.category)
    return {
      style: {
        backgroundColor: category?.color || '#44dd44',
        border: 'none',
        color: '#111111',
        padding: '2px 5px',
        fontWeight: 'bold'
      }
    }
  }

  const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      if (action === 'PREV') newDate.setMonth(prevDate.getMonth() - 1)
      if (action === 'NEXT') newDate.setMonth(prevDate.getMonth() + 1)
      if (action === 'TODAY') return new Date()
      return newDate
    })
  }

  return (
    <ClientOnly>
      <div className="min-h-screen p-4 bg-[#111111] grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        <div className="h-[calc(100vh-2rem)] border-4 border-[#44dd44] p-4">
          <DnDCalendar
            localizer={localizer}
            events={tasks}
            startAccessor={(event: any) => new Date(event.start_time)}
            endAccessor={(event: any) => new Date(event.end_time)}
            style={{ height: '100%' }}
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day']}
            defaultView={defaultView}
            date={currentDate}
            onNavigate={handleNavigate}
            components={{
              toolbar: ({ label }) => (
                <div className="rbc-toolbar">
                  <span className="rbc-btn-group">
                    <button onClick={() => handleNavigate('PREV')}>Back</button>
                    <button onClick={() => handleNavigate('TODAY')}>Today</button>
                    <button onClick={() => handleNavigate('NEXT')}>Next</button>
                  </span>
                  <span className="rbc-toolbar-label">{label}</span>
                </div>
              )
            }}
          />
        </div>

        <style jsx global>{`
          .rbc-calendar { background: #111111; border: 1px solid #44dd44; }
          .rbc-toolbar { padding: 8px; display: flex; justify-content: space-between; }
          .rbc-btn-group { display: flex; gap: 6px; }
          .rbc-btn-group button { background: #111111; color: #44dd44; padding: 6px 12px; }
          .rbc-month-view { display: grid; grid-template-rows: auto repeat(6, 1fr); }
          .rbc-month-row { display: grid; grid-template-columns: repeat(7, 1fr); }
          .rbc-day-bg { border-right: 1px solid #44dd44; min-height: 100px; padding: 4px; }
          .rbc-today { background: rgba(68, 221, 68, 0.1); border: 1px solid #44dd44; }
          .rbc-event { background: #44dd44; color: #111111; border-radius: 4px; padding: 4px; }
        `}</style>
      </div>
    </ClientOnly>
  )
}
