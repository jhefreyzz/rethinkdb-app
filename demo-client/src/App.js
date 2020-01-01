import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import io from "socket.io-client";

const ws = io("http://localhost:4001", { forceNew: true });

function App() {
  const [users, setUsers] = useState([]);
  const [order, setOrder] = useState("");
  useEffect(() => {
    ws.on("connect", () => {
      console.log(`connected`);
      ws.emit("stream");
      ws.on("disconnect", () => {
        console.log("disconnected");
      });
    });

    fetch(`http://localhost:3000/`)
      .then(response => response.json())
      .then(data => {
        setUsers(data);
      });

    ws.on("feed", response => {
      const prev = response.old_val;
      const next = response.new_val;
      const type = response.type;

      setUsers(users => {
        let currentUser = [...users];
        let index;
        switch (type) {
          case "add":
            return [...users, next];
          case "change":
            index = users.findIndex(u => u.id === next.id);
            currentUser[index].order = next.order;
            return currentUser;
          case "remove":
            index = users.findIndex(u => u.id === prev.id);
            currentUser.splice(index, 1);
            return currentUser;
          default:
            return currentUser;
        }
      });
    });
    return () => {
      ws.close();
    };
  }, []);

  const handleChange = event => {
    setOrder(event.target.value);
  };

  const handleAdd = () => {
    ws.emit("add_user", order);
    setOrder("");
  };

  const handleUpdate = (id, order) => {
    ws.emit("update_user", {
      id: id,
      order: order
    });
  };

  const handleDelete = id => {
    ws.emit("delete_user", id);
  };

  const sortedUser = users.sort((a, b) => {
    return parseFloat(a.order) - parseFloat(b.order);
  });

  console.log(users);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Inputted name: {order}</p>
        <div>
          <input onChange={handleChange} />
          <button onClick={handleAdd}>Add</button>
        </div>
        {sortedUser.map(user => (
          <div key={user.id}>
            <h1>{user.order}</h1>

            <button onClick={() => handleUpdate(user.id, order)}>Update</button>
            <button onClick={() => handleDelete(user.id)}>Delete this.</button>
          </div>
        ))}
      </header>
    </div>
  );
}

export default App;
