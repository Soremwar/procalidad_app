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
    approved: false,
    city: "",
    comments: "",
  });
  const [reload_data, setReloadData] = useState(true);

  useEffect(() => {
    let active = true;

    getUserResidence()
      .then(async (request) => {
        if (request.ok) {
          const document = await request.json();
          if(active){
            setFields((prev_state) => ({
              ...prev_state,
              address: document.direccion_residencia || "",
              approved: document.residencia_aprobada,
              city: document.fk_ciudad_residencia || "",
              comments: document.residencia_observaciones || "",
            }));
          }
        }else{
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
        console.error("couldnt submit residence data");
      })
      .finally(() => setReloadData(true))
  };

  return (
    <CardForm
      approved={fields.approved}
      helper_text={fields.comments}
      onSubmit={handleSubmit}
      title="Residencia"
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
