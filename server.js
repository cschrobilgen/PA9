const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

// Chris Schrobilgen
// CSC 337
// Server side code to initialize a MongoDB and handle url requests made by the client to append and display
// database documents via JSON.

// Creating the MongoDB
const mongoDBURL = 'mongodb://127.0.0.1:27017/ostaa'; 
mongoose.connect(mongoDBURL, { useNewUrlParser: true });
mongoose.connection.on('error', () => { 
    console.log('Connection error') 
});

// Creating schemas for the users and items
const Schema = mongoose.Schema;
// Items
const ItemSchema = new Schema({
    title: String,
    description: String,
    image: String,
    price: Number,
    stat: String 
});
// User
const UserSchema = new Schema({
    username: String,
    password: String,
    listings: [String],
    purchases: [String]
});
const Item = mongoose.model('Item', ItemSchema);
const User = mongoose.model('User', UserSchema);

let sessions = {};

function addSession(username) {
    let sid = Math.floor(Math.random() * 1000000000);
    let now = Date.now();
    sessions[username] = {id: sid, time: now};

    console.log(sid);

    return sid;
}

function removeSessions() {
    let now = Date.now();
    let usernames = Object.keys(sessions);
    for (let i = 0; i < usernames.length; i++) {
        let last = sessions[usernames[i]].time;
        if (last + 20000000 < now) {
            delete sessions[usernames[i]];
        }
    }
    console.log(sessions);
}

setInterval(removeSessions, 2000);

const app = express();
app.use(cookieParser());
app.use(express.json());

function authenticate(req, res, next) {
    let c = req.cookies;
    console.log('auth request:');
    console.log(req.cookies);
    if (c != undefined) {
        if (sessions[c.login.username] != undefined && 
            sessions[c.login.username].id == c.login.sessionID) {
            next();
        } else {
            res.redirect('/index.html');
        }
    }  else {
        res.redirect('/index.html');
    }
}

app.use('/app/*', authenticate);
app.get('/app/*', (req, res, next) => {
    console.log('another');
    next();
});

app.use(express.static('public_html'));

app.get('/get/username', (req, res) => {
    // Retrieve the username from the cookie
    const username = req.cookies.login.username;

    // Send the username as a response
    res.send(username);
});

app.get('/buy/item/:itemID', async (req, res) => {
    const item = await Item.findOne({ _id: req.params.itemID }).exec();
    item.stat = 'SOLD';
    await item.save();
    
    const updatedUser = await User.findOneAndUpdate(
        { username: req.cookies.login.username }, 
        { $push: { purchases: item._id } }, 
    );
});


// Get all users
app.get('/get/users', async (req, res) => {
    const users = await User.find({}).exec()
    .then((results) => {
        console.log(results)
        res.send(results);
    })
    .catch((error) => {
        console.log('Could not retrieve users');
        console.log(error);
    })
});

// Get all items
app.get('/get/items', async (req, res) => {
    const users = await Item.find({}).exec()
    .then((results) => {
        console.log(results);
        res.send(results);
    })
    .catch((error) => {
        console.log('Could not retrieve items');
        console.log(error);
    })
});

app.get('/get/item/:itemID', async (req, res) => {
    try {
        const item = await Item.findOne({ _id: req.params.itemID });

        if (!item) {
            return res.status(404).json({ status: 'error', message: 'Item not found' });
        }

        res.json(item);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

// Get listings for a user by username
app.get('/get/listings/:username', async (req, res) => {
    const user = await User.findOne({ username: req.params.username })
    .then((results) => {
        console.log(results.listings);
        res.send(results.listings);
    })
    .catch((error) => {
        console.log('Could not retrieve listings for ' + req.params.username);
        console.log(error);
    })
});

// Get purchases for a user by username
app.get('/get/purchases/:username', async (req, res) => {
    const user = await User.findOne({ username: req.params.username })
    .then((results) => {
        console.log(results.purchases);
        res.send(results.purchases);
    })
    .catch((error) => {
        console.log('Could not retrieve purchases for ' + req.params.username);
        console.log(error);
    })
});

// Search users by keyword in the username
app.get('/search/users/:keyword', async (req, res) => {
    const keyword = await req.params.keyword;

    const users = await User.find({ username: { $regex: keyword } })
    .then((results) => {
        console.log(results);
        res.send(results);
    })
    .catch((error) => {
        console.log('Could not find users with the keyword ' + req.params.username);
        console.log(error);
    })
});

// Search items by keyword in the description
app.get('/search/items/:keyword', async (req, res) => {
    const keyword = await req.params.keyword;

    const items = await Item.find({ description: { $regex: keyword }, stat: 'SALE' })
    .then((results) => {
        console.log(results);
        res.send(results)
    })
    .catch((error) => {
        console.log('Could not find users with the keyword ' + req.params.username);
        console.log(error);
    })
});

// Add a new user
app.post('/add/user', async (req, res) => {
    const { username, password } = req.body;

    console.log(req.body);

    try {
        const existingUser = await User.findOne({ username: username }).exec();

        if (existingUser == null) {
            const newUser = new User({ username, password });
            savedUser = await newUser.save();
            console.log('USER CREATED');
            res.send(savedUser);
            
        } else {
            res.status(401).send('USERNAME ALREADY TAKEN');
        }
    } catch (error) {
        res.status(500).send('DATABASE SAVE ISSUE');
    }
});

// Login
app.post(('/login'), async (req, res) => {
    let u = req.body;
    let p1 = await User.findOne({username: u.username, password: u.password}).exec();
    
    console.log(p1);
    
    if (p1 == null) {
        res.status(401).send('FAILED');
    } else {
        let sid = addSession(u.username);  
        res.cookie("login", 
            {username: u.username, sessionID: sid}, 
            {maxAge: 60000 * 2 });
        res.end('SUCCESS');
    }
});

// Add a new item for a user by username
app.post('/add/item/:username', async (req, res) => {
    const username = req.params.username;
    const itemStatus = 'SALE';
    const { title, description, image, price} = req.body;
    const item = await Item.create({ title, description, image, price, stat: itemStatus});
    const newItem = item.save();
    
    //Removing "new ObjectID()" from the object ID

    const updatedUser = await User.findOneAndUpdate(
        { username: username }, 
        { $push: { listings: item._id } }, 
    );
    res.json(updatedUser);
});



// Listening on port 3000
const port = 3000;
app.listen(port, () => {
    console.log(`Ostaa app is running on port ${port}`);
});