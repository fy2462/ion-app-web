import React, { createContext } from "react";
import { createUseStyles } from "react-jss";
import store, { Store } from "src/store";
import ContentLayout from 'src/components/layout';

export const StoreContext = createContext<Store>(store);

const useStyles = createUseStyles({
  app: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  mainView: {
    display: "flex",
    flexGrow: 1,
    overflow: "hidden",
  },
});

const App = () => {
  const classes = useStyles();
  return (
    <StoreContext.Provider value={store}>
      <div className={classes.app}>
        <div className={classes.mainView}>
          <ContentLayout />
        </div>
      </div>
    </StoreContext.Provider>
  );
}

export default App;
