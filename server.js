const express = require("express");
const app = express();
const admin = require("firebase-admin");
const serviceAccount = require("./movieskey.json");
const bodyParser = require("body-parser");
const path = require("path");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "signup.html"));
});

app.get("/movies", (req, res) => {
  res.sendFile(path.join(__dirname, "movies.html"));
});

app.get("/", (req, res) => {
  const html = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f0ff0f;
            text-align: center;
          }
          .user {
            font-size: 100px;
            color: #f70808;
            margin: 100px;
          }
          .overview {
            font-size: 40px;
            color: green;
            }
          .signup-link {
            font-size: 68px;
            color: #007bff;
            text-decoration: none;
          }
          .signup-link:hover {
            text-decoration: underline;
          }
          .welcome {
            font-size: 100px;
            color: deeppink;
            margin: 100px;
          }
        </style>
      
      <body>
        <div class="user">Hi User! <br><strong class="welcome"> WELCOME!</strong></div>
        <p class="overview">Goto Movies Overview <a class="signup-link" href="/signup"><u>Click here</u></a></p>
      </body>
      </head>
    </html>
  `;

  res.send(html);
});

app.post("/loginSubmit", async (req, res) => {
  const { email, password } = req.body;
  const usersRef = db.collection("users");
  const userSnapshot = await usersRef.where("email", "==", email).get();  
  if (userSnapshot.empty) {
    return res.send('<p style="color: red; background-color: #8ff708; text-align: center; font-size: 50px; padding: 300px; font-family: Arial, sans-serif;">User not found <br><a href="/signup" style="font-size: 35px;">Signup here</a></p>');
    }
  const user = userSnapshot.docs[0].data();
  if (user.password !== password) {
    return res.send('<p style="color: red; background-color: #8ff708; text-align: center; font-size: 50px; padding: 300px; font-family: Arial, sans-serif;">Please Enter Correct Password <a href="/login" style="font-size: 35px;">Login here</a></p>');
    }
  res.redirect("/movies");
});


app.post("/signupSubmit", async (req, res) => {
  const { email, password } = req.body;
  const usersRef = db.collection("users");
  const existingUserSnapshot = await usersRef.where("email", "==", email).get();
  if (!existingUserSnapshot.empty) {
    return res.send('<p style="color: red; background-color: #8ff708; text-align: center; font-size: 50px; padding: 240px; font-family: Arial, sans-serif;">User with this email already exists <a href="/signup" style="font-size: 35px;">Signup here</a></p>');
    }
  try {
    await usersRef.add({ email, password });

    res.redirect("/login");
  } catch (error) {
    console.error("Error saving data to Firestore:", error);
    res.status(500).send("Error saving data to Firestore");
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
