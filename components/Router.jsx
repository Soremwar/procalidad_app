import React from "react";
import {
  BrowserRouter,
  Switch,
  Route,
} from "react-router-dom";

import Layout from "./layout/Layout.jsx";
import NotFound from "./utils/errors/NotFound.jsx";

export default () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path={["/", "/home"]}>
          <Layout />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </BrowserRouter>
  );
};
