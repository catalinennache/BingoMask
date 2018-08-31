'use strict'
var querystring = require('querystring');
var httpService = require('http');


console.log("PARSED")
class TaskQue {


    constructor() {
        this.taskBluePrint = {
            id: null,
            code: null


        };
        this.que = [];
        this.CoreHandlers = [];
        this.GroundHandlers = [];
    }

    addTask(OperationCode, data) {
        var task = JSON.parse(JSON.stringify(this.taskBluePrint));
        task.id = this.generateUID();
        task.code = OperationCode;
        console.log(task);
        let datakeys = Object.keys(data);
        console.log(datakeys);
        for (let i in datakeys) {
            task[datakeys[i]] = data[datakeys[i]];
        }

        this.que.push(task);
        return task;
    }

    removeTask(taskid) {
        let task = this.que.find((obj) => {
            if (obj.id == taskid) {
                return true;
            }
        });

        if (task) this.que.pop(task);
        for (let i in this.CoreHandlers) {
            if (this.CoreHandlers[i] == taskid) {
                this.CoreHandlers.splice(i, 1);
            }
        }

        for (let i in this.GroundHandlers) {
            if (this.GroundHandlers[i] == taskid) {
                this.GroundHandlers.splice(i, 1);
            }

        }

    }
    addCoreHandler(task, callback) {
        this.CoreHandlers[task.id] = callback;
    }
    addGroundHandler(task, callback) {
        this.GroundHandlers[task.id] = callback;
    }

    processCoreResult(result) {
        let hndIDS = Object.keys(this.CoreHandlers);

        for (let j in hndIDS) {
            if (hndIDS[j] == result.task_id)
                this.CoreHandlers[hndIDS[j]](result);
        }
    }
    processGroundResult(result) {
        let hndIDS = Object.keys(this.GroundHandlers);
        console.log(hndIDS);
        console.log(result, result.task_id);
        for (let j in hndIDS) {
            if (hndIDS[j] == result.task_id) {
                console.log("Found listener");
                // console.log(this.GroundHandlers[hndIDS[j]].toString());
                this.GroundHandlers[hndIDS[j]](result);

            }
        }
    }

    generateUID() {

        let id = Math.floor(Math.random() * 100);
        let existingIDS = [];
        this.que.find((obj) => {
            existingIDS.push(obj.id);
        })
        while (existingIDS.includes(id)) {
            id = Math.floor(Math.random() * 100);
        }

        return id;

    }
}

class InternalService {



    constructor() {
        this.CoreReg = {
            PortPipe: null,
            TaskQue: new TaskQue()
        }
        this.GroundReg = {
            PortPipe: null,
            TaskQue: new TaskQue()
        }
        this.CoreConnector = httpService.createServer();
        this.setUp(this.CoreConnector);
        this.GroundConnector = httpService.createServer();
        this.setUp(this.GroundConnector);
        this.paired = false;
        console.log("SERVICE CREATED")
    }

    async pair() {
        var timmer = setInterval(function () {
            this.Post(35300, { "1": this.CoreConnector.address().port, "2": this.GroundConnector.address().port }, function (res) {

                res.setEncoding('utf8');
                this.ExtractPostData(res);
                console.log(res.statusCode);
                if (res.statusCode == 200) {
                    let data = this.ExtractPostData(res);
                    data.then(function (data) {
                        data = JSON.parse(data);
                        this.CoreReg.PortPipe = data[1];
                        this.GroundReg.PortPipe = data[2];
                        clearInterval(timmer);
                        console.log("Handshake DONE", data);
                        this.setCoreBHV();
                        this.setGroundBHV();
                        this.paired = true;
                    }.bind(this))

                }
            }.bind(this))

        }.bind(this), 1000);
        while (!this.paired) {
            await this.delay(500);
        }
    }

    setUp(Connector) {
        let PORT = Math.floor(Math.random() * (49000 - 12001) + 12001);
        Connector.listen(PORT);

        Connector.on('error', function (err) {
            if (err.status == "EADDRINUSE") {
                PORT = Math.floor(Math.random() * (49000 - 12001) + 12001);
                Connector.listen(PORT);

            }
        })
        console.log(Connector.address().port);
    }

    setCoreBHV(overwrite, SocketConsumer) {
        if (overwrite) this.CoreConnector.removeAllListeners("request");
        this.CoreConnector.addListener("request", function (req, res) {
            if (req.method == 'POST') {
                let data = this.ExtractV2PostData(req);
                data.then(function (result) {
                    res.writeHead(200, 0);
                    res.end();

                    this.CoreReg.TaskQue.processCoreResult(result);
                }.bind(this))



            }


        }.bind(this));

    }
    setGroundBHV(overwrite, LambdaHandler) {
        if (overwrite) this.GroundConnector.removeAllListeners("request");
        this.GroundConnector.addListener("request", function (req, res) {
            if (req.method == 'POST') {
                let data = this.ExtractV2PostData(req);
                res.writeHead(200, 0);
                res.end();

                // console.log(this,this.GroundReg)
                data.then(function (data) {
                    this.GroundReg.TaskQue.processGroundResult(data);
                }.bind(this))



            }


        }.bind(this));
    }
    GenerateTicket() {
        let task = this.CoreReg.TaskQue.addTask("1", {});
        console.log(task);
        this.Post(this.CoreReg.PortPipe, task, function (res) {
            if (res.statusCode == 200) {
                console.log("SENT TO CORE");

            }
        });


        return this.getCoreResp(task)
    }

    AuthenticateUser(email, password) {
        let task = this.GroundReg.TaskQue.addTask("1", { email: email, password: password });
        console.log(task);
        this.Post(this.GroundReg.PortPipe, task, function (res) {
            console.log("SENT TO GROUND");
            if (res.statusCode == 200) {
                

            }
        });


        return this.getGroundResp(task)

    }



    getGroundResp(task) {
        let que = this.GroundReg.TaskQue;
        return new Promise(function (resolve, reject) {
            que.addGroundHandler(task, (result) => {
                que.removeTask(task.id);
                resolve(result);
            })
        })
    }

    getCoreResp(task) {
        let que = this.CoreReg.TaskQue;
        return new Promise(function (resolve, reject) {
            que.addCoreHandler(task, (result) => {
                que.removeTask(task.id);
                resolve(result);
            })
        })
    }

    Post(Port, data, callback) {
        var post_data = querystring.stringify(data);
        console.log("POST PARAMS: "+post_data)
        var post_options = {
            host: 'localhost',
            port: Port,
            path: '/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(post_data)
            }
        };



        // Set up the request
        var post_req = httpService.request(post_options, callback);

        // post the data
        post_req.write(post_data);
        post_req.end();


    }

    async ExtractPostData(request) {
        var body = '';
        let finished = false;
        var post;
        request.on('data', function (data) {
            body += data;

            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6)
                request.connection.destroy();
        });

        request.on('end', function () {
            console.log(body);
            post = body;
          //  console.log(post, "THIS IS POST");
            finished = true;
            // response.writeHead(200);
            // response.end();

        });
        while (!finished) {
            console.log('awaiting post');
            await this.delay(500);
        }
        return post;

    }

    async ExtractV2PostData(request) {
        var body = '';
        let finished = false;
        var post;
        request.on('data', function (data) {
            body += data;

            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6)
                request.connection.destroy();
        });

        request.on('end', function () {
            console.log(body,'post');
            post = querystring.parse(body);
         //   console.log(post, "THIS IS POST");
            finished = true;
            // response.writeHead(200);
            // response.end();

        });
        while (!finished) {
            console.log('awaiting post');
            await this.delay(500);
        }
        return post;

    }
    delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }
}
if (!IService) {
    var IService = new InternalService();
}

module.exports = IService;