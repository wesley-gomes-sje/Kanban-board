const express = require("express");
const cors = require("cors");
const { appendFile } = require("fs");
const app = express();
const PORT = 4000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const http = require("http").Server(app);

app.use(cors());

const socketIO = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});

socketIO.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on("taskDragged", (data) => {
    const { source, destination } = data;

    const itemMoved = {
      ...tasks[source.droppableId].items[source.index],
    };
    console.log("DraggedItem>>> ", itemMoved);

    tasks[source.droppableId].items.splice(source.index, 1);

    tasks[destination.droppableId].items.splice(
      destination.index,
      0,
      itemMoved
    );

    socket.emit("tasks", tasks);
  });

  socket.on("createTask", (data) => {
    const newTask = { id: fetchID(), title: data.task, comments: [] };
    tasks["pending"].items.push(newTask);
    socket.emit("tasks", tasks);
  });

  socket.on("addComment", (data) => {
    const { category, userId, comment, id } = data;
    const taskItems = tasks[category].items;
    for (let i = 0; i < taskItems.length; i++) {
      if (taskItems[i].id === id) {
        taskItems[i].comments.push({
          name: userId,
          text: comment,
          id: fetchID(),
        });

        socket.emit("comments", taskItems[i].comments);
      }
    }
  });

  socket.on("fetchComments", (data) => {
    const { category, id } = data;
    const taskItems = tasks[category].items;

    for (let i = 0; i < taskItems.length; i++) {
      if (taskItems[i].id === id) {
        socket.emit("comments", taskItems[i].comments);
      }
    }
  });

  socket.on("disconnect", () => {
    socket.disconnect();
    console.log("🔥: A user disconnected");
  });
});

const fetchID = () => Math.random().toString(36).substring(2, 10);

let tasks = {
  pending: {
    title: "pending",
    items: [
      {
        id: fetchID(),
        title: "Envie o arquivo Figma para Dima",
        comments: [],
      },
    ],
  },

  ongoing: {
    title: "ongoing",
    items: [
      {
        id: fetchID(),
        title: "Revise os problemas do GitHub",
        comments: [
          {
            name: "Davi",
            text: "Certifique-se de revisar antes de mesclar",
            id: fetchID(),
          },
        ],
      },
    ],
  },

  completed: {
    title: "completed",
    items: [
      {
        id: fetchID(),
        title: "Crie conteúdos técnicos",
        comments: [
          {
            name: "Dima",
            text: "Certifique-se de verificar os requisitos",
            id: fetchID(),
          },
        ],
      },
    ],
  },
};

app.get("/api", (req, res) => {
  res.json(tasks);
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
