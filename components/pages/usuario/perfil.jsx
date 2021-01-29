import React, { Fragment, useEffect, useState } from "react";
import {
  Button,
  Checkbox as MuiCheckbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  Typography,
} from "@material-ui/core";
import { fetchHRPerson, fetchPeopleApi } from "../../../lib/api/generator.js";
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
 * If preview is set to true, the server will return
 * raw HTML
 * */
const generateResume = (id, generation_parameters, preview) =>
  fetchHRPerson(`hv/${id}`, {
    body: JSON.stringify({ ...generation_parameters, preview }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const Checkbox = ({
  checked,
  label,
  onChange,
}) => (
  <FormControlLabel
    control={<MuiCheckbox checked={checked} onChange={onChange} />}
    label={label}
  />
);

const MarginLeft = ({
  children,
}) => (
  <FormGroup style={{ marginLeft: "20px" }}>
    {children}
  </FormGroup>
);

/**
 * @param {object} props
 * @param {boolean} [props.review_mode = false]
 * */
export default function Perfil({
  review_mode = false,
}) {
  const [people, setPeople] = useState([]);
  const [selected_person, setSelectedPerson] = useState();
  const [show_cv_selection_modal, showCVSelectionModal] = useState(false);
  const [cv_selection_modal_loading, setCvSelectionModalLoading] = useState(
    false,
  );
  const [cv_selection_modal_error, setCvSelectionModalError] = useState("");
  const [generation_parameters, setGenerationParameters] = useState({
    general_information: false,
    project_experience: {
      participation_dates: false,
      participation: false,
      functions: false,
      contact: false,
      all_experience: false,
    },
    certifications: false,
    continuous_formation: false,
  });

  useEffect(() => {
    setCvSelectionModalLoading(false);
    setCvSelectionModalError("");
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
              <Grid
                container
                item
                justify="center"
                md={6}
              >
                <Button
                  disabled={!selected_person}
                  color="primary"
                  onClick={() => showCVSelectionModal(true)}
                  variant="contained"
                >
                  Generar hoja de vida
                </Button>
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
      {!review_mode
        ? (
          <Fragment>
            <br />
            <br />
            <ContactForm />
            <br />
            <br />
            <ChildrenForm />
            <br />
            <br />
            <LanguageForm />
          </Fragment>
        )
        : null}
      {!review_mode
        ? <FileForm
          person={selected_person}
          review_mode={review_mode}
        />
        : !!selected_person && <FileForm
          person={selected_person}
          review_mode={review_mode}
        />}
      <Dialog
        fullWidth
        maxWidth="md"
        onClose={() => showCVSelectionModal(false)}
        open={show_cv_selection_modal}
        scroll="paper"
      >
        <DialogTitle>Opciones de hoja de vida</DialogTitle>
        <DialogContent>
          <FormControl>
            <FormLabel>Opciones</FormLabel>
            <FormGroup>
              <Checkbox
                checked={generation_parameters.general_information}
                label="Informacion General"
                onChange={() =>
                  setGenerationParameters((prev_state) => {
                    prev_state.general_information = !prev_state
                      .general_information;
                    return { ...prev_state };
                  })}
              />
              <Checkbox
                checked={generation_parameters.project_experience.contact &&
                  generation_parameters.project_experience.functions &&
                  generation_parameters.project_experience.participation &&
                  generation_parameters.project_experience
                    .participation_dates &&
                  generation_parameters.project_experience.all_experience}
                label="Experiencia en proyectos"
                onChange={(event) => {
                  const checked = event.target.checked;
                  setGenerationParameters((prev_state) => {
                    prev_state.project_experience.contact = checked;
                    prev_state.project_experience.functions = checked;
                    prev_state.project_experience.participation = checked;
                    prev_state.project_experience.participation_dates = checked;
                    prev_state.project_experience.all_experience = checked;
                    return { ...prev_state };
                  });
                }}
              />
              <MarginLeft>
                <Checkbox
                  checked={generation_parameters.project_experience
                    .participation_dates}
                  label="Fechas de participacion"
                  onChange={() =>
                    setGenerationParameters((prev_state) => {
                      prev_state.project_experience.participation_dates =
                        !prev_state.project_experience.participation_dates;
                      return { ...prev_state };
                    })}
                />
                <Checkbox
                  checked={generation_parameters.project_experience
                    .participation}
                  label="Porcentaje de participacion"
                  onChange={() =>
                    setGenerationParameters((prev_state) => {
                      prev_state.project_experience.participation = !prev_state
                        .project_experience.participation;
                      return { ...prev_state };
                    })}
                />
                <Checkbox
                  checked={generation_parameters.project_experience.functions}
                  label="Funciones"
                  onChange={() =>
                    setGenerationParameters((prev_state) => {
                      prev_state.project_experience.functions = !prev_state
                        .project_experience.functions;
                      return { ...prev_state };
                    })}
                />
                <Checkbox
                  checked={generation_parameters.project_experience.contact}
                  label="Contacto"
                  onChange={() =>
                    setGenerationParameters((prev_state) => {
                      prev_state.project_experience.contact = !prev_state
                        .project_experience.contact;
                      return { ...prev_state };
                    })}
                />
                <Checkbox
                  checked={generation_parameters.project_experience
                    .all_experience}
                  label="Toda la experiencia"
                  onChange={() =>
                    setGenerationParameters((prev_state) => {
                      prev_state.project_experience.all_experience = !prev_state
                        .project_experience.all_experience;
                      return { ...prev_state };
                    })}
                />
                <Checkbox
                  checked={!generation_parameters.project_experience
                    .all_experience}
                  label="Solo experiencia en Procalidad"
                  onChange={() =>
                    setGenerationParameters((prev_state) => {
                      prev_state.project_experience.all_experience = !prev_state
                        .project_experience.all_experience;
                      return { ...prev_state };
                    })}
                />
              </MarginLeft>
              <Checkbox
                checked={generation_parameters.certifications}
                label="Certificaciones"
                onChange={() =>
                  setGenerationParameters((prev_state) => {
                    prev_state.certifications = !prev_state.certifications;
                    return { ...prev_state };
                  })}
              />
              <Checkbox
                checked={generation_parameters.continuous_formation}
                label="Formacion continuada"
                onChange={() =>
                  setGenerationParameters((prev_state) => {
                    prev_state.continuous_formation = !prev_state
                      .continuous_formation;
                    return { ...prev_state };
                  })}
              />
            </FormGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          {cv_selection_modal_loading && (
            <CircularProgress
              size={26}
            />
          )}
          <Button
            color="primary"
            disabled={cv_selection_modal_loading}
            onClick={() => showCVSelectionModal(false)}
          >
            Cancelar
          </Button>
          <Button
            color="primary"
            disabled={cv_selection_modal_loading}
            onClick={async () => {
              setCvSelectionModalLoading(true);
              try {
                const html = await generateResume(
                  selected_person,
                  generation_parameters,
                  true,
                )
                  .then((response) => {
                    if (response.ok) {
                      return response.text();
                    }
                    throw new Error();
                  });

                const win = window.open("", "_blank");
                win.document.body.innerHTML = html;
                setCvSelectionModalError("");
              } catch (e) {
                setCvSelectionModalError(
                  "No fue posible generar la hoja de vida",
                );
              } finally {
                setCvSelectionModalLoading(false);
              }
            }}
          >
            Generar vista previa
          </Button>
          <Button
            color="primary"
            disabled={cv_selection_modal_loading}
            onClick={async () => {
              setCvSelectionModalLoading(true);
              const download_link = document.createElement("a");
              try {
                const file = await generateResume(
                  selected_person,
                  generation_parameters,
                  false,
                )
                  .then((response) => {
                    if (response.ok) {
                      return response.blob();
                    }
                    throw new Error();
                  });

                download_link.href = URL.createObjectURL(file);
                download_link.download = "Hoja de vida.pdf";

                document.body.appendChild(download_link);
                download_link.click();
                document.body.removeChild(download_link);
                setCvSelectionModalError("");
              } catch (e) {
                setCvSelectionModalError(
                  "No fue posible generar la hoja de vida",
                );
              } finally {
                setCvSelectionModalLoading(false);
              }
            }}
          >
            Descargar PDF
          </Button>
          <br />
          {!!cv_selection_modal_error && (
            <Typography
              align="right"
              color="error"
            >
              {cv_selection_modal_error}
            </Typography>
          )}
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}
