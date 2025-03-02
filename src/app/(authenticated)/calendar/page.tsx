import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TaskSidebar } from './TaskSidebar';
import { TaskHeatmap } from './TaskHeatmap';
import { TaskStats } from './TaskStats';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Task } from '../../types';

interface CalendarPageProps {
  view: 'month' | 'week' | 'day';
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ view }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const supabase = useSupabaseClient();

  // Fetch tasks from Supabase
  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) {
        console.error('Error fetching tasks:', error);
        return;
      }
      
      setTasks(data || []);
    };

    fetchTasks();
  }, [supabase]);

  // Custom tile content to show task status indicators
  const getTileContent = ({ date }: { date: Date }) => {
    const dayTasks = tasks.filter(task => 
      new Date(task.date).toDateString() === date.toDateString()
    );

    return (
      <div className="task-indicators">
        {dayTasks.map(task => (
          <span key={task.id} className={`status-${task.status}`}>
            {task.status === 'completed' && '✅'}
            {task.status === 'pending' && '⚠️'}
            {task.status === 'missed' && '❌'}
          </span>
        ))}
      </div>
    );
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSidebarOpen(true);
  };

  const handleTaskDrop = async (taskId: string, newDate: Date) => {
    const { error } = await supabase
      .from('tasks')
      .update({ date: newDate })
      .match({ id: taskId });

    if (error) {
      console.error('Error updating task:', error);
      return;
    }

    // Update local state
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, date: newDate } : task
      )
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="calendar-page">
        <div className="calendar-container">
          <Calendar
            view={view}
            value={selectedDate}
            onChange={handleDateClick}
            tileContent={getTileContent}
          />
          <TaskHeatmap tasks={tasks} />
        </div>
        
        <TaskStats tasks={tasks} />
        
        {sidebarOpen && (
          <TaskSidebar
            date={selectedDate}
            tasks={tasks.filter(task => 
              new Date(task.date).toDateString() === selectedDate.toDateString()
            )}
            onClose={() => setSidebarOpen(false)}
            onTaskUpdate={async (updatedTask: Task) => {
              const { error } = await supabase
                .from('tasks')
                .update(updatedTask)
                .match({ id: updatedTask.id });

              if (!error) {
                setTasks(prevTasks =>
                  prevTasks.map(task =>
                    task.id === updatedTask.id ? updatedTask : task
                  )
                );
              }
            }}
          />
        )}
      </div>
    </DndProvider>
  );
};