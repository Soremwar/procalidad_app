import React, { Fragment, useEffect, useState } from "react";
import { CircularProgress, TextField } from "@material-ui/core";
import { Autocomplete as MUIAutocomplete } from "@material-ui/lab";

export default function Autocomplete({
  componentClassName = "",
  disabled = false,
  /*
  * This function should be a promise that returns the expected value
  * Returns an array of strings
  */
  fetchOptions,
  inputClassName = "",
  label,
  max,
  required = false,
  setValue,
  value,
}) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [should_fetch, setShouldFetch] = useState(false);

  const reloadOptions = () => {
    setShouldFetch(true);
  };

  useEffect(() => {
    let active = true;

    if (!disabled) {
      setError(false);
      setLoading(true);

      fetchOptions()
        .then((result) => {
          if (active) {
            setOptions(result);
          }
        })
        .catch(() => {
          setError(true);
          setOpen(false);
          setValue(null);
        })
        .finally(() => {
          setLoading(false);
          setShouldFetch(false);
        });
    }

    return () => {
      active = false;
    };
  }, [should_fetch]);

  useEffect(() => {
    if (open) {
      reloadOptions();
    }
  }, [open]);

  return (
    <MUIAutocomplete
      autoSelect
      className={componentClassName}
      disableClearable
      disabled={disabled}
      freeSolo
      getOptionLabel={(option) => option}
      getOptionSelected={(option, value) => option === value}
      loading={loading}
      onChange={(_e, value) => {
        if (!isNaN(max)) {
          setValue(String(value).slice(0, max));
        } else {
          setValue(value);
        }
      }}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      options={options}
      renderInput={(params) => (
        <TextField
          {...params}
          className={inputClassName}
          error={error}
          helperText={error ? "Error al cargar la informacion" : ""}
          inputProps={{
            ...params.inputProps,
            maxLength: max,
          }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <Fragment>
                {loading
                  ? <CircularProgress color="inherit" size={20} />
                  : null}
                {params.InputProps.endAdornment}
              </Fragment>
            ),
          }}
          label={label}
          required={required}
        />
      )}
      value={value}
    />
  );
}
