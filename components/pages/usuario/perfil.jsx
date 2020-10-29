import React, { Fragment, useEffect, useState } from "react";
import { Grid } from "@material-ui/core";
import { fetchPeopleApi } from "../../../lib/api/generator.js";
import ChildrenForm from "./perfil/ChildrenForm.jsx";
import ContactForm from "./perfil/ContactForm.jsx";
import DocumentForm from "./perfil/DocumentForm.jsx";
import FileForm from "./perfil/FileForm.jsx";
import LanguageForm from "./perfil/LanguageForm.jsx";
import MainForm from "./perfil/MainForm.jsx";
import ResidenceForm from "./perfil/ResidenceForm.jsx";
import AdvancedSelectField from "../../common/AdvancedSelectField.jsx";

const getPeople = () => fetchPeopleApi();

/**
 * @param {object} props
 * @param {boolean} [props.review_mode = false]
 * */
export default function Perfil({
  review_mode = false,
}) {
  const [people, setPeople] = useState([]);
  const [selected_person, setSelectedPerson] = useState();

  useEffect(() => {
    if (review_mode) {
      getPeople()
        .then(async (response) => {
          if (response.ok) {
            /** @type Array<{pk_persona: number, nombre: string }>|*/
            const people = await response.json();

            setPeople(
              people
                .map(({ pk_persona, nombre }) => [pk_persona, nombre])
                .sort(([_x, x], [_y, y]) => x.localeCompare(y)),
            );
          } else {
            throw new Error();
          }
        })
        .catch(() => console.error("couldnt load people"));
    }
  }, []);

  return (
    <Fragment>
      {review_mode
        ? (
          <Fragment>
            <Grid container>
              <Grid item md={6}>
                <AdvancedSelectField
                  fullWidth
                  label="Empleado"
                  onChange={(_e, value) => setSelectedPerson(value)}
                  options={people}
                  value={selected_person}
                />
              </Grid>
            </Grid>
            <br />
            <br />
          </Fragment>
        )
        : null}
      <MainForm
        person={selected_person}
        review_mode={review_mode}
      />
      <br />
      <br />
      <Grid container spacing={10}>
        <Grid item md={6} xs={12}>
          <DocumentForm
            person={selected_person}
            review_mode={review_mode}
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <ResidenceForm
            person={selected_person}
            review_mode={review_mode}
          />
        </Grid>
      </Grid>
      <br />
      <br />
      {!review_mode
        ? (
          <Fragment>
            <ContactForm />
            <br />
            <br />
            <ChildrenForm />
            <br />
            <br />
            <LanguageForm />
            <br />
            <br />
          </Fragment>
        )
        : null}
      <FileForm />
    </Fragment>
  );
}
