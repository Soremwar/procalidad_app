import React, {
  Fragment,
  useEffect,
  useState
} from "react";
import {
  DialogContentText,
  Grid,
  TextField
} from "@material-ui/core";

import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import Title from "../../common/Title.jsx";
import SelectField from "../../common/SelectField.jsx";
import Widget from "../../common/Widget.jsx";

//TODO
//Add primary key as constant

const getProjects = () => {
  //TODO
  //Remove hardcoded url
  const url = `http://localhost/api/operaciones/proyecto`;
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
  { id: "budget_type", numeric: false, disablePadding: false, label: "Tipo de Proyecto" },
  { id: "name", numeric: false, disablePadding: false, label: "Nombre" },
  { id: "status", numeric: false, disablePadding: false, label: "Estado" },
];

const AddModal = ({
  budget_types,
  is_open,
  projects,
  setModalOpen,
  updateTable,
}) => {
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    setLoading(true);
    setError(null);

    const form_data = new FormData(event.target);
    const request = await createBudget(new URLSearchParams(form_data));

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
      title={"Crear Nuevo"}
    >
      <SelectField
        margin="dense"
        name="project"
        label="Proyecto"
        fullWidth
        required
      >
        {projects.map(({ pk_proyecto, nombre }) => (
          <option key={pk_proyecto} value={pk_proyecto}>{nombre}</option>
        ))}
      </SelectField>
      <SelectField
        margin="dense"
        name="budget_type"
        label="Tipo de Presupuesto"
        fullWidth
        required
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
        required
      />
      <TextField
        margin="dense"
        name="description"
        label="Descripcion"
        fullWidth
        required
      />
      <SelectField
        margin="dense"
        name="status"
        label="Estado"
        fullWidth
        required
      >
        <option value="0">Cerrado</option>
        <option value="1">Abierto</option>
      </SelectField>
    </DialogForm>
  );
};

const EditModal = ({
  budget_types,
  data,
  is_open,
  projects,
  setModalOpen,
  updateTable,
}) => {
  const [fields, setFields] = useState({
    project: '',
    budget_type: '',
    name: '',
    description: '',
    status: '',
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        project: data.fk_proyecto,
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

    const form_data = new FormData(event.target);
    const id = data.pk_presupuesto;
    const request = await updateBudget(id, new URLSearchParams(form_data));

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
        name="project"
        label="Proyecto"
        fullWidth
        onChange={event => handleChange(event)}
        required
        value={fields.project}
      >
        {projects.map(({ pk_proyecto, nombre }) => (
          <option key={pk_proyecto} value={pk_proyecto}>{nombre}</option>
        ))}
      </SelectField>
      <SelectField
        margin="dense"
        name="budget_type"
        label="Tipo de Presupuesto"
        fullWidth
        onChange={event => handleChange(event)}
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
        onChange={event => handleChange(event)}
        required
        value={fields.name}
      />
      <TextField
        margin="dense"
        name="description"
        label="Descripcion"
        fullWidth
        onChange={event => handleChange(event)}
        required
        value={fields.description}
      />
      <SelectField
        margin="dense"
        name="status"
        label="Estado"
        fullWidth
        onChange={event => handleChange(event)}
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
  const [projects, setProjects] = useState([]);
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
    getProjects().then(projects => setProjects(projects));
    getBudgetTypes().then(budget_types => setBudgetTypes(budget_types));
  }, []);

  return (
    <Fragment>
      <Title title={"Presupuesto"} />
      <AddModal
        budget_types={budget_types}
        is_open={is_add_modal_open}
        projects={projects}
        setModalOpen={setAddModalOpen}
        updateTable={updateTable}
      />
      <EditModal
        budget_types={budget_types}
        data={selected_budget}
        is_open={is_edit_modal_open}
        projects={projects}
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
