import express from "express";
import expressWs from "express-ws";
import cors from "cors";
import WebSocket from "ws";

const app = express();
const wsInstance = expressWs(app);

const port = 8000;
app.use(cors());

const router = express.Router();
wsInstance.applyTo(router);

const connectedClient: WebSocket[] = [];

router.ws('/canvas', (ws, req) => {
    connectedClient.push(ws);

    interface IncomingPositions {
        type: string;
        payload: string;
    }

    ws.on('message', (positionsArr) => {
        try {
            const decodedMessage = JSON.parse(positionsArr.toString()) as IncomingPositions;

            if (decodedMessage.type === "DRAW") {
                connectedClient.forEach((clientWS) => {
                    clientWS.send(JSON.stringify({
                        type: "DRAW",
                        payload: decodedMessage.payload,
                    }));
                })
            }
        } catch (e) {
            ws.send(JSON.stringify({error: "Invalid message format"}));
        }
    })

    ws.on('close', () => {
        const index = connectedClient.indexOf(ws);
        connectedClient.splice(index, 1);
    })
});

app.use(router);

app.listen(port, () => {
    console.log(`Server started on ${port} port!`);
});