import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const events: any[] = [];

//tracking API

app.post('/track', (req, res) => {
    events.push({
        ...req.body,
        receivedAt: new Date().toISOString(),
    });

    res.json({ok: true});
});

app.get('/events', (_req, res) =>{
    res.json({
        count: events.length, 
        events: events.slice(-50),
    });
});

app.listen(4000, () =>{
    console.log('Tracking API -> http://localhost:4000');
});