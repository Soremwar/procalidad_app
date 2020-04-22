import React, {
  Fragment,
  useEffect,
  useState,
} from "react";
import {
  DialogContentText,
  Grid,
  TextField,
} from "@material-ui/core";

import AsyncSelectField from "../../common/AsyncSelectField.jsx";
import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import Title from "../../common/Title.jsx";
import SelectField from "../../common/SelectField.jsx";
import Widget from "../../common/Widget.jsx";

//TODO
//Add primary key as constant

const getClients = () => {
  //TODO
  //Remove hardcoded url
  const url = `http://localhost/api/clientes/cliente`;
  return fetch(`${url}`)
    .then((x) => x.json());
};

const getBudgetTypes = () => {
  //TODO
  //Remove hardcoded url
  const url = `http://localhost/api/operaciones/tipo_presupuesto`;
  return fetch(`${url}`)
    .then((x) => x.json());
};

const getBudget = (id) => {
  //TODO
  //Remove hardcoded url
  const url = `http://localhost/api/operaciones/presupuesto/${id}`;
  return fetch(`${url}`)
    .then((x) => x.json());
};

const createBudget = async (form_data) => {
  //TODO
  //Remove hardcoded url
  const url = "http://localhost/api/operaciones/presupuesto";
  return await fetch(`${url}`, {
    method: "POST",
    body: form_data,
  });
};

const updateBudget = async (id, form_data) => {
  //TODO
  //Remove hardcoded url
  const url = `http://localhost/api/operaciones/presupuesto/${id}`;
  return await fetch(`${url}`, {
    method: "PUT",
    body: form_data,
  });
};

const deleteBudget = async (id) => {
  //TODO
  //Remove hardcoded url
  const url = `http://localhost/api/operaciones/presupuesto/${id}`;
  return await fetch(`${url}`, {
    method: "DELETE",
  });
};

const headers = [
  { id: "project", numeric: false, disablePadding: false, label: "Proyecto" },
  {
    id: "budget_type",
    numeric: false,
    disablePadding: false,
    label: "Tipo de Proyecto",
  },
  { id: "name", numeric: false, disablePadding: false, label: "Nombre" },
  { id: "status", numeric: false, disablePadding: false, label: "Estado" },
];

const AddModal = ({
  budget_types,
  clients,
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fields, setFields] = useState({
    client: "",
    project: "",
    budget_type: "",
    name: "",
    description: "",
    status: "",
  });
  const [project_query, setProjectQuery] = useState("");

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFields((prev_state) => {
      const data = ({ ...prev_state, [name]: value });
      return data;
    });
  };

  const handleSubmit = async (event) => {
    setLoading(true);
    setError(null);

    const request = await createBudget(new URLSearchParams(fields));

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
      setError(null);
      setFields({
        client: "",
        project: "",
        budget_type: "",
        name: "",
        description: "",
        status: "",
      });
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
      <SelectField
        margin="dense"
        name="client"
        label="Cliente"
        fullWidth
        onChange={(event) => handleChange(event)}
        required
        value={fields.client}
      >
        {clients.map(({ pk_cliente, nombre }) => (
          <option key={pk_cliente} value={pk_cliente}>{nombre}</option>
        ))}
      </SelectField>
      <AsyncSelectField
        disabled={!fields.client}
        fullWidth
        handleSource={(source) => (
          Object.values(source).map(({
            pk_proyecto,
            nombre,
          }) => {
            return { value: String(pk_proyecto), text: nombre };
          })
        )}
        label="Proyecto"
        margin="dense"
        name="project"
        onChange={(event) => handleChange(event)}
        onType={(event) => {
          if (fields.project) {
            setFields((old_state) => ({ ...old_state, project: "" }));
          }
          const value = event.target.value;
          setProjectQuery(value);
        }}
        required
        source={`http://localhost/api/operaciones/proyecto/search?client=${fields.client}&query=${encodeURI(
          fields.project
            ? ""
            : project_query.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
        )}`}
        value={fields.project}
      />
      <SelectField
        margin="dense"
        name="budget_type"
        label="Tipo de Presupuesto"
        fullWidth
        onChange={(event) => handleChange(event)}
        required
        value={fields.budget_type}
      >
        {budget_types.map(({ pk_tipo, nombre }) => (
          <option key={pk_tipo} value={pk_tipo}>{nombre}</option>
        ))}
      </SelectField>
      <TextField
        margin="dense"
        name="name"
        label="Nombre"
        fullWidth
        onChange={(event) => handleChange(event)}
        required
        value={fields.name}
      />
      <TextField
        margin="dense"
        name="description"
        label="Descripcion"
        fullWidth
        onChange={(event) => handleChange(event)}
        required
        value={fields.description}
      />
      <SelectField
        margin="dense"
        name="status"
        label="Estado"
        fullWidth
        onChange={(event) => handleChange(event)}
        required
        value={fields.status}
      >
        <option value="0">Cerrado</option>
        <option value="1">Abierto</option>
      </SelectField>
    </DialogForm>
  );
};

const EditModal = ({
  budget_types,
  clients,
  data,
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const [fields, setFields] = useState({
    project: "",
    budget_type: "",
    name: "",
    description: "",
    status: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [project_query, setProjectQuery] = useState("");

  useEffect(() => {
    if (is_open) {
      setFields({
        client: data.fk_cliente,
        project: String(data.fk_proyecto),
        budget_type: data.fk_tipo_presupuesto,
        name: data.nombre,
        description: data.descripcion,
        status: Number(data.estado),
      });
    }
  }, [is_open]);

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFields((prev_state) => {
      const data = ({ ...prev_state, [name]: value });
      return data;
    });
  };

  const handleSubmit = async (event) => {
    setLoading(true);
    setError(null);

    const id = data.pk_presupuesto;
    const request = await updateBudget(id, new URLSearchParams(fields));

    if (request.ok) {
      setModalOpen(false);
      updateTable();
    } else {
      const { message } = await request.json();
      setError(message);
    }
    setLoading(false);
  };

  return (
    <DialogForm
      error={error}
      handleSubmit={handleSubmit}
      is_loading={is_loading}
      is_open={is_open}
      setIsOpen={setModalOpen}
      title={"Editar"}
    >
      <SelectField
        margin="dense"
        name="client"
        label="Cliente"
        fullWidth
        onChange={(event) => handleChange(event)}
        required
        value={fields.client}
      >
        {clients.map(({ pk_cliente, nombre }) => (
          <option key={pk_cliente} value={pk_cliente}>{nombre}</option>
        ))}
      </SelectField>
      <AsyncSelectField
        disabled={!fields.client}
        fullWidth
        handleSource={(source) => (
          Object.values(source).map(({
            pk_proyecto,
            nombre,
          }) => {
            return { value: String(pk_proyecto), text: nombre };
          })
        )}
        label="Proyecto"
        margin="dense"
        name="project"
        onChange={(event) => handleChange(event)}
        onType={(event) => {
          if (fields.project) {
            setFields((old_state) => ({ ...old_state, project: "" }));
          }
          const value = event.target.value;
          setProjectQuery(value);
        }}
        preload
        required
        source={`http://localhost/api/operaciones/proyecto/search?client=${fields.client}&query=${encodeURI(
          fields.project
            ? ""
            : project_query.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
        )}`}
        value={fields.project}
      />
      <SelectField
        margin="dense"
        name="budget_type"
        label="Tipo de Presupuesto"
        fullWidth
        onChange={(event) => handleChange(event)}
        required
        value={fields.budget_type}
      >
        {budget_types.map(({ pk_tipo, nombre }) => (
          <option key={pk_tipo} value={pk_tipo}>{nombre}</option>
        ))}
      </SelectField>
      <TextField
        margin="dense"
        name="name"
        label="Nombre"
        fullWidth
        onChange={(event) => handleChange(event)}
        required
        value={fields.name}
      />
      <TextField
        margin="dense"
        name="description"
        label="Descripcion"
        fullWidth
        onChange={(event) => handleChange(event)}
        required
        value={fields.description}
      />
      <SelectField
        margin="dense"
        name="status"
        label="Estado"
        fullWidth
        onChange={(event) => handleChange(event)}
        required
        value={fields.status}
      >
        <option value="0">Cerrado</option>
        <option value="1">Abierto</option>
      </SelectField>
    </DialogForm>
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

  const handleSubmit = async (event) => {
    setLoading(true);
    setError(null);

    const delete_progress = selected.map((id) => deleteBudget(id));

    //TODO
    //Add error catching
    Promise.all(delete_progress)
      .then(() => {
        setModalOpen(false);
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
      title={"Crear Nuevo"}
      confirmButtonText={"Confirmar"}
    >
      <DialogContentText>
        Esta operacion no se puede deshacer.
        ¿Esta seguro que desea eliminar estos <b>{selected.length}</b>
        &nbsp;elementos?
      </DialogContentText>
    </DialogForm>
  );
};

export default () => {
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selected_budget, setSelectedBudget] = useState({});
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(true);
  const [clients, setClients] = useState([]);
  const [budget_types, setBudgetTypes] = useState([]);

  const handleEditModalOpen = async (id) => {
    const data = await getBudget(id);
    setSelectedBudget(data);
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
    getClients().then((clients) => setClients(clients));
    getBudgetTypes().then((budget_types) => setBudgetTypes(budget_types));
  }, []);

  return (
    <Fragment>
      <Title title={"Presupuesto"} />
      <AddModal
        budget_types={budget_types}
        clients={clients}
        is_open={is_add_modal_open}
        setModalOpen={setAddModalOpen}
        updateTable={updateTable}
      />
      <EditModal
        budget_types={budget_types}
        clients={clients}
        data={selected_budget}
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
            {/*
              TODO
              Remove hardcoded url
            */}
            <AsyncTable
              data_index={"pk_presupuesto"}
              data_source={"http://localhost/api/operaciones/presupuesto/table"}
              headers={headers}
              onAddClick={() => setAddModalOpen(true)}
              onEditClick={(id) => handleEditModalOpen(id)}
              onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
              tableShouldUpdate={tableShouldUpdate}
              setTableShouldUpdate={setTableShouldUpdate}
              title={"Listado de Presupuestos"}
            />
          </Widget>
        </Grid>
      </Grid>
    </Fragment>
  );
};
