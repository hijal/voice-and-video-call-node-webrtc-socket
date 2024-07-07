const { createServer } = require('node:http');

const express = require('express');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;

const app = express();
const server = createServer(app);

const io = new Server(server);

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendfile(__dirname + '/public/index.html');
});

let connectedPeers = [];
io.on('connection', (socket) => {
  connectedPeers.push(socket.id);
  console.log(connectedPeers);

  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected`);

    connectedPeers = connectedPeers.filter((id) => id !== socket.id);
    console.log(connectedPeers);
  });

  socket.on('pre-offer', (data) => {
    const { callType, calleePersonalCode } = data;
    console.log(
      `Received pre-offer from ${socket.id} for call type ${callType} with callee personal code ${calleePersonalCode}`
    );

    const connectedPeer = connectedPeers.find((cp) => cp === calleePersonalCode);

    if (connectedPeer) {
      const data = {
        callerSocketId: socket.id,
        callType
      };
      io.to(connectedPeer).emit('pre-offer', data);
    } else {
      io.to(socket.id).emit('pre-offer-answer', {
        preOfferAnswer: 'CALLEE_NOT_FOUND'
      });
    }
  });

  socket.on('pre-offer-answer', (data) => {
    console.log('pre offer answer');
    const { callerSocketId } = data;

    const connectedPeer = connectedPeers.find((cp) => cp === callerSocketId);
    console.log('pre offer answer user found,' + connectedPeer);
    if (connectedPeer) {
      io.to(connectedPeer).emit('pre-offer-answer', data);
    }
  });

  socket.on('webRTC-signaling', (data) => {
    const { connectedUserSocketId } = data;
    const connectedPeer = connectedPeers.find((cp) => cp === connectedUserSocketId);

    if (connectedPeer) {
      io.to(connectedPeer).emit('webRTC-signaling', data);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
