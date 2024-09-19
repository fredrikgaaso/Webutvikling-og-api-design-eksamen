import React, { useEffect } from "react";
import { fetchJSON } from "./http";
import { useNavigate } from "react-router-dom";

export function GoogleLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { authorization_endpoint } = await fetchJSON(
          "https://accounts.google.com/.well-known/openid-configuration",
        );

        const parameters = {
          response_type: "token",
          client_id:
            "529955107732-vp1v79g09ppecbb1dep7jhjkp0s8cr3h.apps.googleusercontent.com",
          scope: "email profile",
          redirect_uri: window.location.origin + "/login/callback",
        };

        window.location.href =
          authorization_endpoint + "?" + new URLSearchParams(parameters);
      } catch (error) {
        console.error("Error fetching Google OpenID configuration:", error);
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <main>
      <div>Loading...</div>
    </main>
  );
}
