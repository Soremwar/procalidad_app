import React from "react";
import {
  TextField,
} from "@material-ui/core";

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
