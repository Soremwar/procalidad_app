import React, {
  Fragment,
  useEffect,
  useState,
} from "react";
import {
  CircularProgress,
  TextField,
} from "@material-ui/core";
import {
  Autocomplete,
} from "@material-ui/lab";
import { createFilterOptions } from "@material-ui/lab/Autocomplete";
import hashGenerator from "../../lib/hash_generator/mod.js";
import { NetworkError } from "../../lib/errors/mod.js";

const DEFAULT_ERROR_TEXT = "No fue posible cargar la informacion";

/**
 * Returns the values needed to render the options
 * @param {{ [value: string; text: string]; }} response
 * @returns {{ [value: string; text: string]; }}
 */
const defaultSourceHandler = (response) => {
  return response;
};

export default ({
  clientFilter = false,
  customFilter = false,
  disabled = false,
  error_text = DEFAULT_ERROR_TEXT,
  fullWidth = false,
  id: default_id = false,
  inputValue = false,
  label,
  handleSource = defaultSourceHandler,
  name,
  onChange = false,
  onType = () => {},
  preload = false,
  required = false,
  source,
  variant = "standard",
  value: default_value = null,
  ...props
}) => {
  const [error, setError] = useState(null);
  const [input_text, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [value, setValue] = useState(default_value ?? null);

  const id = default_id || hashGenerator(10);

  const defaultHandler = (event) => setValue(event.target.value);

  const getOption = (value) => {
    return options.find((option) => {
      return option.value === value;
    }) ?? null;
  };

  useEffect(() => {
    if ((open || preload) && !disabled) {
      setError(null);
      setLoading(true);
      fetch(source)
        .then(async (request) => {
          const result = await request.json();
          if (request.ok) {
            return result;
          } else {
            throw new NetworkError(result.message || DEFAULT_ERROR_TEXT);
          }
        })
        .then((response) => handleSource(response))
        .catch((error) => {
          if (error instanceof NetworkError) {
            setError(error.message);
          } else {
            setError(error_text);
          }
          setOpen(false);
          return [];
        })
        .then((result) => setOptions(result))
        .finally(() => {
          setLoading(false);
        });
    } else if (disabled) {
      setOptions([]);
    }
  }, [open, source, disabled]);

  useEffect(() => {
    setValue(default_value);
  }, [default_value]);

  return (
    <Autocomplete
      disabled={disabled}
      filterOptions={clientFilter
        ? (customFilter || createFilterOptions())
        : (options) => (options)}
      getOptionLabel={(option) => option.text}
      getOptionSelected={(option, selected) => option.value === selected.value}
      id={id}
      inputValue={value
        ? getOption(value)?.text || ""
        : inputValue || input_text}
      loading={loading}
      onChange={(event, new_value) => {
        event.target = document.querySelector(`[id="${id}"]`).cloneNode();
        event.target.value = new_value?.value || null;
        return onChange ? onChange(event) : defaultHandler(event);
      }}
      onClose={() => setOpen(false)}
      onInputChange={(event, new_value) => {
        if (event) {
          event.target = document.querySelector(`[id="${id}"]`).cloneNode();
          event.target.value = new_value;
          setInput(new_value);
          return onType(event);
        }
      }}
      onOpen={() => setOpen(true)}
      open={open}
      options={options}
      renderInput={(params) => (
        <TextField
          {...params}
          error={error}
          fullWidth={fullWidth}
          helperText={error}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <Fragment>
                {loading && <CircularProgress color="inherit" size={20} />}
                {params.InputProps.endAdornment}
              </Fragment>
            ),
          }}
          label={label}
          name={name}
          required={required}
          variant={variant}
          {...props}
        />
      )}
      value={value ? getOption(value) : null}
    />
  );
};
