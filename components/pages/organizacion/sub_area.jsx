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
const fetchAreaApi = requestGenerator('organizacion/area');
const fetchSubAreaApi = requestGenerator('organizacion/sub_area');

const getSupervisors = () => fetchPeopleApi().then((x) => x.json());

const getAreas = () => fetchAreaApi().then((x) => x.json());

const getSubArea = (id) => fetchSubAreaApi(id).then((x) => x.json());

const createSubArea = async (form_data) => {
  return await fetchSubAreaApi("", {
    method: "POST",
    body: form_data,
  });
};

const updateSubArea = async (id, form_data) => {
  return await fetchSubAreaApi(id, {
    method: "PUT",
    body: form_data,
  });
};

const deleteSubArea = async (id) => {
  return await fetchSubAreaApi(id, {
    method: "DELETE",
  });
};

const headers = [
  {
    id: "area",
    numeric: false,
    disablePadding: false,
    label: "Area",
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
  areas,
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
    const request = await createSubArea(new URLSearchParams(form_data));

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
        label="Area"
        fullWidth
        name="area"
        required
      >
        {areas.map(({ pk_area, nombre }) => (
          <option key={pk_area} value={pk_area}>{nombre}</option>
        ))}
      </SelectField>
      <TextField
        autoFocus
        fullWidth
        label="SubArea"
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
  areas,
  data,
  is_open,
  setModalOpen,
  supervisors,
  updateTable,
}) => {
  const [fields, setFields] = useState({
    area: null,
    name: null,
    supervisor: null,
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        area: data.fk_area,
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
    const id = data.pk_sub_area;
    const request = await updateSubArea(id, new URLSearchParams(form_data));

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
        name="area"
        onChange={(event) => handleChange(event)}
        required
        value={fields.area}
      >
        {areas.map(({ pk_area, nombre }) => (
          <option key={pk_area} value={pk_area}>{nombre}</option>
        ))}
      </SelectField>
      <TextField
        autoFocus
        fullWidth
        label="SubArea"
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

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const delete_progress = selected.map((id) => deleteSubArea(id));

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
  const [selected_project_type, setSelectedArea] = useState({});
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [tableShouldUpdate, setTableShouldUpdate] = React.useState(true);
  const [areas, setAreas] = useState([]);
  const [supervisors, setSupervisors] = useState([]);

  const handleEditModalOpen = async (id) => {
    const data = await getSubArea(id);
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
    getAreas().then((res) => setAreas(res));
    getSupervisors().then(x => setSupervisors(x));
  }, [false]);

  return (
    <Fragment>
      <Title title={"SubArea"} />
      <AddModal
        areas={areas}
        is_open={is_add_modal_open}
        setModalOpen={setAddModalOpen}
        supervisors={supervisors}
        updateTable={updateTable}
      />
      <EditModal
        areas={areas}
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
              data_index={"NA"}
              data_source={"organizacion/sub_area/table"}
              headers={headers}
              onAddClick={() => setAddModalOpen(true)}
              onEditClick={(id) => handleEditModalOpen(id)}
              onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
              tableShouldUpdate={tableShouldUpdate}
              setTableShouldUpdate={setTableShouldUpdate}
              title={"Listado de SubAreas"}
            />
          </Widget>
        </Grid>
      </Grid>
    </Fragment>
  );
};
