import React, { Fragment, useEffect, useState } from "react";
import { InputLabel } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import {
  fetchCityApi,
  fetchCountryApi,
  fetchStateApi,
} from "../../lib/api/generator.js";
import hashGenerator from "../../lib/hash_generator/mod.js";
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

/**
 * Returns the selected values for city, state and country. Triggered only on city select
 * @callback setCityValue
  * @param {string} city
  * @param {string} state
  * @param {string} country
 * */

/**@param {object} props
 * @param {string} props.label
 * @param {boolean} props.required
 * @param {setCityValue} props.setValue
 * @param {number} props.value
 */
export default function CitySelector({
  label,
  required = false,
  setValue,
  value,
}) {
  const classes = useStyles();

  const [city_search, setCitySearch] = useState("");
  const [city, setCity] = useState(null);
  const [country_disabled, setCountryDisabled] = useState(false);
  const [country_search, setCountrySearch] = useState("");
  const [country, setCountry] = useState(null);
  const [component_id] = useState(hashGenerator(10));
  const [state_search, setStateSearch] = useState("");
  const [state, setState] = useState(null);

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
    if (city?.value) {
      setValue(
        String(city.value),
        String(state.value),
        String(country.value),
      );
    } else {
      setValue("", "", "");
    }
  }, [city]);

  useEffect(() => {
    if (value && value != city?.value) {
      disableSelection();

      fetchCityApi(value)
        .then(async (response) => {
          if (response.ok) {
            const city_data = await response.json();

            if (city_data.fk_estado == state?.value) {
              return;
            }

            const state_data = await fetchStateApi(city_data.fk_estado)
              .then(async (response) => {
                if (response.ok) {
                  return await response.json();
                } else {
                  throw new Error();
                }
              });
            if (state_data.fk_pais == country?.value) {
              return;
            }

            const country_data = await fetchCountryApi(state_data.fk_pais)
              .then(async (response) => {
                if (response.ok) {
                  return await response.json();
                } else {
                  throw new Error();
                }
              });

            setCountry({ text: country_data.nombre, value: country_data.pk_pais });
            setState({ text: state_data.nombre, value: state_data.pk_estado });
            setCity({ text: city_data.nombre, value: city_data.pk_ciudad });
          } else {
            throw new Error();
          }
        })
        .catch((e) => {
          console.log(e)
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
      <InputLabel
        htmlFor={component_id}
        required={required}
      >
        {label}
      </InputLabel>
      <div className={classes.container} id={component_id}>
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
