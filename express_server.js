// REQUIREMENTS //

const express = require("express");
const app = express();
const PORT = 8080; 
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const morgan = require("morgan");
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
// const lookup = require('./helpers');
// const cookieParser = require("cookie-parser");


// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}))

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});

// DATABASES //

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

// const urlDatabase = {
// 	b2xVn2: "http://www.lighthouselabs.ca",
// 	"9sm5xK": "http://www.google.com",

// };
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

// FUNCTIONS//
const findUserByEmail = (email) => {
  for(const userId in users) {
    const user = users[userId];
    if(user.email === email) {
      return user;
    }
  }
  return null;
}

const generateRandomString = () => {
	let randomNum = Math.random().toString(36).substr(2, 6);
	return randomNum;
}

const authenticateUser = (email, password) => {
  // retrieve the user with that email
  const user = findUserByEmail(email);

  console.log("FORM PASSWORD:", password, "DB PASSWORD:", user.password);

  // if we got a user back and the passwords match then return the userObj
  if (user && bcrypt.compareSync(password, user.password)) {
    // user is authenticated
    return user;
  } else {
    // Otherwise return false
    return false;
  }
};

const userUrls = function (id, urlDatabase) {
	let urls = {};

	for (let key in urlDatabase) {
		if (urlDatabase[key].userID === id){
			urls[key] = urlDatabase[key]
		}
	}
	return urls;
};

// URL ROUTES //

app.get("/urls/new", (req, res) => {
	const user_id = req.session["user_id"];
	const user = users[user_id];
	const templateVars = {
		user,
		urls: urlDatabase,
	};
	res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
	const user_id = req.session["user_id"];
	const user = users[user_id];
	const urls = userUrls(user_id, urlDatabase);
	const templateVars = {
		user,
		urls,
	};
	res.render("urls_index", templateVars);
});
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

app.post("/urls/:shortURL/delete", (req, res) => {
	delete urlDatabase[req.params.shortURL];
	res.redirect("/urls/");
});

app.post("/urls/:shortURL/edit", (req, res) => {
	const shortURL = req.params.shortURL;
	const longURL = req.body.longURL;
	const user_id = req.session["user_id"];
		urlDatabase[shortURL] = {
		longURL,
		userID: user_id,
};
	res.redirect("/urls/");
});

app.get("/u/:shortURL", (req, res) => {
	const longURL = urlDatabase[req.params.shortURL].longURL;
	if (longURL === null) return res.sendStatus(404);
	res.redirect(longURL);
});

// LOGIN ROUTES // 
app.get("/register", (req, res) => {
	templateVars = { user: null };
	res.render("user_registration", templateVars);
});

app.get("/login", (req, res) => {
	templateVars = { user: null };
	res.render("user_login", templateVars);
});

app.post("/register", (req,res) => {
	let email = req.body.email;
	let password = req.body.password;
	
	if (!email || !password) {
    return res.status(400).send("email and password cannot be blank");
  }
  const registerUser = findUserByEmail(email);
  
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

app.post("/login", (req, res) => {
	let email = req.body.email;
	let password = req.body.password;

	//Authenticate the user

	const user = authenticateUser(email, password);

	//if authenticated, set cookie with its user id and redirect

	if(user) {
		req.session['user_id'] = user.id;
		res.redirect("/urls");
	} else {
		res.status(401).send('Wrong credentials!');
	}
	// const user = findUserByEmail(email);
	// console.log("user", user)
	// if(!user) {
	// 	return res.status(403).send("Email does not exist.");
	// }

	// if(user.password !== password) {
	// 	return res.status(403).send("Password does not match.");
	// }

	// res.cookie("user_id", user.id);
	// res.redirect("/urls");
});

app.post("/logout", (req, res) => {
	console.log("/logout")
	req.session['user_id'] = null;	
	res.redirect("/urls");
});


