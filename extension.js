const events = require('events');

module.exports = (nodecg) => {

    const timer = nodecg.Replicant('timer', 'nodecg-speedcontrol');
    const runDataActiveRun = nodecg.Replicant('runDataActiveRun', 'nodecg-speedcontrol')
    const runDataArray = nodecg.Replicant('runDataArray', 'nodecg-speedcontrol')

    const router = nodecg.Router();

    let timerEvent = new events.EventEmitter();
    timer.on('change', (newVal) => timerEvent.emit('change'))

    router.use((req, res, next) => {
        if (req.path === '/timer/event') return next();
        switch (req.headers.authorization.split(' ')[1]) {
            case undefined: res.status(401).send({ error: 'No token provided.' }); break;
            case nodecg.bundleConfig.token: nodecg.log.debug(`Endpoint: ${req.path}     Body: ${req.body}`); next(); break;
            default: res.status(403).send({ error: 'Invalid token.' }); break;
        }
    });

    // Timer
    router.post('/timer/start', (req, res) => {
        if (timer.value.state !== 'stopped' && timer.value.state !== 'paused') return res.status(400).send({ error: 'Timer is running.' })
        nodecg.sendMessageToBundle('timerStart', 'nodecg-speedcontrol');
        res.status(200).send({})
    });
    router.post('/timer/stop', (req, res) => {
        if (timer.value.state !== 'running') return res.status(400).send({ error: 'Timer is not running.' })
        if (req.body === '' || Object.keys(req.body).length <= 0) {
            for (let i = 0; i < runDataActiveRun.value.teams.length; i++) {
                nodecg.sendMessageToBundle('timerStop', 'nodecg-speedcontrol', { id: runDataActiveRun.value.teams[i].id, forfeit: req.body.forfeit });
            }
        }
        else if (req.body.id !== undefined && req.body.player !== undefined) return res.status(400).send({ error: 'Invalid parameters.' })
        else if (req.body.id !== undefined) nodecg.sendMessageToBundle('timerStop', 'nodecg-speedcontrol', { id: `${req.body.id}`, forfeit: req.body.forfeit });
        else if (req.body.player !== undefined) {
            if (!(req.body.player >= 1 && req.body.player <= 4)) return res.status(400).send({ error: 'Invalid player.' })
            else nodecg.sendMessageToBundle('timerStop', 'nodecg-speedcontrol', { id: `${runDataActiveRun.value.teams[req.body.player - 1].id}`, forfeit: req.body.forfeit });
        }
        res.status(200).send({})
    });
    router.post('/timer/pause', (req, res) => {
        if (timer.value.state !== 'running') return res.status(400).send({ error: 'Timer is running.' })
        nodecg.sendMessageToBundle('timerPause', 'nodecg-speedcontrol');
        res.status(200).send({})
    });
    router.post('/timer/undo', (req, res) => {
        if (timer.value.state !== 'finished' && timer.value.state !== 'running') return res.status(400).send({ error: 'Timer is not running.' })
        else if (req.body === '' || Object.keys(req.body).length <= 0) nodecg.sendMessageToBundle('timerUndo', 'nodecg-speedcontrol', 'undefined');
        nodecg.sendMessageToBundle('timerUndo', 'nodecg-speedcontrol', req.body.id);
        res.status(200).send({})
    })
    router.post('/timer/reset', (req, res) => {
        if (timer.value.state === 'stopped') return res.status(400).send({ error: 'Timer is stopped.' })
        nodecg.sendMessageToBundle('timerReset', 'nodecg-speedcontrol', false);
        res.status(200).send({})
    });
    router.post('/timer/edit', (req, res) => {
        if (timer.value.state !== 'paused' && timer.value.state !== 'stopped') return res.status(400).send({ error: 'Timer is running.' });
        if (typeof req.body.time !== 'string' || req.body.time.length !== 8) return res.status(400).send({ error: 'Invalid time format.' });
        nodecg.sendMessageToBundle('timerEdit', 'nodecg-speedcontrol', req.body.time);
        res.status(200).send({})
    });
    router.get('/timer/status', (req, res) => {
        res.status(200).send({ data: timer.value })
    })

    // Timer EventSource
    router.get('/timer/event', (req, res) => {
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();
        let listener = (newVal) => res.write(`data: ${JSON.stringify(newVal)}\n\n`)
        timer.on('change', listener);

        req.on("close", () => timer.removeListener('change', listener));
    });

    // Run data.
    router.get('/run/active', (req, res) => {
        res.status(200).send({ data: runDataActiveRun.value })
    })

    nodecg.mount('/bundles/nodecg-speedcontrol/api', router);
}