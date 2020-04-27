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

import {
  formatResponseJson,
  requestGenerator,
} from "../../../lib/api/request.js";

import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import Title from "../../common/Title.jsx";
import SelectField from "../../common/SelectField.jsx";
import Widget from "../../common/Widget.jsx";

//TODO
//Add primary key as constant

const fetchPeopleApi = requestGenerator('organizacion/persona');
const fetchAreaTypesApi = requestGenerator('organizacion/tipo_area');

const getSupervisors = () => fetchPeopleApi().then((x) => x.json());

const getProjectType = (id) => fetchAreaTypesApi(id).then((x) => x.json());

const createProjectType = async (form_data) => {
  return await fetchAreaTypesApi("", {
    method: "POST",
    body: form_data,
  });
};

const updateProjectType = async (id, form_data) => {
  return await fetchAreaTypesApi(id, {
    method: "PUT",
    body: form_data,
  });
};

const deleteProjectType = async (id) => {
  return await fetchAreaTypesApi(id, {
    method: "DELETE",
  });
};

const headers = [
  { id: "name", numeric: false, disablePadding: false, label: "Nombre" },
  {
    id: "supervisor",
    numeric: false,
    disablePadding: false,
    label: "Supervisor",
  },
];

const AddModal = ({
  is_open,
  setModalOpen,
  supervisors,
  updateTable,
}) => {
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    setLoading(true);
    setError(null);

    const form_data = new FormData(event.target);
    const request = await createProjectType(new URLSearchParams(form_data));

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
      <TextField
        autoFocus
        fullWidth
        label="Tipo de Area"
        margin="dense"
        name="name"
        required
      />
      <SelectField
        autoFocus
        fullWidth
        label="Supervisor"
        name="supervisor"
        required
      >
        {supervisors.map(({ pk_persona, nombre }) => (
          <option key={pk_persona} value={pk_persona}>{nombre}</option>
        ))}
      </SelectField>
    </DialogForm>
  );
};

const EditModal = ({
  data,
  is_open,
  setModalOpen,
  supervisors,
  updateTable,
}) => {
  const [fields, setFields] = useState({
    name: null,
    supervisor: null,
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        name: data.nombre,
        supervisor: data.fk_supervisor,
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
    const id = data.pk_tipo;
    const request = await updateProjectType(id, new URLSearchParams(form_data));

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
      <TextField
        autoFocus
        fullWidth
        label="Tipo de Area"
        margin="dense"
        name="name"
        onChange={(event) => handleChange(event)}
        required
        value={fields.name}
      />
      <SelectField
        autoFocus
        fullWidth
        label="Supervisor"
        name="supervisor"
        onChange={(event) => handleChange(event)}
        required
        value={fields.supervisor}
      >
        {supervisors.map(({ pk_persona, nombre }) => (
          <option key={pk_persona} value={pk_persona}>{nombre}</option>
        ))}
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

    const delete_progress = selected.map((id) => deleteProjectType(id));

    Promise.allSettled(delete_progress)
      .then((results) => results.reduce(async (total, result) => {
        if (result.status == 'rejected') {
          total.push(result.reason.message);
        } else if (!result.value.ok) {
          total.push(await formatResponseJson(result.value));
        }
        return total;
      }, []))
      .then(errors => {
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
      title={"Eliminar Elementos"}
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
  const [selected_project_type, setSelectedProjectType] = useState({});
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(true);
  const [supervisors, setSupervisors] = useState([]);

  const handleEditModalOpen = async (id) => {
    const data = await getProjectType(id);
    setSelectedProjectType(data);
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
    getSupervisors().then((x) => setSupervisors(x));
  }, [false]);

  return (
    <Fragment>
      <Title title={"Tipo de Area"} />
      <AddModal
        is_open={is_add_modal_open}
        setModalOpen={setAddModalOpen}
        supervisors={supervisors}
        updateTable={updateTable}
      />
      <EditModal
        data={selected_project_type}
        is_open={is_edit_modal_open}
        setModalOpen={setEditModalOpen}
        supervisors={supervisors}
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
              data_index={"pk_tipo"}
              data_source={"organizacion/tipo_area/table"}
              headers={headers}
              onAddClick={() => setAddModalOpen(true)}
              onEditClick={(id) => handleEditModalOpen(id)}
              onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
              tableShouldUpdate={tableShouldUpdate}
              setTableShouldUpdate={setTableShouldUpdate}
              title={"Listado de Tipos de Area"}
            />
          </Widget>
        </Grid>
      </Grid>
    </Fragment>
  );
};
