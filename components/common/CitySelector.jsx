import React, {
  Fragment,
  useEffect,
  useState,
} from "react";
import {
  Typography,
} from "@material-ui/core";
import {
  makeStyles,
} from "@material-ui/styles";
import {
  fetchCityApi,
  fetchCountryApi,
  fetchStateApi,
} from "../../lib/api/generator.js";
import AsyncSelectField from "./AsyncSelectField.jsx";

const generateCountrySearch = (input) => {
  return async () => {
    const country = await fetchCountryApi(`search?limit=10&query=${input}`)
      .then(async (response) => {
        if (response.ok) {
          return await response.json();
        }
        throw new Error();
      });

    return Object.values(country).map(({ pk_pais, nombre }) => {
      return { text: nombre, value: String(pk_pais) };
    });
  };
};

const generateStateSearch = (country, input) => {
  return async () => {
    const state = await fetchStateApi(
      `search?country=${country}&limit=10&query=${input}`,
    )
      .then(async (response) => {
        if (response.ok) {
          return await response.json();
        }
        throw new Error();
      });

    return Object.values(state).map(({ pk_estado, nombre }) => {
      return { text: nombre, value: String(pk_estado) };
    });
  };
};

const generateCitySearch = (state, input) => {
  return async () => {
    const city = await fetchCityApi(
      `search?limit=10&query=${input}&state=${state}`,
    )
      .then(async (response) => {
        if (response.ok) {
          return await response.json();
        }
        throw new Error();
      });

    return Object.values(city).map(({ pk_ciudad, nombre }) => {
      return { text: nombre, value: String(pk_ciudad) };
    });
  };
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
  required = false,
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
        <AsyncSelectField
          componentClassName={classes.select}
          disabled={country_disabled}
          fetchOptions={generateCountrySearch(country_search)}
          label="Pais"
          onInputChange={handleCountrySearch}
          setValue={handleCountryChange}
          value={country}
        />
        <AsyncSelectField
          componentClassName={classes.select}
          disabled={!country}
          fetchOptions={generateStateSearch(country?.value, state_search)}
          label="Departamento"
          onInputChange={handleStateSearch}
          setValue={handleStateChange}
          value={state}
        />
        <AsyncSelectField
          componentClassName={classes.select}
          disabled={!(country && state)}
          fetchOptions={generateCitySearch(state?.value, city_search)}
          label="Ciudad"
          onInputChange={handleCitySearch}
          required={required}
          setValue={handleCityChange}
          value={city}
        />
      </div>
    </Fragment>
  );
}
