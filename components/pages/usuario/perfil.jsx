import React, {
  Fragment,
} from "react";
import {
  Grid,
} from "@material-ui/core";
import ChildrenForm from "./perfil/ChildrenForm.jsx";
import ContactForm from "./perfil/ContactForm.jsx";
import DocumentForm from "./perfil/DocumentForm.jsx";
import FileForm from "./perfil/FileForm.jsx";
import LanguageForm from "./perfil/LanguageForm.jsx";
import MainForm from "./perfil/MainForm.jsx";
import ResidenceForm from "./perfil/ResidenceForm.jsx";

export default function Perfil() {
  return (
    <Fragment>
      <MainForm />
      <br />
      <br />
      <Grid container spacing={10}>
        <Grid item md={6} xs={12}>
          <DocumentForm />
        </Grid>
        <Grid item md={6} xs={12}>
          <ResidenceForm />
        </Grid>
      </Grid>
      <br />
      <br />
      <br />
      <br />
      <ContactForm />
      <br />
      <br />
      <ChildrenForm />
      <br />
      <br />
      <LanguageForm />
      <br />
      <br />
      <FileForm />
    </Fragment>
  );
}
