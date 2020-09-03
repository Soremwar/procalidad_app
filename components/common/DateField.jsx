import React, {
  useEffect,
  useState,
} from "react";
import {
  TextField,
} from "@material-ui/core";
import {
  parseStandardString,
} from "../../lib/date/mod.js";

/*
* This works based on YYYY-MM-DD date strings
*/
export default function DateField({
  disabled = false,
  fullWidth = false,
  label,
  name,
  onChange,
  required = false,
  value,
}) {
  return (
    <TextField
      disabled={disabled}
      fullWidth={fullWidth}
      label={label}
      name={name}
      onChange={onChange}
      required={required}
      type="date"
      InputLabelProps={{
        shrink: true,
      }}
      value={value}
    />
  );
}
