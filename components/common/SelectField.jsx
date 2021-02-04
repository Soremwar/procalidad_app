import React, { useState } from "react";
import { FormControl, InputLabel, NativeSelect } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import hashGenerator from "../../lib/hash_generator/mod.js";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
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
  id = false,
  fullWidth = false,
  label,
  name,
  onChange = false,
  default_value = false,
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
        className={blank_value ? classes.selectEmpty : ""}
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
    </FormControl>
  );
}
