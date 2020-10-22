import React, { Fragment, useEffect, useState } from "react";
import { TextField } from "@material-ui/core";
import { fetchUserApi } from "../../../../lib/api/generator.js";
import CitySelector from "../../../common/CitySelector.jsx";
import CardForm from "./components/CardForm.jsx";
import ReviewDialog from "../common/ReviewDialog";

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
  const [loading, setLoading] = useState(false);
  const [confirm_modal_open, setConfirmModalOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getUserResidence()
      .then(async (request) => {
        if (request.ok) {
          const document = await request.json();
          if (active) {
            setFields((prev_state) => ({
              ...prev_state,
              address: document.direccion_residencia || "",
              approved: document.residencia_aprobada,
              city: document.fk_ciudad_residencia || "",
              comments: document.residencia_observaciones || "",
            }));
          }
        } else {
          throw new Error();
        }
      })
      .catch(() => console.error("couldnt fetch document"))
      .finally(() => {
        setLoading(false);
        setReloadData(false);
      });

    return () => {
      active = false;
    };
  }, [reload_data]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = () => {
    setLoading(true);

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
      .finally(() => {
        setLoading(false);
        setReloadData(true);
      });
  };

  return (
    <Fragment>
      <CardForm
        approved={fields.approved}
        helper_text={fields.comments}
        loading={loading}
        onSubmit={() => setConfirmModalOpen(true)}
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
      <ReviewDialog
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleSubmit}
        open={confirm_modal_open}
        reviewed={fields.approved}
      />
    </Fragment>
  );
}
