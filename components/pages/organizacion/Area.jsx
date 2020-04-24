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

import { requestGenerator } from "../../../lib/api/request.js";

import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import Title from "../../common/Title.jsx";
import SelectField from "../../common/SelectField.jsx";
import Widget from "../../common/Widget.jsx";

//TODO
//Add primary key as constant

const fetchPeopleApi = requestGenerator('organizacion/persona');
const fetchAreaTypesApi = requestGenerator('organizacion/tipo_area');
const fetchAreaApi = requestGenerator('organizacion/area');

const getSupervisors = () => fetchPeopleApi().then((x) => x.json());

const getAreaTypes = () => fetchAreaTypesApi().then((x) => x.json());

const getArea = (id) => fetchAreaApi(id).then((x) => x.json());

const createArea = async (form_data) => {
  return await fetchAreaApi("", {
    method: "POST",
    body: form_data,
  });
};

const updateArea = async (id, form_data) => {
  return await fetchAreaApi(id, {
    method: "PUT",
    body: form_data,
  });
};

const deleteArea = async (id) => {
  return await fetchAreaApi(id, {
    method: "DELETE",
  });
};

const headers = [
  {
    id: "area_type",
    numeric: false,
    disablePadding: false,
    label: "Tipo de Area",
  },
  { id: "name", numeric: false, disablePadding: false, label: "Nombre" },
  {
    id: "supervisor",
    numeric: false,
    disablePadding: false,
    label: "Supervisor",
  },
];

const AddModal = ({
  area_types,
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
    const request = await createArea(new URLSearchParams(form_data));

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
        label="Tipo de Area"
        fullWidth
        name="area_type"
        required
      >
        {area_types.map(({ pk_tipo, nombre }) => (
          <option key={pk_tipo} value={pk_tipo}>{nombre}</option>
        ))}
      </SelectField>
      <TextField
        autoFocus
        fullWidth
        label="Area"
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
  area_types,
  data,
  is_open,
  setModalOpen,
  supervisors,
  updateTable,
}) => {
  const [fields, setFields] = useState({
    area_type: null,
    name: null,
    supervisor: null,
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        area_type: data.fk_tipo_area,
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
    const id = data.pk_area;
    const request = await updateArea(id, new URLSearchParams(form_data));

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
        label="Tipo de Area"
        fullWidth
        name="area_type"
        onChange={(event) => handleChange(event)}
        required
        value={fields.area_type}
      >
        {area_types.map(({ pk_tipo, nombre }) => (
          <option key={pk_tipo} value={pk_tipo}>{nombre}</option>
        ))}
      </SelectField>
      <TextField
        autoFocus
        fullWidth
        label="Area"
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

    const delete_progress = selected.map((id) => deleteArea(id));

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
  const [selected_project_type, setSelectedArea] = useState({});
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [tableShouldUpdate, setTableShouldUpdate] = React.useState(true);
  const [area_types, setAreaTypes] = useState([]);
  const [supervisors, setSupervisors] = useState([]);

  const handleEditModalOpen = async (id) => {
    const data = await getArea(id);
    setSelectedArea(data);
    setEditModalOpen(true);
  };

  const handleDeleteModalOpen = async (selected) => {
    setSelected(selected);
    setDeleteModalOpen(true);
  };

  const updateTable = () => {
    setTableShouldUpdate(true);
  };

  //TODO
  //Add error catching for data fetching
  useEffect(() => {
    getAreaTypes().then((res) => setAreaTypes(res));
    getSupervisors().then(x => setSupervisors(x));
  }, [false]);

  return (
    <Fragment>
      <Title title={"Area"} />
      <AddModal
        area_types={area_types}
        is_open={is_add_modal_open}
        setModalOpen={setAddModalOpen}
        supervisors={supervisors}
        updateTable={updateTable}
      />
      <EditModal
        area_types={area_types}
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
              data_index={"pk_area"}
              data_source={"organizacion/area/table"}
              headers={headers}
              onAddClick={() => setAddModalOpen(true)}
              onEditClick={(id) => handleEditModalOpen(id)}
              onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
              tableShouldUpdate={tableShouldUpdate}
              setTableShouldUpdate={setTableShouldUpdate}
              title={"Listado de Area"}
            />
          </Widget>
        </Grid>
      </Grid>
    </Fragment>
  );
};
