import React, { Fragment, useContext } from "react";
import { Redirect, Route, Switch, withRouter } from "react-router-dom";

import useStyles from "./styles";
import Header from "./header/Header.jsx";
import Sidebar from "./sidebar/Sidebar.jsx";

import { UserContext } from "../context/User.jsx";
import { useLayoutState } from "../context/Layout.jsx";
import Perfil from "../pages/usuario/perfil.jsx";

import { getRoutes, hasProfile } from "./routes";

/**
 * This component will render the component if no profiles are passed to it
 * or one of the profiles matches those of the user
 *
 * @param {Object} props
 * @param {number[]} props.allowed_profiles
 * */
const ProfiledRoute = ({
  allowed_profiles,
  component,
  ...props
}) => {
  const [context] = useContext(UserContext);

  return (
    <Route
      {...props}
      render={(children_props) =>
        (!allowed_profiles?.length ||
            hasProfile(context.profiles, allowed_profiles))
          ? React.createElement(component, children_props)
          : <Redirect to={"/"} />}
    />
  );
};

const Layout = (props) => {
  const [context] = useContext(UserContext);
  const routes = getRoutes(context.profiles);

  const classes = useStyles();
  const layout_context = useLayoutState();

  return (
    <div className={classes.root}>
      <Fragment>
        <Header history={props.history} />
        <Sidebar />
        <div
          className={[
            classes.content,
            ...(layout_context.isSidebarOpened ? [classes.contentShift] : []),
          ].join(" ")}
        >
          <div className={classes.fakeToolbar} />
          <Switch>
            <Route component={Perfil} path="/usuario/perfil" />
            {routes
              .reduce((routes, section, index) => {
                routes = [...routes, ...section.children];
                return routes;
              }, [])
              .map(({ allowed_profiles, component, path }) => (
                <ProfiledRoute
                  allowed_profiles={allowed_profiles}
                  component={component}
                  key={path}
                  path={path}
                />
              ))}
            <Route exact={true} path="/" />
            <Redirect from="*" to="/404" />
          </Switch>
        </div>
      </Fragment>
    </div>
  );
};

export default withRouter(Layout);
