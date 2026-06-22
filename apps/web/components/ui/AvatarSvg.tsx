'use client';

import React from 'react';

export interface AvatarConfig {
  characterId: 'student' | 'office' | 'explorer' | 'commuter' | 'hunter';
  hairStyle?: 'short' | 'long' | 'curly' | 'cap';
  hairColor?: 'default' | 'blue' | 'green' | 'beige';
  outfitStyle?: 'casual' | 'formal' | 'sporty';
  outfitColor?: 'electricBlue' | 'vibrantGreen' | 'urbanBeige';
  accessory?: 'none' | 'glasses' | 'headphones' | 'backpack';
}

interface AvatarSvgProps {
  config: AvatarConfig;
  className?: string;
  size?: number | string;
}

export function AvatarSvg({ config, className = '', size = '100%' }: AvatarSvgProps) {
  const {
    characterId,
    hairStyle = 'short',
    hairColor = 'default',
    outfitStyle = 'casual',
    outfitColor = 'electricBlue',
    accessory = 'none'
  } = config;

  // Colors mapping based on the campaign guidelines
  const palette = {
    electricBlue: '#0066FF',
    vibrantGreen: '#9FCE1A',
    urbanBeige: '#FFF3DD',
    ink: '#0A1118',
    white: '#FFFFFF',
    skin: '#FFE5D9',
    skinShadow: '#FCD5C6',
    gray: '#6B7280',
    lightGray: '#E5E7EB'
  };

  // Resolve Hair color
  let fillHairColor = palette.ink;
  if (hairColor === 'blue') fillHairColor = palette.electricBlue;
  if (hairColor === 'green') fillHairColor = palette.vibrantGreen;
  if (hairColor === 'beige') fillHairColor = '#D97706'; // Golden brown

  // Resolve Outfit color
  let fillOutfitColor = palette.electricBlue;
  if (outfitColor === 'vibrantGreen') fillOutfitColor = palette.vibrantGreen;
  if (outfitColor === 'urbanBeige') fillOutfitColor = '#E2E8F0'; // Fallback to premium cool grey for contrast
  if (outfitColor === 'electricBlue') fillOutfitColor = palette.electricBlue;

  // Render Background circles depending on Character
  const bgGlow = characterId === 'student' ? palette.electricBlue :
                 characterId === 'office' ? '#00D2FF' :
                 characterId === 'explorer' ? palette.vibrantGreen :
                 characterId === 'commuter' ? '#FBBF24' : '#EC4899';

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`rounded-full shadow-inner bg-slate-900 overflow-hidden select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle / aura */}
      <circle cx="50" cy="50" r="48" fill={`${bgGlow}15`} stroke={`${bgGlow}30`} strokeWidth="1.5" />
      <circle cx="50" cy="50" r="42" fill={`${bgGlow}10`} />

      {/* Hair (Back layer for long hair) */}
      {hairStyle === 'long' && (
        <path
          d="M 28,45 C 28,25 72,25 72,45 C 72,60 76,68 76,82 C 72,82 28,82 24,82 C 24,68 28,60 28,45 Z"
          fill={fillHairColor}
        />
      )}

      {/* Torso / Body */}
      {/* Base shoulder shape */}
      <path
        d="M 22,86 C 22,76 30,70 42,68 L 58,68 C 70,70 78,76 78,86 C 78,92 78,100 78,100 L 22,100 L 22,86 Z"
        fill={fillOutfitColor}
      />

      {/* Outfit details (Casual, Formal, Sporty) */}
      {outfitStyle === 'formal' && (
        <>
          {/* White Shirt V collar */}
          <path d="M 45,68 L 50,78 L 55,68 Z" fill={palette.white} />
          {/* Tie or Collar flaps */}
          <path d="M 50,78 L 47,88 L 50,92 L 53,88 Z" fill={palette.electricBlue} />
          <path d="M 42,68 L 47,78 L 45,68 Z" fill={`${fillOutfitColor}bb`} />
          <path d="M 58,68 L 53,78 L 55,68 Z" fill={`${fillOutfitColor}bb`} />
        </>
      )}

      {/* Sporty Zipped Hoodie */}
      {outfitStyle === 'sporty' && (
        <>
          {/* Hoodie inner V */}
          <path d="M 44,68 L 50,76 L 56,68 Z" fill={palette.ink} />
          {/* Zip line */}
          <line x1="50" y1="76" x2="50" y2="92" stroke={palette.white} strokeWidth="1.5" strokeLinecap="round" />
          {/* Neon green accents */}
          <circle cx="50" cy="78" r="1.5" fill={palette.vibrantGreen} />
        </>
      )}

      {/* Casual T-shirt */}
      {outfitStyle === 'casual' && (
        <>
          {/* Neck round cutout */}
          <path d="M 42,68 C 42,74 58,74 58,68 Z" fill={palette.skin} />
          {/* Stripe pattern or simple leaf badge on chest */}
          <path d="M 50,76 L 51,78 L 50,80 L 49,78 Z" fill={palette.vibrantGreen} />
        </>
      )}

      {/* Neck */}
      <rect x="44" y="60" width="12" height="10" rx="3" fill={palette.skin} />
      <path d="M 44,65 C 47,69 53,69 56,65 Z" fill={palette.skinShadow} />

      {/* Head / Face */}
      <rect x="33" y="32" width="34" height="32" rx="14" fill={palette.skin} />

      {/* Cheeks blush */}
      <circle cx="39" cy="51" r="2.5" fill="#FFA5A5" opacity="0.6" />
      <circle cx="61" cy="51" r="2.5" fill="#FFA5A5" opacity="0.6" />

      {/* Eyes */}
      <circle cx="43" cy="46" r="1.8" fill={palette.ink} />
      <circle cx="57" cy="46" r="1.8" fill={palette.ink} />
      {/* Eyebrows */}
      <path d="M 39,42 C 41,41 44,42 45,43" stroke={fillHairColor} strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M 61,42 C 59,41 56,42 55,43" stroke={fillHairColor} strokeWidth="1" strokeLinecap="round" fill="none" />

      {/* Nose */}
      <path d="M 50,47 L 50,51" stroke={palette.skinShadow} strokeWidth="1.5" strokeLinecap="round" />

      {/* Mouth */}
      <path d="M 46,55 Q 50,59 54,55" stroke={palette.ink} strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Hair (Front layer) */}
      {hairStyle === 'short' && (
        <>
          {/* Short spikes / side cuts */}
          <path
            d="M 30,36 C 35,26 65,26 70,36 C 71,38 70,41 68,40 C 65,39 60,34 50,34 C 40,34 35,39 32,40 C 30,41 29,38 30,36 Z"
            fill={fillHairColor}
          />
        </>
      )}

      {hairStyle === 'long' && (
        <>
          {/* Hair bangs / fringe */}
          <path
            d="M 32,38 C 38,28 62,28 68,38 C 66,35 60,33 50,33 C 40,33 34,35 32,38 Z"
            fill={fillHairColor}
          />
        </>
      )}

      {hairStyle === 'curly' && (
        <>
          {/* Curly hair blobs using multiple overlapping circles/arcs */}
          <path
            d="M 31,34 C 27,38 27,46 32,46 C 36,46 36,40 40,43 C 44,46 44,38 48,40 C 52,42 54,46 58,44 C 62,42 63,46 67,44 C 71,42 72,36 68,32 C 64,28 60,26 50,26 C 40,26 34,29 31,34 Z"
            fill={fillHairColor}
          />
        </>
      )}

      {hairStyle === 'cap' && (
        <>
          {/* Cool Cap front-facing or side-slanted */}
          <path d="M 31,36 C 31,23 69,23 69,36 Z" fill={palette.vibrantGreen} />
          {/* Cap brim */}
          <path d="M 30,36 Q 50,34 70,36 Q 73,38 72,40 C 70,42 50,42 30,39 Z" fill={palette.vibrantGreen} />
          {/* Cap button/logo */}
          <circle cx="50" cy="24" r="2" fill={palette.white} />
          <path d="M 48,32 L 52,32 L 50,29 Z" fill={palette.white} />
        </>
      )}

      {/* Accessory (Backpack - rendered as straps) */}
      {accessory === 'backpack' && (
        <>
          {/* Left strap */}
          <path
            d="M 32,70 C 32,70 34,78 35,84 C 36,90 32,100 32,100"
            stroke={palette.vibrantGreen}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Right strap */}
          <path
            d="M 68,70 C 68,70 66,78 65,84 C 64,90 68,100 68,100"
            stroke={palette.vibrantGreen}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Leaf clip on strap */}
          <circle cx="34" cy="76" r="2.5" fill={palette.white} />
          <circle cx="34" cy="76" r="1.5" fill={palette.vibrantGreen} />
        </>
      )}

      {/* Accessory (Glasses) */}
      {accessory === 'glasses' && (
        <>
          {/* Left frame */}
          <rect x="36" y="42" width="10" height="8" rx="2" stroke={palette.electricBlue} strokeWidth="1.5" fill="none" />
          {/* Right frame */}
          <rect x="54" y="42" width="10" height="8" rx="2" stroke={palette.electricBlue} strokeWidth="1.5" fill="none" />
          {/* Bridge */}
          <line x1="46" y1="46" x2="54" y2="46" stroke={palette.electricBlue} strokeWidth="1.5" />
          {/* Side bars */}
          <line x1="33" y1="45" x2="36" y2="45" stroke={palette.electricBlue} strokeWidth="1.5" />
          <line x1="64" y1="45" x2="67" y2="45" stroke={palette.electricBlue} strokeWidth="1.5" />
        </>
      )}

      {/* Accessory (Headphones) */}
      {accessory === 'headphones' && (
        <>
          {/* Band over head */}
          <path
            d="M 33,45 C 33,18 67,18 67,45"
            stroke={palette.ink}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Left ear pad */}
          <rect x="29" y="40" width="5" height="12" rx="2.5" fill={palette.electricBlue} stroke={palette.ink} strokeWidth="1" />
          {/* Right ear pad */}
          <rect x="66" y="40" width="5" height="12" rx="2.5" fill={palette.electricBlue} stroke={palette.ink} strokeWidth="1" />
        </>
      )}
    </svg>
  );
}
