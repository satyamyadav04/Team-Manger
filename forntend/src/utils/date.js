const toDate = (value) => (value ? new Date(value) : null);

export const isPastDate = (value) => {
  const date = toDate(value);
  return Boolean(date) && date.getTime() < Date.now();
};

export const formatDateShort = (value) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(value));

export const formatDateMedium = (value) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));

export const formatRelativeTime = (value) => {
  const date = toDate(value);
  if (!date) {
    return '';
  }

  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, 'minute');
  }
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, 'hour');
  }
  return formatter.format(diffDays, 'day');
};
