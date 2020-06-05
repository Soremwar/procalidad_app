import React from "react";
import {
  username as dev_username,
  password as dev_password,
} from "../../config/app.js";

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

const attemptLogin = (username, password) => {
  //TODO
  //Verify session with google server
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (username === dev_username && password === dev_password) {
        resolve("Autenticado con éxito");
      } else {
        reject("Credenciales incorrectas");
      }
    }, 1000);
  });
};

export const loginUser = (
  dispatch,
  username,
  password,
  history,
  setLoginError,
  setIsLoading,
) => {
  setIsLoading(true);
  attemptLogin(username, password)
    .then(() => {
      dispatch({ type: ACTIONS.LOGIN });
      history.push("/home");
    })
    .catch((message) => {
      //TODO
      //Replace with error detection
      setLoginError(message);
      setIsLoading(false);
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
