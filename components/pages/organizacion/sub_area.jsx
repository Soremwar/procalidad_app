import React, {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useState,
} from "react";
import { DialogContentText, TextField } from "@material-ui/core";
import { formatResponseJson } from "../../../lib/api/request.js";
import {
  fetchAreaApi,
  fetchPeopleApi,
  fetchSubAreaApi,
} from "../../../lib/api/generator.js";
import AdvancedSelectField from "../../common/AdvancedSelectField.jsx";
import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import Title from "../../common/Title.jsx";
import SelectField from "../../common/SelectField.jsx";

const getPeople = () => fetchPeopleApi().then((x) => x.json());
const getAreas = () => fetchAreaApi().then((x) => x.json());

const getSubArea = (id) => fetchSubAreaApi(id).then((x) => x.json());

const createSubArea = async (
  area,
  name,
  supervisor,
) =>
  fetchSubAreaApi("", {
    body: JSON.stringify({
      area,
      name,
      supervisor,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const updateSubArea = async (
  id,
  area,
  name,
  supervisor,
) =>
  fetchSubAreaApi(id, {
    body: JSON.stringify({
      area,
      name,
      supervisor,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const deleteSubArea = async (id) =>
  fetchSubAreaApi(id, {
    method: "DELETE",
  });

const headers = [
  {
    id: "area",
    numeric: false,
    disablePadding: false,
    label: "Area",
    searchable: true,
  },
  {
    id: "name",
    numeric: false,
    disablePadding: false,
    label: "Nombre",
    searchable: true,
  },
  {
    id: "supervisor",
    numeric: false,
    disablePadding: false,
    label: "Supervisor",
    searchable: true,
  },
];

const ParameterContext = createContext({
  areas: [],
  people: [],
});

const AddModal = ({
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const {
    areas,
    people,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    area: "",
    name: "",
    supervisor: "",
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

    const request = await createSubArea(
      fields.area,
      fields.name,
      fields.supervisor,
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
        area: "",
        name: "",
        supervisor: "",
      });
      setLoading(false);
      setError(null);
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
        label="Area"
        fullWidth
        name="area"
        onChange={handleChange}
        required
        value={fields.area}
      >
        {areas.map(({ pk_area, nombre }) => (
          <option key={pk_area} value={pk_area}>{nombre}</option>
        ))}
      </SelectField>
      <TextField
        fullWidth
        label="SubArea"
        margin="dense"
        name="name"
        onChange={handleChange}
        required
        value={fields.name}
      />
      <AdvancedSelectField
        fullWidth
        label="Supervisor"
        name="supervisor"
        onChange={(_event, value) =>
          setFields((prev_state) => ({ ...prev_state, supervisor: value }))}
        options={people}
        required
        value={fields.supervisor}
      />
    </DialogForm>
  );
};

const EditModal = ({
  data,
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const {
    areas,
    people,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    area: "",
    name: "",
    supervisor: "",
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
      setLoading(false);
      setError(null);
    }
  }, [is_open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const request = await updateSubArea(
      data.pk_sub_area,
      fields.area,
      fields.name,
      fields.supervisor,
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
        label="Area"
        fullWidth
        name="area"
        onChange={handleChange}
        required
        value={fields.area}
      >
        {areas.map(({ pk_area, nombre }) => (
          <option key={pk_area} value={pk_area}>{nombre}</option>
        ))}
      </SelectField>
      <TextField
        fullWidth
        label="SubArea"
        margin="dense"
        name="name"
        onChange={handleChange}
        required
        value={fields.name}
      />
      <AdvancedSelectField
        fullWidth
        label="Supervisor"
        name="supervisor"
        onChange={(_event, value) =>
          setFields((prev_state) => ({ ...prev_state, supervisor: value }))}
        options={people}
        required
        value={fields.supervisor}
      />
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
      title={"Eliminar Elementos"}
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
  const [parameters, setParameters] = useState({
    areas: [],
    people: [],
  });
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selected_sub_area, setSelectedSubArea] = useState({});
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(false);

  const handleEditModalOpen = async (id) => {
    setSelectedSubArea(await getSubArea(id));
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
  //Cancel subscription to state update
  useEffect(() => {
    getAreas().then((areas) =>
      setParameters((prev_state) => ({ ...prev_state, areas }))
    );
    getPeople().then((people) => {
      const entries = people.map((
        { pk_persona, nombre },
      ) => [pk_persona, nombre]);
      setParameters((prev_state) => ({ ...prev_state, people: entries }));
    });
    updateTable();
  }, [false]);

  return (
    <Fragment>
      <Title title={"SubArea"} />
      <ParameterContext.Provider value={parameters}>
        <AddModal
          is_open={is_add_modal_open}
          setModalOpen={setAddModalOpen}
          updateTable={updateTable}
        />
        <EditModal
          data={selected_sub_area}
          is_open={is_edit_modal_open}
          setModalOpen={setEditModalOpen}
          updateTable={updateTable}
        />
      </ParameterContext.Provider>
      <DeleteModal
        is_open={is_delete_modal_open}
        setModalOpen={setDeleteModalOpen}
        selected={selected}
        updateTable={updateTable}
      />
      <AsyncTable
        columns={headers}
        onAddClick={() => setAddModalOpen(true)}
        onEditClick={(id) => handleEditModalOpen(id)}
        onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
        onTableUpdate={() => setTableShouldUpdate(false)}
        update_table={tableShouldUpdate}
        url={"organizacion/sub_area/table"}
      />
    </Fragment>
  );
};
