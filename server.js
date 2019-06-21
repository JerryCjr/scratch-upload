var express = require('express')
var bodyParser = require('body-parser')
var multer = require('multer');
var app = express();

app.use(bodyParser.urlencoded({ extended: true }))

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/Users/chengjinrui/repo/scratch/scratch-player-3.0/sb3')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

var upload = multer({ storage: storage })

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.post('/scratch_upload/uploadmultiple', upload.array('myFiles', 12), (req, res, next) => {
    var files = req.files;
    var fileName;
    if (!files) {
        var error = new Error('Please choose files')
        error.httpStatusCode = 400
        return next(error)
    }
    if (files && files.length) {
        fileName = files[0].originalname;
        res.redirect(`http://m.dev.babyfs.cn/scratch/scratch_player/player.html?file=${fileName}`)
    } else {
        res.send(files)
    }
})

app.listen(3000, '0.0.0.0', () => console.log('Server started on port 3000'));
