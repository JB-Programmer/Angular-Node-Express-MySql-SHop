
const express = require("express");
const cors = require("cors");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var path = require('path')
var fs = require('fs');
var expressValidator = require('express-validator');
var upload = require('express-fileupload');
var morgan = require('morgan');
var session = require('express-session');

//Not used finally
/*
const jwt = require("jsonwebtoken");
const checkAuth = require('./check-auth');
*/


var app = express();
app.use(morgan('combined'));
app.use(cookieParser());
app.use(cors());

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(express.json());

app.use(expressValidator());

//Connection to DB
var con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'myshop'

});

con.connect((err)=>{
  if(err){
    console.log("Connection to DB fail");
    throw err;

  }else{
    console.log("Connected successfully to DB");
  }


});

//I dont know if it will be necessary
app.use(express.static('src'));



app.use(session(
                {secret:'chaim',
                 saveUninitialized:false,
                 resave:false,
                cookie: {
                    secure: true,
                    expires: new Date(Date.now() + 1000000),
                    maxAge: 5000000}
                }
));


//Root
/*
app.get('/salchichas', (req, res)=>{
  console.log(req.cookies);
  console.log('-------');
  console.log(req.session);
  res.send('Our first cookie trying');


});
*/

//Root
app.get('/', (req, res)=>{
  console.log(req.cookies);
  console.log('-------');
  console.log(req.session);
  //res.send(req.cookies);
  res.render('/index.html');

});



//USERS QUERIES
//Login Control
//ATTENTION, IT IS CASE SENSITIVE
app.route('/login').post((req,res)=>{
  //TODO UNHASH the password via bcrypt si es que funciona: 101.4
  //Admin-> Username: chaim  Password:1234
  //Client -> Username: eli  Password:1234
  console.log("User is trying to login");
  console.log(req.body.email);
  console.log(req.body.password);
  console.log(req.body.date);
  //To do pass to MD5 before
  con.query(`SELECT * FROM users WHERE email='${req.body.email}' && password='${req.body.password}'`, (err,row)=>{
    if(err){
      console.log(err);
      console.log("Error in function select");
      res.status(401).send(err);
    }else{
      if(row.length==1){
        //Assign values to the object session
        req.session.name = row[0].name;
       /* Not neccessry with express-session
        const token = jwt.sign(
              {email: req.body.username, userId: row[0].id},
              'secret_this_should_be_longer',
              {expiresIn: "1h"}); //One hour validate of the token

        console.log("User has been authentified and token sent");
        res.status(200).json({
             token:token,
             message: 'Usen has been authentified and token sent'
          });
        */
        req.session.username = row[0].username;
        req.session.role = row[0].role;
        req.session.authenticated = true;
        req.session.date = req.body.date;

        console.log(req.session.role);
        //res.status(200).send(row[0]);
        res.status(201).send(req.session);
      }else{
        console.log(row.lenght);
        console.log("User/password not valid");
        res.status(201).send('User/password not valid');
      }
    }
  })

})



//LOGOUT
app.route('/logout').post((req,res)=>{
    console.log(req.session.name);
    console.log('User has been logged out')

    req.session.destroy();
    res.end();
});




//Get all users
app.route('/users').get((req,res)=>{
  console.log("Client get all users")
  con.query(`SELECT * FROM users`, (err, data)=>{
    if(err){
      console.log(err);
      console.log("Error retriving all users");
      res.status(400).send(err);
    }else{
      res.send(data);
    }
  })
});


//Check if exist this user (by teudat zehut), if exist return in body=1, if not, returns body-0
app.route('/existuser').post((req,res)=>{
  console.log("Client wants to check if exist user with this teudat zehut");
  con.query(`SELECT * FROM users WHERE zehut=${req.body.zehut}`, (err,rows)=>{
    if(err){
      console.log(err);
      console.log("Checking zehut doenst worked properly");
    }else{
      if(rows.length ==1){
        console.log("Exist user with this zehut");
        res.send('1');
      }else{
        console.log("Doenst exist user with this zehut");
        res.send('0');
      }
    }

  })
})

//Insert new user
app.route('/signupuser').post((req,res)=>{
  // TODO USE MD5
  //Todo, add control email and teudat zehut to login
  con.query(`INSERT INTO users (name, surname, username, password, role, email, zehut, street, city)
             VALUES
             ("${req.body.name}", "${req.body.surname}", "${req.body.username}", "${req.body.password}", "user",
             "${req.body.email}", "${req.body.zehut}", "${req.body.street}", "${req.body.city}")`, (err,body)=>{

                if(err){
                  console.log(err);
                  console.log("Error INSERTING new user into DB");
                  res.status(400).send(err);
                }else{
                  console.log("User added successfully");
                  console.log(req.body);
                  res.status(201).send(req.body);
                }


             })



});






//PRODUCTS/CATEGORIES QUERYS
//Getting all categories
app.route('/categoriesnames').get((req,res)=>{
  con.query(`SELECT * FROM categories`, (err,data)=>{
    if(err){
      console.log(err);
      console.log("Error getting all categories");
      res.status(400).send(err);
    }else{
      console.log("Client asked for category name");
      console.log(data);
      res.status(200).send(data);
    }

  })


});

//Get all products
app.route('/products').get((req, res)=>{
  console.log("Client asked for all products");
  //con.query(`select * from products where category=`)
  con.query(`SELECT * FROM products`, (err, data)=>{
    if(err){
      console.log("Error getting all products");
      console.log(err);
      res.status(400).send(err);
    }else{
      console.log(data);
      console.log("All products retrieved successfully");
      res.send(data);
    }

  });


});




//Getting products of a category
app.route('/category').get((req, res)=>{
  //const reqCategory = req.params['catname'];
  const reqCategory = req.query.catname;
  console.log("Client asked for "+reqCategory+" Kippot.");

  //con.query(`select * from products where category=`)
  con.query(`SELECT * FROM products WHERE category IN (SELECT id FROM categories WHERE categoryName='${reqCategory}')`, (err, data)=>{
    if(err){
      console.log("Error getting products of category");
      console.log(err);
      res.status(400).send(err);
    }else{
      console.log(data);
      console.log("Products of this category retrieved successfully");
      res.send(data);
    }

  });


});


//Get product by ID
app.route('/product/:id').get((req, res)=>{
  console.log("Searching product by id");
  const prodIdRequested = req.params['id'];
  con.query(`SELECT * FROM products WHERE id='${prodIdRequested}'`, (err, data)=>{
    if(err){
      console.log(err);
      console.log("Error retriving info of this product id");
      res.status(400);
    }else{
      console.log("Retrieved data of this product ID successfully");
      res.status(400).send(data);
    }
  })

})


//Inserting a product to the database
app.route('/newproduct').post((req, res)=>{
  const bodyreq = req.body;
  console.log(bodyreq);
  con.query(`INSERT INTO products (name, price, category, description, image) values
            ('${req.body.name}', '${req.body.price}', '${req.body.category}','${req.body.description}','${req.body.image}')`,
            (err)=>{
    if(err){
      console.log(err);
      console.log("Inserting product into db failed");

      res.send(err);
    }else{
      console.log("Yes! Product added successfully");

      res.status(200).send();
    }
  })
  res.status(200).send(bodyreq);



});



app.post('/producttocart', (req, res) => {
  /*
  if(req.session.cartId){
    const cartid= req.session.cartId;
  }else{
    const cartid = 1;

  }*/
  const cartid = '1';
  const productId = req.body.productid;
  const quantity = req.body.quantity;
  /*
  con.query(`SELECT price FROM products WHERE id=${productId}`, (err, precio)=>{
    if(err){
      console.log("Error Getting the price");
    }else {
      console.log(precio[0].price);
      const theprice = precio[0].price;
      return theprice;
    }
  });

  */
  //console.log(precio);
  const subtotal = req.body.quantity * 30;
  con.query(`SELECT * FROM cartelements WHERE cartId='${cartid}' AND productid='${productId}'`, (err, rows) => {
      if (err) {
          console.log(err);

      } else if (rows.length == 0) {
          con.query(`INSERT INTO cartelements (cartId, productid, quantity, subtotal) VALUES(${cartid}, ${productId}, ${quantity}, ${subtotal})`, (err) => {
              if (err){
                  console.log("Product wasnt inserted into cart");
                  res.status(400);
              } else {
                  console.log("Cart has been successfully updated" + productId);
                  res.status(200).send();
              }
          })
      } else if (rows.length != 0){
          con.query(`UPDATE cartelements SET quantity=${quantity}, subtotal=${subtotal}  WHERE cartId=${cartid} AND productid=${productId}`, (err, rows) => {
              if (err) {
                  console.log(err);
                  res.status(400);

              } else {
                  console.log("Cart updated successfuly");
                  res.status(200).send();
              }
          })
      }
  });
});



//Updating an product
app.route('/product/:id').put((req,res)=>{
  const prodToUpdate = req.params['id'];
  //console.log(req.body);
  console.log("This is the product to update:");
  console.log(prodToUpdate);

  con.query(`UPDATE products SET name='${req.body.name}', price='${req.body.price}', description='${req.body.description}' WHERE id='${prodToUpdate}'`, (err)=>{
    if(err){
      console.log("Product hasnt been updated successfully");
      console.log(err);
      res.status(400);
    }else{
      console.log("Yes! product has been updated!");
      res.status(200).send();
    }
  })

  res.status(200).send(req.body);

});



//Deleting a product
app.route('/deleteproduct/:id').delete((req,res)=>{
  const prodToDelete = req.params['id'];
  //The deleteproceess

  res.status(204);

});

app.post('/logout', (req, res) => {
  console.log('Logged out');
  req.session.destroy();
  res.status(200).json({mensaje: "THe user has been logged out"});
  res.end();
});

app.route('*').get((req,res)=>{
  res.sendFile('/index.html', {
    root: './src/'
  });
})

app.listen(4040,()=>{
  console.log("Listening app.js in 4040");
})
