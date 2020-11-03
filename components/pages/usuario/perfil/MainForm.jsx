import React, { Fragment, useEffect, useState } from "react";
import {
  Button,
  Card,
  CardActions,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  TextField,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { CloudUpload as UploadIcon } from "@material-ui/icons";
import {
  fetchGenderApi,
  fetchHRPerson,
  fetchMaritalStatus,
  fetchParameterApi,
  fetchPeopleApi,
  fetchUserApi,
} from "../../../../lib/api/generator.js";
import CardForm from "./components/CardForm.jsx";
import CitySelector from "../../../common/CitySelector.jsx";
import DateField from "../../../common/DateField.jsx";
import SelectField from "../../../common/SelectField.jsx";
import ReviewDialog from "../common/ReviewDialog.jsx";
import ReviewerCardForm from "./components/ReviewerCardForm.jsx";

//TODO
//The fetching of the text warning or any parameters should be globally defined(like generators)
//Replace for top level await when we switch to Deno compiler
let AVATAR_UPLOAD_WARNING = (
  "No fue posible cargar las recomendaciones de carga. " +
  "Sea profesional al escoger la foto  que desea para su perfil."
);
(async () =>
  await fetchParameterApi("valor/TEXTO_CARGA_FOTO")
    .then(async (response) => {
      if (response.ok) {
        AVATAR_UPLOAD_WARNING = await response.text();
      } else {
        throw new Error();
      }
    })
    .catch(() => {
      console.error("The avatar upload warning couldnt be loaded");
    }))();

const getGenders = () => fetchGenderApi();
const getMaritalStatuses = () => fetchMaritalStatus();
const getPerson = (id) =>
  fetchPeopleApi({
    path: id,
    params: {
      review: true,
    },
  });

const getUserInformation = () => fetchUserApi();
const setUserInformation = (
  birth_city,
  birth_date,
  blood_type,
  civil_status,
  gender,
  military_passbook,
  personal_email,
  phone,
  professional_card_expedition,
) =>
  fetchUserApi("", {
    body: JSON.stringify({
      birth_city,
      birth_date,
      blood_type,
      civil_status,
      gender,
      military_passbook,
      personal_email,
      phone,
      professional_card_expedition,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const setUserPicture = async (
  name,
  picture,
) => {
  const data = new FormData();
  data.append(name, picture);
  return fetchUserApi("foto", {
    body: data,
    method: "PUT",
  });
};

const updatePersonReview = async (
  id,
  approved,
  observations,
) =>
  fetchHRPerson(`personal/${id}`, {
    body: JSON.stringify({
      approved,
      observations,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const useProfilePictureStyles = makeStyles(() => ({
  input: {
    display: "none",
  },
  image: {
    backgroundSize: "200px",
    minHeight: "200px",
    width: "200px",
  },
}));

const UploadProfilePicture = () => {
  const classes = useProfilePictureStyles();
  const [picture_key, setPictureKey] = useState(0);
  const [is_modal_open, setModalOpen] = useState(false);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setUserPicture(file.name, file)
      .then((response) => {
        if (response.ok) {
          setPictureKey((prev) => prev + 1);
          setModalOpen(false);
        } else {
          throw new Error();
        }
      })
      .catch(() => console.error("Picture couldn't be uploaded"));
  };

  return (
    <Fragment>
      <Card className={classes.card} variant="outlined">
        <Grid>
          <Grid container item xs={12} justify="center">
            <CardMedia
              className={classes.image}
              image={`/api/usuario/foto#${picture_key}`}
            />
          </Grid>
          <Grid container item xs={12} justify="center">
            <CardActions>
              <Button
                color="primary"
                component="span"
                className={classes.button}
                endIcon={<UploadIcon />}
                onClick={() => setModalOpen(true)}
                variant="contained"
              >
                Cambiar foto
              </Button>
            </CardActions>
          </Grid>
        </Grid>
      </Card>
      <Dialog
        fullWidth
        maxWidth="sm"
        onClose={() => setModalOpen(false)}
        open={is_modal_open}
      >
        <DialogContent>
          {AVATAR_UPLOAD_WARNING}
        </DialogContent>
        <DialogActions>
          <label>
            <input
              accept="image/*"
              id="upload_image"
              className={classes.input}
              onChange={handleImageChange}
              type="file"
            />
            <Button
              color="primary"
              component="span"
              className={classes.button}
              variant="contained"
            >
              Continuar
            </Button>
          </label>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

/**
 * @param {object} props
 * @param {number} props.person
 * */
const ProfilePicture = ({
  person,
}) => {
  const classes = useProfilePictureStyles();

  return (
    <Card variant="outlined">
      <Grid container justify="center">
        <CardMedia
          className={classes.image}
          image={`/api/organizacion/persona/foto/${person}`}
        />
      </Grid>
    </Card>
  );
};

/**
 * @param {object} props
 * @param {number=} props.person Will only be used when review_mode is enabled
 * @param {boolean} [props.review_mode = false]
 * */
export default function MainForm({
  person,
  review_mode = false,
}) {
  const [fields, setFields] = useState({
    approved: false,
    birth_city: "",
    birth_date: "",
    blood_type: "",
    cellphone: "",
    civil_status: "",
    comments: "",
    gender: "",
    has_military_passbook: false,
    has_professional_card: false,
    id: "",
    military_passbook: "",
    name: "",
    personal_email: "",
    phone: "",
    professional_card_expedition: "",
  });
  const [genders, setGenders] = useState([]);
  const [marital_statuses, setMaritalStatuses] = useState([]);
  const [reload_data, setReloadData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirm_modal_open, setConfirmModalOpen] = useState(false);

  const rejected = !fields.approved && !!fields.comments;
  const disable_review = fields.approved || rejected;

  useEffect(() => {
    getGenders()
      .then(async (response) => {
        if (response.ok) {
          return await response.json();
        }
        throw new Error();
      })
      .then((genders) => setGenders(genders))
      .catch(() => console.error("couldnt fetch gender"));
    getMaritalStatuses()
      .then(async (response) => {
        if (response.ok) {
          return await response.json();
        }
        throw new Error();
      })
      .then((marital_statuses) => setMaritalStatuses(marital_statuses))
      .catch(() => console.error("couldnt fetch marital status"));
  }, []);

  useEffect(() => {
    if (!reload_data) {
      return;
    }

    let active = true;
    setLoading(true);

    /**
     * @type Promise<Response>
     * */
    let person_data_request;

    if (review_mode) {
      person_data_request = getPerson(person);
    } else {
      person_data_request = getUserInformation();
    }

    person_data_request
      .then(async (response) => {
        if (response.ok) {
          const information = await response.json();

          if (active) {
            setFields((prev_state) => ({
              ...prev_state,
              approved: information.informacion_principal_aprobada,
              birth_city: information.fk_ciudad_nacimiento || "",
              birth_date: information.fec_nacimiento || "",
              blood_type: information.tipo_sangre || "",
              cellphone: information.telefono,
              civil_status: information.fk_estado_civil || "",
              comments: information.informacion_principal_observaciones || "",
              gender: information.fk_genero || "",
              id: information.pk_persona,
              has_military_passbook: Boolean(information.libreta_militar),
              has_professional_card: Boolean(
                information.expedicion_tarjeta_profesional,
              ),
              military_passbook: information.libreta_militar || "",
              name: information.nombre,
              personal_email: information.correo_personal || "",
              phone: information.telefono_fijo || "",
              picture: null,
              professional_card_expedition:
                information.expedicion_tarjeta_profesional || "",
            }));
          }
        } else {
          throw new Error();
        }
      })
      .catch(() => console.error("could not fetch information"))
      .finally(() => {
        setReloadData(false);
        setLoading(false);
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

    setUserInformation(
      fields.birth_city || null,
      fields.birth_date || null,
      fields.blood_type || null,
      fields.civil_status || null,
      fields.gender || null,
      fields.has_military_passbook ? fields.military_passbook || null : null,
      fields.personal_email || null,
      fields.phone || null,
      fields.has_professional_card
        ? fields.professional_card_expedition || null
        : null,
    )
      .then((request) => {
        if (!request.ok) {
          throw new Error();
        }
      })
      .catch(() => console.error("couldnt submit personal data"))
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
        title="Datos personales"
        onReview={handleReview}
      >
        <Grid container spacing={10}>
          <Grid item md={6} xs={12}>
            <DateField
              fullWidth
              label="Nombre"
              name="birth_date"
              value={fields.name}
            />
            <CitySelector
              label="Ciudad de nacimiento"
              setValue={() => {}}
              value={fields.birth_city}
            />
            <DateField
              fullWidth
              label="Fecha de nacimiento"
              name="birth_date"
              value={fields.birth_date}
            />
            <SelectField
              label="Género"
              fullWidth
              name="gender"
              value={fields.gender}
            >
              {genders.map(({ id, name }) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </SelectField>
            <SelectField
              label="Estado civil"
              fullWidth
              name="civil_status"
              value={fields.civil_status}
            >
              {marital_statuses.map(({ id, name }) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </SelectField>
            <SelectField
              label="Tipo de sangre"
              fullWidth
              name="blood_type"
              value={fields.blood_type}
            >
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </SelectField>
            <TextField
              fullWidth
              label="Celular"
              name="cellphone"
              value={fields.cellphone}
            />
            <TextField
              fullWidth
              label="Teléfono fijo"
              name="phone"
              value={fields.phone}
            />
          </Grid>
          <Grid item md={6} xs={12}>
            <Grid container item justify="center">
              {person ? <ProfilePicture person={person} /> : null}
            </Grid>
            <br />
            <SelectField
              fullWidth
              label="Libreta militar"
              name="has_military_passbook"
              value={Number(fields.has_military_passbook)}
            >
              <option value="0">No</option>
              <option value="1">Si</option>
            </SelectField>
            {fields.has_military_passbook && (
              <TextField
                fullWidth
                label="Numero libreta militar"
                name="military_passbook"
                value={fields.military_passbook}
              />
            )}
            <TextField
              fullWidth
              label="Correo personal"
              name="personal_email"
              value={fields.personal_email}
            />
            <SelectField
              fullWidth
              label="Tarjeta profesional"
              name="has_professional_card"
              value={Number(fields.has_professional_card)}
            >
              <option value="0">No</option>
              <option value="1">Si</option>
            </SelectField>
            {fields.has_professional_card
              ? (
                <DateField
                  fullWidth
                  label="Expedición de tarjeta profesional"
                  name="professional_card_expedition"
                  value={fields.professional_card_expedition}
                />
              )
              : null}
          </Grid>
        </Grid>
      </ReviewerCardForm>
    );
  }

  return (
    <Fragment>
      <CardForm
        approved={fields.approved}
        disabled={review_mode}
        helper_text={fields.comments}
        loading={loading}
        onSubmit={() => setConfirmModalOpen(true)}
        title="Datos personales"
      >
        <Grid container spacing={10}>
          <Grid item md={6} xs={12}>
            <DateField
              disabled
              fullWidth
              label="Nombre"
              name="birth_date"
              value={fields.name}
            />
            <CitySelector
              label="Ciudad de nacimiento"
              setValue={(value) =>
                setFields((prev_state) => ({
                  ...prev_state,
                  birth_city: value,
                }))}
              value={fields.birth_city}
            />
            <DateField
              fullWidth
              label="Fecha de nacimiento"
              name="birth_date"
              onChange={handleChange}
              value={fields.birth_date}
            />
            <SelectField
              label="Género"
              fullWidth
              name="gender"
              onChange={handleChange}
              value={fields.gender}
            >
              {genders.map(({ id, name }) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </SelectField>
            <SelectField
              label="Estado civil"
              fullWidth
              name="civil_status"
              onChange={handleChange}
              value={fields.civil_status}
            >
              {marital_statuses.map(({ id, name }) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </SelectField>
            <SelectField
              label="Tipo de sangre"
              fullWidth
              name="blood_type"
              onChange={handleChange}
              value={fields.blood_type}
            >
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </SelectField>
            <TextField
              disabled
              fullWidth
              label="Celular"
              name="cellphone"
              value={fields.cellphone}
            />
            <TextField
              fullWidth
              label="Teléfono fijo"
              name="phone"
              onChange={handleChange}
              value={fields.phone}
            />
          </Grid>
          <Grid item md={6} xs={12}>
            <UploadProfilePicture />
            <br />
            <SelectField
              blank_value={false}
              fullWidth
              label="Libreta militar"
              name="has_military_passbook"
              onChange={(event) => {
                const has_military_passbook = Boolean(
                  Number(event.target.value),
                );
                setFields((prev_state) => ({
                  ...prev_state,
                  has_military_passbook,
                }));
              }}
              value={Number(fields.has_military_passbook)}
            >
              <option value="0">No</option>
              <option value="1">Si</option>
            </SelectField>
            {fields.has_military_passbook && (
              <TextField
                fullWidth
                label="Numero libreta militar"
                name="military_passbook"
                onChange={handleChange}
                value={fields.military_passbook}
              />
            )}
            <TextField
              fullWidth
              InputProps={{
                inputProps: {
                  maxLength: "320",
                },
              }}
              label="Correo personal"
              name="personal_email"
              onChange={handleChange}
              value={fields.personal_email}
            />
            <SelectField
              blank_value={false}
              fullWidth
              label="Tarjeta profesional"
              name="has_professional_card"
              onChange={(event) => {
                const has_professional_card = Boolean(
                  Number(event.target.value),
                );
                setFields((prev_state) => ({
                  ...prev_state,
                  has_professional_card,
                }));
              }}
              value={Number(fields.has_professional_card)}
            >
              <option value="0">No</option>
              <option value="1">Si</option>
            </SelectField>
            {fields.has_professional_card
              ? (
                <DateField
                  fullWidth
                  label="Expedición de tarjeta profesional"
                  name="professional_card_expedition"
                  onChange={handleChange}
                  value={fields.professional_card_expedition}
                />
              )
              : null}
          </Grid>
        </Grid>
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
