import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useCookies } from "react-cookie";
export default function ProtectedRoute({
  Auth,
  path,
  component: Component,
  ...rest
}) {
  const [cookies] = useCookies(["author"]);
  return (
    <Route
      {...rest}
      render={(props) => {
        if (Auth) {
          if (path === "/table") {
            if (cookies["lay-access"] === "admin") return <Component />;
            else
              return (
                <Redirect
                  to={{ pathname: "/", state: { from: props.location } }}
                />
              );
          } else return <Component />;
        } else
          return (
            <Redirect to={{ pathname: "/", state: { from: props.location } }} />
          );
      }}
    />
  );
}
