import React, { useState, useEffect } from "react";
import { Drawer, IconButton, List } from "@material-ui/core";
import {
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  AccountBox as AccountBoxIcon
} from "@material-ui/icons";
import { useTheme } from "@material-ui/styles";
import { withRouter } from "react-router-dom";

// styles
import useStyles from "./styles.js";

// components
import SidebarLink from "./components/sidebar_link/SidebarLink.jsx";
import Dot from "./components/Dot.jsx";

// context
import {
  useLayoutState,
  useLayoutDispatch,
  toggleSidebar
} from "../../context/Layout.jsx";

const structure = [
  { label: "Inicio", link: "/home", icon: <HomeIcon /> },
  {
    label: "Clientes",
    icon: <AccountBoxIcon />,
    children: [
      
    ]
  }
];

function Sidebar({ location }) {
  const classes = useStyles();
  const theme = useTheme();

  const { isSidebarOpened } = useLayoutState();
  const layoutDispatch = useLayoutDispatch();
  const [showAlways, setShowAlways] = useState(true);

  function handleWindowWidthChange() {
    const window_width = window.innerWidth;
    const min_allowed_width = theme.breakpoints.values.md;
    const should_always_show = window_width > min_allowed_width;

    setShowAlways(should_always_show);
  }

  useEffect(function() {
    window.addEventListener("resize", handleWindowWidthChange);
    handleWindowWidthChange();
    return function cleanup() {
      window.removeEventListener("resize", handleWindowWidthChange);
    };
  });

  return (
    <Drawer
      variant={showAlways ? "permanent" : "temporary"}
      className={[
        classes.drawer,
        isSidebarOpened ? classes.drawerOpen : classes.drawerClose
      ].join(" ")}
      classes={{
        paper: isSidebarOpened ? classes.drawerOpen : classes.drawerClose
      }}
      open={isSidebarOpened}
    >
      <div className={classes.toolbar} />
      <div className={classes.mobileBackButton}>
        <IconButton onClick={() => toggleSidebar(layoutDispatch)}>
          <ArrowBackIcon
            classes={{
              root: [classes.headerIcon, classes.headerIconCollapse].join(" ")
            }}
          />
        </IconButton>
      </div>
      <List className={classes.sidebarList}>
        {structure.map((link, index) =>
          (
            <SidebarLink
              key={index}
              location={location}
              isSidebarOpened={isSidebarOpened}
              {...link}
            />
          )
        )}
      </List>
    </Drawer>
  );
}

export default withRouter(Sidebar);
