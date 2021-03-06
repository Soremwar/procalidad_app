import React, {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useState,
} from "react";
import { DialogContentText, TextField } from "@material-ui/core";
import { formatResponseJson } from "../../../lib/api/request.ts";
import {
  fetchAreaApi,
  fetchAreaTypesApi,
  fetchPeopleApi,
} from "../../../lib/api/generator.js";
import AdvancedSelectField from "../../common/AdvancedSelectField.jsx";
import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import Title from "../../common/Title.jsx";
import SelectField from "../../common/SelectField.jsx";

/** @return Promise<Array<{name: string}>> */
const getAreaTypes = () => fetchAreaTypesApi().then((x) => x.json());
/** @return Promise<Array<{nombre: string}>> */
const getPeople = () => fetchPeopleApi().then((x) => x.json());

const getArea = (id) => fetchAreaApi(id).then((x) => x.json());

const createArea = async (
  area_type,
  name,
  supervisor,
) =>
  fetchAreaApi("", {
    body: JSON.stringify({
      area_type,
      name,
      supervisor,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const updateArea = async (
  id,
  area_type,
  name,
  supervisor,
) =>
  fetchAreaApi(id, {
    body: JSON.stringify({
      area_type,
      name,
      supervisor,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const deleteArea = async (id) =>
  fetchAreaApi(id, {
    method: "DELETE",
  });

const headers = [
  {
    id: "area_type",
    numeric: false,
    disablePadding: false,
    label: "Tipo de área",
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
  area_types: [],
  people: [],
});

const AddModal = ({
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const {
    area_types,
    people,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState({
    area_type: "",
    name: "",
    supervisor: "",
  });
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        area_type: "",
        name: "",
        supervisor: "",
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

    const request = await createArea(
      fields.area_type,
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
      title={"Crear Nuevo"}
    >
      <SelectField
        label="Tipo de área"
        fullWidth
        name="area_type"
        onChange={handleChange}
        required
        value={fields.area_type}
      >
        {area_types.map(({ id, name }) => (
          <option key={id} value={id}>{name}</option>
        ))}
      </SelectField>
      <TextField
        fullWidth
        label="Area"
        margin="dense"
        name="name"
        onChange={handleChange}
        required
        value={fields.name}
      />
      <AdvancedSelectField
        fullWidth
        name="supervisor"
        label="Supervisor"
        onChange={(_event, value) =>
          setFields((prev_value) => ({ ...prev_value, supervisor: value }))}
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
    area_types,
    people,
  } = useContext(ParameterContext);

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

    const request = await updateArea(
      data.pk_area,
      fields.area_type,
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
        label="Tipo de área"
        fullWidth
        name="area_type"
        onChange={handleChange}
        required
        value={fields.area_type}
      >
        {area_types.map(({ id, name }) => (
          <option key={id} value={id}>{name}</option>
        ))}
      </SelectField>
      <TextField
        fullWidth
        label="Area"
        margin="dense"
        name="name"
        onChange={handleChange}
        required
        value={fields.name}
      />
      <AdvancedSelectField
        fullWidth
        name="supervisor"
        label="Supervisor"
        onChange={(_event, value) =>
          setFields((prev_value) => ({ ...prev_value, supervisor: value }))}
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

  const handleSubmit = async (event) => {
    setLoading(true);
    setError(null);

    const delete_progress = selected.map((id) => deleteArea(id));

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
    area_types: [],
    people: [],
  });
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selected_area, setSelectedArea] = useState({});
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(false);

  const handleEditModalOpen = async (id) => {
    setSelectedArea(await getArea(id));
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
    getAreaTypes().then((area_types) =>
      setParameters((prev_state) => ({
        ...prev_state,
        area_types: area_types.sort(({ name: x }, { name: y }) =>
          x.localeCompare(y)
        ),
      }))
    );
    getPeople().then((people) => {
      const entries = people
        .map(({ pk_persona, nombre }) => [pk_persona, nombre])
        .sort(([_x, x], [_y, y]) => x.localeCompare(y));
      setParameters((prev_state) => ({ ...prev_state, people: entries }));
    });
    updateTable();
  }, [false]);

  return (
    <Fragment>
      <Title title={"Area"} />
      <ParameterContext.Provider value={parameters}>
        <AddModal
          is_open={is_add_modal_open}
          setModalOpen={setAddModalOpen}
          updateTable={updateTable}
        />
        <EditModal
          data={selected_area}
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
        url={"organizacion/area/table"}
      />
    </Fragment>
  );
};
