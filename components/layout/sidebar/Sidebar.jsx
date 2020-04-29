import React, { useState, useEffect } from "react";
import { Drawer, IconButton, List } from "@material-ui/core";
import {
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  AccountBox as AccountBoxIcon,
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
  toggleSidebar,
} from "../../context/Layout.jsx";

//TODO
//Centralize links to component with virtual routing

const structure = [
  { label: "Inicio", link: "/home", icon: <HomeIcon /> },
  {
    label: "Sistema",
    icon: <AccountBoxIcon />,
    children: [
      { label: "Parametro", link: "/maestro/parametro" },
    ],
  },
  {
    label: "Clientes",
    icon: <AccountBoxIcon />,
    children: [
      { label: "Sector", link: "/clientes/sector" },
      { label: "Cliente", link: "/clientes/cliente" },
      { label: "Contacto", link: "/clientes/contacto" },
    ],
  },
  {
    label: "Operaciones",
    icon: <AccountBoxIcon />,
    children: [
      { label: "Tipo de Proyecto", link: "/operaciones/tipo_proyecto" },
      { label: "Proyecto", link: "/operaciones/proyecto" },
      { label: "Tipo de Presupuesto", link: "/operaciones/tipo_presupuesto" },
      { label: "Rol", link: "/operaciones/rol" },
      { label: "Presupuesto", link: "/operaciones/presupuesto" },
    ],
  },
  {
    label: "Organizacion",
    icon: <AccountBoxIcon />,
    children: [
      { label: "Tipo de Area", link: "/organizacion/tipo_area" },
      { label: "Area", link: "/organizacion/area" },
      { label: "SubArea", link: "/organizacion/sub_area" },
    ],
  },
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

  useEffect(function () {
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
        isSidebarOpened ? classes.drawerOpen : classes.drawerClose,
      ].join(" ")}
      classes={{
        paper: [
          isSidebarOpened ? classes.drawerOpen : classes.drawerClose,
          classes.drawerContent,
        ].join(' '),
      }}
      open={isSidebarOpened}
    >
      <div className={classes.toolbar} />
      <div className={classes.mobileBackButton}>
        <IconButton onClick={() => toggleSidebar(layoutDispatch)}>
          <ArrowBackIcon
            classes={{
              root: [classes.headerIcon, classes.headerIconCollapse].join(" "),
            }}
          />
        </IconButton>
      </div>
      <List className={classes.sidebarList}>
        {structure.map((link, index) => (
          <SidebarLink
            key={index}
            location={location}
            isSidebarOpened={isSidebarOpened}
            {...link}
          />
        ))}
      </List>
    </Drawer>
  );
}

export default withRouter(Sidebar);
