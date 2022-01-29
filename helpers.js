const bcrypt = require('bcryptjs');

const findUserByEmail = (email, usersDatabase) => {
  for(const userId in usersDatabase) {
    const user = usersDatabase[userId];
    if(user.email === email) {
      return user;
    }
  }
  return undefined;
}

const userUrls = function (id, urlDatabase) {
	let urls = {};

	for (let key in urlDatabase) {
		if (urlDatabase[key].userID === id){
			urls[key] = urlDatabase[key]
		}
	}
	return urls;
};

const authenticateUser = (email, password, users) => {
  // retrieve the user with that email
  const user = findUserByEmail(email, users);

  // if we got a user back and the passwords match then return the userObj
  if (user && bcrypt.compareSync(password, user.password)) {
    // user is authenticated
    return user;
  } else {
    // Otherwise return false
    return false;
  }
};

const generateRandomString = () => {
	let randomNum = Math.random().toString(36).substr(2, 6);
	return randomNum;
}

module.exports = { findUserByEmail, userUrls, authenticateUser, generateRandomString  }