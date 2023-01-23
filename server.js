const http = require('http');
const formidable = require('formidable')
const fs = require('fs') 
const sharp = require("sharp");
const express = require("express")
const sessions = require('express-session');
const { serialize } = require('v8');
var favicon = require('serve-favicon');

const app = express();

const PORT = 3333

var full_file_name;
var type_of_file;
var name_of_file;

app.use(express.static(__dirname + "/view"));
app.use(favicon(__dirname + "/view/favicon.ico")); 

async function resizeImage(pic_width, file, destination) {
	try {
	  await sharp(file)
		.resize({
		  
			fit: sharp.fit.contain,
			width: pic_width,
		  
		})
		.toFile(destination);
	} catch (error) {
	  console.log(error);
	}
  }


  	const oneDay = 1000 * 60 * 60 * 24;

	app.use(sessions({
	secret: "sekretnyKlucz",
	saveUninitialized:true,
	cookie: { maxAge: oneDay },
	resave: false
	})); // Session ID is used as a means of ensuring only given user has access to their files.


  app.listen(PORT, () => {
	console.log("JScale started listening on port " + PORT);
  });
	


	app.get("/", (req, res) => {
		res.sendFile(__dirname + "/view" +  "/strona1.html");
		let dirpath = __dirname + "/uploads/" + req.sessionID; 

	
			if (!fs.existsSync(dirpath)) {
			  fs.mkdirSync(dirpath);
			}
			else
			{
				fs.rm(dirpath, { recursive: true }, (err) => {
					if(err){
						//File deletion failed
						console.error(err.message);
						return;
					}
					else{
					fs.mkdirSync(dirpath);
					}

					
				});
			}
	  });


	  
	  app.get("/download", (req, res) => {
		res.sendFile(__dirname + "/view" + "/strona2.html");
	  }); 


	  app.get("/download/small", (req, res) => {
		res.download(__dirname + "/uploads/" + req.sessionID + "/" + name_of_file + "_small." + type_of_file);
	  }); 
	  app.get("/download/medium", (req, res) => {
		res.download(__dirname + "/uploads/" + req.sessionID + "/" + name_of_file + "_medium." + type_of_file);
	  }); 
	  app.get("/download/large", (req, res) => {
		res.download(__dirname + "/uploads/" + req.sessionID + "/" + name_of_file + "_large." + type_of_file);
	  }); 
	  
	  

	  app.post('/', function(req, res) {
		
		let dirpath = __dirname + "/uploads/" + req.sessionID; 
		
		const form = new formidable.IncomingForm();
		
		form.parse(req, function(err, fields, files) {
		  if (err != null) {
			console.log(err)
			return res.status(400).json({ message: err.message });
		  }

		  

		  

		  let filepath = files.fileupload.filepath;
		  
			full_file_name = files.fileupload.originalFilename;
			let string_temp = full_file_name.split(".")
			name_of_file =  string_temp[0];
			type_of_file =  string_temp[1];
			
		  let newpath = dirpath + "/" + "photo_original";

		  let small = dirpath + "/" + name_of_file + "_small." + type_of_file;
		  let medium = dirpath + "/" + name_of_file + "_medium." + type_of_file;
		  let large = dirpath + "/" + name_of_file + "_large." + type_of_file;


		    //fs.rename(filepath, newpath, function() {		res.redirect('/download') 	  		}	);
			fs.copyFile(filepath, newpath, function() {		res.redirect('/download') 	  		}		);
			
		  
		  try {
			resizeImage( 100, newpath, small)
		  	resizeImage( 200, newpath, medium)
		  	resizeImage( 400, newpath, large)
		  } catch (err) {
			console.error(err);
		}
		  
		});
	  });
	  





	



