import React from "react";
import ReactDOMServer from "react-dom/server";

const App = () => {
  return (
    <React.Fragment>
      <h1>Aplicación en Construcción</h1>
      Proximámente...
    </React.Fragment>
  );
};

const app_html = ReactDOMServer.renderToString(<App />);

const html_document = (
  `<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
  </head>
  <body>
    ${app_html}
  </body>
  </html>`
);

export default html_document;
