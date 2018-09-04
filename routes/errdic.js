
var express = require('express');
var router = express.Router();
let dictionary = require('./../bin/error_dict');
router.post('/',function(req,res,next){
    try{
        let err_address = req.body.code;
        let category ;
        let index ;
        for(let i =0;i<err_address.length;i++){
            
        if (!isNaN(parseInt(err_address[i]))) {
            category = err_address.substring(0,i);
            index = err_address.substring(i,err_address.length);
            break;
        }}
       let message =  dictionary[category][index];
       message = message? message : "Unknown Error. Contact the administrator if this error persists !";

        res.setHeader('Content-Type',"application/json");
        res.write(JSON.stringify({message:message}));
        res.end();}catch(e){console.log(e)}
})



module.exports = router