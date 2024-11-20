'use client'

import { useState, useEffect, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Background from '@/components/Background'
import type { JSX } from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import SkillCreationForm from '@/components/SkillCreationForm'
import { useSkillPoints } from '@/hooks/useSkillPoints'

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface UserStats {
  id: string
  strength: number
  agility: number
  endurance: number
  intelligence: number
  charisma: number
  luck: number
  vitality: number
  wisdom: number
  dexterity: number
  level: number
  experience: number
  stat_points: number
  hidden_strength?: number
  hidden_agility?: number
  hidden_endurance?: number
  hidden_intelligence?: number
  hidden_charisma?: number
  hidden_luck?: number
  hidden_vitality?: number
  hidden_wisdom?: number
  hidden_dexterity?: number
  skill_points: number
}

interface UserProfile {
  email: string
  username?: string
  avatar_url?: string
  created_at: string
  profession?: string
}

interface Skill {
  id: string;
  name: string;
  description: string;
  level: number;
  icon?: string;
  powerLevel?: string;
  requiredPoints?: number;
}

interface StatQuest {
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  reward: number;
}

interface Profession {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface SkillCreationResponse {
  isValid: boolean;
  adjustedName?: string;
  adjustedDescription?: string;
  requiredPoints: number;
  feedback: string;
  icon?: string;
  powerLevel?: string;
  adjustedVersion?: {
    name: string;
    description: string;
    requiredPoints: number;
  };
}

// Add this near your other interfaces
interface SkillData {
  user_id: string;
  skill_id: string;
  skill_name: string;
  skill_description: string;
  skill_level: number;
  skill_icon?: string;
  power_level?: string;
}

// Add this interface with your other interfaces
interface AdjustmentModal {
  original: Skill;
  adjusted: {
    name: string;
    description: string;
    requiredPoints: number;
  };
  feedback: string;
}

// Add this interface near your other interfaces
interface ConfirmationModal {
  feedback: string;
  points: number;
  icon: string;
  skill: Skill;
}

const calendarStyles = `
  /* Calendar picker icon */
  input[type="datetime-local"]::-webkit-calendar-picker-indicator {
    background: #44dd44 !important;
    padding: 6px !important;
    cursor: pointer !important;
    border: 2px solid #44dd44 !important;
    border-radius: 2px !important;
    filter: invert(1) !important;
  }

  input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
    animation: pulse 1s infinite;
    background: #88ff88;
  }

  /* Calendar dropdown styling */
  ::-webkit-datetime-edit {
    padding: 0.2em;
    background-color: rgba(0, 0, 0, 0.7);
    border: 1px solid #44dd44;
    border-radius: 2px;
    color: #44dd44;
  }

  ::-webkit-datetime-edit:hover,
  ::-webkit-datetime-edit:focus {
    background-color: rgba(68, 221, 68, 0.1);
  }

  ::-webkit-datetime-edit-fields-wrapper {
    padding: 0 0.2em;
  }

  ::-webkit-datetime-edit-text {
    color: #44dd44;
    padding: 0 0.2em;
  }

  ::-webkit-datetime-edit-month-field,
  ::-webkit-datetime-edit-day-field,
  ::-webkit-datetime-edit-year-field,
  ::-webkit-datetime-edit-hour-field,
  ::-webkit-datetime-edit-minute-field,
  ::-webkit-datetime-edit-ampm-field {
    padding: 0.2em;
    background-color: rgba(0, 0, 0, 0.3);
    border: 1px solid #44dd44;
    color: #44dd44;
  }

  ::-webkit-datetime-edit-month-field:hover,
  ::-webkit-datetime-edit-day-field:hover,
  ::-webkit-datetime-edit-year-field:hover,
  ::-webkit-datetime-edit-hour-field:hover,
  ::-webkit-datetime-edit-minute-field:hover,
  ::-webkit-datetime-edit-ampm-field:hover {
    background-color: rgba(68, 221, 68, 0.2);
  }

  ::-webkit-datetime-edit-month-field:focus,
  ::-webkit-datetime-edit-day-field:focus,
  ::-webkit-datetime-edit-year-field:focus,
  ::-webkit-datetime-edit-hour-field:focus,
  ::-webkit-datetime-edit-minute-field:focus,
  ::-webkit-datetime-edit-ampm-field:focus {
    background-color: rgba(68, 221, 68, 0.3);
    outline: none;
  }

  ::-webkit-calendar-picker {
    background-color: black;
    border: 1px solid #44dd44;
    box-shadow: 0 0 10px #44dd44;
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }

  .calendar-wrapper {
    position: relative;
    overflow: hidden;
  }

  .calendar-wrapper::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 2px solid #44dd44;
    animation: borderGlow 2s infinite;
    pointer-events: none;
  }

  @keyframes borderGlow {
    0% { box-shadow: 0 0 5px #44dd44; }
    50% { box-shadow: 0 0 15px #44dd44; }
    100% { box-shadow: 0 0 5px #44dd44; }
  }

  .react-datepicker {
    background-color: rgba(0, 0, 0, 0.9) !important;
    border: 2px solid #44dd44 !important;
    box-shadow: 0 0 20px #44dd44 !important;
    font-family: 'Press Start 2P', cursive !important;
  }

  .react-datepicker__header {
    background-color: rgba(68, 221, 68, 0.1) !important;
    border-bottom: 2px solid #44dd44 !important;
  }

  .react-datepicker__current-month,
  .react-datepicker__day-name,
  .react-datepicker__time-name {
    color: #44dd44 !important;
  }

  .react-datepicker__day {
    color: #44dd44 !important;
    background-color: transparent !important;
    border: 1px solid transparent !important;
    transition: all 0.2s !important;
  }

  .react-datepicker__day:hover {
    background-color: rgba(68, 221, 68, 0.2) !important;
    border-color: #44dd44 !important;
    box-shadow: 0 0 10px #44dd44 !important;
    transform: scale(1.1) !important;
  }

  .react-datepicker__day--selected {
    background-color: #44dd44 !important;
    color: black !important;
    text-shadow: 0 0 5px rgba(68, 221, 68, 0.5) !important;
  }

  .react-datepicker__day--keyboard-selected {
    background-color: rgba(68, 221, 68, 0.3) !important;
    border-color: #44dd44 !important;
  }

  .react-datepicker__time-container {
    border-left: 2px solid #44dd44 !important;
  }

  .react-datepicker__time-list-item {
    color: #44dd44 !important;
    background-color: transparent !important;
    transition: all 0.2s !important;
  }

  .react-datepicker__time-list-item:hover {
    background-color: rgba(68, 221, 68, 0.2) !important;
    box-shadow: 0 0 10px #44dd44 !important;
  }

  .react-datepicker__time-list-item--selected {
    background-color: #44dd44 !important;
    color: black !important;
  }

  .react-datepicker__navigation-icon::before {
    border-color: #44dd44 !important;
  }

  .react-datepicker__navigation:hover *::before {
    border-color: #88ff88 !important;
  }

  .react-datepicker__year-read-view--down-arrow,
  .react-datepicker__month-read-view--down-arrow {
    border-color: #44dd44 !important;
  }

  .react-datepicker__year-dropdown,
  .react-datepicker__month-dropdown {
    background-color: rgba(0, 0, 0, 0.9) !important;
    border: 2px solid #44dd44 !important;
  }

  .react-datepicker__year-option:hover,
  .react-datepicker__month-option:hover {
    background-color: rgba(68, 221, 68, 0.2) !important;
  }

  .react-datepicker-popper[data-placement^=bottom] .react-datepicker__triangle::before,
  .react-datepicker-popper[data-placement^=bottom] .react-datepicker__triangle::after {
    border-bottom-color: #44dd44 !important;
  }

  .react-datepicker__day--outside-month {
    color: #2a8a2a !important;
    opacity: 0.5 !important;
  }

  /* Animation for the calendar popup */
  .react-datepicker-popper {
    animation: calendarPopup 0.3s ease-out !important;
  }

  @keyframes calendarPopup {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`

const styles = `
  @keyframes levelUp {
    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
    50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
  }

  .animate-levelUp {
    animation: levelUp 2s ease-out forwards;
  }

  @keyframes questComplete {
    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
    50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
  }

  .animate-questComplete {
    animation: questComplete 2s ease-out forwards;
  }

  @keyframes fadeIn {
    0% { opacity: 0; transform: translate(-50%, -60%); }
    10% { opacity: 1; transform: translate(-50%, -50%); }
    90% { opacity: 1; transform: translate(-50%, -50%); }
    100% { opacity: 0; transform: translate(-50%, -40%); }
  }

  .animate-fadeIn {
    animation: fadeIn 2s ease-out forwards;
  }
`;

// Add these helper functions before the DashboardPage component
const getSkillName = (skillId: string): string => {
  const skillMap: Record<string, string> = {
    fireball: 'Fireball',
    heal: 'Heal',
    // Add more skills as needed
  }
  return skillMap[skillId] || 'Unknown Skill'
}

const getSkillDescription = (skillId: string): string => {
  const descriptionMap: Record<string, string> = {
    fireball: 'Launches a ball of fire at enemies',
    heal: 'Restores health points',
    // Add more descriptions as needed
  }
  return descriptionMap[skillId] || 'No description available'
}

const getSkillIcon = (skillId: string): string => {
  const iconMap: Record<string, string> = {
    fireball: '🔥',
    heal: '💚',
    // Add more icons as needed
  }
  return iconMap[skillId] || ''
}

const questTemplates = [
  {
    type: "training",
    templates: [
      "Practice {skill} by doing {specific_action} for {duration} minutes",
      "Improve your {skill} by completing {specific_action} {count} times",
      "Do {specific_action} to enhance your {skill} for {duration} minutes"
    ]
  },
  {
    type: "study",
    templates: [
      "Read about {skill} for {duration} minutes and take notes",
      "Watch {count} educational videos about {skill} and summarize key points",
      "Complete {count} practice problems related to {skill}"
    ]
  },
  {
    type: "project",
    templates: [
      "Create a small project using {skill} that demonstrates {specific_concept}",
      "Document your progress in {skill} by writing {count} journal entries",
      "Practice {skill} by helping someone else learn a basic concept"
    ]
  }
];

const specificDetails = {
  specific_action: [
    "focused repetition exercises",
    "timed practice sessions",
    "structured drills",
    "review exercises",
    "practical applications"
  ],
  specific_concept: [
    "basic principles",
    "fundamental techniques",
    "problem-solving methods",
    "common use cases",
    "best practices"
  ],
  duration: [
    "15",
    "20",
    "25",
    "30",
    "45"
  ],
  count: [
    "3",
    "5",
    "7",
    "10",
    "15"
  ]
};

function generateQuestDescription(template: string, skill: string): string {
  return template.replace(/{(\w+)}/g, (match, key) => {
    if (key === 'skill') return skill;
    if (key === 'duration') return specificDetails.duration[Math.floor(Math.random() * specificDetails.duration.length)];
    if (key === 'count') return specificDetails.count[Math.floor(Math.random() * specificDetails.count.length)];
    
    // Use specific details if available
    if (key in specificDetails) {
      const details = specificDetails[key as keyof typeof specificDetails];
      return details[Math.floor(Math.random() * details.length)];
    }
    
    return match;
  });
}

const generateQuest = async (stat: string): Promise<StatQuest> => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const statPrompts = {
      strength: "Generate a solo workout quest focused on strength training that's suitable for a computer science student who spends long hours at a desk. Include specific exercises and duration.",
      intelligence: "Generate a programming practice quest focused on algorithms, leetcode problems, or coding challenges. Include specific difficulty level or topic.",
      charisma: "Generate a self-improvement quest for developing communication skills, such as practicing public speaking, recording video explanations, or preparing technical presentations.",
      wisdom: "Generate a learning quest focused on studying new programming concepts, design patterns, or technology documentation.",
      agility: "Generate a solo cardio or flexibility exercise quest suitable for someone who works at a computer all day.",
      endurance: "Generate a stamina-building quest that can be done individually, like maintaining good posture during coding sessions or doing desk exercises.",
      vitality: "Generate a health-focused quest related to proper nutrition, sleep schedule, or exercise routine for a programmer.",
      dexterity: "Generate a typing or coding speed improvement quest, or exercises for preventing repetitive strain injury.",
      luck: "Generate a quest focused on building good coding habits or exploring new technologies that might be useful in the future."
    };

    const prompt = `${statPrompts[stat.toLowerCase() as keyof typeof statPrompts]}
    Requirements:
    1. Must be completable alone
    2. Must be specific and measurable
    3. Must include clear duration or quantity
    4. Must be realistic for a busy student
    Format as a single, clear sentence.`;

    const result = await model.generateContent(prompt);
    const description = result.response.text().trim();

    let difficulty: 'easy' | 'medium' | 'hard';
    if (description.length < 50) difficulty = 'easy';
    else if (description.length < 100) difficulty = 'medium';
    else difficulty = 'hard';

    const rewards = { easy: 1, medium: 2, hard: 3 };

    return {
      description,
      difficulty,
      reward: rewards[difficulty]
    };
  } catch (error) {
    console.error('Error generating quest with Gemini:', error);
    // Fallback to template-based generation
    const questType = questTemplates[Math.floor(Math.random() * questTemplates.length)];
    const template = questType.templates[Math.floor(Math.random() * questType.templates.length)];
    const description = generateQuestDescription(template, stat);
    const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    const rewards = { easy: 1, medium: 2, hard: 3 };

    return {
      description,
      difficulty,
      reward: rewards[difficulty]
    };
  }
};

// Add profession data
const professions: Profession[] = [
  {
    id: 'chaos_bringer',
    name: 'Chaos Bringer',
    description: 'A mysterious force that brings controlled chaos to systems and code.',
    icon: '🌀'
  },
  {
    id: 'code_sage',
    name: 'Code Sage',
    description: 'Master of algorithms and software architecture.',
    icon: '📚'
  },
  {
    id: 'tech_artificer',
    name: 'Tech Artificer',
    description: 'Creates and maintains complex technical systems.',
    icon: '⚡'
  },
  {
    id: 'data_weaver',
    name: 'Data Weaver',
    description: 'Manipulates and analyzes complex data structures.',
    icon: '🔮'
  }
];

// Add this component after your stats display
const StatsRadar = ({ stats }: { stats: UserStats }) => {
  const data = {
    labels: ['STR', 'AGI', 'END', 'INT', 'CHA', 'LCK', 'VIT', 'WIS', 'DEX'],
    datasets: [
      {
        label: 'Base Stats',
        data: [
          stats.strength,
          stats.agility,
          stats.endurance,
          stats.intelligence,
          stats.charisma,
          stats.luck,
          stats.vitality,
          stats.wisdom,
          stats.dexterity
        ],
        backgroundColor: 'rgba(68, 221, 68, 0.2)',
        borderColor: '#44dd44',
        borderWidth: 2,
      },
      {
        label: 'Total Stats',
        data: [
          stats.strength + (stats.hidden_strength || 0),
          stats.agility + (stats.hidden_agility || 0),
          stats.endurance + (stats.hidden_endurance || 0),
          stats.intelligence + (stats.hidden_intelligence || 0),
          stats.charisma + (stats.hidden_charisma || 0),
          stats.luck + (stats.hidden_luck || 0),
          stats.vitality + (stats.hidden_vitality || 0),
          stats.wisdom + (stats.hidden_wisdom || 0),
          stats.dexterity + (stats.hidden_dexterity || 0)
        ],
        backgroundColor: 'rgba(255, 170, 68, 0.2)',
        borderColor: '#ffaa44',
        borderWidth: 2,
      }
    ]
  };

  // Calculate max value for radar scale
  const allStats = [
    stats.strength + (stats.hidden_strength || 0),
    stats.agility + (stats.hidden_agility || 0),
    stats.endurance + (stats.hidden_endurance || 0),
    stats.intelligence + (stats.hidden_intelligence || 0),
    stats.charisma + (stats.hidden_charisma || 0),
    stats.luck + (stats.hidden_luck || 0),
    stats.vitality + (stats.hidden_vitality || 0),
    stats.wisdom + (stats.hidden_wisdom || 0),
    stats.dexterity + (stats.hidden_dexterity || 0)
  ];
  const maxStat = Math.max(...allStats);
  
  const options = {
    scales: {
      r: {
        min: 0,
        max: Math.ceil(maxStat * 1.2),
        angleLines: {
          color: 'rgba(68, 221, 68, 0.2)'
        },
        grid: {
          color: 'rgba(68, 221, 68, 0.2)'
        },
        pointLabels: {
          color: '#44dd44',
          font: {
            family: "'Press Start 2P', cursive",
            size: 10
          }
        },
        ticks: {
          color: '#44dd44',
          backdropColor: 'transparent',
          font: {
            family: "'Press Start 2P', cursive",
            size: 8
          }
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: '#44dd44',
          font: {
            family: "'Press Start 2P', cursive",
            size: 10
          }
        }
      },
      tooltip: {
        titleFont: {
          family: "'Press Start 2P', cursive"
        },
        bodyFont: {
          family: "'Press Start 2P', cursive"
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#44dd44',
        bodyColor: '#44dd44',
        borderColor: '#44dd44',
        borderWidth: 1
      }
    },
    elements: {
      line: {
        tension: 0.2
      }
    },
    maintainAspectRatio: false,
  };

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="mt-8 p-6 bg-black/50 backdrop-blur-sm border-2 border-[#44dd44] rounded-lg max-w-2xl mx-auto"
    >
      <h2 className="text-[#44dd44] text-xl mb-4 text-center">STATS OVERVIEW</h2>
      <div className="w-full h-[400px] mx-auto">
        <Radar data={data} options={options} />
      </div>
    </motion.div>
  );
};

const validateSkillWithAI = async (
  name: string,
  description: string,
  userLevel: number,
  availablePoints: number
): Promise<SkillCreationResponse> => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `As a game master, evaluate this programming or self-improvement skill:
    Name: ${name}
    Description: ${description}
    User Level: ${userLevel}
    Available Skill Points: ${availablePoints}

    Analyze the skill and provide:
    1. Is it valid (programming/self-improvement related)?
    2. How powerful is it (scale 1-5)?
    3. Required skill points (1-5 based on power)
    4. If required points > available points, suggest a weaker version
    5. Suggest an appropriate emoji icon

    Respond with ONLY a JSON object:
    {
      "isValid": boolean,
      "powerLevel": number (1-5),
      "requiredPoints": number (1-5),
      "feedback": "explanation of evaluation",
      "icon": "emoji",
      "adjustedVersion": {
        "name": "suggested weaker name if needed",
        "description": "adjusted description if needed",
        "requiredPoints": number
      }
    }`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response format');
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error validating skill:', error);
    throw error;
  }
};

const handleSkillValidation = async (
  newSkill: Skill, 
  currentStats: UserStats,
  onValidating: (isValidating: boolean) => void,
  onFeedback: (feedback: { type: string, message: string }) => void,
  onShowAdjustment: (data: { original: Skill, adjusted: any, feedback: string }) => void,
  onShowConfirmation: (data: { skill: Skill, points: number, feedback: string, icon: string }) => void
) => {
  try {
    onValidating(true);
    const validation = await validateSkillWithAI(
      newSkill.name,
      newSkill.description,
      currentStats.level,
      currentStats.skill_points
    );

    if (!validation.isValid) {
      setFeedback({
        type: 'error',
        message: validation.feedback
      });
      return;
    }

    if (validation.requiredPoints > currentStats.skill_points) {
      setShowAdjustmentModal({
        original: newSkill,
        adjusted: validation.adjustedVersion,
        feedback: validation.feedback
      });
    } else {
      setShowConfirmationModal({
        skill: newSkill,
        points: validation.requiredPoints,
        feedback: validation.feedback,
        icon: validation.icon
      });
    }
  } catch (error) {
    onFeedback({
      type: 'error', 
      message: 'Error validating skill. Please try again.'
    });
  } finally {
    onValidating(false);
  }
};

// Add this before your component
const createSkill = async (
  supabase: any,
  userId: string,
  newSkill: Skill,
  requiredPoints: number
): Promise<boolean> => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are a game master validating a new skill. Evaluate this programming-themed skill:
    Name: ${newSkill.name}
    Description: ${newSkill.description}

    Requirements:
    1. Must be programming/computer-science related or realistic self-improvement
    2. No game-breaking abilities
    3. Must be specific and measurable

    Respond with ONLY a JSON object containing these fields:
    isValid (boolean)
    requiredPoints (number 1-5)
    feedback (string)
    powerLevel (string)
    icon (string emoji)`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    // Extract JSON from response if needed
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Invalid response format from Gemini');
      return false;
    }

    const validation = JSON.parse(jsonMatch[0]);

    if (!validation.isValid) {
      // Instead of throwing an error, return false and let the component handle the feedback
      console.log('Skill validation failed:', validation.feedback);
      return false;
    }

    // Check if user has enough points
    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('skill_points')
      .eq('id', userId)
      .single();

    if (statsError || !stats || stats.skill_points < requiredPoints) {
      console.log('Insufficient skill points');
      return false;
    }

    // Generate a unique skill ID
    const skillId = `${newSkill.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;

    // Log the data we're trying to insert
    console.log('Attempting to insert skill:', {
      user_id: userId,
      skill_id: skillId,
      skill_name: newSkill.name,
      skill_description: newSkill.description,
      skill_level: 1,
      skill_icon: validation.icon,
      power_level: validation.powerLevel
    });

    // Insert skill with better error handling
    const { data: skillData, error: skillError } = await supabase
      .from('user_skills')
      .insert([{
        user_id: userId,
        skill_id: skillId,
        skill_name: newSkill.name,
        skill_description: newSkill.description,
        skill_level: 1,
        skill_icon: validation.icon,
        power_level: validation.powerLevel
      }])
      .select();

    if (skillError) {
      console.error('Skill creation error:', {
        message: skillError.message,
        details: skillError.details,
        hint: skillError.hint
      });
      return false;
    }

    // Update skill points
    const { error: updateError } = await supabase
      .from('user_stats')
      .update({ 
        skill_points: stats.skill_points - requiredPoints 
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating skill points:', updateError);
      // Rollback skill creation if points update fails
      await supabase
        .from('user_skills')
        .delete()
        .match({ skill_id: skillId });
      return false;
    }

    console.log('Skill created successfully:', skillData);
    return true;

  } catch (error) {
    console.error('Error in createSkill:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
};

export default function DashboardPage() {
  const { skillPoints, isLoading, error, refreshSkillPoints, setSkillPoints } = useSkillPoints();
  const [userStats, setUserStats] = useState<UserStats>({
    id: '',
    strength: 1,
    agility: 1,
    endurance: 1,
    intelligence: 1,
    charisma: 1,
    luck: 1,
    vitality: 1,
    wisdom: 1,
    dexterity: 1,
    level: 1,
    experience: 0,
    stat_points: 0,
    skill_points: 0
  })
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isEditing, setIsEditing] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [skills, setSkills] = useState<Skill[]>([
    {
      id: 'fireball',
      name: 'Fireball',
      description: 'Launches a ball of fire at enemies',
      level: 1,
      icon: '🔥'
    },
    {
      id: 'heal',
      name: 'Heal',
      description: 'Restores health points',
      level: 1,
      icon: '💚'
    }
  ]);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [currentQuest, setCurrentQuest] = useState<StatQuest | null>(null);
  const [questStat, setQuestStat] = useState<string>('');
  const [showQuestConfirmation, setShowQuestConfirmation] = useState(false);
  const [isGeneratingQuest, setIsGeneratingQuest] = useState(false);
  const [questGenerationStat, setQuestGenerationStat] = useState('');
  const [showInsufficientPoints, setShowInsufficientPoints] = useState(false);
  const [selectedProfession, setSelectedProfession] = useState<string>('chaos_bringer');
  const [showProfessionModal, setShowProfessionModal] = useState(false);
  const [showSkillCreationModal, setShowSkillCreationModal] = useState(false);
  const [showSkillPointWarning, setShowSkillPointWarning] = useState(false);
  const [feedback, setFeedback] = useState<{ type: string; message: string } | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout>();
  const [isValidating, setIsValidating] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState<ConfirmationModal | null>(null);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState<AdjustmentModal | null>(null);

  useEffect(() => {
    return () => {
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchUserData()
  }, [])

  useEffect(() => {
    const styleSheet = document.createElement("style")
    styleSheet.innerText = calendarStyles
    document.head.appendChild(styleSheet)
    return () => {
      document.head.removeChild(styleSheet)
    }
  }, [])

  useEffect(() => {
    // Add the styles to the document
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  useEffect(() => {
    if (userStats) {
      const pointsFromLevels = Math.floor(userStats.level / 10);
      // Fetch used points from skills table and subtract
      setSkillPoints(pointsFromLevels);
    }
  }, [userStats]);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch profile data
      const { data: profileData } = await supabase
        .from('player_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Set profile info with fallback to email if no username
      setUserProfile({
        email: user.email || '',
        username: profileData?.username || user.email?.split('@')[0] || `Player#${user.id.slice(0, 4)}`,
        avatar_url: profileData?.avatar_url,
        created_at: user.created_at,
        profession: profileData?.profession || 'chaos_bringer'
      })
      setSelectedProfession(profileData?.profession || 'chaos_bringer')

      console.log("Current user:", user.id)

      let { data: statsData, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('id', user.id)
        .single()

      console.log("Stats data:", statsData)
      console.log("Query error:", error)

      if (!statsData) {
        console.log("Creating new stats for user")
        // Initialize stats for new user
        const newStats = {
          id: user.id,
          strength: 1,
          agility: 1,
          endurance: 1,
          intelligence: 1,
          charisma: 1,
          luck: 1,
          vitality: 1,
          wisdom: 1,
          dexterity: 1,
          level: 1,
          experience: 0,
          stat_points: 0,
          skill_points: 0
        }
        
        const { data, error: insertError } = await supabase
          .from('user_stats')
          .insert([newStats])
          .select()
          .single()
          
        console.log("Insert result:", data)
        console.log("Insert error:", insertError)
        
        statsData = data
      }

      if (statsData) {
        setUserStats(statsData)
        setSkillPoints(statsData.skill_points)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStatBar = (stat: string, value: number) => {
    const getHiddenStat = () => {
      const hiddenStatKey = `hidden_${stat.toLowerCase()}` as keyof UserStats;
      return userStats[hiddenStatKey] || 0;
    }

    // Calculate the highest stat value for scaling
    const allStats = [
      userStats.strength + (userStats.hidden_strength || 0),
      userStats.agility + (userStats.hidden_agility || 0),
      userStats.endurance + (userStats.hidden_endurance || 0),
      userStats.intelligence + (userStats.hidden_intelligence || 0),
      userStats.charisma + (userStats.hidden_charisma || 0),
      userStats.luck + (userStats.hidden_luck || 0),
      userStats.vitality + (userStats.hidden_vitality || 0),
      userStats.wisdom + (userStats.hidden_wisdom || 0),
      userStats.dexterity + (userStats.hidden_dexterity || 0)
    ];
    const maxStat = Math.max(...allStats);
    
    // Calculate percentages for base and hidden stats
    const basePercentage = (Number(value) / (maxStat || 1)) * 100;
    const hiddenPercentage = (Number(getHiddenStat()) / (maxStat || 1)) * 100;

    const handleIncreaseStat = async () => {
      if (userStats.stat_points <= 0) {
        setShowInsufficientPoints(true);
        setTimeout(() => setShowInsufficientPoints(false), 2000);
        return;
      }
      
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return;

        const { data, error } = await supabase
          .from('user_stats')
          .update({ 
            [stat.toLowerCase()]: value + 1,
            stat_points: userStats.stat_points - 1
          })
          .eq('id', user.id)
          .select()
          .single()

        if (error) throw error
        if (data) setUserStats(data)
      } catch (error) {
        console.error(`Error updating ${stat}:`, error)
      }
    }

    const handleQuestGeneration = async () => {
      setQuestGenerationStat(stat);
      setShowQuestConfirmation(true);
    };

    return (
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="bg-black/50 backdrop-blur-sm border-2 border-[#44dd44] p-4 mb-4 relative"
      >
        <div className="flex justify-between items-center">
          <span className="text-[#44dd44]">{stat.toUpperCase()}</span>
          <div className="flex items-center gap-2">
            <span className="text-[#44dd44]">
              {value}
              {Number(getHiddenStat()) > 0 && (
                <span className="text-[#ffaa44] text-sm ml-1">
                  (+{getHiddenStat()})
                </span>
              )}
            </span>
            <motion.button
              onClick={handleQuestGeneration}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 flex items-center justify-center
                       border-2 border-[#ffaa44] text-[#ffaa44] 
                       hover:bg-[#ffaa44] hover:text-black
                       transition-colors shadow-[0_0_10px_rgba(255,170,68,0.3)]"
            >
              ⚔️
            </motion.button>
            <motion.button
              onClick={handleIncreaseStat}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 flex items-center justify-center
                       border-2 border-[#44dd44] text-[#44dd44] 
                       hover:bg-[#44dd44] hover:text-black
                       transition-colors shadow-[0_0_10px_rgba(68,221,68,0.3)]"
            >
              +
            </motion.button>
          </div>
        </div>
        <div className="mt-2 relative">
          {/* Base stat bar */}
          <div className="h-2 bg-black/50 border border-[#44dd44]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${basePercentage}%` }}
              className="h-full bg-[#44dd44]"
            />
          </div>
          
          {/* Hidden stat bar */}
          {Number(getHiddenStat()) > 0 && (
            <div className="h-2 bg-black/50 border border-[#ffaa44] mt-1">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${hiddenPercentage}%` }}
                className="h-full bg-[#ffaa44]"
              />
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  const handleUpdateUsername = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !newUsername.trim()) return

      const { error } = await supabase
        .from('player_profiles')
        .upsert({ 
          id: user.id,
          username: newUsername.trim(),
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setUserProfile(prev => prev ? {
        ...prev,
        username: newUsername.trim()
      } : null)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating username:', error)
    }
  }

  const gainExperience = async () => {
    try {
      // Step 1: Get user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log("No user found")
        return
      }

      // Step 2: Log current state
      console.log("Current user:", user.id)
      console.log("Current stats:", userStats)

      // Step 3: Calculate new exp
      const expGained = Math.floor(Math.random() * 100) + 50;
      console.log("Exp to gain:", expGained)
      
      // Step 4: Get current stats first
      const { data: currentStats, error: fetchError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('id', user.id)
        .single()

      if (fetchError) {
        console.error('Fetch error:', fetchError)
        return
      }

      console.log("Current stats from DB:", currentStats)

      if (!currentStats) {
        console.log("No stats found in DB")
        return
      }

      // Step 5: Calculate new total
      const newExp = currentStats.experience + expGained
      console.log("New exp total:", newExp)

      // Step 6: Update the stats
      const { data, error } = await supabase
        .from('user_stats')
        .update({ experience: newExp })
        .eq('id', user.id)
        .select()

      // Log everything
      console.log("Update response:", { data, error })

      if (error) {
        console.error('Update error:', error)
        return
      }

      // Step 7: Update local state
      if (data && data[0]) {
        console.log("Setting new stats:", data[0])
        setUserStats(data[0])
        checkLevelUp(data[0])
      }

    } catch (error) {
      console.error('Full error object:', error)
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        })
      }
    }
  }

  const checkLevelUp = async (stats: UserStats) => {
    const expNeeded = stats.level * 1000;
    if (stats.experience >= expNeeded) {
      const { data, error } = await supabase
        .from('user_stats')
        .update({ 
          level: stats.level + 1,
          experience: stats.experience - expNeeded,
          stat_points: stats.stat_points + 5
        })
        .eq('id', stats.id)
        .select()
        .single()

      if (!error && data) {
        // Level up animation
        const levelUpDiv = document.createElement('div');
        levelUpDiv.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 \
                               text-[#44dd44] text-4xl font-bold z-50 animate-levelUp';
        levelUpDiv.textContent = 'LEVEL UP!';
        document.body.appendChild(levelUpDiv);
        
        // Remove the animation after it completes
        setTimeout(() => {
          document.body.removeChild(levelUpDiv);
        }, 2000);

        setUserStats(data)
      }
    }
  }

  const fetchUserSkills = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error

      if (data) {
        // Map the database skills to our skill interface
        const userSkills = data.map(dbSkill => ({
          id: dbSkill.skill_id,
          name: getSkillName(dbSkill.skill_id), // You'll need to implement this
          description: getSkillDescription(dbSkill.skill_id), // And this
          level: dbSkill.skill_level,
          icon: getSkillIcon(dbSkill.skill_id) // And this
        }))
        setSkills(userSkills)
      }
    } catch (error) {
      console.error('Error fetching skills:', error)
    }
  }

  useEffect(() => {
    fetchUserSkills()
  }, [])

  const updateProfession = async (newProfession: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('player_profiles')
        .upsert({
          id: user.id,
          profession: newProfession,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setSelectedProfession(newProfession)
      setUserProfile(prev => prev ? {
        ...prev,
        profession: newProfession
      } : null)
    } catch (error) {
      console.error('Error updating profession:', error)
    }
  }

  const handleSkillCreation = async (newSkill: Skill, requiredPoints: number) => {
    const supabase = createClientComponentClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const success = await createSkill(supabase, user.id, newSkill, requiredPoints);

    if (!success) {
      setFeedback({
        type: 'error',
        message: `Insufficient skill points. Required: ${requiredPoints}`
      });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    // Refresh the entire skill list instead of updating state directly
    const { data: updatedSkills } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', user.id);

    if (updatedSkills) {
      const formattedSkills: Skill[] = updatedSkills.map(skill => ({
        id: skill.skill_id,
        name: skill.skill_name,
        description: skill.skill_description,
        level: skill.skill_level,
        icon: skill.skill_icon,
        powerLevel: skill.power_level
      }));
      
      // Update skills state with fresh data
      setSkills(formattedSkills);
      
      // Fetch updated stats
      const { data: updatedStats } = await supabase
        .from('user_stats')
        .select('skill_points')
        .eq('id', user.id)
        .single();
        
      if (updatedStats) {
        setSkillPoints(updatedStats.skill_points);
      }
      
      setShowSkillCreationModal(false);
    }
  };

  return (
    <main className="relative min-h-screen font-['Press_Start_2P'] overflow-hidden">
      <Background />
      
      <div className="fixed inset-0 bg-gradient-to-b from-[#00220011] via-[#44dd4422] to-[#00220011] animate-pulse"></div>

      <div className="container relative mx-auto px-4 py-8 z-10">
        {isLoading ? (
          <div className="text-center text-[#44dd44]">Loading...</div>
        ) : userStats && userProfile ? (
          <>
            {/* User Profile Card */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-8 p-6 bg-black/50 backdrop-blur-sm border-2 border-[#44dd44] rounded-lg max-w-2xl mx-auto"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 border-2 border-[#44dd44] rounded-full overflow-hidden bg-black/30">
                  {userProfile.avatar_url ? (
                    <img 
                      src={userProfile.avatar_url} 
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#44dd44]">
                      {userProfile.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="bg-black/30 border-2 border-[#44dd44] text-[#44dd44] px-2 py-1 text-sm outline-none"
                        placeholder="Enter new username"
                        maxLength={20}
                      />
                      <button
                        onClick={handleUpdateUsername}
                        className="text-[#44dd44] hover:text-[#88ff88] text-sm border-2 border-[#44dd44] px-2 py-1"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          setNewUsername('')
                        }}
                        className="text-[#44dd44] hover:text-[#88ff88] text-sm border-2 border-[#44dd44] px-2 py-1"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="text-[#44dd44] text-xl mb-1">{userProfile.username}</h2>
                      <button
                        onClick={() => {
                          setIsEditing(true)
                          setNewUsername(userProfile?.username || '')
                        }}
                        className="text-[#44dd44] hover:text-[#88ff88] text-xs"
                      >
                        ✎ Edit
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="text-[#44dd44] text-sm">Hidden Class:</div>
                    <div className="flex items-center gap-2 px-2 py-1">
                      <span className="text-lg">🌀</span>
                      <span className="text-[#44dd44] font-bold">
                        Chaos Bringer
                      </span>
                      <span className="text-xs text-[#44dd44]/60">
                        (Unique)
                      </span>
                    </div>
                  </div>
                  <div className="my-3 border-t border-[#44dd44]/30"></div>
                  <div className="flex items-center gap-2">
                    <div className="text-[#44dd44] text-sm">Profession:</div>
                    <div 
                      onClick={() => setShowProfessionModal(true)}
                      className="flex items-center gap-2 cursor-pointer hover:bg-[#44dd4422] px-2 py-1 rounded"
                    >
                      <span className="text-lg">
                        {professions.find(p => p.id === selectedProfession)?.icon}
                      </span>
                      <span className="text-[#44dd44]">
                        {professions.find(p => p.id === selectedProfession)?.name}
                      </span>
                      <span className="text-[#44dd44] text-xs">✎</span>
                    </div>
                  </div>
                  <div className="text-[#44dd44]/60 text-xs mt-2">
                    Joined {new Date(userProfile.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#44dd44]/30 pt-4">
                <div className="text-[#44dd44]">
                  <div className="text-xs mb-1">LEVEL</div>
                  <div className="text-2xl">{userStats.level}</div>
                </div>
                <div className="text-[#44dd44]">
                  <div className="text-xs mb-1">EXP</div>
                  <div className="text-sm">{userStats.experience}/{userStats.level * 1000}</div>
                  <div className="mt-1 h-2 bg-black/50 border border-[#44dd44]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(userStats.experience / (userStats.level * 1000)) * 100}%` }}
                      className="h-full bg-[#44dd44]"
                    />
                  </div>
                </div>
                <div className="text-[#44dd44]">
                  <div className="text-xs mb-1">RANK</div>
                  <div className="text-sm">Novice</div>
                </div>
              </div>

              <motion.button
                onClick={gainExperience}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 w-full py-3 border-4 border-[#44dd44] bg-black/30 text-[#44dd44] 
                           hover:bg-[#44dd44] hover:text-black transition-all
                           shadow-[0_0_10px_#44dd4466]"
              >
                ADVENTURE
              </motion.button>
            </motion.div>

            {/* Existing Stats Display */}
            <div className="max-w-2xl mx-auto">
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-8 p-4 bg-black/50 backdrop-blur-sm border-2 border-[#44dd44] rounded-lg max-w-2xl mx-auto text-center"
              >
                <div className="text-[#44dd44] text-sm mb-2">AVAILABLE STAT POINTS</div>
                <div className={`text-[#44dd44] text-3xl font-bold ${userStats.stat_points > 0 ? 'animate-pulse' : ''}`}>
                  {userStats.stat_points}
                </div>
                {userStats.stat_points > 0 && (
                  <div className="text-[#44dd44]/60 text-xs mt-2">
                    Click + next to a stat to spend points
                  </div>
                )}
              </motion.div>
              {renderStatBar('Strength', userStats.strength)}
              {renderStatBar('Agility', userStats.agility)}
              {renderStatBar('Endurance', userStats.endurance)}
              {renderStatBar('Intelligence', userStats.intelligence)}
              {renderStatBar('Charisma', userStats.charisma)}
              {renderStatBar('Luck', userStats.luck)}
              {renderStatBar('Vitality', userStats.vitality)}
              {renderStatBar('Wisdom', userStats.wisdom)}
              {renderStatBar('Dexterity', userStats.dexterity)}
            </div>

            <StatsRadar stats={userStats} />

            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-8 max-w-2xl mx-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[#44dd44] text-xl text-center">SKILLS</h2>
                <motion.button
                  onClick={() => setShowSkillCreationModal(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 border-2 border-[#44dd44] text-[#44dd44] hover:bg-[#44dd44] hover:text-black"
                >
                  CREATE SKILL ({userStats.skill_points} points)
                </motion.button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[...Array(8)].map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      aspect-square relative 
                      border-2 border-[#44dd44] 
                      bg-black/50 backdrop-blur-sm
                      ${skills[index] ? 'cursor-pointer hover:bg-[#44dd4422]' : 'opacity-50'}
                      transition-all duration-300
                    `}
                  >
                    {skills[index] ? (
                      <div className="absolute inset-0 p-2 flex flex-col items-center justify-center">
                        <div className="text-2xl mb-1">{skills[index].icon}</div>
                        <div className="text-[#44dd44] text-xs text-center">
                          {skills[index].name}
                        </div>
                        <div className="absolute bottom-1 right-1 text-[#44dd44] text-xs">
                          Lv.{skills[index].level}
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[#44dd44] text-xs">
                        EMPTY
                      </div>
                    )}
                    
                    {/* Hover tooltip */}
                    {skills[index] && (
                      <div className="absolute opacity-0 group-hover:opacity-100 z-10 
                                    bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                                    w-48 p-2 bg-black/90 border border-[#44dd44] 
                                    text-[#44dd44] text-xs pointer-events-none
                                    transition-opacity duration-200">
                        <div className="font-bold mb-1">{skills[index].name}</div>
                        <div className="text-[#44dd44]/80">{skills[index].description}</div>
                        <div className="mt-1">Level: {skills[index].level}</div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        ) : (
          <div className="text-center text-[#44dd44]">No stats found</div>
        )}
      </div>
      {showQuestModal && currentQuest && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-black/90 border-2 border-[#ffaa44] p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-[#ffaa44] text-xl mb-4">Quest for {questStat}</h3>
            <div className="text-[#ffaa44] mb-4">{currentQuest.description}</div>
            <div className="flex justify-between text-sm mb-6">
              <span className="text-[#ffaa44]">Difficulty: {currentQuest.difficulty}</span>
              <span className="text-[#44dd44]">Reward: +{currentQuest.reward} {questStat}</span>
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowQuestModal(false)}
                className="px-4 py-2 border-2 border-[#ff4444] text-[#ff4444] hover:bg-[#ff4444] hover:text-black"
              >
                Decline
              </button>
              <button
                onClick={async () => {
                  try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;

                    const hiddenStatKey = `hidden_${questStat.toLowerCase()}`;
                    const currentHiddenValue = Number(userStats[hiddenStatKey as keyof UserStats] || 0);
                    const newHiddenValue = currentHiddenValue + currentQuest.reward;

                    const { data, error } = await supabase
                      .from('user_stats')
                      .update({ 
                        [hiddenStatKey]: newHiddenValue 
                      })
                      .eq('id', user.id)
                      .select()
                      .single();

                    if (error) throw error;
                    if (data) {
                      setUserStats(data);
                      
                      // Show success animation
                      const questCompleteDiv = document.createElement('div');
                      questCompleteDiv.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 \
                                                 text-[#ffaa44] text-4xl font-bold z-50 animate-questComplete';
                      questCompleteDiv.textContent = `+${currentQuest.reward} ${questStat}!`;
                      document.body.appendChild(questCompleteDiv);
                      
                      setTimeout(() => {
                        document.body.removeChild(questCompleteDiv);
                      }, 2000);
                    }
                  } catch (error) {
                    console.error('Error updating hidden stats:', error);
                  }
                  setShowQuestModal(false);
                }}
                className="px-4 py-2 border-2 border-[#44dd44] text-[#44dd44] hover:bg-[#44dd44] hover:text-black"
              >
                Accept
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {showQuestConfirmation && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-black/90 border-2 border-[#44dd44] p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-[#44dd44] text-xl mb-4">Generate Quest</h3>
            <p className="text-[#44dd44] mb-6">
              Would you like to generate a quest to improve your {questGenerationStat}?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowQuestConfirmation(false)}
                className="px-4 py-2 border-2 border-[#ff4444] text-[#ff4444] hover:bg-[#ff4444] hover:text-black"
              >
                No
              </button>
              <button
                onClick={async () => {
                  setShowQuestConfirmation(false);
                  setIsGeneratingQuest(true);
                  try {
                    const quest = await generateQuest(questGenerationStat);
                    setCurrentQuest(quest);
                    setQuestStat(questGenerationStat);
                    setShowQuestModal(true);
                  } catch (error) {
                    console.error('Error generating quest:', error);
                  } finally {
                    setIsGeneratingQuest(false);
                  }
                }}
                className="px-4 py-2 border-2 border-[#44dd44] text-[#44dd44] hover:bg-[#44dd44] hover:text-black"
              >
                Yes
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {isGeneratingQuest && (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-[#44dd44] border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-[#44dd44] text-xl">
            Generating {questGenerationStat} Quest...
          </div>
        </div>
      )}
      {showInsufficientPoints && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                        bg-black/90 border-2 border-[#ff4444] p-4 z-50
                        text-[#ff4444] text-center animate-fadeIn">
          Insufficient stat points!
        </div>
      )}
      {showProfessionModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-black/90 border-2 border-[#44dd44] p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-[#44dd44] text-xl mb-4">Choose Your Class</h3>
            <div className="grid gap-4">
              {professions.map((profession) => (
                <div
                  key={profession.id}
                  onClick={async () => {
                    await updateProfession(profession.id);
                    setShowProfessionModal(false);
                  }}
                  className={`
                    flex items-center gap-4 p-4 cursor-pointer
                    border-2 transition-all duration-200
                    ${selectedProfession === profession.id 
                      ? 'border-[#44dd44] bg-[#44dd4422]' 
                      : 'border-[#44dd4444] hover:border-[#44dd44] hover:bg-[#44dd4411]'}
                  `}
                >
                  <span className="text-3xl">{profession.icon}</span>
                  <div>
                    <div className="text-[#44dd44] font-bold">{profession.name}</div>
                    <div className="text-[#44dd44]/80 text-sm">{profession.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowProfessionModal(false)}
              className="mt-6 w-full px-4 py-2 border-2 border-[#44dd44] text-[#44dd44] 
                         hover:bg-[#44dd44] hover:text-black transition-all"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
      {showSkillCreationModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <SkillCreationForm
            onClose={() => setShowSkillCreationModal(false)}
            onSubmit={handleSkillCreation}
            availablePoints={userStats.skill_points}
            userLevel={userStats.level}
            setSkillPoints={setSkillPoints}
          />
        </div>
      )}
      {showSkillPointWarning && feedback && (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    bg-black/90 border-2 border-[#ff4444] p-6 z-50
                    text-[#ff4444] text-center"
        >
          <div className="text-xl mb-2">⚠️ Warning</div>
          <div>Insufficient skill points!</div>
          <div className="text-sm mt-2">
            This skill requires {feedback.message}
            You have {userStats.skill_points} points available.
          </div>
        </motion.div>
      )}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-black/90 border-2 border-[#44dd44] p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-[#44dd44] text-xl mb-4">Confirm Skill Creation</h3>
            <div className="text-[#44dd44] mb-4">
              <p className="text-[#44dd44]/80 text-sm mb-4">{showConfirmationModal.feedback}</p>
              <p className="mb-2">Required Points: {showConfirmationModal.points}</p>
              <p>Suggested Icon: {showConfirmationModal.icon}</p>
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmationModal(null)}
                className="px-4 py-2 border-2 border-[#ff4444] text-[#ff4444] hover:bg-[#ff4444] hover:text-black"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!showAdjustmentModal) return;
                  const adjustedSkill = {
                    ...showAdjustmentModal.original,
                    name: showAdjustmentModal.adjusted.name,
                    description: showAdjustmentModal.adjusted.description
                  };
                  handleSkillCreation(adjustedSkill, showAdjustmentModal.adjusted.requiredPoints);
                  setShowAdjustmentModal(null);
                }}
                className="px-4 py-2 border-2 border-[#ffaa44] text-[#ffaa44] hover:bg-[#ffaa44] hover:text-black"
              >
                Create Adjusted Version
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {showAdjustmentModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-black/90 border-2 border-[#ffaa44] p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-[#ffaa44] text-xl mb-4">Skill Too Powerful</h3>
            <div className="text-[#ffaa44] mb-4">
              <p className="mb-2">Assessment:</p>
              <p className="text-[#ffaa44]/80 text-sm mb-4">{showAdjustmentModal.feedback}</p>
              <p className="mb-4">Would you like to create an adjusted version?</p>
              <div className="bg-black/50 p-4 rounded">
                <p className="font-bold mb-1">{showAdjustmentModal.original.name}</p>
                <p className="text-sm mb-2">{showAdjustmentModal.original.description}</p>
                <p className="text-sm">Required Points: {showAdjustmentModal.original.requiredPoints}</p>
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowAdjustmentModal(null)}
                className="px-4 py-2 border-2 border-[#ff4444] text-[#ff4444] hover:bg-[#ff4444] hover:text-black"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!showAdjustmentModal) return;
                  const adjustedSkill = {
                    ...showAdjustmentModal.original,
                    name: showAdjustmentModal.adjusted.name,
                    description: showAdjustmentModal.adjusted.description
                  };
                  handleSkillCreation(adjustedSkill, showAdjustmentModal.adjusted.requiredPoints);
                  setShowAdjustmentModal(null);
                }}
                className="px-4 py-2 border-2 border-[#ffaa44] text-[#ffaa44] hover:bg-[#ffaa44] hover:text-black"
              >
                Create Adjusted Version
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  )
} 