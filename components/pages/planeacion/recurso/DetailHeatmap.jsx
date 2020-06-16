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
  getRandomColor,
} from "../../../../lib/colors/mod.js";
import {
  CleanTableCell,
  DetailDot,
  VerticalCell,
} from "./Heatmap.jsx";

const DetailCell = ({
  assignation,
  color = null,
  value = null,
}) => (
    <CleanTableCell>
      <Tooltip title={`Horas: ${value || 0}\n Asignacion: ${assignation}%`}>
        <div>
          <DetailDot
            color={color}
            status={value && color ? null : "invalid"}
          />
        </div>
      </Tooltip>
    </CleanTableCell>
  );

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
      if (!blacklisted_dates.includes(parseDateToStandardNumber(x))) {
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
            data.map(({ project_id, project, dates, }) => {
              const color = getRandomColor();

              return (
                <DetailTableRow key={project_id}>
                  <CleanTableCell className={classes.detail_column}>{project}</CleanTableCell>
                  {
                    calendar_dates.map((calendar_date) => {
                      const activity = dates.find(({ date }) => calendar_date == date);
                      return (
                        <DetailCell
                          assignation={activity ? Number(activity.assignation) : 0}
                          color={activity ? color : null}
                          key={calendar_date}
                          value={activity ? Number(activity.hours) : 0}
                        />
                      );
                    })
                  }
                </DetailTableRow>
              );
            })
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
}