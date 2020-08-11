import React, {
  useEffect,
  useState,
} from "react";
import {
  TextField,
} from "@material-ui/core";
import {
  fetchUserApi,
} from "../../../../lib/api/generator.js";
import AsyncSelectField from "../../../common/AsyncSelectField.jsx";
import CardForm from "./components/CardForm.jsx";

const getUserResidence = () => fetchUserApi();
const setUserResidence = (
  city,
  address,
) =>
  fetchUserApi("", {
    body: JSON.stringify({
      residence_address: address,
      residence_city: city,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

export default function ResidenceForm() {
  const [fields, setFields] = useState({
    address: "",
    city: "",
    country: "",
    state: "",
  });
  const [city_query, setCityQuery] = useState("");

  useEffect(() => {
    getUserResidence()
      .then(async (request) => {
        if (request.ok) {
          return await request.json();
        }
        throw new Error();
      })
      .then((document) =>
        setFields((prev_state) => ({
          ...prev_state,
          address: document.direccion_residencia || "",
          city: document.fk_ciudad_residencia || "",
        }))
      )
      .catch(() => console.error("couldnt fetch document"));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = () => {
    setUserResidence(
      fields.city,
      fields.address,
    )
      .then((request) => {
        if (!request.ok) {
          throw new Error();
        }
      })
      .catch(() => {
        console.error("uncatched error");
      });
  };

  return (
    <CardForm
      onSubmit={handleSubmit}
      title="Residencia"
      variant="outlined"
    >
      <AsyncSelectField
        fullWidth
        handleSource={(source) => (
          Object.values(source).map(({
            pk_ciudad,
            nombre,
          }) => ({ value: String(pk_ciudad), text: nombre }))
        )}
        label="Ciudad"
        margin="dense"
        name="city"
        onChange={handleChange}
        onType={(event) => {
          if (!fields.city) {
            setFields((prev_state) => ({ ...prev_state, city: "" }));
          }
          setCityQuery(event.target.value);
        }}
        required
        source={`maestro/ciudad/search?limit=10&query=${
          encodeURI(
            fields.city
              ? ""
              : city_query.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
          )
        }`}
        value={fields.city}
      />
      <TextField
        fullWidth
        label="Direccion"
        name="address"
        onChange={handleChange}
        required
        value={fields.address}
      />
    </CardForm>
  );
}
