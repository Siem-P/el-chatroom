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

ioServer.on('connection', (socket) => {
	console.log('A user connected')

	ioServer.emit('history', history)

	socket.on('message', (message) => {
		while (history.length > historySize) {
			history.shift()
		}
		history.push(message)
		ioServer.emit('message', message)
	})

	socket.on('disconnect', () => {
		console.log('A user has disconnected')
	})
})

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





