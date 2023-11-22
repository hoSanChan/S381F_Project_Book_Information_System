const assert = require('assert');

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const mongourl = 'mongodb+srv://hosanchan:1Q2w3e4r5T@cluster0.a1rr14u.mongodb.net/?retryWrites=true&w=majority'; 
const dbName = 'book';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const session = require('cookie-session');
const SECRETKEY = 'cs381';

/*var usersinfo = new Array(
    {name: "student1", password: "123"},
    {name: "student2", password: "234"},
    {name: "student3", password: "345"}
);*/


var documents = {};
//Main Body
app.set('view engine', 'ejs');
app.use(session({
    userid: "session",  
    keys: [SECRETKEY],
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const createDocument = function(db, createddocuments, callback){
    const client = new MongoClient(mongourl);
    client.connect(function(err) {
        assert.equal(null, err);
        console.log("Connected successfully to the MongoDB database server.");
        const db = client.db(dbName);

        db.collection('books').insertOne(createddocuments, function(error, results){
            if(error){
            	throw error
            };
            console.log(results);
            return callback();
        });
    });
}

const findDocument =  function(db, criteria, callback){
    let cursor = db.collection('books').find(criteria);
    console.log(`findDocument: ${JSON.stringify(criteria)}`);
    cursor.toArray(function(err, docs){
        assert.equal(err, null);
        console.log(`findDocument: ${docs.length}`);
        return callback(docs);
    });
}

const findUser =  function(db, criteria, callback){
    let cursor = db.collection('users').find(criteria);
    console.log(`findUser: ${JSON.stringify(criteria)}`);
    cursor.toArray(function(err, docs){
        assert.equal(err, null);
        console.log(`findUser: ${docs.length}`);
        return callback(docs);
    });
}

const handle_Find = function(res, criteria){
    const client = new MongoClient(mongourl);
    client.connect(function(err) {
        console.log(err)
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        findDocument(db, criteria, function(docs){
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('display', {nItems: docs.length, items: docs});
        });
    });
}

const handle_Edit = function(res, criteria) {
    const client = new MongoClient(mongourl);
    client.connect(function(err) {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        let documentID = {};
        documentID['_id'] = ObjectID(criteria._id)
        let cursor = db.collection('books').find(documentID);
        cursor.toArray(function(err,docs) {
            client.close();
            assert.equal(err,null);
            res.status(200).render('edit',{item: docs[0]});

        });
    });
}

const handle_Details = function(res, criteria) {
    const client = new MongoClient(mongourl);
    client.connect(function(err) {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        let documentID = {};
        documentID['_id'] = ObjectID(criteria._id)
        findDocument(db, documentID, function(docs){ 
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('details', {item: docs[0]});
        });
    });
}

const updateDocument = function(criteria, updatedocument, callback){
    const client = new MongoClient(mongourl);
    client.connect(function(err){
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);
        console.log(criteria);
	console.log(updatedocument);
	
        db.collection('books').updateOne(criteria,{
                $set: updatedocument
            }, function(err, results){
                client.close();
                assert.equal(err, null);
                return callback(results);
            }
        );
    });
}

const deleteDocument = function(db, criteria, callback){
	console.log(criteria);
	db.collection('books').deleteOne(criteria, function(err, results){
	assert.equal(err, null);
	console.log(results);
	return callback();
	});

};

const handle_Delete = function(res, criteria) {
    const client = new MongoClient(mongourl);
    client.connect(function(err) {
        console.log("Connected successfully to server");
        const db = client.db(dbName);
	
	let deldocument = {};
	
        deldocument["_id"] = ObjectID(criteria._id);
        deldocument["ownerID"] = criteria.owner;
        console.log(deldocument["_id"]);
        console.log(deldocument["ownerID"]);
        
        deleteDocument(db, deldocument, function(results){
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('info', {message: "Document is deleted successfully."});
        })     
    });
}

app.get('/', function(req, res){
    if(!req.session.authenticated){
        console.log("...Not authenticated; directing to login");
        res.redirect("/login");
    }else{
    	res.redirect("/login");
    }
    console.log("...Hello, welcome back");
});

//login
app.get('/login', function(req, res){
    console.log("...Welcome to login page.")
    return res.status(200).render("login");
});

app.post('/login', function(req, res){
    console.log("...Handling your login request");
    const client = new MongoClient(mongourl);
    client.connect(function(err) {
        console.log("Connected successfully to server");
        const db = client.db(dbName);
    	let username =  req.body.username;
    	let password = req.body.password;
    	let criteria = {
	    name: username,
            password: password
    	};
 	console.log(criteria);
	findUser(db, criteria, (result) => {
	    if(result.length == 1){
		req.session.authenticated = true;
		req.session.userid = username;
            	console.log(req.session.userid);
            	return res.status(200).redirect("/home");
	    } else {
	    	console.log("Error username or password.");
	        return res.redirect("/");
	    }
	});
        
    });
    
});

app.get('/logout', function(req, res){
    req.session = null;
    req.authenticated = false;
    res.redirect('/login');
});

app.get('/home', function(req, res){
    if(req.session.authenticated != true){
        console.log("Please login.");
        res.redirect('/login');
    }else{
        console.log("...Welcome to the home page!");
        return res.status(200).render("home");
    }
});

app.get('/list', function(req, res){
    if(req.session.authenticated != true){
        console.log("Please login.");
        res.redirect('/login');
    }else{
        console.log("Show all information! ");
        handle_Find(res,req.query.docs);
    }
});

app.get('/find', function(req, res){
    if(req.session.authenticated != true){
        console.log("Please login.");
        res.redirect('/login');
    }else{
        return res.status(200).render("search");
    }
});

app.post('/search', function(req, res){
    if(req.session.authenticated != true){
        console.log("Please login.");
        res.redirect('/login');
    }else{
        const client = new MongoClient(mongourl);
        client.connect(function(err){
            assert.equal(null, err);
            console.log("Connected successfully to the DB server.");
            const db = client.db(dbName);
        
        var searchID={};
        searchID['isbn'] = req.body.isbn;
        
        if (searchID.isbn){
        console.log("...Searching the document");
        findDocument(db, searchID, function(docs){
                client.close();
                console.log("Closed DB connection");
                res.status(200).render('display', {nItems: docs.length, items: docs});
            });
        }
        else{
        console.log("Invalid Entry - ISBN is compulsory for searching!");
        res.status(200).redirect('/find');
        }         	
        });
    }
});

app.get('/details', function(req,res){
    if(req.session.authenticated != true){
        console.log("Please login.");
        res.redirect('/login');
    }else{
    handle_Details(res, req.query);
    }
});

app.get('/edit', function(req,res) {
    if(req.session.authenticated != true){
    console.log("Please login.");
    res.redirect('/login');
}else{
    handle_Edit(res, req.query);
}
})

app.get('/create', function(req, res){
    if(req.session.authenticated != true){
        console.log("Please login.");
        res.redirect('/login');
    }else{
    return res.status(200).render("create");
    }
});

app.post('/create', function(req, res){

    const client = new MongoClient(mongourl);
    client.connect(function(err){
        assert.equal(null, err);
        console.log("Connected successfully to the DB server.");
        const db = client.db(dbName);
        
        documents["_id"] = ObjectID;        
	documents["isbn"] = req.body.isbn;	
	documents['bookname']= req.body.bookname;
	documents['category']= req.body.category;
	documents['publisher']= req.body.publisher;
        documents['author']= req.body.author;
        documents['remark']= req.body.remark;
        console.log("...putting data into documents");
        
        
        if(documents.isbn){
            console.log("...Creating the document");
            createDocument(db, documents, function(docs){
                client.close();
                console.log("Closed DB connection");
                return res.status(200).render('info', {message: "Document is created successfully!"});
            });
        } else{
            client.close();
            console.log("Closed DB connection");
            return res.status(200).render('info', {message: "Invalid entry - ISBN is compulsory!"});
        }
    }); 

});


app.post('/update', function(req, res){

    var updatedocument={};
    const client = new MongoClient(mongourl);
        client.connect(function(err){
            assert.equal(null, err);
            console.log("Connected successfully to server");
            
                if(req.body.bookname){
                updatedocument['bookname']= req.body.bookname;
                updatedocument['category']= req.body.category;
                updatedocument['publisher']= req.body.publisher;
                updatedocument['author']= req.body.author;
                updatedocument['remark']= req.body.remark;


        	let updateDoc = {};
                updateDoc['isbn'] = req.body.postId;
                console.log(updateDoc);

                updateDocument(updateDoc, updatedocument, function(docs) {
                    client.close();
                    console.log("Closed DB connection");
                    return res.render('info', {message: "Document is updated successfully!."});
                    
                })
            }
            else{
            	return res.render('info', {message: "Invalid entry - Book name is compulsory!"});
            }
    });

});

app.get('/delete', function(req, res){
    if(req.session.authenticated != true){
        console.log("Please login.");
        res.redirect('/login');
    }else{
    console.log("...Hello !");
    handle_Delete(res, req.query);
    }
});

//Restful
//insert
app.post('/api/item/isbn/:isbn', function(req,res) {
    if (req.params.isbn) {
        console.log(req.body)
        const client = new MongoClient(mongourl);
        client.connect(function(err){
            assert.equal(null,err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);
            let newDocument = req.body;
            newDocument['isbn'] = req.params.isbn;
            newDocument['bookname'] = req.body.bookname;

            db.collection('books').insertOne(newDocument, function(err,results){
                        assert.equal(err,null);
                        client.close()
                        res.status(200).json(results["ops"]);
                
                        
            });
        });
     } else {
        res.status(500).json({"error": "missing isbn"});
    }
})

//find
app.get('/api/item/isbn/:isbn', function(req,res) {
    if (req.params.isbn) {
        let criteria = {};
        criteria['isbn'] = req.params.isbn;
        const client = new MongoClient(mongourl);
        client.connect(function(err) {
            assert.equal(null, err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);

            findDocument(db, criteria, function(docs){
                client.close();
                console.log("Closed DB connection");
                res.status(200).json(docs).end();
            });
        });
    } else {
        res.status(500).json({"error": "missing isbn"}).end();
    }
})

/*  UPDATE
curl -X PUT -F "publisher=99999999" localhost:8099/api/isbn/9999999999999 
*/
app.put('/api/item/isbn/:isbn', (req,res) => {
    console.log(1)
    if (req.params.isbn) {
        console.log(req.body)
        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null,err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);

            let criteria = {}
            criteria['isbn'] = req.params.isbn

            let updateDoc = req.body;
            console.log(updateDoc)
            db.collection('books').updateOne(criteria, {$set: updateDoc},(err,results) => {
              assert.equal(err,null);
              client.close()
              res.status(200).json(results).end()
            //res.status(200).json({"results":"success"}).end();
        })
    
        })
    } else {
        res.status(500).json({"error": "missing isbn"}).end();
    }
})

//delete
app.delete('/api/item/isbn/:isbn', function(req,res){
    if (req.params.isbn) {
        let criteria = {};
        criteria['isbn'] = req.params.isbn;
        const client = new MongoClient(mongourl);
        client.connect(function(err){
            assert.equal(null, err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);

            db.collection('books').deleteMany(criteria, function(err,results) {
                assert.equal(err,null)
                client.close()
                res.status(200).end();
            })
        });
    } else {
        res.status(500).json({"error": "missing isbn"});       
    }
})

app.listen(app.listen(process.env.PORT || 8099));
