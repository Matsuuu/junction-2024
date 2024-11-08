import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "hugh-data",
  brokers: ["datanautti:9092", "100.82.107.137:9092"],
});

export const pingProducer = kafka.producer();
await pingProducer.connect();

console.log("[kafka.ts]: Kafka init");
