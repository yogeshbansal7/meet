const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const http = require('http');
app.set("view engine", "ejs");
const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});
const { ExpressPeerServer } = require("peer");
const opinions = {
  debug: true,
}

app.use("/peerjs", ExpressPeerServer(server, opinions));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

app.get("/ping", (req, res) => {
  console.log("Ok");
  res.send("pong");
  return;
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    setTimeout(()=>{
      socket.to(roomId).broadcast.emit("user-connected", userId);
    }, 1000)
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
    });
  });
});

function pingServer() {
  const options = {
    hostname: 'localhost',
    port: process.env.PORT || 3030,
    path: '/ping',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    res.on('data', (chunk) => {
      // console.log(`Ping response: ${chunk}`);
      console.log("Calling dummy api")
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with ping request: ${e}`);
  });

  req.end();
}

setInterval(pingServer, 8 * 60 * 1000); 


server.listen(process.env.PORT || 3030, () => {
  console.log("Server started");
});
