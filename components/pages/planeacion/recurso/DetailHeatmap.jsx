import React, {
  useEffect,
  useState,
} from "react";
import { makeStyles } from "@material-ui/styles";
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Paper,
} from "@material-ui/core";
import {
  parseDateToStandardNumber,
  parseStandardNumber,
} from "../../../../lib/date/mod.js";
import {
  CleanTableCell,
  DetailDot,
  VerticalCell,
} from "./Heatmap.jsx";

const DetailCell = ({
  assignation,
  value = null,
}) => {
  let status;

  if (value === 0) {
    status = "error";
  } else if (value === 9) {
    status = "ok";
  } else if (value > 0 && value < 9) {
    status = "warning";
  } else {
    status = "invalid";
  }

  return (
    <CleanTableCell>
      <Tooltip title={`Horas: ${value || 0}\n Asignacion: ${assignation}%`}>
        <div>
          <DetailDot status={status} />
        </div>
      </Tooltip>
    </CleanTableCell>
  );
};

const rowStyles = makeStyles({
  row: {
    margin: 0,
    padding: "0px",
  }
});

const CleanTableRow = ({ children, className = "", ...props }) => {
  const styles = rowStyles();
  return (
    <TableRow
      className={[styles.row, ...className.split(" ")].join(" ")}
      {...props}
    >
      {children}
    </TableRow>
  );
};

const detailRowStyles = makeStyles({
  row: {
    height: "30px",
    margin: 0,
    padding: "0px",
  }
});

const DetailTableRow = ({ children, className = "", ...props }) => {
  const styles = detailRowStyles();
  return (
    <TableRow
      className={[styles.row, ...className.split(" ")].join(" ")}
      {...props}
    >
      {children}
    </TableRow>
  );
};

const tableStyles = makeStyles({
  table: {
    borderCollapse: "collapse",
  },
  detail_column: {
    minWidth: "100px",
  },
});

export default function ({
  blacklisted_dates,
  data,
  end_date,
  start_date,
}) {
  const classes = tableStyles();
  const [calendar_dates, setCalendarDates] = useState([]);

  useEffect(() => {
    let dates = [];

    for (
      let x = parseStandardNumber(start_date);
      x <= parseStandardNumber(end_date);
      x.setDate(x.getDate() + 1)
    ) {
      if (!(parseDateToStandardNumber(x) in blacklisted_dates)) {
        dates.push(parseDateToStandardNumber(x));
      }
    }

    setCalendarDates(dates);
  }, [start_date, end_date, blacklisted_dates]);

  return (
    <TableContainer component={Paper}>
      <Table aria-label="spanning table" className={classes.table}>
        <TableHead>
          <TableRow>
            <CleanTableCell align="center" colSpan={calendar_dates.length}>
              Fechas
            </CleanTableCell>
          </TableRow>
          <CleanTableRow>
            <CleanTableCell className={classes.detail_column} />
            {
              calendar_dates.map(date => (
                <VerticalCell key={date}>{date}</VerticalCell>
              ))
            }
          </CleanTableRow>
        </TableHead>
        <TableBody>
          {
            data.map(({ project_id, project, dates, }) => (
              <DetailTableRow key={project_id}>
                <CleanTableCell className={classes.detail_column}>{project}</CleanTableCell>
                {
                  calendar_dates.map((calendar_date) => {
                    const activity = dates.find(({ date }) => calendar_date == date);
                    //TODO
                    //Replace null for 0
                    //Depends on blacklisted
                    return (
                      <DetailCell
                        assignation={activity ? Number(activity.assignation) : 0}
                        key={calendar_date}
                        value={activity ? Number(activity.hours) : null}
                      />
                    );
                  })
                }
              </DetailTableRow>
            ))
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
}
