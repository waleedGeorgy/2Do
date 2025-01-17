import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import moment from 'moment';

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "2do",
  password: "123456",
  port: 5432
});
db.connect();

const app = express();
const port = 3000;
let now = moment().format("Do MMMM YYYY");
let items = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async(req, res) => {
  try {
    const result = await db.query("SELECT * FROM items ORDER BY id ASC");
    items = result.rows;
    res.render("index.ejs", {
      listTitle: now,
      listItems: items,
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/add", async(req, res) => {
  try {
    await db.query("INSERT INTO items (title) VALUES ($1)", [req.body.newItem]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/edit", async(req, res) => {
  try {
    await db.query("UPDATE items SET title = $1 WHERE id = $2", [req.body.updatedItemTitle, req.body.updatedItemId]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/delete", async(req, res) => {
  try {
    await db.query("DELETE FROM items WHERE id = $1", [req.body.deleteItemId]);
    res.redirect("/")
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
