import React, { useState } from "react";
import {
  FormControl,
  FormHelperText,
  InputLabel,
  NativeSelect,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import hashGenerator from "../../lib/hash_generator/mod.js";

const useStyles = makeStyles((theme) => ({
  formControl: {
    minWidth: 120,
  },
}));

/**
 * @callback valueCallback
 * @param {ChangeEvent} event
 * */

/**
 * @param {object} SelectProps
 * @param {string=} label
 * @param {string=} name
 * @param {boolean | valueCallback} [onChange=false]
 * */
export default function SelectField({
  blank_value = true,
  children,
  default_value = false,
  error = false,
  id = false,
  fullWidth = false,
  helperText = "",
  label,
  name,
  onChange = false,
  required = false,
  shrink = undefined,
  ...props
}) {
  const classes = useStyles();
  const input_id = id || hashGenerator(10);

  const [value, setValue] = useState(default_value || "");

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <FormControl
      className={classes.formControl}
      error={error}
      fullWidth={fullWidth}
      required={required}
    >
      <InputLabel
        htmlFor={input_id}
        shrink={shrink}
      >
        {label}
      </InputLabel>
      <NativeSelect
        inputProps={{
          id: input_id,
          name,
        }}
        onChange={(event) => onChange ? onChange(event) : handleChange(event)}
        required={required}
        value={value}
        {...props}
      >
        {blank_value && <option aria-label="None" value="" />}
        {children}
      </NativeSelect>
      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  );
}
