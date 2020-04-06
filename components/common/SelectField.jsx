import React, { useState } from "react";
import {
  FormControl,
  InputLabel,
  NativeSelect,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import hashGenerator from '../../lib/hash_generator/mod.js';

const useStyles = makeStyles((theme) => ({
  formControl: {
    //margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    //marginTop: theme.spacing(2),
  },
}));

export default ({
  children,
  id = false,
  fullWidth = false,
  label,
  name,
  onChange = false,
  default_value = false,
  required = false,
  ...props
}) => {
  const classes = useStyles();
  const input_id = id || hashGenerator(10);

  const [value, setValue] = useState(default_value || '');

  const handleChange = (event) => {
    setValue(event.target.value);
  }

  return (
    <FormControl
      className={classes.formControl}
      fullWidth={fullWidth}
      required={required}
    >
      <InputLabel htmlFor={input_id}>{label}</InputLabel>
      <NativeSelect
        inputProps={{
          id: input_id,
          name,
        }}
        onChange={event => onChange ? onChange(event) : handleChange(event)}
        required={required}
        value={value}
        {...props}
      >
        <option aria-label="None" value="" />
        {children}
      </NativeSelect>
    </FormControl>
  );
}
