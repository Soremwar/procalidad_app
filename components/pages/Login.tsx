import React, { useContext, useState } from "react";
import { Fade, Grid, Typography } from "@material-ui/core";
import { withRouter } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { authentication } from "../../config/app";
import { attemptServerAuthentication, UserContext } from "../context/User.jsx";
import {
  AccountInfo,
  AuthenticationResult,
  Configuration,
  PublicClientApplication,
} from "@azure/msal-browser";

export const MSAL_CONFIG: Configuration = {
  auth: {
    clientId: authentication.client_id,
    redirectUri: "http://localhost",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

// Current login logic is based around the account selection window and popup
// Changing this configuration in the loginPopup method property might have adverse results
class MicrosoftAuthenticationService {
  private myMSALObj = new PublicClientApplication(
    MSAL_CONFIG,
  );
  public isAuthenticationConfigured = false;

  constructor() {
    if (MSAL_CONFIG?.auth?.clientId) {
      this.isAuthenticationConfigured = true;
    }
  }

  login(): Promise<AccountInfo> {
    return this.myMSALObj
      .loginPopup({
        scopes: [],
        prompt: "select_account",
      })
      .then((resp: AuthenticationResult) => {
        if (resp?.account) {
          return resp.account;
        }
        throw new Error(
          "No account was returned by the authentication service",
        );
      });
  }
}

const AuthenticationButton = ({
  onAuthenticated,
  onError,
}: {
  onAuthenticated: (user: AccountInfo) => void;
  onError: (error: string) => void;
}) => {
  const authenticationModule = new MicrosoftAuthenticationService();
  if (!authenticationModule.isAuthenticationConfigured) {
    onError(
      "The client id for the Microsoft authentication has not been configured",
    );
  }

  const logIn = async () => {
    try {
      onAuthenticated(await authenticationModule.login());
    } catch (e) {
      onError(e.message);
    }
  };

  return (
    <button
      disabled={!authenticationModule.isAuthenticationConfigured}
      onClick={logIn}
    >
      Log in
    </button>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
  },
  errorMessage: {
    textAlign: "center",
  },
  form: {
    width: 320,
  },
  formContainer: {
    width: "40%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    [theme.breakpoints.down("md")]: {
      width: "50%",
    },
  },
  greeting: {
    fontWeight: 500,
    textAlign: "center",
    marginTop: theme.spacing(4),
  },
  loginButton: {
    marginTop: theme.spacing(6),
    backgroundColor: "white",
    width: "100%",
    textTransform: "none",
  },
  logotypeContainer: {
    backgroundColor: theme.palette.primary.light,
    width: "60%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    [theme.breakpoints.down("md")]: {
      width: "50%",
    },
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
  logotypeImage: {
    width: 165,
    marginBottom: theme.spacing(4),
  },
  logotypeText: {
    color: "white",
    fontWeight: 500,
    fontSize: 84,
    [theme.breakpoints.down("md")]: {
      fontSize: 48,
    },
  },
}));

const Login = ({ history }) => {
  const classes = useStyles();

  const [_userState, userDispatch] = useContext(UserContext);
  const [login_error, setLoginError] = useState(null);

  return (
    <Grid container className={classes.container}>
      <div className={classes.logotypeContainer}>
        <img
          src="/resources/img/login_icon.png"
          alt="APP_PROCALIDAD_LOGO"
          className={classes.logotypeImage}
        />
        <Typography className={classes.logotypeText}>
          App Procalidad
        </Typography>
      </div>
      <div className={classes.formContainer}>
        <div className={classes.form}>
          <React.Fragment>
            <Typography variant="h1" className={classes.greeting}>
              Bienvenido
            </Typography>
            {
              // loginButton
            }
            <AuthenticationButton
              onAuthenticated={({ username }) =>
                attemptServerAuthentication(
                  userDispatch,
                  username,
                  history,
                  setLoginError,
                )}
              onError={(error) => setLoginError(error)}
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
