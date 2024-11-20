'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface SkillCreationFormProps {
  onClose: () => void
  onSubmit: (skill: any, requiredPoints: number) => void
  availablePoints: number
  userLevel: number
  setSkillPoints: (points: number) => void
}

export default function SkillCreationForm({
  onClose,
  onSubmit,
  availablePoints,
  userLevel,
  setSkillPoints
}: SkillCreationFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-black/90 border-2 border-[#44dd44] p-6 max-w-md w-full mx-4"
    >
      <h3 className="text-[#44dd44] text-xl mb-4">Create New Skill</h3>
      <form onSubmit={(e) => {
        e.preventDefault()
        onSubmit({
          id: name.toLowerCase().replace(/\s+/g, '_'),
          name,
          description,
          level: 1
        }, 1)
      }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Skill Name"
          className="w-full mb-4 p-2 bg-black/50 border-2 border-[#44dd44] text-[#44dd44]"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Skill Description"
          className="w-full mb-4 p-2 bg-black/50 border-2 border-[#44dd44] text-[#44dd44]"
        />
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border-2 border-[#ff4444] text-[#ff4444]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border-2 border-[#44dd44] text-[#44dd44]"
          >
            Create
          </button>
        </div>
      </form>
    </motion.div>
  )
} 