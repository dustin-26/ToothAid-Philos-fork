/**
 * Preset elementary schools under BOCTOL and JCES.
 * Stored value is the school name string (e.g. "Calabacita ES").
 */

export const CHILD_SCHOOL_GROUPS = [
  {
    district: 'BOCTOL',
    schools: [
      'BOCTOL Elementary School',
      'Calabacita ES',
      'Mayana ES',
      'Lonoy ES',
      'Cabungaan ES',
      'Oding ES',
      'Canipol ES'
    ]
  },
  {
    district: 'JCES',
    schools: [
      'Jagna Central Elementary School',
      'Balili ES',
      'Malbog ES',
      'Cantuyoc ES',
      'Canjulao ES',
      'Tubod Monte ES',
      'Boyog ES',
      'Kinagbaan ES',
      'Bunga Ilaya ES',
      'Bunga Mar ES',
      'Cantagay ES',
      'Can Uba ES',
      'Naatang ES',
      'Larapan ES'
    ]
  }
];

/** Flat list for preset checks and filters. */
export const CHILD_SCHOOL_PRESETS = CHILD_SCHOOL_GROUPS.flatMap((g) => g.schools);

/** `<select>` value when user picks custom school. */
export const CHILD_SCHOOL_UI_OTHER = 'OTHER';

/** Children list filter: non-preset, non-empty school. */
export const CHILD_SCHOOL_FILTER_OTHERS = '__OTHERS__';

export function isPresetChildSchool(s) {
  return CHILD_SCHOOL_PRESETS.includes(String(s ?? '').trim());
}
