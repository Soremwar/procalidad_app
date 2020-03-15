import React, { useContext } from "react";
import {
  BrowserRouter,
  Switch,
  Route,
  Redirect
} from "react-router-dom";

import { UserContext } from "./context/User.jsx";
import Login from "./login/Login.jsx";
import Layout from "./layout/Layout.jsx";
import NotFound from "./utils/errors/NotFound.jsx";

const PublicRoute = ({ component, ...props }) => {
  const [userState] = useContext(UserContext);

  return (
    <Route
      {...props}
      //TODO
      //Replace "false" with logging status
      render={children_props =>
        userState.isAuthenticated
          ? <Redirect to={"/home"} />
          : React.createElement(component, children_props)}
    />
  );
};

const PrivateRoute = ({ component, ...props }) => {
  const [userState] = useContext(UserContext);

  return (
    <Route
      {...props}
      //TODO
      //Replace "false" with logging status
      render={children_props =>
        userState.isAuthenticated
          ? React.createElement(component, children_props)
          : <Redirect to={"/login"} />}
    />
  );
};

export default () => {
  return (
    <BrowserRouter>
      <Switch>
        <PublicRoute path={"/login"} component={Login} />
        <PrivateRoute path={"/"} component={Layout} />
        <Route component={NotFound} />
      </Switch>
    </BrowserRouter>
  );
};
