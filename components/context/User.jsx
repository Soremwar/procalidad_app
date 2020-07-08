import React, {
  createContext,
  useReducer,
} from "react";
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
        ...state,
        is_authenticated: false,
      };
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
  dispatch({ type: ACTIONS.SIGN_OUT });
  history.push("/login");
};

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(loginReducer, {
    email: "",
    id: "",
    image: "",
    is_authenticated: false,
    name: "",
    profiles: [],
  });

  return (
    <UserContext.Provider value={[state, dispatch]}>
      {children}
    </UserContext.Provider>
  );
};
