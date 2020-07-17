/*
* Validation schema for a positive integer
* */
export const TRUTHY_INTEGER = {
  minimum: 1,
  pattern: "^[0-9]*[1-9][0-9]*$",
  type: ["string", "number"],
};

/*
* Validation schema for a numeric unsigned number
* */
export const UNSIGNED_NUMBER = {
  minimum: 0,
  pattern: "^[0-9]+([\\.][0-9]+)?$",
  type: ["string", "number"],
};

/*
* Validation schema for a boolean value or string
* */
export const BOOLEAN = {
  exclusiveMinimum: 0,
  regexp: {
    flags: "i",
    pattern: "^true$|^false$",
  },
  type: ["string", "boolean"],
};
