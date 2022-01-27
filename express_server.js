// REQUIREMENTS //

const express = require("express");
const app = express();
const PORT = 8080; 
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});

// DATABASES //

const urlDatabase = {
	b2xVn2: "http://www.lighthouselabs.ca",
	"9sm5xK": "http://www.google.com",
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

// FUNCTIONS//

const generateRandomString = () => {
	let randomNum = Math.random().toString(36).substr(2, 6);
	return randomNum;
}

const findUserByEmail = (email) => {
  for(const userId in users) {
    const user = users[userId];
    if(user.email === email) {
      return user;
    }
  }
  return null;
}

// URL ROUTES //

app.get("/urls/new", (req, res) => {
	const user_id = req.cookies["user_id"];
	const user = users[user_id];
	const templateVars = {
		user: user
	};
	res.render("urls_new", templateVars);
});
app.get("/urls", (req, res) => {
	const user_id = req.cookies["user_id"];
	const user = users[user_id];
	console.log("/urls", user);
	const templateVars = {
		user: user,
		urls: urlDatabase,
	};
	res.render("urls_index", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
	const user_id = req.cookies["user_id"];
	const user = users[user_id];
	const templateVars = {
		user: user,
		shortURL: req.params.shortURL,
		longURL: urlDatabase[req.params.shortURL],
	};
	res.render("urls_show", templateVars);
});
app.post("/urls", (req, res) => {
	const shortURL = generateRandomString();
	const longURL = req.body.longURL;
	urlDatabase[shortURL] = longURL;
	res.redirect("/urls/" + shortURL);
});
app.post("/urls/:shortURL/delete", (req, res) => {
	delete urlDatabase[req.params.shortURL];
	res.redirect("/urls/");
});
app.post("/urls/:shortURL/edit", (req, res) => {
	const shortURL = req.params.shortURL;
	const longURL = req.body.longURL;
	urlDatabase[shortURL] = longURL;
	res.redirect("/urls/");
});
app.get("/u/:shortURL", (req, res) => {
	const longURL = urlDatabase[req.params.shortURL];
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
	const user = { email, password, id: user_id };
	users[user_id] = user;
	res.cookie("user_id", user_id);
	res.redirect("/urls");
});

app.post("/login", (req, res) => {
	let email = req.body.email;
	let password = req.body.password;
	const user = findUserByEmail(email);
	console.log("user", user)
	if(!user) {
		return res.status(403).send("Email does not exist.");
	}

	if(user.password !== password) {
		return res.status(403).send("Password does not match.");
	}

	res.cookie("user_id", user.id);
	res.redirect("/urls");
});

app.post("/logout", (req, res) => {
	console.log("/logout")
	res.clearCookie('user_id');
	res.redirect("/urls");
});


