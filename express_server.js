const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

const urlDatabase = {
	b2xVn2: "http://www.lighthouselabs.ca",
	"9sm5xK": "http://www.google.com",
};

function generateRandomString() {
	let randomNum = Math.random().toString(36).substr(2, 6);
	return randomNum;
}

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get("/urls/new", (req, res) => {
	res.render("urls_new");
});

app.get("/urls", (req, res) => {
	const templateVars = { urls: urlDatabase };
	res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
	const templateVars = {
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
console.log("Check");
app.post("urls/:shortURL/delete", (req, res) => {
	console.log(request.params.shortURL);
	delete urlDatabase[req.params.shortURL];
	res.redirect("/urls/");
});

app.get("/u/:shortURL", (req, res) => {
	const longURL = urlDatabase[req.params.shortURL];
	if (longURL === null) return res.sendStatus(404);
	res.redirect(longURL);
});

app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});
