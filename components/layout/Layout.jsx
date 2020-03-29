import React, { Fragment } from "react";
import {
  Route,
  Switch,
  withRouter
} from "react-router-dom";

import useStyles from "./styles";
import Header from "./header/Header.jsx";
import Sidebar from "./sidebar/Sidebar.jsx";

import { useLayoutState } from "../context/Layout.jsx";

const Layout = (props) => {
  const classes = useStyles();
  const layout_context = useLayoutState();

  return (
    <div className={classes.root}>
      <Fragment>
        <Header history={props.history} />
        <Sidebar />
        <div className={[
          classes.content,
          ...(layout_context.isSidebarOpened ? [classes.contentShift] : []),
        ].join(" ")}>
          <div className={classes.fakeToolbar} />
        </div>
      </Fragment>
    </div>
  );
};

export default withRouter(Layout);
