import React, { createContext, useReducer } from "react";
import { fetchAuthApi } from "../../lib/api/generator.js";
import { Cookies, useCookies } from "react-cookie";
import decodeJwt from "jwt-decode";

const createSession = (email) =>
  fetchAuthApi("", {
    body: JSON.stringify({ email }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

export const UserContext = createContext({
  email: "",
  id: "",
  is_authenticated: false,
  name: "",
  profiles: [],
});

export const ACTIONS = {
  LOGIN: "LOGIN_SUCCESS",
  SIGN_OUT: "SIGN_OUT_SUCCESS",
};

const loginReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.LOGIN:
      return {
        email: action.value.email,
        id: action.value.id,
        is_authenticated: true,
        name: action.value.name,
        profiles: action.value.profiles,
      };
    case ACTIONS.SIGN_OUT:
      return {
        email: "",
        id: "",
        is_authenticated: false,
        name: "",
        profiles: [],
      };
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
};

export const attemptServerAuthentication = async (
  dispatch,
  username,
  history,
  setLoginError,
) => {
  const response = await createSession(username);
  const response_body = await response.json();

  if (response.ok) {
    dispatch({
      type: ACTIONS.LOGIN,
      value: {
        email: response_body.email,
        id: response_body.id,
        name: response_body.name,
        profiles: response_body.profiles,
      },
    });
    history.push("/");
  } else {
    switch (response.status) {
      case 401:
        setLoginError("El usuario no se encuentra registrado");
        break;
      default:
        setLoginError(
          response_body?.message || "Ocurrio un error al procesar el usuario",
        );
    }
  }
};

export const signOutUser = (dispatch, history) => {
  new Cookies().remove("PA_AUTH");
  dispatch({ type: ACTIONS.SIGN_OUT });
  history.push("/login");
};

//TODO
//Improve session check
const decodeSessionCookie = (session_token) => {
  const session = {
    email: "",
    id: "",
    is_authenticated: false,
    name: "",
    profiles: [],
  };

  try {
    const {
      user,
      exp,
    } = decodeJwt(session_token);
    if (Date.now() > exp * 1000) throw new Error();

    Object.assign(session, {
      email: user.email,
      id: user.id,
      is_authenticated: true,
      name: user.name,
      profiles: user.profiles,
    });
  } finally {
    return session;
  }
};

export const UserProvider = ({ children }) => {
  const [cookies] = useCookies("PA_AUTH");
  const [state, dispatch] = useReducer(
    loginReducer,
    decodeSessionCookie(cookies.PA_AUTH),
  );

  return (
    <UserContext.Provider value={[state, dispatch]}>
      {children}
    </UserContext.Provider>
  );
};
