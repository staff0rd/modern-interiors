import "./App.css";
import Connect from "./Connect.tsx";
import Documentation from "./Documentation.tsx";
import heroImg from "./assets/hero.png";
import reactLogo from "./assets/react.svg";
import { useState } from "react";
import viteLogo from "./assets/vite.svg";

const INITIAL_COUNT = 0;
const INCREMENT = 1;

const App = () => {
  const [count, setCount] = useState(INITIAL_COUNT);

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((value) => value + INCREMENT)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <Documentation />
        <Connect />
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  );
};

export default App;
