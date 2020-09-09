import React, {
  createContext,
  useState,
  useEffect,
} from "react";
import { makeStyles } from "@material-ui/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@material-ui/core";

import {
  parseDateToStandardNumber,
  parseStandardNumber,
} from "../../../../lib/date/mod.js";
import {
  months as month_lang,
} from "../../../../lib/date/lang.js";

export const DateParameters = createContext({
  calendar_dates: [],
});

const cellStyles = makeStyles({
  row: {
    borderBottom: "none",
    fontSize: "10px",
    padding: "2px",
    margin: 0,
  },
});

export const CleanTableCell = ({ children, className = "", ...props }) => {
  const styles = cellStyles();
  return (
    <TableCell
      className={[styles.row, ...className.split(" ")].join(" ")}
      {...props}
    >
      {children}
    </TableCell>
  );
};

const rowStyles = makeStyles({
  row: {
    margin: 0,
    padding: "0px",
  },
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

const verticalStyles = makeStyles({
  verticalColumn: {
    transform: "rotate(-90deg)",
    display: "inline-block",
    padding: 0,
    margin: 0,
  },
});

export const VerticalCell = ({ children, ...props }) => {
  const styles = verticalStyles();
  return (
    <CleanTableCell {...props}>
      <div className={styles.verticalColumn}>{children}</div>
    </CleanTableCell>
  );
};

const colors = new Map([
  ["green", "#C6E48B"],
  ["yellow", "#FFC700"],
  ["red", "#FE5C5C"],
  ["gray", "#D2D0D1"],
]);

const dotStyles = makeStyles((theme) => ({
  dot: {
    borderRadius: "0%",
    height: "15px",
    margin: "auto",
    width: "15px",
  },
  warning: {
    backgroundColor: colors.get("yellow"),
  },
  error: {
    backgroundColor: colors.get("red"),
  },
  ok: {
    backgroundColor: colors.get("green"),
  },
  invalid: {
    backgroundColor: colors.get("gray"),
  },
}));

const detailStatus = new Set([
  "warning",
  "error",
  "ok",
  "invalid",
]);

export const DetailDot = ({
  color = null,
  status,
}) => {
  const classes = dotStyles();

  status = detailStatus.has(status) ? status : "invalid";

  return (
    <div
      className={[
        classes.dot,
        classes[status],
      ].join(" ")}
      style={color
        ? {
          backgroundColor: color,
        }
        : {}}
    >
    </div>
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

export default function Heatmap({
  blacklisted_dates,
  children,
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
      <Table className={classes.table}>
        <TableHead>
          <CleanTableRow>
            <CleanTableCell className={classes.detail_column} />
            {Object.entries(calendar_dates
              .reduce((month_count, current_date) => {
                const current_month = String(current_date).substr(4, 2);
                if (current_month in month_count) {
                  month_count[current_month] += 1;
                } else {
                  month_count[current_month] = 1;
                }
                return month_count;
              }, {}))
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([month_id, count]) => (
                <CleanTableCell align="center" colSpan={count} key={month_id}>
                  {month_lang.get(month_id)}
                </CleanTableCell>
              ))}
          </CleanTableRow>
          <CleanTableRow>
            <CleanTableCell className={classes.detail_column} />
            {calendar_dates.map((date) => (
              <VerticalCell key={date}>
                {String(date).substr(6, 2)}
              </VerticalCell>
            ))}
          </CleanTableRow>
        </TableHead>
        <TableBody>
          <DateParameters.Provider value={{ calendar_dates }}>
            {children}
          </DateParameters.Provider>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
