
export const colors = {
  navy: '#0F3150',
  brand: '#2A6CA8',
  ink: '#14273D',
  text2: '#3B4C5E',
  muted: '#6B7A8C',
  placeholder: '#8593A3',
  chevron: '#A3AFBC',
  border: '#DCE3EA',
  borderSoft: '#E6EBF0',
  divider: '#EEF2F5',
  mist: '#F3F6F9',
  white: '#FFFFFF',
  backdrop: 'rgba(20, 39, 61, 0.45)',
  navySoft: '#E6EEF6',
  navyText: '#B9C8D8',
  success: '#1F8A5B',
  successSoft: '#E3F4EC',
  danger: '#C2362F',
  dangerBorder: '#F0C8C4',
  infoSoft: '#EEF4FA',
  infoText: '#1F4B78',
};

export const radius = { sm: 9, md: 10, lg: 12, xl: 14, xxl: 16, sheet: 22, pill: 999 };

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };

export const fonts = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
};

export const type = {
  display: { fontFamily: fonts.extrabold, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, color: colors.navy },
  h1: { fontFamily: fonts.extrabold, fontSize: 24, lineHeight: 30, letterSpacing: -0.4, color: colors.navy },
  h2: { fontFamily: fonts.extrabold, fontSize: 20, lineHeight: 26, letterSpacing: -0.3, color: colors.navy },
  title: { fontFamily: fonts.extrabold, fontSize: 17, lineHeight: 22, color: colors.ink },
  body: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, color: colors.ink },
  bodyStrong: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 21, color: colors.ink },
  label: { fontFamily: fonts.bold, fontSize: 14, lineHeight: 19, color: colors.ink },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.muted },
  small: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16, color: colors.muted },
  link: { fontFamily: fonts.bold, fontSize: 14, lineHeight: 19, color: colors.brand },
};

export const WASTE_TYPES = {
  reciclavel: {
    key: 'reciclavel',
    value: 'Material Reciclável',
    label: 'Reciclável',
    longLabel: 'Reciclável',
    hint: 'Plástico, metal e vidro',
    icon: 'recycle',
    color: '#F2B130',
    bg: '#FDF2D9',
    fg: '#8A5D00',
  },
  papel: {
    key: 'papel',
    value: 'Papel Reciclável',
    label: 'Papel',
    longLabel: 'Papel reciclável',
    hint: 'Papel e papelão',
    icon: 'file-document-outline',
    color: '#3F72E0',
    bg: '#E6EEFD',
    fg: '#1D4AA6',
  },
  naoReciclavel: {
    key: 'naoReciclavel',
    value: 'Não Reciclável',
    label: 'Não reciclável',
    longLabel: 'Não reciclável',
    hint: 'Rejeitos e orgânicos',
    icon: 'trash-can-outline',
    color: '#4B5563',
    bg: '#ECEEF1',
    fg: '#2E3640',
  },
};

export const WASTE_ORDER = ['reciclavel', 'papel', 'naoReciclavel'];

export const wasteFromValue = (value = '') => {
  const v = value.toLowerCase();
  if (v.includes('papel')) return WASTE_TYPES.papel;
  if (v.includes('não') || v.includes('nao')) return WASTE_TYPES.naoReciclavel;
  return WASTE_TYPES.reciclavel;
};

export const BAG_SIZES = [1, 10, 20, 30, 40, 60, 80, 100];

export const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };
