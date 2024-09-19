import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { CallBack, Profile } from "./LoggedInMenu";
import { GoogleLogin } from "./Login";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { ChatApplication } from "./Chat";

function FrontPage() {
  return (
    <div>
      <header>
        <h1>Welcome to AwesomePersonIntellect chat-rom </h1>
      </header>
      <main>
        <ul>
          <li>
            <Link to={"/login"}>Login</Link>
          </li>
        </ul>
      </main>
      <footer></footer>
    </div>
  );
}

function Application() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={"/"} element={<FrontPage />}></Route>
        <Route path={"/login"} element={<GoogleLogin />}></Route>
        <Route path={"/login/callback"} element={<CallBack />}></Route>
        <Route path={"/login/menu"} element={<Profile />}></Route>
        <Route path={"/login/chat"} element={<ChatApplication />}></Route>
        <Route path={"/*"} element={<h1>Not Found</h1>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.render(<Application />, document.getElementById("app"));
