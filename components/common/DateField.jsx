import React from "react";
import { TextField } from "@material-ui/core";

/**
 * @callback valueCallback
 * @param {ChangeEvent} event
 * */

/**
* This works based on YYYY-MM-DD date strings
 * @param {object} props
 * @param {boolean} [props.disabled = false]
 * @param {boolean} [props.fullWidth = false]
 * @param {string} props.label
 * @param {string} props.name
 * @param {valueCallback} props.onChange
 * @param {boolean} [props.required = false]
 * @param {string} props.value A YYYY-MM-DD date string
*/
export default function DateField({
  disabled = false,
  fullWidth = false,
  InputProps,
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
      InputProps={InputProps}
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
