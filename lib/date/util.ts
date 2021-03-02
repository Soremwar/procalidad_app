type DateRange = [Date, Date];

/**
 * This function will check if two dates have a difference greater than one day
 */
export const dateRangeHasDifference = (a: Date, b: Date) => {
  if (Math.abs(a.getTime() - b.getTime()) > 86400000) {
    return true;
  }

  return false;
};

/**
 * Overlapping will also check that dates aren't equal and marked them as overlapping if so
 */
export const dateRangeOverlaps = (
  range_a: DateRange,
  range_b: DateRange,
): boolean => {
  const range_a_start = range_a[0].getTime();
  const range_a_end = range_a[1].getTime();
  const range_b_start = range_b[0].getTime();
  const range_b_end = range_b[1].getTime();

  // If range_b start is between range_a
  if (
    range_b_start >= range_a_start && range_b_start <= range_a_end
  ) {
    return true;
  }
  // If range_b end is between range_a
  if (range_b_end >= range_a_start && range_b_end <= range_a_end) return true;
  // Cornercase
  // If a is completely contained inside b the validations before will fail
  if (range_a_start > range_b_start && range_a_end < range_b_end) return true;
  return false;
};

/**
 * This function will check if the date ranges passed to it are all continuous,
 * meaning there is no interval between them longer than a single day
 */
export const multipleDateRangesAreContinuous = (
  ranges: DateRange[],
): boolean => {
  if (ranges.length < 2) {
    throw new RangeError(
      "You need to provide at least two dates in order if they are continuous",
    );
  }

  // Sort by start dates
  const dates = ranges
    .sort(([a], [b]) => {
      if (a.getTime() === b.getTime()) return 0;
      if (a > b) {
        return 1;
      }
      return -1;
    });

  let is_continuous = true;
  for (let x = 0; x < dates.length - 1; x++) {
    const range_1 = dates[x];
    const range_2 = dates[x + 1];

    // Compare difference between the end date of the first range and the
    // start date of the second range
    if (dateRangeHasDifference(range_1[1], range_2[0])) {
      is_continuous = false;
      break;
    }
  }

  return is_continuous;
};

export const multipleDateRangesOverlap = (ranges: DateRange[]): boolean => {
  if (ranges.length < 2) {
    throw new RangeError(
      "You need to provide at least two dates in order to check overlapping",
    );
  }

  let current_range = ranges.shift();
  while (ranges.length) {
    for (const range of ranges) {
      if (dateRangeOverlaps(current_range!, range)) {
        return true;
      }
    }
    current_range = ranges.shift();
  }

  return false;
};
