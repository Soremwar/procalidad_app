import React, {
  createContext,
  useReducer,
} from "react";
import {
  fetchAuthApi,
} from "../../lib/api/generator.js";
import { useCookies, Cookies } from "react-cookie";
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
  image: "",
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
      //TODO
      //Set user name and email
      return {
        email: action.value.email,
        id: action.value.id,
        image: action.value.image,
        is_authenticated: true,
        name: action.value.name,
        profiles: action.value.profiles,
      };
    case ACTIONS.SIGN_OUT:
      return {
        email: "",
        id: "",
        image: "",
        is_authenticated: false,
        name: "",
        profiles: [],
      };
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
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
    .then(({ id, profiles }) => {
      dispatch({
        type: ACTIONS.LOGIN,
        value: {
          email: api_data.profileObj.email,
          id,
          image: api_data.profileObj.imageUrl,
          name: api_data.profileObj.name,
          profiles,
        },
      });
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
  new Cookies().remove("PA_AUTH");
  dispatch({ type: ACTIONS.SIGN_OUT });
  history.push("/login");
};

//TODO
//Improve session check
//Get google avatar from server
const decodeSessionCookie = (session_token) => {
  const session = {
    email: "",
    id: "",
    image: "",
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
