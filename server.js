var express = require('express')
var bodyParser = require('body-parser') // Node.js body parsing middleware
var multer = require('multer');
var fs = require('fs-extra');
var app = express();

app.use(bodyParser.urlencoded({ extended: true }))

var MongoClient = require('mongodb').MongoClient
var ObjectId = require('mongodb').ObjectId
var myurl = 'mongodb://localhost:27017';

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, +new Date() + '-' + file.originalname)
    }
})

var upload = multer({ storage: storage })

MongoClient.connect(myurl, { useNewUrlParser: true }, (err, client) => {
    if (err) return console.log(err)
    db = client.db('test')
    app.listen(3000, () => {
        console.log('listening on 3000')
    })
})

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/photos', (req, res) => {
    db.collection('mycollection').find().toArray((err, result) => {
        const imgArray = result.map(element => element._id);
        console.log(imgArray);
        if (err) return console.log(err)
        res.send(imgArray)
    })
});

app.get('/photo/:id', (req, res) => {
    var filename = req.params.id;

    db.collection('mycollection').findOne({ '_id': ObjectId(filename) }, (err, result) => {

        if (err) return console.log(err)

        res.contentType('image/jpeg');
        res.send(result.image.buffer)
    })
})

app.post('/uploadmultiple', upload.array('myFiles', 12), (req, res, next) => {
    var files = req.files
    if (!files) {
        var error = new Error('Please choose files')
        error.httpStatusCode = 400
        return next(error)
    }

    res.send(files)
})

app.post('/uploadphoto', upload.single('myImage'), (req, res) => {
    var img = fs.readFileSync(req.file.path);
    var encode_image = img.toString('base64');
    // Define a JSONobject for the image attributes for saving to database

    var finalImg = {
        contentType: req.file.mimetype,
        image: new Buffer(encode_image, 'base64')
    };
    db.collection('mycollection').insertOne(finalImg, (err, result) => {
        console.log(result)

        if (err) return console.log(err)

        console.log('saved to database')
        res.redirect('/')
    })
})
