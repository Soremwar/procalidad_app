/*
* Validation schema for a boolean value or string
* */
export const BOOLEAN = {
  pattern: "^true|false$",
  type: ["string", "boolean"],
};

/*
* Validation schema for a cellphone
* */
export const CELLPHONE = {
  pattern: "^\\d{10}$",
  type: ["number", "string"],
};

/*
* Validation schema for a numeric number
* Will fail on numeric string
* */
export const NUMBER = (min, max) => {
  const params = {
    type: "number",
  };
  if (typeof min === "number" && !Number.isNaN(min)) {
    params.min = min;
  }
  if (typeof max === "number" && !Number.isNaN(max)) {
    params.max = max;
  }

  return params;
};

/*
* Validation schema for a YYYYMMDD format date string
* */
export const STANDARD_DATE_STRING = {
  pattern: "^\\d{4}-\\d{2}-\\d{2}$",
  type: "string",
};

/*
* Validation schema for a YYYYMMDD format date string
* */
export const STANDARD_DATE_STRING_OR_NULL = {
  pattern: "^\\d{4}-\\d{2}-\\d{2}$",
  type: ["string", "null"],
};

/*
* Validation schema for strings with customizable pattern and length
* */
export const STRING = (
  length,
  pattern,
) => {
  const params = {
    type: "string",
  };

  if (length) {
    params.maxLength = length;
  }
  if (pattern) {
    params.pattern = pattern;
  }

  return params;
};

/*
* Validation schema for a positive integer
* */
export const TRUTHY_INTEGER = {
  minimum: 1,
  pattern: "^[0-9]*[1-9][0-9]*$",
  type: ["string", "number"],
};

/*
* Validation schema for a positive integer
* */
export const TRUTHY_INTEGER_OR_EMPTY = {
  minimum: 1,
  pattern: "^[0-9]*[1-9][0-9]*$|^(?![\\s\\S])",
  type: ["string", "number"],
};

/*
* Validation schema for a positive integer
* */
export const TRUTHY_INTEGER_OR_NULL = {
  minimum: 1,
  pattern: "^[0-9]*[1-9][0-9]*$",
  type: ["string", "null", "number"],
};

/*
* Validation schema for a numeric unsigned number
* */
export const UNSIGNED_NUMBER = {
  minimum: 0,
  pattern: "^[0-9]+([\\.][0-9]+)?$",
  type: ["string", "number"],
};
