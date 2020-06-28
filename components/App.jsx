import React from "react";
import ReactDOM from "react-dom";
import Router from "./Router.jsx";

import theme from "./utils/themes/index.js";
import { CssBaseline } from "@material-ui/core";
import { UserProvider } from "./context/User.jsx";
import { LayoutProvider } from "./context/Layout.jsx";
import { ThemeProvider } from "@material-ui/styles";

const App = () => {
  return (
    <UserProvider>
      <LayoutProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router />
        </ThemeProvider>
      </LayoutProvider>
    </UserProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));

if (module.hot) {
  module.hot.accept();
}
