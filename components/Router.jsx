import React, { useContext } from "react";
import {
  BrowserRouter,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

import { UserContext } from "./context/User.jsx";
import Login from "./login/Login.jsx";
import Layout from "./layout/Layout.jsx";
import NotFound from "./pages/errors/NotFound.jsx";

const PublicRoute = ({ component, ...props }) => {
  const [userState] = useContext(UserContext);

  return (
    <Route
      {...props}
      render={(children_props) =>
        userState.is_authenticated
          ? <Redirect to={"/"} />
          : React.createElement(component, children_props)}
    />
  );
};

const PrivateRoute = ({ component, ...props }) => {
  const [userState] = useContext(UserContext);

  return (
    <Route
      {...props}
      render={(children_props) =>
        userState.is_authenticated
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
        <PrivateRoute path={"/404"} component={NotFound} />
        <PrivateRoute path={"/"} component={Layout} />
      </Switch>
    </BrowserRouter>
  );
};
