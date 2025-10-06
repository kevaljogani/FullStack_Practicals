import React, { useState } from "react";
import "./App.css";

function App() {
  const [expression, setExpression] = useState("");

  const append = (value) => {
    const lastChar = expression.slice(-1);
    const operators = ["+", "-", "*", "/"];

    if (
      operators.includes(value) &&
      (expression === "" || operators.includes(lastChar))
    ) {
      return; // prevent invalid operator input
    }
    setExpression(expression + value);
  };

  const clear = () => setExpression("");

  const del = () => setExpression(expression.slice(0, -1));

  const calculate = () => {
    try {
      // eslint-disable-next-line no-eval
      const result = eval(expression);
      setExpression(String(result));
    } catch {
      alert("Invalid expression");
    }
  };

  return (
    <div className="calculator">
      <div className="display">{expression || "0"}</div>
      <div className="buttons">
        <button className="operator" onClick={() => append("/")}>
          /
        </button>
        <button className="operator" onClick={() => append("*")}>
          *
        </button>
        <button className="operator" onClick={() => append("+")}>
          +
        </button>
        <button className="operator" onClick={() => append("-")}>
          -
        </button>
        <button className="operator" onClick={del}>
          DEL
        </button>
        <button onClick={() => append("1")}>1</button>
        <button onClick={() => append("2")}>2</button>
        <button onClick={() => append("3")}>3</button>
        <button onClick={() => append("4")}>4</button>
        <button onClick={() => append("5")}>5</button>
        <button onClick={() => append("6")}>6</button>
        <button onClick={() => append("7")}>7</button>
        <button onClick={() => append("8")}>8</button>
        <button onClick={() => append("9")}>9</button>
        <button onClick={() => append("0")}>0</button>
        <button onClick={() => append(".")}>.</button>
        <button className="equal" onClick={calculate}>
          =
        </button>
        <button className="operator" onClick={clear}>
          C
        </button>
      </div>
    </div>
  );
}

export default App;
