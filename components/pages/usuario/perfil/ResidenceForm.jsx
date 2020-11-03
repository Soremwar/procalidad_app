import React, { Fragment, useEffect, useState } from "react";
import { TextField } from "@material-ui/core";
import {
  fetchHRPerson,
  fetchPeopleApi,
  fetchUserApi,
} from "../../../../lib/api/generator.js";
import CitySelector from "../../../common/CitySelector.jsx";
import CardForm from "./components/CardForm.jsx";
import ReviewDialog from "../common/ReviewDialog";
import ReviewerCardForm from "./components/ReviewerCardForm";

const getUserInformation = () => fetchUserApi();
const getPerson = (id) =>
  fetchPeopleApi({
    path: id,
    params: {
      review: true,
    },
  });

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

const updatePersonReview = async (
  id,
  approved,
  observations,
) =>
  fetchHRPerson(`residencia/${id}`, {
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
export default function ResidenceForm({
  person,
  review_mode = false,
}) {
  const [fields, setFields] = useState({
    address: "",
    approved: false,
    city: "",
    comments: "",
    id: "",
  });
  const [reload_data, setReloadData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirm_modal_open, setConfirmModalOpen] = useState(false);

  const rejected = !fields.approved && fields.comments;
  const disable_review = fields.approved || rejected;

  useEffect(() => {
    let active = true;
    setLoading(true);

    let person_data_request;

    if (review_mode) {
      person_data_request = getPerson(person);
    } else {
      person_data_request = getUserInformation();
    }

    person_data_request
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
              id: document.pk_persona,
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
        title="Residencia"
        onReview={handleReview}
      >
        <CitySelector
          label="Ciudad de residencia"
          setValue={() => {}}
          value={fields.city}
        />
        <TextField
          fullWidth
          label="Direccion"
          name="address"
          value={fields.address}
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
        approved={fields.approved}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleSubmit}
        open={confirm_modal_open}
      />
    </Fragment>
  );
}
