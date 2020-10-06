import React, { useEffect, useState } from "react";
import { TextField } from "@material-ui/core";
import { fetchUserApi } from "../../../../lib/api/generator.js";
import CitySelector from "../../../common/CitySelector.jsx";
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
  });

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
      fields.city || null,
      fields.address || null,
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
      <CitySelector
        label="Ciudad de residencia"
        setValue={(value) =>
          setFields((prev_state) => ({ ...prev_state, city: value }))}
        value={fields.city}
      />
      <TextField
        fullWidth
        label="Direccion"
        name="address"
        onChange={handleChange}
        value={fields.address}
      />
    </CardForm>
  );
}
