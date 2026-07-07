import 'dotenv/config';
import app from './src/app.ts';
import http from 'http';

const server = http.createServer(app);

const port = process.env.PORT || 4000;

server.listen(port, () => {
    console.log(`Server is up and running on http://localhost:${port}`);
});