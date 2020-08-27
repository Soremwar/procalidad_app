import React, {
  Fragment,
  useEffect,
  useState,
} from "react";
import {
  CircularProgress,
  TextField,
  Typography,
} from "@material-ui/core";
import {
  makeStyles,
} from "@material-ui/styles";
import {
  Autocomplete,
} from "@material-ui/lab";
import {
  fetchCityApi,
  fetchCountryApi,
  fetchStateApi,
} from "../../lib/api/generator.js";

const AsyncSelector = ({
  componentClassName = "",
  disabled = false,
  /* This function should be a promise that returns the expected value */
  fetchOptions,
  /* This should return an array of objects with props `text` and `value` */
  handleFetchResult,
  inputClassName = "",
  label,
  onInputChange = () => {},
  setValue,
  value,
}) => {
  const [error, setError] = useState(false);
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
  }, [value]);

  useEffect(() => {
    let active = true;

    setError(false);
    setLoading(true);

    fetchOptions()
      .then((result) => {
        if (active) {
          setOptions(
            handleFetchResult(result),
          );
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
        />
      )}
      value={value}
    />
  );
};

const generateCountrySearch = (input) => {
  return async () =>
    await fetchCountryApi(`search?limit=10&query=${input}`)
      .then(async (response) => {
        if (response.ok) {
          return await response.json();
        }
        throw new Error();
      });
};

const generateStateSearch = (country, input) => {
  return async () =>
    await fetchStateApi(`search?country=${country}&limit=10&query=${input}`)
      .then(async (response) => {
        if (response.ok) {
          return await response.json();
        }
        throw new Error();
      });
};

const generateCitySearch = (state, input) => {
  return async () =>
    await fetchCityApi(`search?limit=10&query=${input}&state=${state}`)
      .then(async (response) => {
        if (response.ok) {
          return await response.json();
        }
        throw new Error();
      });
};

const useStyles = makeStyles(() => ({
  container: {
    display: "flex",
  },
  select: {
    flex: 1,
  },
}));

export default function CitySelector({
  label,
  setValue,
  value,
}) {
  const classes = useStyles();
  const [country, setCountry] = useState(null);
  const [country_disabled, setCountryDisabled] = useState(false);
  const [country_search, setCountrySearch] = useState("");
  const [state, setState] = useState(null);
  const [state_search, setStateSearch] = useState("");
  const [city, setCity] = useState(null);
  const [city_search, setCitySearch] = useState("");

  const handleCountrySearch = (_event, value, reason, reloadOptions) => {
    if (value && reason !== "reset") {
      setCountrySearch(value);
      reloadOptions();
    }
  };
  const handleStateSearch = (_event, value, reason, reloadOptions) => {
    if (value && reason !== "reset") {
      setStateSearch(value);
      reloadOptions();
    }
  };
  const handleCitySearch = (_event, value, reason, reloadOptions) => {
    if (value && reason !== "reset") {
      setCitySearch(value);
      reloadOptions();
    }
  };

  const handleCountryChange = (option) => {
    setCity(null);
    setState(null);
    setCountry(option);
  };
  const handleStateChange = (option) => {
    setCity(null);
    setState(option);
  };
  const handleCityChange = (option) => {
    setValue(option?.value || "");
    setCity(option);
  };

  const enableSelection = () => {
    setCountryDisabled(false);
  };

  const disableSelection = () => {
    setCountryDisabled(true);
    setCity(null);
  };

  useEffect(() => {
    if (value) {
      disableSelection();

      fetchCityApi(value)
        .then(async (response) => {
          if (response.ok) {
            const city = await response.json();

            if (city.fk_estado == state?.value) {
              return;
            }

            const state = await fetchStateApi(city.fk_estado)
              .then(async (response) => {
                if (response.ok) {
                  return await response.json();
                } else {
                  throw new Error();
                }
              });

            if (state.fk_pais == country?.value) {
              return;
            }

            const country = await fetchCountryApi(state.fk_pais)
              .then(async (response) => {
                if (response.ok) {
                  return await response.json();
                } else {
                  throw new Error();
                }
              });

            setCountry({ text: country.nombre, value: country.pk_pais });
            setState({ text: state.nombre, value: state.pk_estado });
            setCity({ text: city.nombre, value: city.pk_ciudad });
          } else {
            throw new Error();
          }
        })
        .catch(() => {
          console.error(
            "The toast component should throw on couldnt recover city data",
          );
        })
        .finally(() => {
          enableSelection();
        });
    }
  }, [value]);

  return (
    <Fragment>
      <Typography
        color="textSecondary"
        variant="caption"
      >
        {label}
      </Typography>
      <div className={classes.container}>
        <AsyncSelector
          componentClassName={classes.select}
          disabled={country_disabled}
          fetchOptions={generateCountrySearch(country_search)}
          handleFetchResult={(result) => {
            return Object.values(result).map(({ pk_pais, nombre }) => {
              return { text: nombre, value: pk_pais };
            });
          }}
          label="Pais"
          onInputChange={handleCountrySearch}
          setValue={handleCountryChange}
          value={country}
        />
        <AsyncSelector
          componentClassName={classes.select}
          disabled={!country}
          fetchOptions={generateStateSearch(country?.value, state_search)}
          handleFetchResult={(result) => {
            return Object.values(result).map(({ pk_estado, nombre }) => {
              return { text: nombre, value: pk_estado };
            });
          }}
          label="Estado"
          onInputChange={handleStateSearch}
          setValue={handleStateChange}
          value={state}
        />
        <AsyncSelector
          componentClassName={classes.select}
          disabled={!(country && state)}
          fetchOptions={generateCitySearch(state?.value, city_search)}
          handleFetchResult={(result) => {
            return Object.values(result).map(({ pk_ciudad, nombre }) => {
              return { text: nombre, value: pk_ciudad };
            });
          }}
          label="Ciudad"
          onInputChange={handleCitySearch}
          setValue={handleCityChange}
          value={city}
        />
      </div>
    </Fragment>
  );
}
