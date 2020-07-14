import React, {
  Fragment,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Snackbar,
} from "@material-ui/core";
import {
  Alert,
} from "@material-ui/lab";
import {
  fetchWeekDetailApi,
} from "../../lib/api/generator.js";
import {
  UserContext,
} from "../context/User.jsx";
import {
  parseStandardNumber,
} from "../../lib/date/mod.js";

import Title from "../common/Title.jsx";
import Table from "./registro/Table.jsx";

const getWeekDate = (id) => fetchWeekDetailApi(`semana?person=${id}`);

const getTableData = (id) =>
  fetchWeekDetailApi(`table/${id}`).then((x) => x.json());

const createWeekDetail = async (week, budget, hours) =>
  fetchWeekDetailApi("", {
    body: JSON.stringify({ week, budget, hours }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

const updateWeekDetail = async (id, week, budget, hours) =>
  fetchWeekDetailApi(id, {
    body: JSON.stringify({ week, budget, hours }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PUT",
  });

const submitWeekDetail = async ({ id, control_id, budget_id, used_hours }) => {
  if (id) {
    return updateWeekDetail(id, control_id, budget_id, used_hours);
  } else {
    return createWeekDetail(control_id, budget_id, used_hours);
  }
};

export default () => {
  const [context] = useContext(UserContext);

  const [current_week, setCurrentWeek] = useState(null);
  const [table_data, setTableData] = useState(new Map());
  const [alert_open, setAlertOpen] = useState(false);
  const [error, setError] = useState(null);

  const updateCurrentWeek = () => {
    if (context.id) {
      setAlertOpen(false);
      setError(null);
      getWeekDate(context.id)
        .then(async (response) => {
          if (response.ok) {
            const current_week = parseStandardNumber(await response.json());
            if (!current_week) throw new Error();
            setCurrentWeek(current_week);
          } else {
            throw new Error();
          }
        })
        .catch(() => {
          setError("No fue posible actualizar la fecha de registro");
          setAlertOpen(true);
        });
    }
  };

  //Set budget_id as unique key since id can be null
  const updateTable = () => {
    if (context.id) {
      getTableData(context.id)
        .then((data) => {
          setTableData((prev_state) => {
            return new Map(
              Array.from(prev_state).reduce((total, [index, value]) => {
                const match = total.findIndex(([index_t]) => index_t === index);
                if (match !== -1) {
                  if (
                    value.server_updated ||
                    total[match][1].used_hours == value.used_hours
                  ) {
                    total[match] = [index, { ...total[match][1] }];
                  } else {
                    total[match] = [
                      index,
                      {
                        ...total[match][1],
                        used_hours: value.used_hours,
                        server_updated: value.server_updated,
                      },
                    ];
                  }
                }
                return total;
              }, data.map((record) => [record.budget_id, record])),
            );
          });
        });
    }
  };

  const updateRow = (id, used_hours) => {
    const data = { ...table_data.get(id), used_hours, server_updated: false };
    setTableData((prev_state) => new Map([...prev_state, [id, data]]));
  };

  const handleRowSave = (row) => {
    setAlertOpen(false);
    setError(false);
    if (Number(row.used_hours)) {
      submitWeekDetail(row)
        .then((response) => {
          if (response.ok) {
            updateTable();
          } else {
            setError("No fue posible actualizar el registro");
          }
        })
        .finally(() => setAlertOpen(true));
    } else {
      setError(`${row.used_hours} no es un numero valido`);
      setAlertOpen(true);
    }
  };

  const handleAlertClose = (_event, reason) => {
    if (reason === "clickaway") return;
    setAlertOpen(false);
  };

  useEffect(() => {
    updateCurrentWeek();
    updateTable();
  }, []);

  return (
    <Fragment>
      <Title title={"Registro"} />
      <Table
        data={table_data}
        onRowSave={handleRowSave}
        onRowUpdate={updateRow}
        week={current_week}
      />
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        open={alert_open}
        autoHideDuration={3000}
        onClose={handleAlertClose}
      >
        <Alert
          elevation={6}
          variant="filled"
          onClose={handleAlertClose}
          severity={error ? "error" : "success"}
        >
          {error || "El registro fue guardado con exito"}
        </Alert>
      </Snackbar>
    </Fragment>
  );
};
