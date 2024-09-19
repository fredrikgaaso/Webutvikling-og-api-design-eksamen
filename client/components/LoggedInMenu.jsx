import { useLoader } from "./useLoader";
import { fetchJSON } from "./http";
import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { GoogleLogin } from "./Login";
export function CallBack() {
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { access_token } = Object.fromEntries(
          new URLSearchParams(window.location.hash.substring(1)),
        );

        if (access_token) {
          console.log(access_token);
          await fetch("/api/login", {
            method: "post",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({ access_token }),
          });

          setTimeout(() => {
            navigate("/login/menu");
          }, 1000);
        } else {
          console.error("Access token not found.");
        }
      } catch (error) {
        console.error("Error during callback:", error);
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
export function Profile() {
  const navigate = useNavigate();
  const { loading, data, error } = useLoader(async () => {
    return await fetchJSON("/api/login");
  });

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/login", {
        method: "delete",
      });

      if (response.ok) {
      } else {
        console.error("Logout failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  if (loading) {
    return (
      <main>
        <div>Loading...</div>
      </main>
    );
  }

  if (error) {
    return <div>Error: {error.toString()}</div>;
  }

  return (
    <div>
      <header>
        {" "}
        <h1>Welcome {data.name}!</h1>
      </header>
      <main>
        <h3>What do you want to do next?</h3>
        <ul>
          <li>
            <Link to={"/login/chat"}>See chatrooms</Link>
          </li>
        </ul>
      </main>
      <footer>
        {" "}
        <Link to={"/"}>
          <button onClick={handleLogout}>Log out</button>
        </Link>
      </footer>
    </div>
  );
}
