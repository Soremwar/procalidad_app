type DateRange = [Date, Date];

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
