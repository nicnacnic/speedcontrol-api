# API Docs
To make an API request, the URL structure is as follows: `<NodeCG URL>/bundles/nodecg-speedcontrol/api/<endpoint>`. For example, to start the timer, you would make a request to `<NodeCG URL>/bundles/nodecg-speedcontrol/api/timer/start`, replacing `<NodeCG URL` with your dashboard's URL.

### Authentication
For security, a bearer token must be passed in the request headers for all API requests. The token can be changed in the bundle's configuration. There is only one token for all users. To generate the config, enter the following command on the server in your root NodeCG folder: `nodecg defaultconfig speedcontrol-api`.

### Error Handling
If for any reason the API returns a error code (for example for a invalid token or invalid parameters), the API will respond with a JSON object containing an error code. For example:
```json
// Trying to edit the timer with an incorrect time format.
{ "error": "Invalid time format." }
```

### Example Request
These example request uses the Fetch API built into most modern browsers.
```js
 // Start the timer.
fetch('http://localhost:9090/bundles/nodecg-speedcontrol/api/timer/start, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer <your token here>'
    }
}).then(response => response.json().then(data => ({ status: response.status, data: data })))
  .then(result => {
       // Will return a JSON object with the following: { status: 200, data: {} }
})

// Pause the timer for a specific user.
fetch('http://localhost:9090/bundles/nodecg-speedcontrol/api/timer/pause, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer <your token here>',
          'Body': { 
              "id": "d8f3068c-9371-4db3-b97d-61821931bec1",
              "forfeit": false
          }
        }
    }).then(response => response.json().then(data => ({ status: response.status, data: data })))
      .then(result => {
           // Will return a JSON object with the following: { status: 200, data: {} }
    })
}
```

**Timer Start**
----
Starts the timer. Timer must be in a stopped or paused state.

* **Endpoint**  
`/timer/start`

* **Method:**  
`POST`

* **Parameters**  
None.

**Timer Stop**
----
Stops/finishes the timer. Timer must be running.

* **Endpoint**  
`/timer/stop`

* **Method:**  
`POST`

* **Parameters**  
  * `id`[`string`] *(optional)* Team ID to stop timer of; must be defined if run is active and has teams.  
  * `forfeit`[`boolean`] *(optional)* if true, the finish time will be recorded as `"forfeit"` instead of `"completed"`.
  
  If no parameters are set, the timer is stopped for all players.
  
**Timer Pause**
----
Pauses the timer for all players. Timer must be running.

* **Endpoint**  
`/timer/pause`

* **Method:**  
`POST`

* **Parameters**  
None.

**Timer Undo**
----
Undos a stop/finished timer. Timer must be finished or running.

* **Endpoint**  
`/timer/undo`

* **Method:**  
`POST`

* **Parameters**  
  * `id`[`string`] *(optional)* Team ID to undo timer of; must be defined if run is active and has teams.  
  
  If no parameters are set, the timer is undoed for all players.
  
**Timer Reset**
----
Resets the timer. Timer must be in any state other than "stopped".

* **Endpoint**  
`/timer/reset`

* **Method:**  
`POST`

* **Parameters**  
None.

**Timer Edit**
----
Edits the time on the timer. Timer must be paused or stopped.

* **Endpoint**  
`/timer/edit`

* **Method:**  
`POST`

* **Parameters**  
  * `time`[`string`] The time to set on the timer. Must be in `hh:mm:ss` format. 
 
 **Timer Status**
----
Returns the status of the timer. Data structure is the same as in the [nodecg-speedcontrol docs](https://github.com/speedcontrol/nodecg-speedcontrol/blob/master/READMES/API/Replicants.md#timer).

* **Endpoint**  
`/timer/status`

* **Method:**  
`GET`
  
**Timer Event**
----
Returns an EventSource that can be subscribed to, sending data every time the timer object is changed. For more information, please refer to the [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/EventSource).

* **Endpoint**  
`/timer/event`

* **Method:**  
`EventSource`

**Run Data Active Run**
----
Returns the run data of the active run. Data structure is the same as in the [nodecg-speedcontrol docs](https://github.com/speedcontrol/nodecg-speedcontrol/blob/master/READMES/API/RunData.md).

* **Endpoint**  
`/run/active`

* **Method:**  
`GET`
