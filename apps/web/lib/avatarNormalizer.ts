import { AvatarConfig } from '../components/ui/AvatarSvg';

export function normalizeAvatarConfig(rawConfig: any): AvatarConfig {
  const defaultPreset: AvatarConfig = {
    characterId: 'student',
    hairStyle: 'short',
    hairColor: 'default',
    outfitStyle: 'casual',
    outfitColor: 'electricBlue',
    accessory: 'backpack'
  };

  if (!rawConfig || typeof rawConfig !== 'object') {
    return defaultPreset;
  }

  // Validate characterId
  const validCharacters = ['student', 'office', 'explorer', 'commuter', 'hunter'];
  const characterId = rawConfig.characterId;
  const isCharacterValid = validCharacters.includes(characterId);

  // If characterId is not valid, let's map legacy values or emojis
  let mappedCharId: any = 'student';
  if (isCharacterValid) {
    mappedCharId = characterId;
  } else {
    // Legacy emoji / value mapping
    const legacyMap: Record<string, 'student' | 'office' | 'explorer' | 'commuter' | 'hunter'> = {
      '💼': 'office',
      'backpack': 'student',
      '🎒': 'student',
      'explorer': 'explorer',
      '🚴': 'commuter',
      'running': 'commuter',
      '🏃': 'commuter',
      'hunter': 'hunter',
      'tree': 'student',
      '🌲': 'student'
    };
    if (typeof characterId === 'string' && legacyMap[characterId]) {
      mappedCharId = legacyMap[characterId];
    } else {
      mappedCharId = 'student';
    }
  }

  // Defaults for chosen characterId
  const presetDefaults: Record<string, AvatarConfig> = {
    student: { characterId: 'student', hairStyle: 'short', hairColor: 'default', outfitStyle: 'casual', outfitColor: 'electricBlue', accessory: 'backpack' },
    office: { characterId: 'office', hairStyle: 'curly', hairColor: 'default', outfitStyle: 'formal', outfitColor: 'electricBlue', accessory: 'glasses' },
    explorer: { characterId: 'explorer', hairStyle: 'long', hairColor: 'beige', outfitStyle: 'casual', outfitColor: 'urbanBeige', accessory: 'headphones' },
    commuter: { characterId: 'commuter', hairStyle: 'cap', hairColor: 'default', outfitStyle: 'sporty', outfitColor: 'vibrantGreen', accessory: 'none' },
    hunter: { characterId: 'hunter', hairStyle: 'curly', hairColor: 'green', outfitStyle: 'sporty', outfitColor: 'vibrantGreen', accessory: 'headphones' }
  };

  const defaultForChar = presetDefaults[mappedCharId];

  // Whitelist values validation
  const validHairStyles = ['short', 'long', 'curly', 'cap'];
  const validHairColors = ['default', 'blue', 'green', 'beige'];
  const validOutfitStyles = ['casual', 'formal', 'sporty'];
  const validOutfitColors = ['electricBlue', 'vibrantGreen', 'urbanBeige'];
  const validAccessories = ['none', 'glasses', 'headphones', 'backpack'];

  const hairStyle = validHairStyles.includes(rawConfig.hairStyle) ? rawConfig.hairStyle : defaultForChar.hairStyle;
  const hairColor = validHairColors.includes(rawConfig.hairColor) ? rawConfig.hairColor : defaultForChar.hairColor;
  const outfitStyle = validOutfitStyles.includes(rawConfig.outfitStyle) ? rawConfig.outfitStyle : defaultForChar.outfitStyle;
  const outfitColor = validOutfitColors.includes(rawConfig.outfitColor) ? rawConfig.outfitColor : defaultForChar.outfitColor;
  const accessory = validAccessories.includes(rawConfig.accessory) ? rawConfig.accessory : defaultForChar.accessory;

  return {
    characterId: mappedCharId,
    hairStyle,
    hairColor,
    outfitStyle,
    outfitColor,
    accessory
  };
}
