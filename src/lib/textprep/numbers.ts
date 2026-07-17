/**
 * Deterministic number-to-speakable-text expansion (English, v1).
 * Pure functions, no AI. Order of application inside expandNumbers:
 * currency -> percent -> ordinals -> years -> plain numbers.
 *
 * Heuristic (documented): a bare 4-digit number between 1100 and 2099 is
 * read as a year ("nineteen ninety-nine"). Currency and percent forms are
 * exempt. The whole transform is user-toggleable.
 */

const ONES = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];

const TENS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

const SCALES = ["", " thousand", " million", " billion", " trillion"];

const ORDINAL_SPECIAL: Record<string, string> = {
  one: "first",
  two: "second",
  three: "third",
  five: "fifth",
  eight: "eighth",
  nine: "ninth",
  twelve: "twelfth",
};

function belowHundredToWords(n: number): string {
  if (n < 20) return ONES[n];
  const tens = TENS[Math.floor(n / 10)];
  const rest = n % 10;
  return rest === 0 ? tens : `${tens}-${ONES[rest]}`;
}

function belowThousandToWords(n: number): string {
  if (n < 100) return belowHundredToWords(n);
  const hundreds = `${ONES[Math.floor(n / 100)]} hundred`;
  const rest = n % 100;
  return rest === 0 ? hundreds : `${hundreds} ${belowHundredToWords(rest)}`;
}

export function integerToWords(value: number): string {
  if (!Number.isFinite(value)) return String(value);
  if (value < 0) return `minus ${integerToWords(-value)}`;
  const n = Math.floor(value);
  if (n === 0) return "zero";
  if (n >= 1e15) return String(n); // beyond trillions: leave as-is, honestly

  const parts: string[] = [];
  let remaining = n;
  const groups: number[] = [];
  while (remaining > 0) {
    groups.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }
  for (let i = groups.length - 1; i >= 0; i -= 1) {
    const group = groups[i];
    if (group > 0) {
      parts.push(`${belowThousandToWords(group)}${SCALES[i]}`);
    }
  }
  return parts.join(" ");
}

export function ordinalToWords(n: number): string {
  const cardinal = integerToWords(n);
  const words = cardinal.split(/([\s-])/);
  const last = words[words.length - 1];
  let ordinalLast: string;
  if (ORDINAL_SPECIAL[last]) {
    ordinalLast = ORDINAL_SPECIAL[last];
  } else if (last.endsWith("y")) {
    ordinalLast = `${last.slice(0, -1)}ieth`;
  } else {
    ordinalLast = `${last}th`;
  }
  words[words.length - 1] = ordinalLast;
  return words.join("");
}

function digitsToWords(digits: string): string {
  return digits
    .split("")
    .map((d) => ONES[Number(d)])
    .join(" ");
}

export function decimalToWords(whole: string, fraction: string): string {
  return `${integerToWords(Number(whole))} point ${digitsToWords(fraction)}`;
}

export function yearToWords(year: number): string {
  if (year % 1000 === 0) return integerToWords(year);
  const high = Math.floor(year / 100);
  const low = year % 100;
  if (year >= 2000 && year < 2010) {
    return `two thousand${low === 0 ? "" : ` ${belowHundredToWords(low)}`}`;
  }
  if (low === 0) return `${belowHundredToWords(high)} hundred`;
  if (low < 10) {
    return `${belowHundredToWords(high)} oh ${ONES[low]}`;
  }
  return `${belowHundredToWords(high)} ${belowHundredToWords(low)}`;
}

const CURRENCY: Record<string, { one: string; many: string; cent: string; cents: string }> = {
  $: { one: "dollar", many: "dollars", cent: "cent", cents: "cents" },
  "£": { one: "pound", many: "pounds", cent: "penny", cents: "pence" },
  "€": { one: "euro", many: "euros", cent: "cent", cents: "cents" },
  "₹": { one: "rupee", many: "rupees", cent: "paisa", cents: "paise" },
};

function stripGroupSeparators(digits: string): string {
  return digits.replace(/,/g, "");
}

function expandCurrency(text: string): string {
  return text.replace(
    /([$£€₹])(\d[\d,]*)(?:\.(\d{1,2}))?/g,
    (_match, symbol: string, whole: string, cents?: string) => {
      const unit = CURRENCY[symbol];
      const amount = Number(stripGroupSeparators(whole));
      const amountWords = integerToWords(amount);
      const unitWord = amount === 1 ? unit.one : unit.many;
      if (!cents) return `${amountWords} ${unitWord}`;
      const centValue = Number(cents.length === 1 ? `${cents}0` : cents);
      if (centValue === 0) return `${amountWords} ${unitWord}`;
      const centWord = centValue === 1 ? unit.cent : unit.cents;
      return `${amountWords} ${unitWord} and ${integerToWords(centValue)} ${centWord}`;
    }
  );
}

function expandPercent(text: string): string {
  return text.replace(
    /(\d[\d,]*)(?:\.(\d+))?\s?%/g,
    (_match, whole: string, fraction?: string) => {
      const cleanWhole = stripGroupSeparators(whole);
      const words = fraction
        ? decimalToWords(cleanWhole, fraction)
        : integerToWords(Number(cleanWhole));
      return `${words} percent`;
    }
  );
}

function expandOrdinals(text: string): string {
  return text.replace(
    /\b(\d[\d,]*)(st|nd|rd|th)\b/g,
    (_match, digits: string) => ordinalToWords(Number(stripGroupSeparators(digits)))
  );
}

function expandYears(text: string): string {
  return text.replace(/\b(1[1-9]\d\d|20\d\d)\b/g, (match) =>
    yearToWords(Number(match))
  );
}

function expandPlainNumbers(text: string): string {
  return text.replace(
    /\b(\d[\d,]*)(?:\.(\d+))?\b/g,
    (match, whole: string, fraction?: string) => {
      const clean = stripGroupSeparators(whole);
      if (clean.length > 15) return match;
      if (fraction) return decimalToWords(clean, fraction);
      return integerToWords(Number(clean));
    }
  );
}

/** Full pipeline. Pure; returns a new string. */
export function expandNumbers(text: string): string {
  let out = expandCurrency(text);
  out = expandPercent(out);
  out = expandOrdinals(out);
  out = expandYears(out);
  out = expandPlainNumbers(out);
  return out;
}
