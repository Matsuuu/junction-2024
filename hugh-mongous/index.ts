import express from "express";
import cors from "cors";
// import "./src/kafka";

export const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/diag", (req, res) => {
  console.log(req.body);
  res.send();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
