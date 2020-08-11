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
import SelectField from "../../../common/SelectField.jsx";

const getUserDocument = () => fetchUserApi();
const setUserDocument = (
  city,
  date,
  number,
  type,
) =>
  fetchUserApi("", {
    body: JSON.stringify({
      document_expedition_city: city,
      document_expedition_date: date,
      document: number,
      document_type: type,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

export default function DocumentForm() {
  const [fields, setFields] = useState({
    city: "",
    country: "",
    date: "",
    number: "",
    state: "",
    type: "",
  });
  const [city_query, setCityQuery] = useState("");

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
      fields.city,
      fields.date,
      fields.number,
      fields.type,
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
      title="Identificacion"
      variant="outlined"
    >
      <TextField
        disabled
        fullWidth
        label="Identificacion"
        name="number"
        onChange={handleChange}
        readOnly
        required
        value={fields.number}
      />
      <SelectField
        label="Tipo de Identificacion"
        fullWidth
        name="type"
        onChange={handleChange}
        //readOnly
        required
        value={fields.type}
      >
        <option value="CC">Cedula de Ciudadania</option>
        <option value="CE">Cedula de Extranjeria</option>
        <option value="PA">Pasaporte</option>
        <option value="RC">Registro Civil</option>
        <option value="TI">Tarjeta de Identidad</option>
      </SelectField>
      <AsyncSelectField
        fullWidth
        handleSource={(source) => (
          Object.values(source).map(({
            pk_ciudad,
            nombre,
          }) => ({ value: String(pk_ciudad), text: nombre }))
        )}
        label="Ciudad de expedicion"
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
        label="Fecha de Expedicion"
        name="date"
        onChange={handleChange}
        required
        type="date"
        value={fields.date}
      />
    </CardForm>
  );
}
