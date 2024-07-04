const http = require("http")
const bcrypt = require('bcryptjs');
const EventEmitter = require('events');
const port = 4000;

const emitter = new EventEmitter();

emitter.on('dataEncrypted', (normal, bcrypt) => {
    console.log('bcrypt:', bcrypt);
    console.log('normal:', normal);
});

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/encrypt') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const jsonData = JSON.parse(body);
                const originalData = jsonData.data;

                bcrypt.hash(originalData, 10, (err, hash) => {
                    if (err) {
                        res.writeHead(500, {'Content-Type': 'application/json'});
                        res.end(JSON.stringify({error: 'Encryption failed'}));
                    } else {
                        emitter.emit('Encryption', originalData, hash);
                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end(JSON.stringify({encryptedData: hash}));
                    }
                });
            } catch (e) {
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({error: 'error JSON'}));
            };
        });
    };
});

server.listen(port, () => {
    console.log(`Server listening to port ${port}`);
});