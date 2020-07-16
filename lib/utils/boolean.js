/*
* Casts string as a boolean value
* If string is different than "true" or "false" it will throw
* @param {string} string - Variation of 
*/
export const castStringToBoolean = (string) => {
  string = String(string).trim().toLocaleLowerCase();
  switch (string) {
    case "true":
      return true;
    case "false":
      return false;
    default:
      throw new Error(`A value different to "true" or "false" was provided`);
  }
};
