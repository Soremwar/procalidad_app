import React, { Fragment, useEffect, useState } from "react";
import { Chip, CircularProgress, TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";

export default function MultipleTextField({
  disabled = false,
  /*
  * This function should be a promise that returns the expected value
  * Returns an array of strings
  */
  fetchSuggestions,
  label,
  max,
  placeholder,
  required,
  setValue = () => {},
  value,
  variant = "standard",
}) {
  const [error, setError] = useState(false);
  const [internal_value, setInternalValue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [should_fetch, setShouldFetch] = useState(false);

  const reloadOptions = () => {
    setShouldFetch(true);
  };

  useEffect(() => {
    let active = true;

    if (!disabled && should_fetch) {
      setError(false);
      setLoading(true);

      fetchSuggestions()
        .then((result) => {
          const options = result.map((x) => {
            if (max) {
              return String(x).slice(0, max);
            } else {
              return String(x);
            }
          });
          if (active) {
            setOptions(options);
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
    if (open && typeof fetchSuggestions === "function") {
      reloadOptions();
    }
  }, [open]);

  useEffect(() => {
    setValue(internal_value);
  }, [internal_value]);

  useEffect(() => {
    let new_value;

    if (!value) {
      new_value = [];
    } else if (Array.isArray(value)) {
      new_value = value;
    } else {
      new_value = [value];
    }

    setInternalValue(
      new_value.map((x) => {
        if (max) {
          return String(x).slice(0, max);
        } else {
          return String(x);
        }
      }),
    );
  }, []);

  return (
    <Autocomplete
      autoSelect
      disabled={disabled}
      freeSolo
      multiple
      onChange={(e, value) => {
        if (max) {
          setInternalValue(
            value.map((x) => x.slice(0, max)),
          );
        } else {
          setInternalValue(value);
        }
      }}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      options={options}
      renderTags={(values, getTagProps) =>
        values.map((option, index) => (
          <Chip
            label={option}
            variant="outlined"
            {...getTagProps({ index })}
          />
        ))}
      renderInput={(params) => (
        <TextField
          {...params}
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
          placeholder={placeholder}
          variant={variant}
        />
      )}
      value={internal_value}
    />
  );
}
