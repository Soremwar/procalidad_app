import React, { useState, useContext } from "react";
import {
  Grid,
  CircularProgress,
  Typography,
  Button,
  TextField,
  Fade,
} from "@material-ui/core";
import { withRouter } from "react-router-dom";
import GoogleLogin from "react-google-login";

import {
  attemptManualLogin,
  attemptGoogleLogin,
  UserContext,
} from "../context/User.jsx";

import useStyles from "./styles.js";

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
    }));
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
            <GoogleLogin
              clientId="754494090542-7kmmopqoulege94gf4mm988ukmda7jv2.apps.googleusercontent.com"
              cookiePolicy={"single_host_origin"}
              buttonText="Iniciar Sesión"
              onSuccess={(api_response) =>
                attemptGoogleLogin(
                  userDispatch,
                  api_response,
                  history,
                  setLoginError,
                  setIsLoading,
                )}
              onFailure={() => setLoginError("La autenticación fallo")}
              redirectUri={"http://localhost/login"}
            />
            <div className={classes.formDividerContainer}>
              <div className={classes.formDivider} />
              <Typography className={classes.formDividerWord}>o</Typography>
              <div className={classes.formDivider} />
            </div>
            <Fade in={!!login_error}>
              <Typography color="primary" className={classes.errorMessage}>
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
                      attemptManualLogin(
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
