import express from "express";
import cors from "cors";
import { pingProducer } from "./src/kafka";

const app = express();
const port = 3000;

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/ping", (req, res) => {
  const timestamp = new Date().toUTCString();
  pingProducer.send({
    topic: "matsu",
    messages: [
      {
        value: JSON.stringify({
          msg: "Ping endpoint called",
          timestamp,
        }),
      },
    ],
  });
  console.log("Submitted to topic");
  res.send({ pong: timestamp });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
