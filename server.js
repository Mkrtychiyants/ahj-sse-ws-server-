import http from "http";
import express from "express";
import WebSocket, { WebSocketServer } from "ws";
import cors from "cors";
import bodyParser from "body-parser";
import * as crypto from "crypto";

const app = express();

app.use(cors());
app.use(
  bodyParser.json({
    type(req) {
      return true;
    },
  })
);
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

const userState = [
  {
    "id": "cf6a64aa-ff6a-4580-8e9f-40e44e339d58",
    "name": "Alexa",
    "host": false,
    "message": "loremlcasckeasklvshevbseklvbsekv",
    "created": "1994-12-17T04:24:00"
  },
  {
    "id": "cf6a64aa-ff6a-4580-8e9f-40e44e339d58",
    "name": "Alexa",
    "host": false,
    "message": "loremlcasckeasklvshevbseklvbsekv",
    "created": "1994-12-17T04:24:00"
  },
  {
    "id": "cf6a64as-ff6a-4580-8e9f-40e44e339d58",
    "name": "Ben",
    "host": false,
    "message": "female awd",
    "created": "1995-12-17T03:44:00"
  },
  {
    "id": "cf6a64as-ff6a-4580-8e9f-40e44e339d59",
    "name": "Benny",
    "host": false,
    "message": "female aASDAWDAWDWDAWDAWDwd",
    "created": "1996-12-17T03:44:00"
  },
  {
    "id": "cf6a64as-ff6a-4580-8e9f-s0e44e339d59",
    "name": "mike",
    "host": false,
    "message": "femalasdwwwwwwwwwwwwwwe aASDAWDAWDWDAWDAWDwd",
    "created": "1996-12-17T03:44:00"
  }
];
app.post("/new-user", async (request, response) => {
  if (Object.keys(request.body).length === 0) {
    const result = {
      status: "error",
      message: "This name is already taken!",
    };
    response.status(400).send(JSON.stringify(result)).end();
  }
  const { name } = request.body;

  const isExist = userState.find((user) => user.name === name);
  if (!isExist) {
    const newUser = {
      id: crypto.randomUUID(),
      name: name,
      host: true,
    };
    userState.push(newUser);

    const result = {
      status: "ok",
      user: newUser,
    };
    response.send(JSON.stringify(result)).end();
  } else {
    const result = {
      status: "error",
      message: "This name is already taken!",
    };
    response.status(409).send(JSON.stringify(result)).end();

  }
});

const server = http.createServer(app);
const wsServer = new WebSocketServer({ server });
wsServer.on("connection", (ws) => {

  ws.on("message", (msg, isBinary) => {

    const receivedMSG = JSON.parse(msg);

    if (receivedMSG.type === "exit") {

      const idx = userState.findIndex(
        (user) => user.name === receivedMSG.name
      );

      userState.splice(idx, 1);
      [...wsServer.clients]
        .filter((o) => o.readyState === WebSocket.OPEN)
        .forEach((o) => o.send(JSON.stringify(userState)));
      return;
    }
    if (receivedMSG.type === "send") {


      [...wsServer.clients]
        .filter((o) => o.readyState === WebSocket.OPEN)
        .forEach((o) => o.send(msg, { binary: isBinary }));
    }
  });


  [...wsServer.clients]
    .filter((o) => o.readyState === WebSocket.OPEN)
    .forEach((o) => o.send(JSON.stringify(userState)));
});

const port = process.env.PORT || 3000;

const bootstrap = async () => {
  try {
    server.listen(port, () =>
      console.log(`Server has been started on http://localhost:${port}`)
    );
  } catch (error) {
    console.error(error);
  }
};

bootstrap();