export const DEFAULT_TIME_ZONE = "America/Mexico_City";

type DateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string) {
  const cached = dateTimeFormatters.get(timeZone);
  if (cached) return cached;

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  dateTimeFormatters.set(timeZone, formatter);
  return formatter;
}

function getLocalParts(date: Date, timeZone: string): DateParts {
  const values = Object.fromEntries(
    getFormatter(timeZone)
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );

  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour === 24 ? 0 : values.hour,
    minute: values.minute,
    second: values.second,
  };
}

function getTimeZoneOffset(date: Date, timeZone: string) {
  const parts = getLocalParts(date, timeZone);
  const localAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  return localAsUtc - date.getTime();
}

function zonedDateTimeToUtc(
  input: Pick<DateParts, "year" | "month" | "day"> & Partial<Pick<DateParts, "hour" | "minute" | "second">>,
  timeZone: string,
) {
  const utcGuess = Date.UTC(
    input.year,
    input.month - 1,
    input.day,
    input.hour ?? 0,
    input.minute ?? 0,
    input.second ?? 0,
  );
  const firstOffset = getTimeZoneOffset(new Date(utcGuess), timeZone);
  const firstResult = new Date(utcGuess - firstOffset);
  const secondOffset = getTimeZoneOffset(firstResult, timeZone);

  return new Date(utcGuess - secondOffset);
}

export function getDayBoundsForTimeZone(date = new Date(), timeZone = DEFAULT_TIME_ZONE) {
  const parts = getLocalParts(date, timeZone);
  const start = zonedDateTimeToUtc(parts, timeZone);
  const nextDay = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + 1));
  const end = zonedDateTimeToUtc(
    {
      year: nextDay.getUTCFullYear(),
      month: nextDay.getUTCMonth() + 1,
      day: nextDay.getUTCDate(),
    },
    timeZone,
  );

  return { start, end };
}

export function getDayBoundsForLocalDate(value: string, timeZone = DEFAULT_TIME_ZONE) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

  if (!match) {
    return getDayBoundsForTimeZone(new Date(value), timeZone);
  }

  const [, year, month, day] = match;
  const start = zonedDateTimeToUtc(
    {
      year: Number(year),
      month: Number(month),
      day: Number(day),
    },
    timeZone,
  );
  const nextDay = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day) + 1));
  const end = zonedDateTimeToUtc(
    {
      year: nextDay.getUTCFullYear(),
      month: nextDay.getUTCMonth() + 1,
      day: nextDay.getUTCDate(),
    },
    timeZone,
  );

  return { start, end };
}

export function getDateTimeForTimeZone(
  dateValue: string,
  timeValue = "00:00",
  timeZone = DEFAULT_TIME_ZONE,
) {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  const timeMatch = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(timeValue || "00:00");

  if (!dateMatch) {
    return new Date(dateValue);
  }

  const [, year, month, day] = dateMatch;
  const [, hour = "0", minute = "0", second = "0"] = timeMatch ?? [];

  return zonedDateTimeToUtc(
    {
      year: Number(year),
      month: Number(month),
      day: Number(day),
      hour: Number(hour),
      minute: Number(minute),
      second: Number(second),
    },
    timeZone,
  );
}
