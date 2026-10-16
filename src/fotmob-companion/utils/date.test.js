import { afterEach, describe, expect, it, vi } from "vitest";
import { formatDateLabel, getLocalDateString, shiftDateString } from "./date";

describe("getLocalDateString", () => {
  it("zero-pads month and day", () => {
    expect(getLocalDateString(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("shiftDateString", () => {
  it("crosses a month end", () => {
    expect(shiftDateString("2026-01-31", 1)).toBe("2026-02-01");
  });

  it("crosses a year end backwards", () => {
    expect(shiftDateString("2026-01-01", -1)).toBe("2025-12-31");
  });

  it("handles a leap day", () => {
    expect(shiftDateString("2028-02-28", 1)).toBe("2028-02-29");
    expect(shiftDateString("2026-02-28", 1)).toBe("2026-03-01");
  });

  it("moves exactly one day over daylight-saving changes", () => {
    expect(shiftDateString("2026-03-28", 1)).toBe("2026-03-29");
    expect(shiftDateString("2026-03-29", 1)).toBe("2026-03-30");
    expect(shiftDateString("2026-10-25", 1)).toBe("2026-10-26");
  });
});

describe("formatDateLabel", () => {
  afterEach(() => vi.useRealTimers());

  it("labels today, yesterday and tomorrow, and other days by weekday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 16, 12));

    expect(formatDateLabel("2026-10-16")).toBe("Today, Oct 16");
    expect(formatDateLabel("2026-10-15")).toBe("Yesterday, Oct 15");
    expect(formatDateLabel("2026-10-17")).toBe("Tomorrow, Oct 17");
    expect(formatDateLabel("2026-10-20")).toBe("Tue, Oct 20");
  });
});
