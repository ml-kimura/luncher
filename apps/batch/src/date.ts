export const toJstDateString = (date: Date): string => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
};

export const resolveLunchDate = (raw?: string): string => {
  if (!raw) {
    return toJstDateString(new Date());
  }

  const parsed = new Date(`${raw}T00:00:00+09:00`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid lunchDate format: ${raw}`);
  }
  return toJstDateString(parsed);
};
