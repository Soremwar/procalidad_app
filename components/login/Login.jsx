import React, { useState, useContext } from "react";
import {
  Grid,
  Typography,
  Fade,
} from "@material-ui/core";
import { withRouter } from "react-router-dom";
import GoogleLogin from "react-google-login";

import {
  attemptGoogleLogin,
  UserContext,
} from "../context/User.jsx";

import useStyles from "./styles.js";

const Login = ({ history }) => {
  const classes = useStyles();

  const [_userState, userDispatch] = useContext(UserContext);
  const [login_error, setLoginError] = useState(null);

  return (
    <Grid container className={classes.container}>
      <div className={classes.logotypeContainer}>
        <img
          src={"/resources/img/login_icon.png"}
          alt="PROCALIDAD_APP_LOGO"
          className={classes.logotypeImage}
        />
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
              className={classes.googleButton}
              clientId="754494090542-7kmmopqoulege94gf4mm988ukmda7jv2.apps.googleusercontent.com"
              cookiePolicy={"single_host_origin"}
              buttonText="Iniciar Sesión"
              onSuccess={(api_response) =>
                attemptGoogleLogin(
                  userDispatch,
                  api_response,
                  history,
                  setLoginError,
                )}
              onFailure={() => setLoginError("La autenticación fallo")}
              redirectUri={"http://localhost/login"}
            />
            <Fade in={!!login_error}>
              <Typography color="primary" className={classes.errorMessage}>
                {login_error}
              </Typography>
            </Fade>
          </React.Fragment>
        </div>
      </div>
    </Grid>
  );
};

export default withRouter(Login);
