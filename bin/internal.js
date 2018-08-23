'use strict'
var querystring = require('querystring');
var httpService = require('http');

 
console.log("PARSED")
class InternalService  {

    

    constructor(CoreBehaviour,GroundBehaviour){
       
        this.CoreConnector = httpService.createServer(CoreBehaviour);
        this.setUp(this.CoreConnector);
        this.GroundConnector = httpService.createServer(GroundBehaviour);
        this.setUp(this.GroundConnector);
        this.paired=false;
       console.log("SERVICE CREATED")
    }

 pair(){
    var timmer = setInterval(function (){
          this.Post(35300,{"1":this.CoreConnector.address().port,"2":this.GroundConnector.address().port},function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log('Response: ' + chunk);
            });
           console.log(res.statusCode);
           if(res.statusCode == 200){
             clearInterval(timmer);
             this.paired=true;
           }
        }.bind(this))
        
    }.bind(this),1000)
 }

 setUp(Connector){
    let PORT = Math.floor(Math.random()*(49000-12001) +12001);
    Connector.listen(PORT);
   
    Connector.on('error',function(err){
            if(err.stayus == "EADDRINUSE"){
                PORT = Math.floor(Math.random()*(49000-12001) +12001);
                Connector.listen(PORT);

            }
    })
    console.log(Connector.address().port);
 }

 Post(Port,data, callback) {
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
}
if(!IService){
    var IService = new InternalService();
}

module.exports = IService;