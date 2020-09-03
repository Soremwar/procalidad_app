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
* This returns a FileList object
*/
export default function InputField({
  accept,
  disabled = false,
  fullWidth = false,
  label,
  multiple = false,
  name,
  onChange,
  required = false,
}) {
  return (
    <TextField
      accept={accept}
      disabled={disabled}
      fullWidth={fullWidth}
      label={label}
      multiple={multiple}
      name={name}
      onChange={(event) => onChange(event.target.files)}
      required={required}
      type="file"
      InputLabelProps={{
        shrink: true,
      }}
    />
  );
}
