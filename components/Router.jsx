import React from "react";
import {
  BrowserRouter,
  Switch,
  Route,
} from "react-router-dom";

import NotFound from "./utils/errors/NotFound.jsx";

export default () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/">
          Home
        </Route>
        <Route component={NotFound} />
      </Switch>
    </BrowserRouter>
  );
};
