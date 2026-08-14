const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');

let phones = {};

app.use(express.static('public'));

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/phone', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'phone.html'));
});

io.on('connection', (socket) => {
    console.log('🔌 New connection:', socket.id);

    socket.on('phone-register', (id) => {
        phones[id] = socket.id;
        console.log(`📱 Phone registered: ${id}`);
        io.emit('phone-list', Object.keys(phones));
    });

    socket.on('phone-screen', (id, image) => {
        socket.broadcast.emit('admin-screen', { id, image });
    });

    socket.on('admin-command', (targetId, command) => {
        if (phones[targetId]) {
            io.to(phones[targetId]).emit('phone-command', command);
            console.log(`📤 Command sent to ${targetId}:`, command);
        }
    });

    socket.on('disconnect', () => {
        for (let id in phones) {
            if (phones[id] === socket.id) {
                delete phones[id];
                console.log(`📱 Phone disconnected: ${id}`);
                io.emit('phone-list', Object.keys(phones));
                break;
            }
        }
    });
});

server.listen(3000, '0.0.0.0', () => {
    console.log('✅ Server running: http://localhost:3000');
    console.log('📱 Admin Panel: http://localhost:3000/admin');
    console.log('📱 Phone App: http://localhost:3000/phone');
});