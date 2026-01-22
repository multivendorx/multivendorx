export const generateRandomKey = (length = 8): string => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length })
    .map(() =>
      characters.charAt(
        Math.floor(Math.random() * characters.length)
      )
    )
    .join('');
};

export const isSelectAddon = (addon: any) =>
  typeof addon === 'object' && addon?.type === 'select';

export const normalizeValue = (value: any) =>
  typeof value === 'object'
    ? value
    : { value: value ?? '' };
