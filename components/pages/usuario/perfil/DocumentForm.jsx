import React, { Fragment, useEffect, useState } from "react";
import { TextField } from "@material-ui/core";
import {
  fetchHRPerson,
  fetchPeopleApi,
  fetchUserApi,
} from "../../../../lib/api/generator.js";
import CardForm from "./components/CardForm.jsx";
import CitySelector from "../../../common/CitySelector.jsx";
import DateField from "../../../common/DateField.jsx";
import SelectField from "../../../common/SelectField.jsx";
import ReviewDialog from "../common/ReviewDialog.jsx";
import ReviewerCardForm from "./components/ReviewerCardForm";

const getUserInformation = () => fetchUserApi();
const getPerson = (id) =>
  fetchPeopleApi({
    path: id,
    params: {
      review: true,
    },
  });

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

const updatePersonReview = async (
  id,
  approved,
  observations,
) =>
  fetchHRPerson(`documentos/${id}`, {
    body: JSON.stringify({
      approved,
      observations,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

/**
 * @param {object} props
 * @param {number=} props.person Will only be used when review_mode is enabled
 * @param {boolean} [props.review_mode = false]
 * */
export default function DocumentForm({
  person,
  review_mode = false,
}) {
  const [fields, setFields] = useState({
    approved: false,
    city: "",
    comments: "",
    date: "",
    id: "",
    number: "",
    type: "",
  });
  const [reload_data, setReloadData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirm_modal_open, setConfirmModalOpen] = useState(false);

  const rejected = !fields.approved && !!fields.comments;
  const disable_review = fields.approved || rejected;

  useEffect(() => {
    if (!reload_data) {
      return;
    }
    let active = true;
    setLoading(true);

    let person_data_request;

    if (review_mode) {
      person_data_request = getPerson(person);
    } else {
      person_data_request = getUserInformation();
    }

    person_data_request
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
              id: document.pk_persona,
              number: document.identificacion,
              type: document.tipo_identificacion,
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

  // If in review mode, wait 'til a person is selected
  // Load instantly if not in review mode
  useEffect(() => {
    if (review_mode && person) {
      setReloadData(true);
    } else if (!review_mode) {
      setReloadData(true);
    }
  }, [person]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = () => {
    setLoading(true);

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
      .finally(() => {
        setLoading(false);
        setReloadData(true);
      });
  };

  const handleReview = (approved, observations) => {
    setLoading(true);
    setError(null);

    updatePersonReview(fields.id, approved, observations)
      .then((response) => {
        if (!response.ok) {
          throw new Error();
        }
      })
      .catch((e) => {
        console.error("Couldnt update review", e);
        setError(true);
      })
      .finally(() => {
        setReloadData(true);
        setLoading(false);
      });
  };

  if (review_mode) {
    return (
      <ReviewerCardForm
        disabled={!person || disable_review}
        helper_text={error}
        loading={loading}
        title="Identificación"
        onReview={handleReview}
      >
        <TextField
          fullWidth
          label="Identificación"
          name="number"
          value={fields.number}
        />
        <SelectField
          label="Tipo de identificación"
          fullWidth
          name="type"
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
          setValue={() => {}}
          value={fields.city}
        />
        <DateField
          fullWidth
          label="Fecha de expedición"
          name="date"
          value={fields.date}
        />
      </ReviewerCardForm>
    );
  }

  return (
    <Fragment>
      <CardForm
        approved={fields.approved}
        helper_text={fields.comments}
        loading={loading}
        onSubmit={() => setConfirmModalOpen(true)}
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
        <DateField
          fullWidth
          label="Fecha de expedición"
          name="date"
          onChange={handleChange}
          value={fields.date}
        />
      </CardForm>
      <ReviewDialog
        approved={fields.approved}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleSubmit}
        open={confirm_modal_open}
      />
    </Fragment>
  );
}
