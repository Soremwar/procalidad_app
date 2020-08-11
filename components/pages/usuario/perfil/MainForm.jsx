import React, {
  useEffect,
  useState,
} from "react";
import {
  Button,
  Card,
  CardActions,
  CardMedia,
  Grid,
  TextField,
} from "@material-ui/core";
import {
  makeStyles,
} from "@material-ui/styles";
import {
  CloudUpload as UploadIcon,
} from "@material-ui/icons";
import {
  fetchMaritalStatus,
  fetchGenderApi,
  fetchUserApi,
} from "../../../../lib/api/generator.js";
import AsyncSelectField from "../../../common/AsyncSelectField.jsx";
import CardForm from "./components/CardForm.jsx";
import SelectField from "../../../common/SelectField.jsx";

const getGenders = () => fetchGenderApi();
const getMaritalStatuses = () => fetchMaritalStatus();

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
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

//TODO
//Find a way to display a good ratio
const useFormStyles = makeStyles(() => ({
  file_card: {
    display: "flex",
  },
  file_card_content: {
    flex: "1 0 auto",
  },
  file_card_details: {
    display: "flex",
    flexDirection: "column",
  },
  file_input: {
    display: "none",
  },
  image: {
    width: "200px",
  },
}));

export default function MainForm() {
  const classes = useFormStyles();
  const [fields, setFields] = useState({
    birth_city: "",
    birth_date: "",
    blood_type: "",
    cellphone: "",
    civil_status: "",
    gender: "",
    military_passbook: "",
    personal_email: "",
    phone: "",
    picture: "",
  });
  const [city_query, setCityQuery] = useState("");
  const [genders, setGenders] = useState([]);
  const [marital_statuses, setMaritalStatuses] = useState([]);

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
    getUserInformation()
      .then(async (response) => {
        if (response.ok) {
          return await response.json();
        }
        throw new Error();
      })
      .then((information) =>
        setFields((prev_state) => ({
          ...prev_state,
          birth_city: information.fk_ciudad_nacimiento || "",
          birth_date: information.fec_nacimiento || "",
          blood_type: information.tipo_sangre || "",
          cellphone: information.telefono,
          civil_status: information.fk_estado_civil || "",
          gender: information.fk_genero || "",
          military_passbook: information.libreta_militar || "",
          personal_email: information.correo_personal || "",
          phone: information.telefono_fijo || "",
          picture: null,
        }))
      )
      .catch(() => console.error("could not fetch information"));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = () => {
    setUserInformation(
      fields.birth_city || undefined,
      fields.birth_date || undefined,
      fields.blood_type || undefined,
      fields.civil_status || undefined,
      fields.gender || undefined,
      fields.military_passbook || undefined,
      fields.personal_email || undefined,
      fields.phone || undefined,
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

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = function () {
      const encoded_base64 = reader.result.replace(/^data:.+;base64,/, "");
      setFields((prev_state) => ({ ...prev_state, picture: encoded_base64 }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <CardForm
      onSubmit={handleSubmit}
      title="Informacion Principal"
      variant="outlined"
    >
      <Grid container spacing={10}>
        <Grid item md={6} xs={12}>
          <AsyncSelectField
            fullWidth
            handleSource={(source) => (
              Object.values(source).map(({
                pk_ciudad,
                nombre,
              }) => ({ value: String(pk_ciudad), text: nombre }))
            )}
            label="Ciudad de nacimiento"
            margin="dense"
            name="birth_city"
            onChange={handleChange}
            onType={(event) => {
              if (!fields.birth_city) {
                setFields((prev_state) => ({ ...prev_state, birth_city: "" }));
              }
              setCityQuery(event.target.value);
            }}
            source={`maestro/ciudad/search?limit=10&query=${
              encodeURI(
                fields.birth_city
                  ? ""
                  : city_query.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
              )
            }`}
            value={fields.birth_city}
          />
          <TextField
            fullWidth
            label="Fecha de Nacimiento"
            name="birth_date"
            onChange={handleChange}
            type="date"
            value={fields.birth_date}
          />
          <SelectField
            label="Genero"
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
            label="Estado Civil"
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
            label="Tipo de Sangre"
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
            label="Telefono fijo"
            name="phone"
            onChange={handleChange}
            value={fields.phone}
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <Card className={classes.file_card}>
            <div className={classes.file_card_details}>
              <CardMedia
                component="img"
                className={classes.image}
                src={fields.picture
                  ? `data:image/png;base64,${fields.picture}`
                  : "/resources/img/logo.png"}
              />
            </div>
            <CardActions className={classes.file_card_content}>
              <input
                accept="image/*"
                id="upload_image"
                className={classes.file_input}
                onChange={handleImageChange}
                type="file"
              />
              <label htmlFor="upload_image">
                <Button
                  color="primary"
                  component="span"
                  className={classes.file_button}
                  endIcon={<UploadIcon />}
                  variant="contained"
                >
                  Cambiar foto
                </Button>
              </label>
            </CardActions>
          </Card>
          <TextField
            fullWidth
            label="Libreta militar"
            name="military_passbook"
            onChange={handleChange}
            value={fields.military_passbook}
          />
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
        </Grid>
      </Grid>
    </CardForm>
  );
}
