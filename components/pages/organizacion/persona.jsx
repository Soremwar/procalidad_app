import React, { Fragment, useEffect, useState } from "react";
import { DialogContentText, TextField } from "@material-ui/core";
import { formatResponseJson } from "../../../lib/api/request.ts";
import { fetchPeopleApi } from "../../../lib/api/generator.js";

import AsyncTable from "../../common/AsyncTable/Table.jsx";
import DateField from "../../common/DateField.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import Title from "../../common/Title.jsx";
import SelectField from "../../common/SelectField.jsx";

import { EmployeeType } from "../../../api/models/enums.ts";

const getPerson = (id) => fetchPeopleApi(id).then((x) => x.json());

const createPerson = async (
  employee_type,
  email,
  identification,
  name,
  phone,
  start_date,
  type,
) =>
  fetchPeopleApi("", {
    body: JSON.stringify({
      employee_type,
      email,
      identification,
      name,
      phone,
      start_date,
      type,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const updatePerson = async (
  id,
  employee_type,
  email,
  identification,
  name,
  phone,
  retirement_date,
  start_date,
  type,
) =>
  fetchPeopleApi(id, {
    body: JSON.stringify({
      employee_type,
      email,
      identification,
      name,
      phone,
      retirement_date,
      start_date,
      type,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const deletePerson = async (id) =>
  fetchPeopleApi(id, {
    method: "DELETE",
  });

const headers = [
  {
    id: "identification",
    numeric: false,
    disablePadding: false,
    label: "Identificación",
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
    id: "phone",
    numeric: false,
    disablePadding: false,
    label: "Teléfono",
    searchable: true,
  },
  {
    id: "email",
    numeric: false,
    disablePadding: false,
    label: "Correo",
    searchable: true,
  },
];

const DEFAULT_FIELDS = {
  email: "",
  employee_type: EmployeeType.INTERNAL,
  identification: "",
  name: "",
  phone: "",
  retirement_date: "",
  start_date: "",
  type: "",
};

const AddModal = ({
  is_open,
  setModalOpen,
  updateTable,
}) => {
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields(DEFAULT_FIELDS);
      setError(null);
      setLoading(false);
    }
  }, [is_open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const request = await createPerson(
      fields.employee_type,
      fields.email,
      fields.identification,
      fields.name,
      fields.phone,
      fields.start_date,
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
        label="Tipo de identificación"
        fullWidth
        name="type"
        onChange={handleChange}
        required
        value={fields.type}
      >
        <option value="CC">Cedula de Ciudadania</option>
        <option value="CE">Cedula de Extranjeria</option>
        <option value="PA">Pasaporte</option>
        <option value="RC">Registro Civil</option>
        <option value="TI">Tarjeta de Identidad</option>
      </SelectField>
      <TextField
        fullWidth
        label="Identificación"
        margin="dense"
        name="identification"
        onChange={handleChange}
        required
        value={fields.identification}
      />
      <TextField
        fullWidth
        label="Nombre"
        margin="dense"
        name="name"
        onChange={handleChange}
        required
        value={fields.name}
      />
      <TextField
        fullWidth
        label="Teléfono"
        margin="dense"
        name="phone"
        onChange={handleChange}
        required
        value={fields.phone}
      />
      <TextField
        fullWidth
        label="Correo"
        margin="dense"
        name="email"
        onChange={handleChange}
        type="email"
        required
        value={fields.email}
      />
      <SelectField
        blank_value={false}
        fullWidth
        label="Tipo de empleado"
        name="employee_type"
        onChange={handleChange}
        required
        value={fields.employee_type}
      >
        <option value={EmployeeType.INTERNAL}>Interno</option>
        <option value={EmployeeType.EXTERNAL}>Externo</option>
      </SelectField>
      <DateField
        fullWidth
        label="Fecha de inicio(en la compañía)"
        name="start_date"
        onChange={handleChange}
        required
        value={fields.start_date}
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
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [is_loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (is_open) {
      setFields({
        employee_type: data.tipo_empleado,
        email: data.correo,
        identification: data.identificacion,
        name: data.nombre,
        phone: data.telefono,
        retirement_date: data.fecha_retiro || "",
        start_date: data.fecha_inicio || "",
        type: data.tipo_identificacion,
      });
      setError(null);
      setLoading(false);
    }
  }, [is_open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const request = await updatePerson(
      data.pk_persona,
      fields.employee_type,
      fields.email,
      fields.identification,
      fields.name,
      fields.phone,
      fields.retirement_date || null,
      fields.start_date,
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
        label="Tipo de identificación"
        fullWidth
        name="type"
        onChange={handleChange}
        required
        value={fields.type}
      >
        <option value="CC">Cedula de Ciudadania</option>
        <option value="CE">Cedula de Extranjeria</option>
        <option value="PA">Pasaporte</option>
        <option value="RC">Registro Civil</option>
        <option value="TI">Tarjeta de Identidad</option>
      </SelectField>
      <TextField
        fullWidth
        label="Identificación"
        margin="dense"
        name="identification"
        onChange={handleChange}
        required
        value={fields.identification}
      />
      <TextField
        fullWidth
        label="Nombre"
        margin="dense"
        name="name"
        onChange={handleChange}
        required
        value={fields.name}
      />
      <TextField
        fullWidth
        label="Teléfono"
        margin="dense"
        name="phone"
        onChange={handleChange}
        required
        value={fields.phone}
      />
      <TextField
        disabled
        fullWidth
        label="Correo"
        margin="dense"
        name="email"
        onChange={handleChange}
        type="email"
        value={fields.email}
      />
      <SelectField
        blank_value={false}
        fullWidth
        label="Tipo de empleado"
        name="employee_type"
        onChange={handleChange}
        required
        value={fields.employee_type}
      >
        <option value={EmployeeType.INTERNAL}>Interno</option>
        <option value={EmployeeType.EXTERNAL}>Externo</option>
      </SelectField>
      <DateField
        fullWidth
        label="Fecha de inicio(en la compañía)"
        name="start_date"
        onChange={handleChange}
        required
        value={fields.start_date}
      />
      <DateField
        fullWidth
        label="Fecha de retiro"
        name="retirement_date"
        onChange={handleChange}
        value={fields.retirement_date}
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

    const delete_progress = selected.map((id) => deletePerson(id));

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
  const [is_add_modal_open, setAddModalOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selected_project_type, setSelectedArea] = useState({});
  const [is_edit_modal_open, setEditModalOpen] = useState(false);
  const [is_delete_modal_open, setDeleteModalOpen] = useState(false);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(false);

  const handleEditModalOpen = async (id) => {
    const data = await getPerson(id);
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

  useEffect(() => {
    updateTable();
  }, []);

  return (
    <Fragment>
      <Title title={"Persona"} />
      <AddModal
        is_open={is_add_modal_open}
        setModalOpen={setAddModalOpen}
        updateTable={updateTable}
      />
      <EditModal
        data={selected_project_type}
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
      <AsyncTable
        columns={headers}
        onAddClick={() => setAddModalOpen(true)}
        onEditClick={(id) => handleEditModalOpen(id)}
        onDeleteClick={(selected) => handleDeleteModalOpen(selected)}
        onTableUpdate={() => setTableShouldUpdate(false)}
        update_table={tableShouldUpdate}
        url={"organizacion/persona/table"}
      />
    </Fragment>
  );
};
