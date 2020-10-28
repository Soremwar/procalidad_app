import React, { useEffect, useState } from "react";
import { FormControl, TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { makeStyles } from "@material-ui/core/styles";

const isStringIn = (target, searchString) => {
  const regex = new RegExp(
    "(?=.*" + searchString.split(/\,|\s/).join(")(?=.*") + ")",
    "gi",
  );
  return target.match(regex) !== null;
};

const useStyles = makeStyles(() => ({
  formControl: {
    minWidth: 120,
  },
}));

/**
 * @typedef SelectOptions
 * @type Array
 * @property {number | string} 0 Value to be set on selection
 * @property {string} 1 Label to be displayed
 * */

/**
 * @callback changeCallback
 * @param {React.ChangeEvent} event
 * @param {number | string} value
 * */

//TODO
//Disabled doesnt do anything
/**
 * @param {object} props
 * @param {changeCallback} props.onChange
 * @param {SelectOptions} props.options
 * */
export default function AdvancedSelectField({
  disabled = false,
  fullWidth = false,
  label = null,
  name,
  onChange,
  onInputChange = false,
  options = [],
  required = false,
  variant = "standard",
  value: external_value = null,
}) {
  const classes = useStyles();

  const [value, setValue] = useState(external_value);

  useEffect(() => {
    setValue(external_value);
  }, [external_value]);

  return (
    <FormControl
      className={classes.formControl}
      fullWidth={fullWidth}
      required={required}
    >
      <Autocomplete
        disabled={disabled}
        filterOptions={(options, { inputValue }) => {
          return options.filter(([_index, text]) =>
            isStringIn(text, inputValue)
          );
        }}
        getOptionSelected={(option, value) => option[0] === value}
        getOptionLabel={(value) => {
          const option = options.find(([index]) => index === value);
          return option ? option[1] : "";
        }}
        onChange={(event, new_value) => {
          onChange
            ? onChange(event, new_value?.[0] ?? null)
            : setValue(new_value?.[0] ?? null);
        }}
        onInputChange={(event, new_value) =>
          onInputChange && onInputChange(event, new_value[0])}
        options={options}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            name={name}
            required={required}
            variant={variant}
          />
        )}
        renderOption={(option) => option[1]}
        value={value === "" ? null : value}
      />
    </FormControl>
  );
}
