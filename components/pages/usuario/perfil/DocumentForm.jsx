import React, { useEffect, useState } from "react";
import { TextField } from "@material-ui/core";
import { fetchUserApi } from "../../../../lib/api/generator.js";
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
    approved: false,
    city: "",
    comments: "",
    date: "",
    number: "",
    type: "",
  });
  const [reload_data, setReloadData] = useState(true);

  useEffect(() => {
    let active = true;

    getUserDocument()
      .then(async (response) => {
        if (response.ok) {
          const document = await response.json();
          if (active) {
            setFields((prev_state) => ({
              ...prev_state,
              approved: document.identificacion_aprobada,
              city: document.fk_ciudad_expedicion_identificacion || "",
              comments: document.identificacion_observaciones || "",
              date: document.fec_expedicion_identificacion || "",
              number: document.identificacion,
              type: document.tipo_identificacion,
            }));
          }
        } else {
          throw new Error();
        }
      })
      .catch(() => console.error("couldnt fetch document"))
      .finally(() => setReloadData(false));

    return () => {
      active = false;
    };
  }, [reload_data]);

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
      .catch(() => console.error("couldnt submit document data"))
      .finally(() => setReloadData(true));
  };

  return (
    <CardForm
      approved={fields.approved}
      helper_text={fields.comments}
      onSubmit={handleSubmit}
      title="Identificación"
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
