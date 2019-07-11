var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var path = require('path');
const flash = require('express-flash');
var session = require('express-session');

app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.use(session({
    secret: "let me whisper in your ear!",
    saveUninitialized: true,
    cookie: {
        maxAge: 60000
    }
}))
app.use(flash());

app.use(bodyParser.urlencoded({
    extended: true
}));


mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/basic_mongoose');

// ----------------------------------------------------

var AnimalSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    fav_food: {
        type: String,
        reqired: true
    }
}, {
    timestamps: true
})
mongoose.model('Animal', AnimalSchema);
var Animal = mongoose.model('Animal');

// --------------------------------------------------

app.get('/', (req, res) => {
    console.log("showing all the animals");
    Animal.find({}, (err, animals) => {
        if (err) {
            console.log("There was an error with the db")
            res.render('index', {
                err: err
            })
        } else {
            console.log(animals);
            res.render('index', {
                results: animals
            });
        };
    });
});
app.get('/penguin/new', (req, res) => {
    res.render('new')
})

app.post('/penguin/new/process', (req, res) => {
    console.log("POST DATA", req.body);
    // create a new quote with the name and age corresponding to those from req.body
    var animal = new Animal({
        type: req.body.type,
        fav_food: req.body.fav_food
    }, {
        timestamps: req.body.created_at
    });
    // Try to save that new user to the database (this is the method that actually inserts into the db) and run a callback function with an error (if any) from the operation.
    animal.save(function (err) {
        // if there is an error console.log that something went wrong!
        if (err) {
            console.log('something went wrong');
            console.log(err.errors);
            for (var key in err.errors) {
                req.flash('reg', err.errors[key].message);
            }
            res.redirect('/penguin/new');
        } else { // else console.log that we did well and then redirect to the quote page
            console.log('successfully added an animal!');
            res.redirect('/');
        };
    });
});
app.get('/penguin/:id', function (req, res) {
    console.log(req.params.id);
    Animal.find({
        _id: (req.params.id)
    }, (err, animals) => {
        if (err) {
            console.log("There was an error with the db")
            res.render('index', {
                err: err
            })
        } else {
            console.log('this is the object' + animals);
            res.render('show', {
                results: animals
            })
        }
    })
});

app.get('/penguin/edit/:id', (req, res) => { // edits animal data
    Animal.find({
        _id: (req.params.id)
    }, (err, animals) => {
        if (err) {
            console.log("There was an error with the db")
            res.render('index', {
                err: err
            })
        } else {
            console.log("this is the object" + animals);
            res.render('edit', {
                results: animals
            })
        }
    })
})

app.post('/penguin/edit/process/', (req, res) => { // processes edit and redirects to show if correct
    // console.log("POST DATA", req.body);
    var update = {
        type: req.body.type,
        fav_food: req.body.fav_food,
        updatedAt: Date.now()
    }
    Animal.findByIdAndUpdate(req.body.id, update, (err, animals) => {
        if (err) {
            console.log('something went wrong');
            for (var key in err.errors) {
                req.flash('reg', err.errors[key].message);
            }
            res.redirect('/penguin/edit/:id');
        } else {
            console.log('successfully updated animal type to db!');
            res.redirect('/')
        }
    })
});

app.get('/penguin/destroy/:id', (req, res) => {
    console.log(req.params.id)
    Animal.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
            console.log('error!!!!', err)
            res.redirect('/')
        } else {
            res.redirect('/')
        }
    })
})


app.listen(8000, function () {
    console.log("listening on port 8000");
})