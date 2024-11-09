import express from "express";
import cors from "cors";
import { db } from "./src/db";
// import "./src/kafka";

export const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.get("/diag", (req, res) => {
    res.send({ msg: "This is the diag endpoint. Please use POST" });
});

app.post("/diag", (req, res) => {
    console.log(req.body);
    res.send();
});

app.post("/submit", async (req, res) => {
    const dbRes = await db.insertInto("inventory").values([req.body]).execute();
    console.log({ dbRes });
    res.send();
});

app.get("/items", async (req, res) => {
    const items = await db.selectFrom("inventory").selectAll().execute();

    res.send({ items });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
