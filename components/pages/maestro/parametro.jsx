import React, { Fragment, useEffect, useState } from "react";
import {
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  TextField,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  formatResponseJson,
  requestGenerator,
} from "../../../lib/api/request.ts";
import { formatDateToStandardString } from "../../../lib/date/mod.js";

import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import Title from "../../common/Title.jsx";
import SelectField from "../../common/SelectField.jsx";
import Widget from "../../common/Widget.jsx";

const fetchParameterApi = requestGenerator("maestro/parametro");
const fetchParameterDefinitionApi = requestGenerator(
  "maestro/parametro_definicion",
);

const getParameter = (id) => fetchParameterApi(id).then((x) => x.json());
const getDefinition = (id) =>
  fetchParameterDefinitionApi(id).then((x) => x.json());

const getDefinitions = (parameter) =>
  fetchParameterDefinitionApi(`search?parameter=${parameter}`);

const createParameter = async (
  name,
  description,
  type,
) =>
  fetchParameterApi("", {
    body: JSON.stringify({
      name,
      description,
      type,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const createDefinition = async (
  parameter_id,
  start_date,
  end_date,
  value,
) =>
  fetchParameterDefinitionApi(parameter_id, {
    body: JSON.stringify({
      start_date,
      end_date,
      value,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const updateParameter = async (
  id,
  name,
  description,
  type,
) =>
  fetchParameterApi(id, {
    body: JSON.stringify({
      name,
      description,
      type,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const updateDefinition = async (
  id,
  start_date,
  end_date,
  value,
) =>
  fetchParameterDefinitionApi(id, {
    body: JSON.stringify({
      start_date,
      end_date,
      value,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const deleteParameter = async (id) =>
  fetchParameterApi(id, {
    method: "DELETE",
  });

const deleteDefinition = async (id) =>
  fetchParameterDefinitionApi(id, {
    method: "DELETE",
  });

const headers = [
  {
    id: "name",
    numeric: false,
    disablePadding: false,
    label: "Nombre",
    searchable: true,
  },
  {
    id: "description",
    numeric: false,
    disablePadding: false,
    label: "Descripción",
    searchable: true,
  },
  {
    id: "type",
    numeric: false,
    disablePadding: false,
    label: "Tipo de Variable",
  },
];

const AddModal = ({
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const [fields, setFields] = useState({
    name: "",
    description: "",
    type: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const request = await createParameter(
      fields.name,
      fields.description,
      fields.type,
    );

    if (request.ok) {
      setModalOpen(false);
      updateTable();
    } else {
      const { message } = await request.json();
      setError(message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (is_open) {
      setFields({
        name: "",
        description: "",
        type: "",
      });
      setError(null);
      setLoading(false);
    }
  }, [is_open]);

  return (
    <DialogForm
      error={error}
      handleSubmit={handleSubmit}
      is_loading={is_loading}
      is_open={is_open}
      setIsOpen={setModalOpen}
      title={"Crear Nuevo"}
    >
      <TextField
        margin="dense"
        name="name"
        label="Nombre"
        fullWidth
        onChange={handleChange}
        required
        value={fields.name}
      />
      <TextField
        margin="dense"
        name="description"
        label="Descripción"
        fullWidth
        onChange={handleChange}
        required
        value={fields.description}
      />
      <SelectField
        margin="dense"
        name="type"
        label="Tipo de parámetro"
        fullWidth
        onChange={handleChange}
        required
        value={fields.type}
      >
        <option value="number">Número</option>
        <option value="percentage">Porcentaje</option>
        <option value="string">Texto</option>
      </SelectField>
    </DialogForm>
  );
};

const useEditModalStyles = makeStyles((theme) => ({
  list: {
    width: "100%",
    maxWidth: 250,
    backgroundColor: theme.palette.background.paper,
  },
}));

const EditModal = ({
  id,
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const styles = useEditModalStyles();

  const [should_fetch_definitions, setFetchDefinitions] = useState(false);
  const [should_fetch_data, setFetchData] = useState(true);
  const [formulary_changed, setFormularyChanged] = useState(false);
  const [is_parameter_selected, setParameterSelected] = useState(true);
  const [selected_definition, setSelectedDefinition] = useState(0);
  const [definitions, setDefinitions] = useState([]);
  const [parameter_fields, setParameterFields] = useState({
    name: "",
    description: "",
    type: "",
  });
  const [definition_fields, setDefinitionFields] = useState({
    start_date: "",
    end_date: "",
    value: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    setFormularyChanged(false);
    if (is_open) {
      setFetchDefinitions(true);
      if (should_fetch_data) {
        if (is_parameter_selected) {
          getParameter(id).then(({ nombre, descripcion, tipo_parametro }) => {
            setParameterFields({
              name: nombre,
              description: descripcion,
              type: tipo_parametro,
            });
          });
        } else if (selected_definition) {
          getDefinition(selected_definition).then(
            ({ fec_inicio, fec_fin, valor }) => {
              setDefinitionFields({
                start_date: formatDateToStandardString(new Date(fec_inicio)),
                end_date: formatDateToStandardString(new Date(fec_fin)),
                value: valor,
              });
            },
          );
        }
        setFetchData(false);
      }
    }
  }, [id, is_open, should_fetch_data]);

  useEffect(() => {
    if (should_fetch_definitions) {
      getDefinitions(id)
        .then((request) => {
          if (request.ok) {
            return request.json();
          } else {
            throw new Error();
          }
        })
        .then((definitions) => setDefinitions(definitions))
        .catch(() =>
          setError("No fue posible cargar las definiciones disponibles")
        );
      setFetchDefinitions(false);
    }
  }, [should_fetch_definitions]);

  const handleParameterChange = (event) => {
    setFormularyChanged(true);
    const { name, value } = event.target;
    setParameterFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleDefinitionChange = (event) => {
    setFormularyChanged(true);
    const { name, value } = event.target;
    setDefinitionFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const setFocusToParameter = () => {
    if (formulary_changed) {
      setError("Guarde los cambios registrados primero");
    } else {
      setParameterSelected(true);
      setFetchData(true);
    }
  };

  const setFocusToDefinition = (definition) => {
    if (formulary_changed) {
      setError("Guarde los cambios registrados primero");
    } else {
      setParameterSelected(false);
      setSelectedDefinition(definition);
      setFetchData(true);
    }
  };

  const submitParameter = async () => {
    setLoading(true);
    setError(null);

    const request = await updateParameter(
      id,
      parameter_fields.name,
      parameter_fields.description,
      parameter_fields.type,
    );

    if (request.ok) {
      setModalOpen(false);
      updateTable();
    } else {
      const { message } = await request.json();
      setError(message);
    }
    setLoading(false);
    setFormularyChanged(false);
  };

  const submitDefinition = async () => {
    setLoading(true);
    setError(null);

    let request;

    if (selected_definition === 0) {
      request = createDefinition(
        id,
        definition_fields.start_date,
        definition_fields.end_date,
        definition_fields.value,
      );
    } else {
      request = updateDefinition(
        selected_definition,
        definition_fields.start_date,
        definition_fields.end_date,
        definition_fields.value,
      );
    }

    request
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then(() => {
        setFormularyChanged(false);
        setModalOpen(false);
      })
      .catch(async () => {
        const {
          message = "No fue posible guardar la definicion",
        } = await request
          .then((x) => x.json())
          .catch(() => ({}));
        setError(message);
      })
      .finally(() => setLoading(false));
  };

  const submitData = () => {
    if (is_parameter_selected) {
      submitParameter();
    } else {
      submitDefinition();
    }
  };

  const addDefinition = () => {
    setFocusToDefinition(0);
    setDefinitionFields({
      start_date: "",
      end_date: "",
      value: "",
    });
  };

  const removeDefinition = (id) => {
    deleteDefinition(id)
      .then(() => setFetchDefinitions(true))
      .catch(() => setError("No fue posible eliminar la definicion"));
  };

  return (
    <Dialog
      fullWidth
      maxWidth={"md"}
      onClose={() => setModalOpen(false)}
      open={is_open}
      scroll={"paper"}
    >
      <DialogTitle>Crear Nuevo</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={4}>
            <div className={styles.list}>
              <Card>
                <List component="nav" aria-label="main mailbox folders">
                  <ListItem
                    button
                    onClick={() => setFocusToParameter()}
                    selected={is_parameter_selected}
                  >
                    <ListItemText>Parametro</ListItemText>
                  </ListItem>
                  <Divider />
                  {definitions.map(({
                    pk_definicion,
                    fec_inicio,
                    fec_fin,
                  }) => {
                    const start_date = new Date(fec_inicio).toLocaleDateString(
                      "es-CO",
                    );
                    const end_date = new Date(fec_fin).toLocaleDateString(
                      "es-CO",
                    );
                    return (
                      <ListItem
                        button
                        key={pk_definicion}
                        onClick={() => setFocusToDefinition(pk_definicion)}
                        selected={(pk_definicion === selected_definition) &&
                          !is_parameter_selected}
                      >
                        <ListItemText>
                          {`${start_date} - ${end_date}`}
                        </ListItemText>
                        <ListItemSecondaryAction>
                          <Button
                            onClick={() => removeDefinition(pk_definicion)}
                          >
                            -
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  })}
                  <ListItem>
                    <ListItemText>Agregar</ListItemText>
                    <ListItemSecondaryAction>
                      <Button
                        onClick={addDefinition}
                      >
                        +
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Card>
            </div>
          </Grid>
          <Grid item xs={8}>
            {is_parameter_selected
              ? (
                <Fragment>
                  <TextField
                    margin="dense"
                    name="name"
                    label="Nombre"
                    fullWidth
                    onChange={handleParameterChange}
                    required
                    value={parameter_fields.name}
                  />
                  <TextField
                    margin="dense"
                    name="description"
                    label="Descripción"
                    fullWidth
                    onChange={handleParameterChange}
                    required
                    value={parameter_fields.description}
                  />
                  <SelectField
                    margin="dense"
                    name="type"
                    label="Tipo de parámetro"
                    fullWidth
                    onChange={handleParameterChange}
                    required
                    value={parameter_fields.type}
                  >
                    <option value="number">Número</option>
                    <option value="percentage">Porcentaje</option>
                    <option value="string">Texto</option>
                  </SelectField>
                </Fragment>
              )
              : (
                <Fragment>
                  <TextField
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    label="Fecha inicial"
                    margin="dense"
                    name="start_date"
                    onChange={handleDefinitionChange}
                    required
                    type="date"
                    value={definition_fields.start_date}
                  />
                  <TextField
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    label="Fecha final"
                    margin="dense"
                    name="end_date"
                    onChange={handleDefinitionChange}
                    required
                    type="date"
                    value={definition_fields.end_date}
                  />
                  {parameter_fields.type == "string"
                    ? (
                      <TextField
                        fullWidth
                        label="Valor"
                        margin="dense"
                        name="value"
                        onChange={handleDefinitionChange}
                        required
                        value={definition_fields.value}
                      />
                    )
                    : (
                      <TextField
                        fullWidth
                        InputProps={{
                          ...(
                            parameter_fields.type == "percentage"
                              ? {
                                inputProps: {
                                  min: 0,
                                  max: 100,
                                },
                              }
                              : {}
                          ),
                        }}
                        label="Valor"
                        margin="dense"
                        name="value"
                        onChange={handleDefinitionChange}
                        type="number"
                        required
                        value={definition_fields.value}
                      />
                    )}
                </Fragment>
              )}
          </Grid>
        </Grid>
        {error && (
          <Typography
            align="right"
            color="error"
          >
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={() => setModalOpen(false)}>
          Cerrar
        </Button>
        {is_loading
          ? (
            <CircularProgress
              size={26}
            />
          )
          : (
            <Button
              color="primary"
              onClick={submitData}
            >
              Guardar
            </Button>
          )}
      </DialogActions>
    </Dialog>
  );
};

const DeleteModal = ({
  is_open,
  selected,
  setModalOpen,
  updateTable,
}) => {
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const delete_progress = selected.map((id) => deleteParameter(id));

    Promise.allSettled(delete_progress)
      .then((results) =>
        results.reduce(async (total, result) => {
          if (result.status == "rejected") {
            total.push(result.reason.message);
          } else if (!result.value.ok) {
            total.push(await formatResponseJson(result.value));
          }
          return total;
        }, [])
      )
      .then((errors) => {
        if (errors.length) {
          setError(errors[0]);
        } else {
          setModalOpen(false);
        }
        setLoading(false);
        updateTable();
      });
  };

  return (
    <DialogForm
      error={error}
      handleSubmit={handleSubmit}
      is_loading={is_loading}
      is_open={is_open}
      setIsOpen={setModalOpen}
      title="Eliminar"
      confirmButtonText={"Confirmar"}
    >
      <DialogContentText>
        Esta operacion no se puede deshacer. ¿Esta seguro que desea eliminar
        estos <b>{selected.length}</b>
        &nbsp;elementos?
      </DialogContentText>
    </DialogForm>
  );
};

export default () => {
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selected_parameter, setSelectedParameter] = useState(0);
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(false);

  const handleEditModalOpen = async (id) => {
    setSelectedParameter(id);
    setEditModalOpen(true);
  };

  const handleDeleteModalOpen = async (selected) => {
    setSelected(selected);
    setDeleteModalOpen(true);
  };

  const updateTable = () => {
    setTableShouldUpdate(true);
  };

  useEffect(() => {
    updateTable();
  }, []);

  return (
    <Fragment>
      <Title title="Parámetro" />
      <AddModal
        is_open={is_add_modal_open}
        setModalOpen={setAddModalOpen}
        updateTable={updateTable}
      />
      <EditModal
        id={selected_parameter}
        is_open={is_edit_modal_open}
        setModalOpen={setEditModalOpen}
        updateTable={updateTable}
      />
      <DeleteModal
        is_open={is_delete_modal_open}
        setModalOpen={setDeleteModalOpen}
        selected={selected}
        updateTable={updateTable}
      />
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Widget noBodyPadding>
            <AsyncTable
              columns={headers}
              onAddClick={() => setAddModalOpen(true)}
              onEditClick={(id) => handleEditModalOpen(id)}
              onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
              onTableUpdate={() => setTableShouldUpdate(false)}
              update_table={tableShouldUpdate}
              url={"maestro/parametro/table"}
            />
          </Widget>
        </Grid>
      </Grid>
    </Fragment>
  );
};
