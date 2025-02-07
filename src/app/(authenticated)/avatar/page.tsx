'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion } from 'framer-motion'
import Link from 'next/link'

const AVATAR_PARTS = {
  hair: ['default', 'long', 'short', 'mohawk', 'bald'],
  eyes: ['default', 'happy', 'angry', 'sleepy', 'cool'],
  mouth: ['default', 'smile', 'sad', 'surprised', 'neutral'],
  accessories: ['none', 'glasses', 'sunglasses', 'eyepatch', 'monocle'],
  clothes: ['tshirt', 'hoodie', 'suit', 'tank', 'jacket'],
  pants: ['jeans', 'shorts', 'skirt', 'slacks', 'cargo'],
  shoes: ['sneakers', 'boots', 'sandals', 'formal', 'none'],
  colors: {
    hair: ['#000000', '#8B4513', '#DEB887', '#FF0000', '#4169E1', '#228B22'],
    skin: ['#FFE0BD', '#FFD1AA', '#E6B89C', '#B47B56', '#8D5524'],
    clothes: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#000000'],
    pants: ['#000080', '#4B0082', '#800000', '#008000', '#000000'],
    shoes: ['#000000', '#8B4513', '#FFFFFF', '#4169E1', '#8B0000']
  }
}

const PixelAvatar = ({ customization }) => {
  return (
    <svg 
      viewBox="0 0 64 128" 
      className="w-full h-full"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Body Base - Legs */}
      <rect x="24" y="80" width="8" height="32" fill={customization.skinColor} />
      <rect x="32" y="80" width="8" height="32" fill={customization.skinColor} />

      {/* Pants */}
      <rect x="24" y="80" width="16" height="24" fill={customization.pantsColor || AVATAR_PARTS.colors.pants[0]} />
      
      {/* Shoes */}
      <rect x="24" y="104" width="8" height="8" fill={customization.shoesColor || AVATAR_PARTS.colors.shoes[0]} />
      <rect x="32" y="104" width="8" height="8" fill={customization.shoesColor || AVATAR_PARTS.colors.shoes[0]} />

      {/* Torso */}
      <rect x="24" y="48" width="16" height="32" fill={customization.clothesColor || AVATAR_PARTS.colors.clothes[0]} />
      
      {/* Arms */}
      <rect x="16" y="48" width="8" height="24" fill={customization.skinColor} />
      <rect x="40" y="48" width="8" height="24" fill={customization.skinColor} />
      
      {/* Sleeves */}
      <rect x="16" y="48" width="8" height="16" fill={customization.clothesColor || AVATAR_PARTS.colors.clothes[0]} />
      <rect x="40" y="48" width="8" height="16" fill={customization.clothesColor || AVATAR_PARTS.colors.clothes[0]} />

      {/* Neck */}
      <rect x="28" y="40" width="8" height="8" fill={customization.skinColor} />

      {/* Head */}
      <rect x="20" y="16" width="24" height="24" fill={customization.skinColor} />

      {/* Hair */}
      {customization.hair === 'default' && (
        <path
          d="M20 16 L44 16 L44 24 L40 28 L24 28 L20 24 Z"
          fill={customization.hairColor}
        />
      )}
      {customization.hair === 'long' && (
        <path
          d="M20 16 L44 16 L44 40 L40 44 L24 44 L20 40 Z"
          fill={customization.hairColor}
        />
      )}
      {customization.hair === 'mohawk' && (
        <path
          d="M28 8 L36 8 L36 24 L28 24 Z"
          fill={customization.hairColor}
        />
      )}
      {customization.hair === 'short' && (
        <path
          d="M20 16 L44 16 L44 20 L40 24 L24 24 L20 20 Z"
          fill={customization.hairColor}
        />
      )}

      {/* Eyes */}
      {customization.eyes === 'default' && (
        <>
          <rect x="24" y="24" width="4" height="4" fill="#000000" />
          <rect x="36" y="24" width="4" height="4" fill="#000000" />
        </>
      )}
      {customization.eyes === 'happy' && (
        <>
          <path d="M24 24 L28 24 L28 26 L24 26 Z" fill="#000000" />
          <path d="M36 24 L40 24 L40 26 L36 26 Z" fill="#000000" />
        </>
      )}
      {customization.eyes === 'angry' && (
        <>
          <path d="M24 24 L28 26 L28 28 L24 26 Z" fill="#000000" />
          <path d="M36 24 L40 26 L40 28 L36 26 Z" fill="#000000" />
        </>
      )}

      {/* Mouth */}
      {customization.mouth === 'default' && (
        <rect x="28" y="32" width="8" height="2" fill="#000000" />
      )}
      {customization.mouth === 'smile' && (
        <path d="M28 32 Q32 36 36 32" stroke="#000000" fill="none" strokeWidth="2" />
      )}
      {customization.mouth === 'sad' && (
        <path d="M28 34 Q32 30 36 34" stroke="#000000" fill="none" strokeWidth="2" />
      )}

      {/* Accessories */}
      {customization.accessories === 'glasses' && (
        <g fill="none" stroke="#000000" strokeWidth="2">
          <rect x="22" y="22" width="8" height="8" />
          <rect x="34" y="22" width="8" height="8" />
          <line x1="30" y1="26" x2="34" y2="26" />
        </g>
      )}
      {customization.accessories === 'eyepatch' && (
        <rect x="22" y="22" width="10" height="8" fill="#000000" />
      )}

      {/* Clothing Details */}
      {customization.clothes === 'hoodie' && (
        <path
          d="M24 48 L40 48 L40 52 L38 56 L26 56 L24 52 Z"
          fill={customization.clothesColor || AVATAR_PARTS.colors.clothes[0]}
          stroke="#000000"
          strokeWidth="1"
        />
      )}
    </svg>
  )
}

export default function AvatarPage() {
  const [customization, setCustomization] = useState({
    hair: 'default',
    eyes: 'default',
    mouth: 'default',
    accessories: 'none',
    hairColor: '#000000',
    skinColor: '#FFE0BD',
    clothes: 'tshirt',
    pants: 'jeans',
    shoes: 'sneakers',
    clothesColor: '#FF0000',
    pantsColor: '#000080',
    shoesColor: '#000000'
  })
  
  const supabase = createClientComponentClient()

  const handleSaveAvatar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update({ 
          avatar_customization: customization 
        })
        .eq('id', user.id)

      if (error) throw error
      
      // Show success message
    } catch (error) {
      console.error('Error saving avatar:', error)
    }
  }

  return (
    <div className="min-h-screen bg-[#111111] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <div className="mb-4">
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
        </div>

        {/* Title */}
        <h1 className="text-[#44dd44] text-lg md:text-2xl font-bold mb-4 md:mb-8 text-center font-pixel">
          Customize Your Avatar
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-4 md:gap-8">
          {/* Preview Section */}
          <div className="bg-[#1a1a1a] border-2 border-[#44dd44] p-4 md:p-6 rounded-lg overflow-hidden">
            <h2 className="text-[#44dd44] text-base md:text-lg font-pixel mb-4">Preview</h2>
            <div className="aspect-square bg-[#222222] rounded-lg relative overflow-hidden border-2 border-[#44dd44]">
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <PixelAvatar customization={customization} />
              </div>
            </div>
          </div>

          {/* Customization Section */}
          <div className="bg-[#1a1a1a] border-2 border-[#44dd44] p-4 md:p-6 rounded-lg overflow-hidden">
            <h2 className="text-[#44dd44] text-base md:text-lg font-pixel mb-4">Customize</h2>
            
            {/* Hair Style */}
            <div className="mb-6">
              <label className="text-[#44dd44] block mb-2 font-pixel text-xs md:text-sm">Hair Style</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {AVATAR_PARTS.hair.map(style => (
                  <motion.button
                    key={style}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-2 rounded-lg transition-all duration-200 text-xs md:text-sm truncate ${
                      customization.hair === style 
                        ? 'border-2 border-[#44dd44] bg-[#222222] text-[#44dd44]' 
                        : 'border border-[#333333] text-[#666666] hover:border-[#44dd44] hover:text-[#44dd44]'
                    }`}
                    onClick={() => setCustomization(prev => ({ ...prev, hair: style }))}
                  >
                    {style}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Hair Color */}
            <div className="mb-6">
              <label className="text-[#44dd44] block mb-2 font-pixel text-xs md:text-sm">Hair Color</label>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_PARTS.colors.hair.map(color => (
                  <motion.button
                    key={color}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-lg transition-transform duration-200 ${
                      customization.hairColor === color 
                        ? 'ring-2 ring-offset-2 ring-offset-[#1a1a1a] ring-[#44dd44]' 
                        : ''
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setCustomization(prev => ({ ...prev, hairColor: color }))}
                  />
                ))}
              </div>
            </div>

            {/* Skin Color */}
            <div className="mb-6">
              <label className="text-[#44dd44] block mb-2 font-pixel text-xs md:text-sm">Skin Tone</label>
              <div className="grid grid-cols-5 gap-2">
                {AVATAR_PARTS.colors.skin.map(color => (
                  <motion.button
                    key={color}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-lg transition-transform duration-200 ${
                      customization.skinColor === color 
                        ? 'ring-2 ring-offset-2 ring-offset-[#1a1a1a] ring-[#44dd44]' 
                        : ''
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setCustomization(prev => ({ ...prev, skinColor: color }))}
                  />
                ))}
              </div>
            </div>

            {/* Clothes */}
            <div className="mb-6">
              <label className="text-[#44dd44] block mb-2 font-pixel text-xs md:text-sm">Clothes</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {AVATAR_PARTS.clothes.map(style => (
                  <motion.button
                    key={style}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-2 rounded-lg transition-all duration-200 text-xs md:text-sm truncate ${
                      customization.clothes === style 
                        ? 'border-2 border-[#44dd44] bg-[#222222] text-[#44dd44]' 
                        : 'border border-[#333333] text-[#666666] hover:border-[#44dd44] hover:text-[#44dd44]'
                    }`}
                    onClick={() => setCustomization(prev => ({ ...prev, clothes: style }))}
                  >
                    {style}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Pants */}
            <div className="mb-6">
              <label className="text-[#44dd44] block mb-2 font-pixel text-xs md:text-sm">Pants</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {AVATAR_PARTS.pants.map(style => (
                  <motion.button
                    key={style}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-2 rounded-lg transition-all duration-200 text-xs md:text-sm truncate ${
                      customization.pants === style 
                        ? 'border-2 border-[#44dd44] bg-[#222222] text-[#44dd44]' 
                        : 'border border-[#333333] text-[#666666] hover:border-[#44dd44] hover:text-[#44dd44]'
                    }`}
                    onClick={() => setCustomization(prev => ({ ...prev, pants: style }))}
                  >
                    {style}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Shoes */}
            <div className="mb-6">
              <label className="text-[#44dd44] block mb-2 font-pixel text-xs md:text-sm">Shoes</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {AVATAR_PARTS.shoes.map(style => (
                  <motion.button
                    key={style}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-2 rounded-lg transition-all duration-200 text-xs md:text-sm truncate ${
                      customization.shoes === style 
                        ? 'border-2 border-[#44dd44] bg-[#222222] text-[#44dd44]' 
                        : 'border border-[#333333] text-[#666666] hover:border-[#44dd44] hover:text-[#44dd44]'
                    }`}
                    onClick={() => setCustomization(prev => ({ ...prev, shoes: style }))}
                  >
                    {style}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full p-3 md:p-4 bg-[#44dd44] text-[#111111] font-bold rounded-lg 
                         transition-all duration-200 hover:bg-[#66ff66] font-pixel
                         text-xs md:text-sm shadow-lg hover:shadow-xl"
              onClick={handleSaveAvatar}
            >
              Save Avatar
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
