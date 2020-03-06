import React from "react";
import ReactDOMServer from "react-dom/server";
import { Button } from "@material-ui/core";

const App = () => {
  return (
    <React.Fragment>
      <h1>React App with Deno</h1>
      <Button variant="contained" color="primary">
        Hello World
      </Button>
    </React.Fragment>
  );
};

const static_app = ReactDOMServer.renderToString(<App />);

export default static_app;
