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
let items = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.get("/", async(req, res) => {
  try {
    const results = await db.query(
      "SELECT lists.id AS list_id, lists.list_name, lists.list_date, items.id AS item_id, items.title FROM lists left JOIN items ON lists.id = items.list_id ORDER BY lists.id ASC"
    );
    res.render("index.ejs", {listItems: results.rows});
  } catch (error) {
    console.log(error);
  }
});

app.post("/add", async(req, res) => {
  try {
    await db.query("INSERT INTO items (title, list_id) VALUES ($1, $2)", [req.body.newItem, req.body.newlistId]);
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

app.post("/delete/:id", async(req, res) => {
  try {
    await db.query("DELETE FROM items WHERE id = $1", [req.params.id]);
    res.redirect("/")
  } catch (error) {
    console.log(error);
  }
});

app.get("/new_list", (req, res) => {
  res.render("new-list.ejs");
});

app.post("/new_list", async(req, res) => {
  try {
    await db.query("INSERT INTO lists (list_name, list_date) VALUES ($1, $2) RETURNING *", [req.body.list_name, req.body.list_date]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/delete_list/:id", async(req, res) => {
  try {
    await db.query("DELETE FROM lists WHERE id=$1", [req.params.id]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
