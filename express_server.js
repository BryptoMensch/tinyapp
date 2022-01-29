// ***** REQUIREMENTS ***** //

const express = require("express");
const app = express();
const PORT = 8080; 
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const morgan = require("morgan");
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const { findUserByEmail, userUrls, authenticateUser, generateRandomString } = require('./helpers');

// ***** MIDDLEWARE ***** // 

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}))
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// ***** LISTENER ***** //

app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});

// ***** DATABASES ***** //

const urlDatabase = {
	b6UTxQ: {
			longURL: "https://www.tsn.ca",
			userID: "aJ48lW"
	},
	i3BoGr: {
			longURL: "https://www.google.ca",
			userID: "aJ48lW"
	}
};

const users = {
	"userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

// ***** URL GET ROUTES***** //

// INDEX PAGE - REDIRECTS TO EITHER LOGIN OR URLS
app.get("/", (req, res) => {
  if (!req.session["user_id"]) {
    return res.redirect("/login");
  }
  return res.redirect("/urls");
});

// URLS WITH ADDED CONDITIONALS
app.get("/urls", (req, res) => {
	const user_id = req.session["user_id"];
	if(!user_id){
		return res.status(400).send("Please sign in to view URLs <a href='/login'>click here to sign in</a>");
	}
	const user = users[user_id];
	const urls = userUrls(user_id, urlDatabase);
	const templateVars = {
		user,
		urls,
	};
	res.render("urls_index", templateVars);
});

// NEW URL CLIENT REQUEST
app.get("/urls/new", (req, res) => {
	const user_id = req.session["user_id"];
	const user = users[user_id];
	const templateVars = {
		user,
		urls: urlDatabase,
	};
	res.render("urls_new", templateVars);
});

// USER ID/SHORT URL GET
app.get("/urls/:shortURL", (req, res) => {
	const user_id = req.session["user_id"];
	const user = users[user_id];
	const templateVars = {
		user,
		shortURL: req.params.shortURL,
		longURL: urlDatabase[req.params.shortURL].longURL,
	};
	res.render("urls_show", templateVars);
});

// REDIRECT TO FULL URL WITH ADDED CONDITIONALS
app.get("/u/:shortURL", (req, res) => {
	const user_id = req.session["user_id"];
	const user = users[user_id];
	const longURL = urlDatabase[req.params.shortURL].longURL;
	if (!longURL) {
    return res.status(400).send(("URL does not exist. Please check your URLs <a href='/urls'>click here to sign in</a>"));
	}; 
	if(!user) {
		return res.status(400).send(("Please sign in to view URLs <a href='/login'>click here to sign in</a>"));
	}
	res.redirect(longURL);
});

// ***** URL POST ROUTES ***** //

// GENERATES SHORT URL ID, POSTS TO URLS PAGE
app.post("/urls", (req, res) => {
	const shortURL = generateRandomString();
	const longURL = req.body.longURL;
	const user_id = req.session["user_id"];
		urlDatabase[shortURL] = {
		longURL,
		userID: user_id,
};
	res.redirect("/urls/" + shortURL);
});

// DELETES URL WITH CONDITIONALS
app.post("/urls/:shortURL/delete", (req, res) => {
	const user_id = req.session["user_id"];
	const url = urlDatabase[req.params.shortURL];
	if(url){
		if(url.userID !== user_id) {
			return res.status(400).send("Permission denied. You cannot delete this URL. <a href='/urls/new'> Click here to create your URLs</a>");
		}
		delete urlDatabase[req.params.shortURL];
	} else {
		return res.status(400).send("URL does not exist");
	}
	res.redirect("/urls/");
});

// EDITS URLS WITH CONDITIONALS
app.post("/urls/:shortURL/edit", (req, res) => {
	const shortURL = req.params.shortURL;
	const longURL = req.body.longURL;
	const user_id = req.session["user_id"];
	const url = urlDatabase[shortURL];
	if(url) {
		if(url.userID !== user_id) {
			return res.status(400).send("Permission denied. You cannot edit this URL. <a href='/urls/new'> Click here to create your URLs</a>");
		}
			urlDatabase[shortURL] = {
			longURL,
			userID: user_id,
	};
	} else {
		return res.status(400).send("URL does not exist");
	}
	
	res.redirect("/urls/");
});

// ***** USER GET ROUTES ***** // 

// RENDERS REGISTRATION PAGE WITH CONDITIONALS
app.get("/register", (req, res) => {
	const user_id = req.session["user_id"];
	if(user_id) {
		res.redirect("/urls/");
	}
	templateVars = { user: null };
	res.render("user_registration", templateVars);
});

// FINDS USER IN USER DATABASE, WITH CONDITIONALS
app.get("/login", (req, res) => {
	const user_id = req.session["user_id"];
	if(user_id) {
		res.redirect("/urls/");
	}
	templateVars = { user: null };
	res.render("user_login", templateVars);
});

// ***** LOGIN POST ROUTES ***** // 

// CREATES USER ID FROM REGISTRATION PAGE, WITH CONDITIONALS
app.post("/register", (req,res) => {
	let email = req.body.email;
	let password = req.body.password;
	
	if (!email || !password) {
    return res.status(400).send("email and password cannot be blank");
  }
  const registerUser = authenticateUser(email, password, users);
  
  if(registerUser){
    return res.status(400).send("a user with that email already exists");
  }
	
	const user_id = generateRandomString();
	const user = { 
		email, 
		password: bcrypt.hashSync(password, salt), 
		id: user_id };
	users[user_id] = user;
	req.session['user_id'] = user.id;
	res.redirect("/urls");
});

// ***** POST LOGIN ***** // 

// ALLOWS USER TO LOGIN, REDIRECTS, WITH CONDITIONALS
app.post("/login", (req, res) => {
	let email = req.body.email;
	let password = req.body.password;

	const user = authenticateUser(email, password, users);

	if(user) {
		req.session['user_id'] = user.id;
		res.redirect("/urls");
	} else {
		res.status(401).send('Wrong credentials!');
	}
});

// LOGS USER OUT, DELETES COOKIES
app.post("/logout", (req, res) => {
	console.log("/logout")
	req.session['user_id'] = null;	
	res.redirect("/login");
});




