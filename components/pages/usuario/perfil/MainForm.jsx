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
import CitySelector from "../../../common/CitySelector.jsx";
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

const useProfilePictureStyles = makeStyles(() => ({
  card: {
    display: "flex",
  },
  card_content: {
    flex: "1 0 auto",
  },
  card_details: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    width: "60%",
  },
  input: {
    display: "none",
  },
  image: {
    backgroundSize: "200px",
    height: "200px",
    width: "200px",
  },
}));

const ProfilePicture = () => {
  const classes = useProfilePictureStyles();
  const [picture_key, setPictureKey] = useState(0);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setUserPicture(file.name, file)
      .then((response) => {
        if (response.ok) {
          setPictureKey((prev) => prev + 1);
        } else {
          throw new Error();
        }
      })
      .catch(() => console.error("Picture couldn't be uploaded"));
  };

  return (
    <Card className={classes.card} variant="outlined">
      <div className={classes.card_details}>
        <CardMedia
          className={classes.image}
          image={`/api/usuario/foto#${picture_key}`}
        />
      </div>
      <CardActions className={classes.card_content}>
        <input
          accept="image/*"
          id="upload_image"
          className={classes.input}
          onChange={handleImageChange}
          type="file"
        />
        <label htmlFor="upload_image">
          <Button
            color="primary"
            component="span"
            className={classes.button}
            endIcon={<UploadIcon />}
            variant="contained"
          >
            Cambiar foto
          </Button>
        </label>
      </CardActions>
    </Card>
  );
};

export default function MainForm() {
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
  });
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

  return (
    <CardForm
      onSubmit={handleSubmit}
      title="Informacion Principal"
      variant="outlined"
    >
      <Grid container spacing={10}>
        <Grid item md={6} xs={12}>
          <CitySelector
            label="Ciudad de nacimiento"
            setValue={(value) =>
              setFields((prev_state) => ({ ...prev_state, birth_city: value }))}
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
          <ProfilePicture />
          <br />
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
