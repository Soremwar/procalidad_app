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

//TODO
//Create session with server
//Check if email is allowed with API
export const loginWithGoogle = (
  dispatch,
  api_data,
  history,
  setLoginError,
) => {
  console.log(api_data);
  dispatch({ type: ACTIONS.LOGIN });
  history.push("/home");
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
