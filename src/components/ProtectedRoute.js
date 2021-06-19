import React from "react";
import { Route, Redirect } from "react-router-dom";

export default function ProtectedRoute({
  Auth,
  path,
  component: Component,
  ...rest
}) {
  return (
    <Route
      {...rest}
      render={(props) => {
        console.log(Auth)
        if (Auth) return <Component />;
        else
          return (
            <Redirect to={{ pathname: "/", state: { from: props.location } }} />
          );
      }}
    />
  );
}
