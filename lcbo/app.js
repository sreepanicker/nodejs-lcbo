//Declaring express module
var express = require("express");
var path = require("path");
//Declaring body parser module to get http parameters
var bodyparser = require("body-parser");
//declaring http module
var http = require("http");

// creating the express module
var app = express();
// setting ejs view
app.set("views",path.resolve(__dirname,"views"));
app.set("view engine","ejs");
//setting body parser
app.use(bodyparser.urlencoded({extended:false}));

//default middle for "/"
app.get("/",function(req,res){
    res.set('Content-Type', 'text/html');
    res.render("index",{errordata : ''});
});

//Middleware for search
app.post("/search",function(request, response){
    var prodId = request.body.productid;
    // Please get your token for accessing the service
    var token ="XXXXXXXX";
    var options = {
				protocol : 'http:',
                hostname : 'lcboapi.com',
				path: '/products/'+ prodId,
				headers :{
					'Content-type' : 'application/json',
					'Authorization' : 'Token' + token
				}
	};
    // connecting to lcbo server
    //JSON data holder
    var jsonData;
    http.get( options ,function(res){
        const statusCode = res.statusCode;
        let error;

        if (statusCode !== 200) {
            error = new Error("Request Failed.\n");
        }
        if(error){
            console.log("error no data");
            res.resume();
            response.set('Content-Type', 'text/html');
            response.render("index",{
                errordata : 'Product not found'
            });
            return;
        }
        let rawData = '';
        res.on("error", function(err){
            console.log(err);
        });
        res.on("data",function(data){
            rawData = rawData+data;
        });

        res.on("end", function(){
            try{
                   jsonData = JSON.parse(rawData);
                   console.log(jsonData);
                   response.set('Content-Type', 'text/html');
                   response.render("search",{
                   prod : jsonData.result.id,
                   name : jsonData.result.name,
                   price : jsonData.result.price_in_cents,
                   tags : jsonData.result.tags,
                   primary : jsonData.result.primary_category,
                   origin : jsonData.result.origin,
                   package : jsonData.result.package,
                   alcohol : jsonData.result.alcohol_content,
                   inventory : jsonData.result.inventory_count,
                   url : jsonData.result.image_url
                 });
            }catch(e){
                console.log("error in parsing");
            }

        });
    });


});

// No resource has matched
app.use(function(request,response){
    response.set('Content-Type', 'text/html');
    response.end("no resource");
});
app.listen(3000);
console.log("Started");