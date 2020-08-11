import React, {
  useEffect,
  useState,
} from "react";
import {
  TextField,
} from "@material-ui/core";
import CardForm from "./components/CardForm.jsx";

export default function FileForm() {
  const [fields, setFields] = useState({
    address: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = () => {
    console.log("submit 1");
  };

  return (
    <CardForm
      onSubmit={handleSubmit}
      title="Lugar de Residencia"
      variant="outlined"
    >
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
