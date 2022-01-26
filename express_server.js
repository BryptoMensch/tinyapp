const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const urlDatabase = {
	b2xVn2: "http://www.lighthouselabs.ca",
	"9sm5xK": "http://www.google.com",
};

function generateRandomString() {
	let randomNum = Math.random().toString(36).substr(2, 6);
	return randomNum;
}

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get("/urls/new", (req, res) => {
	const templateVars = {
		username: req.cookies["username"],
	};
	res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
	const templateVars = {
		username: req.cookies["username"],
		urls: urlDatabase,
	};
	res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
	const templateVars = {
		username: req.cookies["username"],
		shortURL: req.params.shortURL,
		longURL: urlDatabase[req.params.shortURL],
	};
	res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
	console.log(req.body); // Log the POST request body to the console
	const shortURL = generateRandomString();
	const longURL = req.body.longURL;
	urlDatabase[shortURL] = longURL;
	console.log(urlDatabase);
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

app.post("/login", (req, res) => {
	res.cookie("username", req.body.username);
	console.log(req.body);
	res.redirect("/urls");
});

app.post("/logout", (req, res) => {
	res.clearCookie('username');
	res.redirect("/urls");
});

app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});
