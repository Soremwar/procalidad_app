import React, { useContext, useEffect, useState } from "react";
import { Drawer, IconButton, List } from "@material-ui/core";
import { ArrowBack as ArrowBackIcon } from "@material-ui/icons";
import { useTheme } from "@material-ui/core/styles";
import { withRouter } from "react-router-dom";
import useStyles from "./styles.js";
import SidebarLink from "./components/sidebar_link/SidebarLink.jsx";
import {
  toggleSidebar,
  useLayoutDispatch,
  useLayoutState,
} from "../../context/Layout.jsx";
import { UserContext } from "../../context/User.jsx";
import { getRoutes } from "../routes";

const Sidebar = ({ location }) => {
  const [context] = useContext(UserContext);
  const structure = getRoutes(context.profiles);

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
        ].join(" "),
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
        {structure
          .reduce((arr, category) => {
            if (category.children) {
              category.children = category.children.reduce((arr, module) => {
                if (
                  !Array.isArray(module.allowed_profiles) &&
                  typeof module.allowed_profiles !== "undefined"
                ) {
                  throw new Error(
                    "A value for allowed_profiles other than array was passed to the route component",
                  );
                }
                // Display modules if the profiles match or no profiles were defined
                if (
                  !module.allowed_profiles?.length ||
                  context.profiles.some((profile) =>
                    module.allowed_profiles.includes(profile)
                  )
                ) {
                  // Map module.link property to the path property inside the routes array
                  module.link = module.path;
                  arr.push(module);
                }
                return arr;
              }, []);

              if (category.children.length) {
                arr.push(category);
              }
            }
            return arr;
          }, [])
          .map(({ children, icon, label }, index) => (
            <SidebarLink
              children={children}
              icon={icon}
              isSidebarOpened={isSidebarOpened}
              key={index}
              label={label}
              location={location}
            />
          ))}
      </List>
    </Drawer>
  );
};

export default withRouter(Sidebar);
