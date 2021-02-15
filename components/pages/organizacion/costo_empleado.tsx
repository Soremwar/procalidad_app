import React, {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@material-ui/core";
import {
  Add as AddIcon,
  CalendarToday as DateIcon,
  Create as EditIcon,
  Delete as DeleteIcon,
} from "@material-ui/icons";
import DataTable, { Column, Options } from "../../common/DataTable";

import {
  fetchComputerApi,
  fetchLicenseApi,
  fetchPeopleApi,
  fetchPersonCostApi,
} from "../../../lib/api/generator.js";
import {
  CostType,
  EmployeeType,
  InternalCostType,
} from "../../../api/models/enums";
import {
  Computer,
  ExternalCost,
  InternalCost,
  InternalCostCalculation,
  Licence,
  People,
} from "../../../api/models/interfaces";

import AsyncTable from "../../common/AsyncTable/Table.jsx";
import CurrencyField from "@unicef/material-ui-currency-textfield";
import DateField from "../../common/DateField.jsx";
import DialogForm from "../../common/DialogForm.jsx";
import MultipleSelectField from "../../common/MultipleSelectField.jsx";
import SelectField from "../../common/SelectField.jsx";
import Title from "../../common/Title.jsx";
import Widget from "../../common/Widget.jsx";

const getPeople = () => fetchPeopleApi<People[]>();
const getComputers = () => fetchComputerApi<Computer[]>();
const getLicenses = () => fetchLicenseApi<Licence[]>();

const getPersonInternalCost = (id) =>
  fetchPersonCostApi<InternalCost>(["interno", id].join("/"));
const getPersonExternalCost = (id) =>
  fetchPersonCostApi<ExternalCost[]>(["externo", id].join("/"));

const getInternalCalculation = async ({
  base_cost,
  bonus_cost,
  computer,
  licenses,
  other_costs,
  type,
}: InternalCostCalculationParameters) =>
  fetchPersonCostApi<InternalCostCalculation>("interno/calculo", {
    body: JSON.stringify({
      base_cost,
      bonus_cost,
      computer,
      licenses,
      other_costs,
      type,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const updateInternalCost = async (
  person: number,
  costs: InternalCostParameters[],
) =>
  fetchPersonCostApi<InternalCost>(`interno/${person}`, {
    body: JSON.stringify({ costs }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const updateExternalCost = async (
  person: number,
  costs: ExternalCostParameters[],
) =>
  fetchPersonCostApi(`externo/${person}`, {
    body: JSON.stringify({
      costs,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const headers = [
  {
    id: "name",
    numeric: false,
    disablePadding: false,
    label: "Persona",
    searchable: true,
  },
  {
    id: "employee_type",
    numeric: false,
    disablePadding: false,
    label: "Tipo de empleado",
    searchable: true,
  },
];

const DEFAULT_PARAMETERS = {
  computers: [] as Computer[],
  licenses: [] as Licence[],
  people: [] as People[],
};
const ParameterContext = createContext(DEFAULT_PARAMETERS);

type InternalCostParameters = Omit<InternalCost, "id" | "person">;
type InternalCostCalculationParameters = Omit<
  InternalCostParameters,
  "person"
>;

type ExternalCostParameters = Omit<ExternalCost, "id" | "person">;

const DEFAULT_INTERNAL_FIELDS: InternalCostParameters = {
  base_cost: 0,
  bonus_cost: 0,
  end_date: "",
  computer: 0,
  licenses: [],
  other_costs: 0,
  start_date: "",
  type: InternalCostType.ORDINARY,
};

const InternalItemModal = ({
  closeModal,
  data,
  id,
  open,
  onSubmit,
}: {
  closeModal: () => void;
  data?: InternalCostParameters;
  id: number;
  open: boolean;
  onSubmit: (id: number, parameters: InternalCostParameters) => void;
}) => {
  const {
    computers,
    licenses,
  } = useContext(ParameterContext);

  const [error, setError] = useState("");
  const [fields, setFields] = useState(DEFAULT_INTERNAL_FIELDS);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InternalCostCalculation>(null);

  useEffect(() => {
    if (open) {
      setFields(data || DEFAULT_INTERNAL_FIELDS);
      setError("");
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    let active = true;

    if (open && fields.computer && fields.type) {
      getInternalCalculation(fields)
        .then(
          async (response) => {
            if (response.ok) {
              const result = await response.json();
              if (active) {
                setResult(result);
              }
            }
            throw new Error();
          },
        )
        .catch(() => console.error("Couldn't fetch the cost result"));
    } else {
      setResult(null);
    }

    return () => {
      active = false;
    };
  }, [
    fields.base_cost,
    fields.bonus_cost,
    fields.computer,
    fields.licenses,
    fields.other_costs,
    fields.type,
  ]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    onSubmit(id, {
      ...fields,
      end_date: fields.end_date || null,
    });
    closeModal();
  };

  return (
    <DialogForm
      error={error}
      handleSubmit={handleSubmit}
      is_loading={loading}
      is_open={open}
      setIsOpen={closeModal}
      title="Editar"
      size="md"
    >
      <SelectField
        fullWidth
        label="Computador"
        name="computer"
        onChange={handleChange}
        required
        value={fields.computer}
      >
        {computers.map(({ id, name }) => (
          <option key={id} value={id}>{name}</option>
        ))}
      </SelectField>
      <CurrencyField
        currencySymbol="$"
        decimalPlaces={0}
        fullWidth
        label="Valor prestacional"
        minimumValue="0"
        name="base_cost"
        onChange={(_event, value) =>
          setFields((fields) => ({ ...fields, base_cost: value }))}
        outputFormat="number"
        required
        value={fields.base_cost}
      />
      <CurrencyField
        currencySymbol="$"
        decimalPlaces={0}
        fullWidth
        label="Valor de bonos"
        minimumValue="0"
        name="bonus_cost"
        onChange={(_event, value) =>
          setFields((fields) => ({ ...fields, bonus_cost: value }))}
        outputFormat="number"
        required
        value={fields.bonus_cost}
      />
      <MultipleSelectField
        data={licenses}
        fullWidth
        label="Licencias"
        name="licenses"
        onChange={handleChange}
        value={fields.licenses}
      />
      <CurrencyField
        currencySymbol="$"
        decimalPlaces={0}
        fullWidth
        label="Otros"
        minimumValue="0"
        name="other_costs"
        onChange={(_event, value) =>
          setFields((fields) => ({ ...fields, other_costs: value }))}
        outputFormat="number"
        required
        value={fields.other_costs}
      />
      <SelectField
        fullWidth
        label="Tipo de salario"
        name="type"
        onChange={handleChange}
        required
        value={fields.type}
      >
        {Object.values(InternalCostType).map((value) => (
          <option key={value} value={value}>
            {value[0].toUpperCase() + value.slice(1).toLowerCase()}
          </option>
        ))}
      </SelectField>
      <DateField
        fullWidth
        label="Inicio de vigencia"
        name="start_date"
        onChange={handleChange}
        required
        value={fields.start_date}
      />
      <DateField
        fullWidth
        label="Final de vigencia"
        name="end_date"
        onChange={handleChange}
        value={fields.end_date}
      />
      <br />
      <br />
      {result
        ? (
          <Fragment>
            <CurrencyField
              currencySymbol="$"
              decimalPlaces={0}
              disabled
              fullWidth
              label="Costo"
              value={result.base_cost}
            />
            <CurrencyField
              currencySymbol="$"
              decimalPlaces={0}
              disabled
              fullWidth
              label="Costo Total"
              value={result.total_cost}
            />
          </Fragment>
        )
        : (
          <Typography>
            Ingrese el modelo de computador y el tipo de salario para realizar
            el cálculo
          </Typography>
        )}
    </DialogForm>
  );
};

const internal_cost_columns: Column[] = [
  {
    name: "start_date",
    label: "Inicio vigencia",
    options: {
      customBodyRender: (value) => (
        <Grid container>
          <Grid item md={9}>{value}</Grid>
          <Grid item md={3}>
            <DateIcon />
          </Grid>
        </Grid>
      ),
    },
  },
  {
    name: "end_date",
    label: "Fin vigencia",
    options: {
      customBodyRender: (value: string) => (
        <Grid container>
          <Grid item md={9}>{value}</Grid>
          <Grid item md={3}>
            <DateIcon />
          </Grid>
        </Grid>
      ),
    },
  },
  {
    name: "type",
    label: "Tipo de costeo",
    options: {
      customBodyRender: (value: string) =>
        value[0].toUpperCase() + value.substr(1).toLowerCase(),
    },
  },
];

const InternalCostModal = ({
  closeModal,
  data,
  is_open,
  person,
  updateTable,
}: {
  closeModal: () => void;
  data: InternalCost[];
  is_open: boolean;
  person: number;
  updateTable: () => void;
}) => {
  const [entries, setEntries] = useState<InternalCostParameters[]>([]);
  const [error, setError] = useState();
  const [item_modal_open, setItemModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected_item, setSelectedItem] = useState<
    { data: InternalCostParameters; index: number }
  >();

  useEffect(() => {
    if (is_open) {
      setEntries(data);
      setLoading(false);
      setError(null);
    }
  }, [is_open]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const request = await updateInternalCost(person, entries);

    if (request.ok) {
      closeModal();
      updateTable();
    } else {
      const { message } = await request.json();
      setError(message);
    }
    setLoading(false);
  };

  const options: Options = {
    customToolbar: () => (
      <Tooltip title="Agregar">
        <IconButton
          onClick={() => {
            setSelectedItem(undefined);
            setItemModalOpen(true);
          }}
        >
          <AddIcon />
        </IconButton>
      </Tooltip>
    ),
    customToolbarSelect: ({ data }, _display_data, setSelectedRows) => (
      <Fragment>
        <Tooltip title="Editar">
          <IconButton
            onClick={() => {
              setSelectedItem({
                data: entries[data[0].dataIndex],
                index: data[0].dataIndex,
              });
              setItemModalOpen(true);
              setSelectedRows([]);
            }}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Eliminar">
          <IconButton
            onClick={() => {
              const new_entries = entries.filter((_entry, index) =>
                index !== data[0].dataIndex
              );
              setEntries(new_entries);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Fragment>
    ),
    download: false,
    filter: false,
    print: false,
    responsive: "vertical",
    rowsPerPage: 10,
    search: false,
    selectableRows: "single",
  };

  return (
    <Fragment>
      <Dialog
        fullWidth
        maxWidth="lg"
        onClose={closeModal}
        open={is_open}
      >
        <DialogTitle>Editar</DialogTitle>
        <DialogContent>
          <DataTable
            data={entries}
            columns={internal_cost_columns}
            options={options}
          />
          {!!error && (
            <Fragment>
              <br />
              <Typography
                align="right"
                color="error"
              >
                {error}
              </Typography>
            </Fragment>
          )}
        </DialogContent>
        <DialogActions>
          {loading
            ? (
              <CircularProgress size={26} />
            )
            : (
              <Fragment>
                <Button
                  color="primary"
                  onClick={closeModal}
                >
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onClick={handleSubmit}
                >
                  Guardar
                </Button>
              </Fragment>
            )}
        </DialogActions>
      </Dialog>
      <InternalItemModal
        closeModal={() => setItemModalOpen(false)}
        data={selected_item?.data}
        id={selected_item?.index}
        onSubmit={(id, external_cost) => {
          if (id === undefined) {
            setEntries((prev_state) => [...prev_state, external_cost]);
          } else {
            entries[id] = external_cost;
            setEntries([...entries]);
          }
        }}
        open={item_modal_open}
      />
    </Fragment>
  );
};

const DEFAULT_EXTERNAL_FIELDS: ExternalCostParameters = {
  computer: 0,
  cost: 0,
  end_date: "",
  licenses: [],
  other_costs: 0,
  start_date: "",
  type: CostType.MONTHLY,
};

const ExternalItemModal = ({
  closeModal,
  data,
  id,
  open,
  onSubmit,
}: {
  closeModal: () => void;
  data?: ExternalCostParameters;
  id: number;
  open: boolean;
  onSubmit: (id: number, parameters: ExternalCostParameters) => void;
}) => {
  const {
    computers,
    licenses,
  } = useContext(ParameterContext);

  const [fields, setFields] = useState<ExternalCostParameters>(
    DEFAULT_EXTERNAL_FIELDS,
  );
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setFields(data || DEFAULT_EXTERNAL_FIELDS);
      setError(null);
      setLoading(false);
    }
  }, [open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFields((prev_state) => ({ ...prev_state, [name]: value }));
  };

  const handleSubmit = async () => {
    if (error) return;

    onSubmit(id, {
      ...fields,
      computer: fields.computer || null,
    });
    closeModal();
  };

  return (
    <DialogForm
      error={error}
      handleSubmit={handleSubmit}
      is_loading={loading}
      is_open={open}
      setIsOpen={closeModal}
      size="sm"
    >
      <SelectField
        blank_value={false}
        fullWidth
        label="Tipo de costeo"
        name="type"
        onChange={handleChange}
        required
        value={fields.type}
      >
        {Object.values(CostType).map((value) => (
          <option key={value} value={value}>
            {value[0].toUpperCase() + value.substr(1).toLowerCase()}
          </option>
        ))}
      </SelectField>
      <SelectField
        fullWidth
        label="Computador"
        name="computer"
        onChange={handleChange}
        value={fields.computer}
      >
        {computers.map(({ id, name }) => (
          <option key={id} value={id}>{name}</option>
        ))}
      </SelectField>
      <MultipleSelectField
        data={licenses}
        fullWidth
        label="Licencias"
        name="licenses"
        onChange={handleChange}
        value={fields.licenses}
      />
      <DateField
        fullWidth
        label="Inicio de vigencia"
        name="start_date"
        onChange={handleChange}
        required
        value={fields?.start_date || ""}
      />
      <DateField
        fullWidth
        label="Fin de vigencia"
        name="end_date"
        onChange={handleChange}
        required
        value={fields?.end_date || ""}
      />
      <CurrencyField
        currencySymbol="$"
        decimalPlaces={0}
        fullWidth
        label="Otros costos"
        minimumValue="0"
        name="other_costs"
        onChange={(_ev, value: number) => {
          setFields((prevState) => ({ ...prevState, other_costs: value }));
        }}
        outputFormat="number"
        required
        value={fields.other_costs}
      />
      <CurrencyField
        currencySymbol="$"
        decimalPlaces={0}
        fullWidth
        label="Costo"
        minimumValue="0"
        name="cost"
        onChange={(_ev, value: number) => {
          setFields((prevState) => ({ ...prevState, cost: value }));
        }}
        outputFormat="number"
        required
        value={fields.cost}
      />
    </DialogForm>
  );
};

const external_cost_columns: Column[] = [
  {
    name: "start_date",
    label: "Inicio vigencia",
    options: {
      customBodyRender: (value) => (
        <Grid container>
          <Grid item md={9}>{value}</Grid>
          <Grid item md={3}>
            <DateIcon />
          </Grid>
        </Grid>
      ),
    },
  },
  {
    name: "end_date",
    label: "Fin vigencia",
    options: {
      customBodyRender: (value: string) => (
        <Grid container>
          <Grid item md={9}>{value}</Grid>
          <Grid item md={3}>
            <DateIcon />
          </Grid>
        </Grid>
      ),
    },
  },
  {
    name: "type",
    label: "Tipo de costeo",
    options: {
      customBodyRender: (value: string) =>
        value[0].toUpperCase() + value.substr(1).toLowerCase(),
    },
  },
  {
    name: "cost",
    label: "Costo",
    options: {
      customBodyRender: (value) => (
        <CurrencyField
          currencySymbol="$"
          decimalPlaces={0}
          disabled
          fullWidth
          value={value}
        />
      ),
    },
  },
];

const ExternalCostModal = ({
  closeModal,
  data,
  is_open,
  person,
  updateTable,
}: {
  closeModal: () => void;
  data?: ExternalCost[];
  is_open: boolean;
  person: number;
  updateTable: () => void;
}) => {
  const [entries, setEntries] = useState<ExternalCostParameters[]>([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [item_modal_open, setItemModalOpen] = useState(false);
  const [selected_item, setSelectedItem] = useState<
    { data: ExternalCostParameters; index: number } | undefined
  >();

  useEffect(() => {
    if (is_open) {
      setEntries(data);
      setLoading(false);
      setError(null);
    }
  }, [is_open]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const response = await updateExternalCost(
      person,
      entries,
    );

    if (response.ok) {
      closeModal();
      updateTable();
    } else {
      const { message } = await response.json();
      setError(message);
    }
    setLoading(false);
  };

  const options: Options = {
    customToolbar: () => (
      <Tooltip title="Agregar">
        <IconButton
          onClick={() => {
            setSelectedItem(undefined);
            setItemModalOpen(true);
          }}
        >
          <AddIcon />
        </IconButton>
      </Tooltip>
    ),
    customToolbarSelect: ({ data }, _display_data, setSelectedRows) => (
      <Fragment>
        <Tooltip title="Editar">
          <IconButton
            onClick={() => {
              setSelectedItem({
                data: entries[data[0].dataIndex],
                index: data[0].dataIndex,
              });
              setItemModalOpen(true);
              setSelectedRows([]);
            }}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Eliminar">
          <IconButton
            onClick={() => {
              const new_entries = entries.filter((_entry, index) =>
                index !== data[0].dataIndex
              );
              setEntries(new_entries);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Fragment>
    ),
    download: false,
    filter: false,
    print: false,
    responsive: "vertical",
    rowsPerPage: 10,
    search: false,
    selectableRows: "single",
  };

  return (
    <Fragment>
      <Dialog
        fullWidth
        maxWidth="lg"
        onClose={closeModal}
        open={is_open}
      >
        <DialogTitle>Editar</DialogTitle>
        <DialogContent>
          <DataTable
            data={entries}
            columns={external_cost_columns}
            options={options}
          />
          {!!error && (
            <Fragment>
              <br />
              <Typography
                align="right"
                color="error"
              >
                {error}
              </Typography>
            </Fragment>
          )}
        </DialogContent>
        <DialogActions>
          {loading
            ? (
              <CircularProgress size={26} />
            )
            : (
              <Fragment>
                <Button
                  color="primary"
                  onClick={closeModal}
                >
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onClick={handleSubmit}
                >
                  Guardar
                </Button>
              </Fragment>
            )}
        </DialogActions>
      </Dialog>
      <ExternalItemModal
        closeModal={() => setItemModalOpen(false)}
        data={selected_item?.data}
        id={selected_item?.index}
        onSubmit={(id, external_cost) => {
          if (id === undefined) {
            setEntries((prev_state) => [...prev_state, external_cost]);
          } else {
            entries[id] = external_cost;
            setEntries([...entries]);
          }
        }}
        open={item_modal_open}
      />
    </Fragment>
  );
};

export default function CostoEmpleado() {
  const [selected_internal_cost, setSelectedInternalCost] = useState<
    { costs: InternalCost[]; person: number }
  >();
  const [selected_external_cost, setSelectedExternalCost] = useState<
    { costs: ExternalCost[]; person: number }
  >();
  const [internal_cost_modal_open, setInternalCostModalOpen] = useState(false);
  const [external_cost_modal_open, setExternalCostModalOpen] = useState(false);
  const [tableShouldUpdate, setTableShouldUpdate] = useState(false);
  const [parameters, setParameters] = useState(DEFAULT_PARAMETERS);

  useEffect(() => {
    getComputers()
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error();
      })
      .then((computers) =>
        setParameters((prev_state) => ({
          ...prev_state,
          computers: computers.sort(({ name: x }, { name: y }) =>
            x.localeCompare(y)
          ),
        }))
      );
    getLicenses()
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error();
      })
      .then((licenses) => {
        setParameters((prev_state) => ({
          ...prev_state,
          licenses: licenses
            .map(({ id, name }) => [id, name])
            .sort(([_x, x], [_y, y]) => x.localeCompare(y)),
        }));
      });
    getPeople()
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error();
      })
      .then((people) => {
        setParameters((prev_state) => ({
          ...prev_state,
          people,
        }));
      })
      .catch((e) => {
        console.error("Couldn't load the people list");
        throw e;
      });
    updateTable();
  }, []);

  const handleEditModalOpen = async (person: number) => {
    const employee_type: EmployeeType | undefined =
      parameters.people.find(({ pk_persona }) => pk_persona === Number(person))
        .tipo_empleado;
    if (!employee_type) {
      return;
    }

    if (employee_type === EmployeeType.INTERNAL) {
      await getPersonInternalCost(person)
        .then(async (response) => {
          if (response.ok) {
            const costs = await response.json();
            setSelectedInternalCost({ costs, person });
            setInternalCostModalOpen(true);
          } else {
            throw new Error();
          }
        });
    } else if (employee_type === EmployeeType.EXTERNAL) {
      const data = await getPersonExternalCost(person)
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error();
          }
        });

      setSelectedExternalCost({ costs: data, person });
      setExternalCostModalOpen(true);
    }
  };

  const updateTable = () => {
    setTableShouldUpdate(true);
  };

  return (
    <Fragment>
      <Title title="Costo por empleado" />
      <ParameterContext.Provider value={parameters}>
        <InternalCostModal
          closeModal={() => setInternalCostModalOpen(false)}
          data={selected_internal_cost?.costs}
          is_open={internal_cost_modal_open}
          person={selected_internal_cost?.person}
          updateTable={updateTable}
        />
        <ExternalCostModal
          closeModal={() => setExternalCostModalOpen(false)}
          data={selected_external_cost?.costs}
          is_open={external_cost_modal_open}
          person={selected_external_cost?.person}
          updateTable={updateTable}
        />
      </ParameterContext.Provider>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Widget noBodyPadding>
            <AsyncTable
              columns={headers}
              onAddClick={null}
              onEditClick={(person) => handleEditModalOpen(person)}
              onDeleteClick={null}
              onTableUpdate={() => setTableShouldUpdate(false)}
              update_table={tableShouldUpdate}
              url="organizacion/costo"
            />
          </Widget>
        </Grid>
      </Grid>
    </Fragment>
  );
}
