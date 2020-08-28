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
import CardForm from "./components/CardForm.jsx";
import CitySelector from "../../../common/CitySelector.jsx";
import SelectField from "../../../common/SelectField.jsx";

const getUserDocument = () => fetchUserApi();
const setUserDocument = (
  city,
  date,
) =>
  fetchUserApi("", {
    body: JSON.stringify({
      document_expedition_city: city,
      document_expedition_date: date,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

export default function DocumentForm() {
  const [fields, setFields] = useState({
    city: "",
    date: "",
    number: "",
    type: "",
  });

  useEffect(() => {
    getUserDocument()
      .then(async (request) => {
        if (request.ok) {
          return await request.json();
        }
        throw new Error();
      })
      .then((document) =>
        setFields((prev_state) => ({
          ...prev_state,
          city: document.fk_ciudad_expedicion_identificacion || "",
          date: document.fec_expedicion_identificacion || "",
          number: document.identificacion,
          type: document.tipo_identificacion,
        }))
      )
      .catch(() => console.error("couldnt fetch document"));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = () => {
    setUserDocument(
      fields.city || null,
      fields.date || null,
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
      title="Identificación"
      variant="outlined"
    >
      <TextField
        disabled
        fullWidth
        label="Identificación"
        name="number"
        onChange={handleChange}
        value={fields.number}
      />
      <SelectField
        disabled
        label="Tipo de identificación"
        fullWidth
        name="type"
        onChange={handleChange}
        value={fields.type}
      >
        <option value="CC">Cedula de Ciudadania</option>
        <option value="CE">Cedula de Extranjeria</option>
        <option value="PA">Pasaporte</option>
        <option value="RC">Registro Civil</option>
        <option value="TI">Tarjeta de Identidad</option>
      </SelectField>
      <CitySelector
        label="Ciudad de expedición"
        setValue={(value) =>
          setFields((prev_state) => ({ ...prev_state, city: value }))}
        value={fields.city}
      />
      <TextField
        fullWidth
        label="Fecha de expedición"
        name="date"
        onChange={handleChange}
        type="date"
        value={fields.date}
      />
    </CardForm>
  );
}
