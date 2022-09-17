import "bootstrap/dist/css/bootstrap.css";
import React from "react";
import Header from "../components/header";
const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <React.Fragment>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component {...pageProps} currentUser={currentUser} />
      </div>
    </React.Fragment>
  );
};

AppComponent.getInitialProps = async (appContext) => {
  try {
    const client = buildClient(appContext.ctx);
    const { data } = await client.get("/api/user/currentuser");
    let pageProps = {};
    if (appContext.Component.getInitialProps) {
      pageProps = await appContext.Component.getInitialProps(
        appContext.ctx,
        client,
        data.currentUser
      );
    }
    return {
      pageProps,
      ...data,
    };
  } catch (error) {
    return {};
  }
};

export default AppComponent;
