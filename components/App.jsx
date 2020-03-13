import React from "react";
import ReactDOM from "react-dom";
import Router from "./Router.jsx";

import theme from "./utils/themes/index.js";
import { CssBaseline } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router />
    </ThemeProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
