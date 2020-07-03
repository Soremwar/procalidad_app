import React from "react";
import {
  username as dev_username,
  password as dev_password,
} from "../../config/app.js";
import {
  fetchAuthApi,
} from "../../lib/api/generator.js";

const createSession = (email) =>
  fetchAuthApi("", {
    body: JSON.stringify({ email }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

export const UserContext = React.createContext();

export const ACTIONS = {
  LOGIN: "LOGIN_SUCCESS",
  SIGN_OUT: "SIGN_OUT_SUCCESS",
};

const loginReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.LOGIN:
      //TODO
      //Set user name and email
      return {
        ...state,
        isAuthenticated: true,
        name: "Usuario",
        email: "mail@example.com",
      };
    case ACTIONS.SIGN_OUT:
      return { ...state, isAuthenticated: false };
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
};

//TODO
//Create session with server
export const attemptManualLogin = (
  dispatch,
  username,
  password,
  history,
  setLoginError,
  setIsLoading,
) => {
  setIsLoading(true);
  if (username === dev_username && password === dev_password) {
    dispatch({ type: ACTIONS.LOGIN });
    history.push("/home");
  } else {
    setLoginError("Credenciales incorrectas");
    setIsLoading(false);
  }
};
export const attemptGoogleLogin = (
  dispatch,
  api_data,
  history,
  setLoginError,
) => {
  createSession(api_data.profileObj.email)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(response.status);
      }
    })
    .then(() => {
      dispatch({ type: ACTIONS.LOGIN });
      history.push("/home");
    })
    .catch(({ message }) => {
      switch (message) {
        case "401":
          setLoginError("El usuario no se encuentra registrado");
          break;
        default:
          setLoginError("Ocurrio un error al procesar el usuario");
      }
    });
};

export const signOutUser = (dispatch, history) => {
  dispatch({ type: ACTIONS.SIGN_OUT });
  history.push("/login");
};

export const UserProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(loginReducer, {
    //TODO
    //Add login server key
    name: null,
    email: null,
    isAuthenticated: false,
  });

  return (
    <UserContext.Provider value={[state, dispatch]}>
      {children}
    </UserContext.Provider>
  );
};
