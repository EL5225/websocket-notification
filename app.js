// Config http
require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const { PORT } = process.env;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get("/", (req, res) => res.render("home"));
app.get("/notification", (req, res) => {
  const { user_id } = req.query;
  const db = require("./db.json");
  let notification = db.notification;

  if (user_id) {
    notification = notification.filter((item) => item.user_id == user_id);
  }

  res.render("notification", { notification, user_id });
});



// config websocket
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.post("/notification", (req, res) => {
  const { user_id, title, body } = req.body;
  const db = require("./db.json");

  db.notification_id += 1;

  const newNotification = {
    id: db.notification.length + 1,
    user_id,
    title,
    body,
    is_read: false,
  };

  db.notification.push(newNotification);

  fs.writeFileSync("./db.json", JSON.stringify(db, null, 2));

  io.emit(`user-${user_id}`, newNotification);

  res.json({
    status: true,
  });
});

app.get("/notification/:id/mark-as-read", (req, res) => {
  const db = require("./db.json");
  const { id } = req.params;
  let notif = db.notification.find((item) => item.id == id);

  notif.is_read = true;

  fs.writeFileSync("./db.json", JSON.stringify(db, null, 2));

  res.redirect(`/notification?user_id=${notif.user_id}`);
});

server.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
