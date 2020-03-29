import React, { useState, useContext } from "react";
import {
  Grid,
  CircularProgress,
  Typography,
  Button,
  TextField,
  Fade
} from "@material-ui/core";
import { withRouter } from "react-router-dom";

import useStyles from "./styles.js";
//TODO
//Lazy load image
//import google_icon from "../../public/resources/img/google.svg";

// context
import { UserContext, loginUser } from "../context/User.jsx";

const Login = ({ history }) => {
  const classes = useStyles();

  const [_userState, userDispatch] = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [login_error, setLoginError] = useState(null);
  const [form_fields, setFormFields] = useState({
    username: "",
    password: "",
  });

  const updateFormField = (event) => {
    const field_name = event.target.name;
    const field_value = event.target.value;
    setFormFields((last_state) => ({
      ...last_state,
      [field_name]: field_value,
    })
    );
  };

  return (
    <Grid container className={classes.container}>
      <div className={classes.logotypeContainer}>
        {/*
          TODO
          Logo goes here
          <img src={logo} alt="logo" className={classes.logotypeImage} />
        */}
        <Typography className={classes.logotypeText}>
          {/*
            TODO
            Replace with real app name
          */}
          Procalidad App
        </Typography>
      </div>
      <div className={classes.formContainer}>
        <div className={classes.form}>
          <React.Fragment>
            <Typography variant="h1" className={classes.greeting}>
              Bienvenido!
            </Typography>
            <Button size="large" className={classes.googleButton}>
              {/*
                  TODO
                  Load file with lazy loading
                  <img src={google_icon} alt="google" className={classes.googleIcon} />
                */}
              Google Logo&nbsp;Iniciar sesión con Google
            </Button>
            <div className={classes.formDividerContainer}>
              <div className={classes.formDivider} />
              <Typography className={classes.formDividerWord}>o</Typography>
              <div className={classes.formDivider} />
            </div>
            <Fade in={login_error && true}>
              <Typography color="secondary" className={classes.errorMessage}>
                {login_error}
              </Typography>
            </Fade>
            <TextField
              name="username"
              InputProps={{
                classes: {
                  underline: classes.textFieldUnderline,
                  input: classes.textField,
                },
              }}
              value={form_fields.username}
              onChange={updateFormField}
              margin="normal"
              placeholder="Usuario"
              type="text"
              fullWidth
            />
            <TextField
              name="password"
              InputProps={{
                classes: {
                  underline: classes.textFieldUnderline,
                  input: classes.textField,
                },
              }}
              value={form_fields.password}
              onChange={updateFormField}
              margin="normal"
              placeholder="Contraseña"
              type="password"
              fullWidth
            />
            <div className={classes.formButtons}>
              {isLoading
                ? (
                  <CircularProgress
                    size={26}
                    className={classes.loginLoader}
                  />
                )
                : (
                  <Button
                    disabled={!form_fields.username && !form_fields.password}
                    onClick={() =>
                      loginUser(
                        userDispatch,
                        form_fields.username,
                        form_fields.password,
                        history,
                        setLoginError,
                        setIsLoading,
                      )}
                    variant="contained"
                    color="primary"
                    size="large"
                  >
                    Iniciar Sesión
                  </Button>
                )}
            </div>
          </React.Fragment>
        </div>
      </div>
    </Grid>
  );
};

export default withRouter(Login);
