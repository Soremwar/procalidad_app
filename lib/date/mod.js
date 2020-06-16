/*
* This function parses an standard date number and returns a Date object
* @param {number} date - A number containing a YYYYMMDD type date
* */
const parseStandardNumber = (date) => {
  const date_string = String(date);

  const date_object = new Date(
    Number(date_string.substr(0, 4)),
    Number(date_string.substr(4, 2) - 1),
    Number(date_string.substr(6, 2)),
  );

  return (
    date_object.getFullYear() == date_string.substr(0, 4) &&
    date_object.getMonth() == date_string.substr(4, 2) - 1 &&
    date_object.getDate() == date_string.substr(6, 2)
  ) ? date_object : NaN;
}

/*
* This function parses a date and returns a standard date number
* @param {Date} date - A date object
* */
const parseDateToStandardNumber = (date) => {
  const offset = date.getTimezoneOffset();
  const validated_date = new Date(date.getTime() - (offset * 60 * 1000));
  return Number.parseInt(validated_date.toISOString().slice(0, 10).replace(/-/g, ""));
};

export {
  parseDateToStandardNumber,
  parseStandardNumber,
};