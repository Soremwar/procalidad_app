import React from "react";
import { makeStyles } from "@material-ui/styles";
import {
  TableCell,
} from "@material-ui/core";

const cellStyles = makeStyles({
  row: {
    borderBottom: "none",
    fontSize: "10px",
    padding: "2px",
    margin: 0
  }
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

const verticalStyles = makeStyles({
  verticalColumn: {
    transform: "rotate(-90deg)",
    display: "inline-block",
    padding: 0,
    margin: 0
  }
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

const dotStyles = makeStyles(theme => ({
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
      ].join(' ')}
      style={color ? {
        backgroundColor: color,
      } : {}}
    ></div>
  );
}