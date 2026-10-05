// Persian Jalali date and time utilities using standard Intl API

export function getShamsiDateString(date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('fa-IR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return formatter.format(date);
  } catch {
    return date.toLocaleDateString('fa-IR');
  }
}

export function getFormattedTimeString(date: Date = new Date()): {
  hours: string;
  minutes: string;
  seconds: string;
} {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return {
    hours: pad(date.getHours()),
    minutes: pad(date.getMinutes()),
    seconds: pad(date.getSeconds()),
  };
}

export function formatPersianNumber(val: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return val.toString().replace(/\d/g, (d) => persianDigits[parseInt(d, 10)]);
}
