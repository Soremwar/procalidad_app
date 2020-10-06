import React, { Fragment, useEffect, useState } from "react";
import { CircularProgress, TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";

export default function AsyncSelectField({
  componentClassName = "",
  disabled = false,
  /* This function should be a promise that returns the expected value */
  fetchOptions,
  inputClassName = "",
  label,
  onInputChange = () => {},
  required = false,
  setValue,
  value,
}) {
  const [error, setError] = useState(false);
  //If no options have been loaded, the internal value must wait
  //until the default options (preloaded value) is set
  const [internal_value, setInternalValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [should_fetch, setShouldFetch] = useState(false);

  const reloadOptions = () => {
    setShouldFetch(true);
  };

  const handleInputChange = (event, input, reason) => {
    onInputChange(
      event,
      input,
      reason,
      reloadOptions,
    );
  };

  useEffect(() => {
    if (value) {
      setOptions([value]);
    }
    setInternalValue(value);
  }, [value]);

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
    <Autocomplete
      className={componentClassName}
      disabled={disabled}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      getOptionSelected={(option, value) => option.value === value.value}
      getOptionLabel={(option) => option.text}
      onChange={(_e, value) => setValue(value)}
      onInputChange={handleInputChange}
      options={options}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          className={inputClassName}
          error={error}
          helperText={error ? "Error al cargar la informacion" : ""}
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
      value={internal_value}
    />
  );
}
