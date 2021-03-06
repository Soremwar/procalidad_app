//TODO
//Limit types of controls: Boolean should only receive boolean not string

/*
* Validation schema for a boolean value or string
* */
export const BOOLEAN = {
  pattern: "^true|false$",
  type: ["string", "boolean"],
};

/*
* Validation schema for a boolean value or a null value
* */
export const BOOLEAN_OR_NULL = {
  pattern: "^true|false$",
  type: ["string", "boolean", "null"],
};

/*
* Validation schema for a cellphone
* */
export const CELLPHONE = {
  pattern: "^\\d{10}$",
  type: ["number", "string"],
};

/**
*   Validation schema for emails
*   Max length for emails is always defined as `320`
*/
export const EMAIL = {
  format: "email",
  maxLength: 320,
  type: "string",
};

/**
 * Validation schema for integer numbers
 * Will fail on numeric string
 */
export const INTEGER = ({
  max = Number.MAX_SAFE_INTEGER,
  min = Number.MIN_SAFE_INTEGER,
}) => {
  const params = {
    multipleOf: 1,
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

/**
 * Validation schema for integer numbers or null values
 * Will fail on numeric string
 */
export const INTEGER_OR_NULL = ({
  max = Number.MAX_SAFE_INTEGER,
  min = Number.MIN_SAFE_INTEGER,
}) => {
  const params = INTEGER({ min, max });

  params.type = ["number", "null"];

  return params;
};

/**
 * Validation schema for integer/decimal numbers
 * Will fail on numeric string
 * 
 * @param {Object} properties
 * @param {number=} properties.max
 * @param {number=} properties.min
 * @param {number=} properties.multipleOf The multiplier for the values
 **/
export const NUMBER = ({
  max = Number.MAX_SAFE_INTEGER,
  min = Number.MIN_SAFE_INTEGER,
  multipleOf,
}) => {
  const params = {
    type: "number",
  };
  if (typeof min === "number" && !Number.isNaN(min)) {
    params.min = min;
  }
  if (typeof max === "number" && !Number.isNaN(max)) {
    params.max = max;
  }
  if (typeof multipleOf === "number" && !Number.isNaN(multipleOf)) {
    params.multipleOf = multipleOf;
  }

  return params;
};

/*
* Validation schema for a phone number
* All unsigned integers from 0 to 999999999999999
* */
export const PHONE = {
  max: 999999999999999,
  min: 0,
  type: "number",
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
  values,
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
  if (values) {
    params.enum = values;
  }

  return params;
};

/** 
 * Validation schema for strings with customizable pattern and length and values.
 * Allows nulls
 * @param {object} [options=]
 * @param {number} [options.max=]
 * @param {number} [options.min=]
 * @param {string} [options.pattern=] Regex string
 * @param {string[]} [options.values=]
 * */
export const STRING_OR_NULL = ({
  max,
  min,
  pattern,
  values,
}) => {
  const params = {
    type: ["string", "null"],
  };

  if (max) {
    params.maxLength = max;
  }
  if (min) {
    params.minLength = min;
  }
  if (pattern) {
    params.pattern = pattern;
  }
  if (values) {
    params.enum = values;
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
