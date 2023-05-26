import * as path from "path";

import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";


const app = express();
const http = createServer(app);
const ioServer = new Server(http);  

// Use custom port or port created by hosting
const port = process.env.PORT || 4242

const historySize = 50

let history = []
let membersLoaded = false
let htmlMemberList = null


// Serve client-side files
app.use(express.static(path.resolve('public')))

ioServer.use((socket, next) => {
	const username = socket.handshake.auth.username;
	if (!username) {
	  return next(new Error("invalid username"));
	}
	socket.username = username;
	next();
  });
  
  ioServer.on("connection", (socket) => {
	// fetch existing users
	const users = [];
	for (let [id, socket] of io.of("/").sockets) {
	  users.push({
		userID: id,
		username: socket.username,
	  });
	}
	socket.emit("users", users);
  
	// notify existing users
	socket.broadcast.emit("user connected", {
	  userID: socket.id,
	  username: socket.username,
	});
  
	// forward the private message to the right recipient
	socket.on("private message", ({ content, to }) => {
	  socket.to(to).emit("private message", {
		content,
		from: socket.id,
	  });
	});
  
	// notify users upon disconnection
	socket.on("disconnect", () => {
	  socket.broadcast.emit("user disconnected", socket.id);
	});
  });

http.listen(port, () => {
	console.log('listening on port http://localhost:' + port)
})

/**
 * Wraps the fetch api and returns the response body parsed through json
 * @param {*} url the api endpoint to address
 * @returns the json response from the api endpoint
 */
// async function fetchJson(url) {
//   return await fetch(url)
//     .then((response) => response.json())
//     .catch((error) => error)
// }

/**
 * Renders the passed memberList to an HTML representation using the holy trinity
 * of functional programming: filter, map and reduce.
 * @param {*} memberList a list of members from the whois API
 * @returns an HTML output of the memberlist.
 */
function renderMembers(memberList) {
  return memberList
    .filter((member) => member.role.includes('student'))
    .map((member) => renderMember(member))
    .reduce((output, member) => output + member)
}

/**
 * Renders a passed member object to HTML
 * @param {*} member a single member object from the whois API
 * @returns an HTML output of the member
 */
function renderMember(member) {
  return `
    <article>
      <h2>${member.name}</h2>
      <p>${member.bio ? member.bio.html : ''}</p>
    </article>
  `
}

/**
 * Demonstrates a longpolling process, io is passed along to prevent side-effects
 * @param {*} io a reference to socket.io used to send a message.
 */
function longPollExample(io) {
  io.emit('whatever', 'somebody set up us the bomb!')
}





