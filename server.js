const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const knex = require("knex");

const app = express();

app.use(bodyParser.json());
app.use(cors());

const db = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    user: "",
    password: "",
    database: "networkapp"
  }
});

app.get("/data", (req, res) => {
  db.select("*")
    .from("users")
    .then(data => {
      res.send(data);
    });
});

app.get("/networkusers", (req, res) => {
  db.select("*")
    .from("networkusers")
    .then(data => {
      res.send(data);
    });
});
/*
app.post("/cb", (req, res) => {
 
  const { loginuser, userid, ischecked } = req.body;
  console.log(loginuser, userid, ischecked);
  
  return db("users")
    .where({ email: email })
    .update({ ischecked: ischecked }, ["email"])
    .then(arr => arr.length && res.status(200).json({ email: arr[0] }));
    
  if (ischecked) {
    console.log("flag is true");
    db.transaction(trx => {
      trx
        .insert({
          id: loginuser,
          connections: userid
        })
        .into("networkusers")
        .returning("id", "connections")
        .then(() => {
          console.log("committing");
          trx.commit();
        })
        .catch(error => {
          console.log("error", error);
          trx.rollback();
        });
    }).catch(err => res.status(400).json(err));
  } else {
    console.log("flag is false");
    db.transaction(trx => {
      db("networkusers")
        .where("id", "=", loginuser)
        .andWhere("connections", "=", userid)
        .del()
        .returning("id", "connections")
        .then(() => {
          console.log("committing");
          trx.commit();
        })
        .catch(error => {
          console.log("error", error);
          trx.rollback();
        });
    }).catch(err => res.status(400).json(err));
  }
});
*/

app.post("/cb", (req, res) => {
 
  const { loginuser, userid, ischecked } = req.body;
  console.log(loginuser, userid, ischecked);
  
  if (ischecked) {
    console.log("flag is true");
       db('networkusers').insert({
          id: loginuser,
          connections: userid
        })
        .returning('*')
        .then(item => {
          res.json(item)
        })
        
    .catch(err => res.status(400).json(err));
  } else {
    console.log("flag is false");
      db("networkusers")
        .where("id", "=", loginuser)
        .andWhere("connections", "=", userid)
        .del()
        .then(() => {
          res.json({delete:'true'})
        })
       
    .catch(err => res.status(400).json(err));
  }
});

app.post("/signin", (req, res) => {
  db.select("email", "hash")
    .from("login")
    .where("email", "=", req.body.email)
    .then(data => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);

      if (isValid) {
        return db
          .select("*")
          .from("users")
          .where("email", "=", req.body.email)
          .then(user => {
            res.json(user[0]);
          })
          .catch(err => res.status(400).json("unable to get user"));
      } else {
        res.status(400).json("idiot");
      }
    })
    .catch(err => res.status(400).json("Wrong Credentials"));
});

app.post("/register", (req, res) => {
  const {
    firstname,
    lastname,
    phone,
    city,
    email,
    password,
    company,
    isChecked
  } = req.body;
  const hash = bcrypt.hashSync(password);
  db("users");
  db.transaction(trx => {
    trx
      .insert({
        hash: hash,
        email: email
      })
      .into("login")
      .returning("email")
      .then(loginEmail => {
        return trx("users")
          .returning("*")
          .insert({
            email: loginEmail[0],
            firstname: firstname,
            lastname: lastname,
            company: company,
            city: city,
            phone: phone,
            ischecked: false
          })
          .then(user => {
            res.json(user[0]);
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch(err => res.status(400).json("Unable to register"));
});

app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  let found = false;
  db.select("*")
    .from("users")
    .where({
      id: id
    })
    .then(user => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json("Not found");
      }
    })
    .catch(err => res.status(400).json("error getting user"));
});

app.post("/suggest", (req, res) => {
  const {
    location,
    restaurant,
    resdescription,
    attractions,
    attdescription
  } = req.body;
  database.suggest.push({
    id: "455",
    location: location,
    restaurant: restaurant,
    resdescription: resdescription,
    attractions: attractions,
    attdescription: attdescription
  });
  //grab the last user
  res.json(database.suggest[database.suggest.length - 1]);
});

app.get("/suggestion/:id", (req, res) => {
  const { id } = req.params;
  let found = false;
  database.suggest.forEach(sugg => {
    if (sugg.id === id) {
      found = true;
      return res.json(sugg);
    }
  });
  if (!found) {
    res.status(400).json("not found");
  }
});

app.listen(3000, () => {
  console.log("app is running on port 3000");
});
