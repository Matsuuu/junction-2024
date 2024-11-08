import { Kafka } from "kafkajs";
import { app } from "../index";

export const kafka = new Kafka({
  clientId: "hugh-data",
  brokers: ["datanautti:9092", "100.82.107.137:9092"],
});

export const pingProducer = kafka.producer();
await pingProducer.connect();

console.log("[kafka.ts]: Kafka init");

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
