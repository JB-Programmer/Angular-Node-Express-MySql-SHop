
const express = require("express");
const cors = require("cors");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var path = require('path')
var fs = require('fs');
var expressValidator = require('express-validator');
var upload = require('express-fileupload');
var session = require('express-session');
const md = require('md5');
const jwt = require('jsonwebtoken');
var morgan = require('morgan');

const checkAuth = require('./appMiddleware');

const multer = require("multer");

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'

}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "./src/assets/productImages");
  },
  filename: (req, file, cb) => {
    const name = file.originalname
      .toLowerCase()
      .split(" ")
      .join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + "-" + Date.now() + "." + ext);
  }
});

//Not used finally
/*
const jwt = require("jsonwebtoken");
const checkAuth = require('./check-auth');
*/


var app = express();
app.use(morgan('combined'));
app.use(cookieParser());
app.use(cors());

app.use((req, res, next)=>{
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"

  );
  next();

})

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



//NOT NECESSARY WITH JWS
/*
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
*/


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
  let thePassMd = md(req.body.password);
        //console.log(req.body.date);
  //To do pass to MD5 before
  con.query(`SELECT * FROM users WHERE email='${req.body.email}' && password='${thePassMd}'`, (err,row)=>{
    if(err){
      console.log(err);
      console.log("Error in function select");
      res.status(401).json({message : "Auth failed"});
    }else{
      if(row.length>0){
        console.log("This is the role, yes!");
        //console.log(req.session.role);
        //res.status(200).send(row[0]);
        const token = jwt.sign({id: row[0].id, email: row[0].email, role:row[0].role, street:row[0].street, city:row[0].city},
                              'Thisisthesecret',
                              { expiresIn: "1h" }
                              );
        res.status(200).json({
          token: token,
          expiresIn: 3600,
          userid: row[0].id,
          role: row[0].role,
          email: row[0].email,
          name: row[0].name
        });
        //Assign values to the object session
        //req.session.name = row[0].name;
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
        //req.session.username = row[0].username;
        //req.session.role = row[0].role;
        //req.session.authenticated = true;
        //req.session.date = req.body.date;


      }else{
        console.log(row.length);
        console.log("User doenst exist or password not valid");
        res.setHeader('Content-Type', 'application/json');
        res.status(201).json(
          {error: "AuthInvalid"});
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
  console.log("Browser wants to check if exist user with this teudat zehut");
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
  console.log("The normal password" + req.body.password);

  let passMd5 = md(req.body.password)
  console.log("The password hashed: " + passMd5);
  // TODO USE MD5
  //To do, check if email already exists
  //Todo, add control email and teudat zehut to login
  con.query(`INSERT INTO users (name, surname, username, password, role, email, zehut, street, city)
             VALUES
             ("${req.body.name}", "${req.body.surname}", "${req.body.username}", "${passMd5}", "user",
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


//Check if user has cart, if has, retrieve data, else, create it.
//ATTENTION, IT IS CASE SENSITIVE
app.route('/checkifhascart').get(checkAuth, (req,res)=>{
  console.log("Checking if user has cart");
  const userId= req.userData.id;
  con.query(`SELECT * FROM carts WHERE userId='${userId}' AND finished='0'`, (err,data)=>{
    if(err){
      console.log(err);
      console.log("Error checking if user has cart");
      res.status(401).json({message : "Error checking if user has cart"});
    }else{
      if(data.length>0){
        console.log("The user has cart");
        console.log("This is the cart ID: " + data[0].id);
        const cartId = data[0].id;
        con.query(`SELECT * FROM cartelements WHERE cartId='${cartId}'`, (err,rows)=>{
          if(err){
            console.log(err);
            console.log("Error checking if usercart has elements");
            res.status(401).json({message : "Error checking if user cart has elements"});
          }else{
            res.status(200).send(rows);
          }

        }) // end of con.query from cartelements


      }else{  //User has not cart, so I have to create a cart (It should be a new user)
        con.query(`INSERT into carts (userId, date, finished) VALUES ('${userId}', '0000-00-00', '0')`, (err, respuesta)=>{
          if(err){
            console.log('Error creating cart to user');
            res.status(400).send(err);
          }else{
              //console.log(data.length);
              console.log("User hadnt car Active so i created it :)");
              res.status(201).json({message: "New create has been created to this user"});

          }

        })

      }

    }
  })

})

app.route('/getCartId').get(checkAuth, (req,res)=>{
  const userId = req.userData.id;

  con.query(`SELECT id FROM carts WHERE userId=${userId}`, (err,data)=>{
    if(err){
      console.log(err);
      console.log("Error getting cartId");
      res.status(400).send(err);
    }else{
      console.log("Cart ID");
      console.log(data);
      res.status(200).send(data[0]);
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
app.route('/category/:name').get(checkAuth, (req, res)=>{
  //const reqCategory = req.params['catname'];
  const reqCategory = req.params['name'];
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
app.route('/newproduct').post(checkAuth, multer({ storage: storage }).single("image"),
(req, res, next) =>{
  const userRole = req.userData.role;
/*   console.log("THE USER ROLEEEEEEEEEE");
  console.log(userRole); */
  if(userRole != 'admin'){
    console.log("User is trying to add a new product");
    res.status(400).json({message: "Adding produts is just for admin"});
    return;
  }
  const bodyreq = req.body;
  console.log(bodyreq);
  const categoryName = req.body.category;
  let categoryId;
 /*  console.log("This is the category name");
  console.log(categoryName); */
  con.query(`SELECT id FROM categories WHERE categoryName='${categoryName}'`,  (err, data)=>{
    if(err){
      console.log(err);
      res.send(err);
    }else{
      const filename = req.file.filename;
      let filenameWithPath = "../src/assets/productImages/" + filename;
      categoryId = data[0].id;
      con.query(`INSERT INTO products (name, price, category, description, image) values
      ('${req.body.name}', '${req.body.price}', '${categoryId}','${req.body.description}','${filenameWithPath}')`,
      (err)=>{
            if(err){
            console.log(err);
            console.log("Inserting product into db failed");

            res.status(400).send();
            }else{
            console.log("Yes! Product added successfully");
           /*  console.log(bodyreq);
            console.log("Category id calculated correctly");
            console.log("This is the id");
            console.log(categoryId); */

            res.status(200).send();
            }
            })
    }
  })


});



app.route('/producttocart').post(checkAuth, (req, res) => {

  const userId = req.userData.id;
  const productId = req.body.id;
  const quantity = req.body.quantity;
  console.log(req.userData);
  console.log(req.body);

  //res.status(200).send();

  con.query(`SELECT id FROM carts WHERE userId=${userId} and finished='0'`, (err,data)=>{
    if(err){
      console.log("Error getting cartId");
      res.status(400).send(err);
    }else{
      console.log("Cart ID");
      console.log(data);
      const cartId = data[0].id;
      con.query(`SELECT price FROM products WHERE id=${productId}`, (err, precio)=>{
        if(err){
          console.log("Error Getting the price");
        }else {
          //console.log(precio[0].price);
          const theprice = precio[0].price;
          const subtotal = theprice * quantity;
          con.query(`SELECT * FROM cartelements WHERE cartId='${cartId}' AND productid='${productId}'`, (err, rows) => {
            if (err) {
                console.log(err);

            } else if (rows.length == 0) {
                con.query(`INSERT INTO cartelements (cartId, productid, quantity, subtotal) VALUES(${cartId}, ${productId}, ${quantity}, ${subtotal})`, (err) => {
                    if (err){
                        console.log("Product wasnt inserted into cart");
                        res.status(400);
                    } else {
                        console.log("Product has been inserted into cart successfully");
                        res.status(200).send();
                    }
                })
            } else if (rows.length != 0){
                con.query(`UPDATE cartelements SET quantity=${quantity}, subtotal=${subtotal}  WHERE cartId=${cartId} AND productid=${productId}`, (err, rows) => {
                    if (err) {
                        console.log("Cart couldnt be updated")
                        //console.log(err);
                        res.status(400);

                    } else {
                        console.log("Cart updated successfuly");
                        res.status(200).send();
                    }
                })
            }
        });
        }
      });
    }

  })

});

app.route('/getUserInfo').get(checkAuth, (req,res)=>{
  const userId = req.userData.id;

  con.query(`SELECT * FROM users WHERE id=${userId}`, (err,data)=>{
    if(err){
      console.log(err);
      console.log("Error getting infoAboutUser");
      res.status(400).send(err);
    }else{
      console.log(data);
      res.status(200).send(data);
    }

  })

});

//Delete product from cart
app.route('/deleteproductfromcart').post(checkAuth, (req,res)=>{

  const userId = req.userData.id;
  const productId = req.body.productId;
  console.log("This is the userid");
  console.log(userId);

  console.log("This is the product id--------------");
  console.log(productId);
  //res.status(200).send();

  con.query(`SELECT id FROM carts WHERE userId=${userId}`, (err,data)=>{

    if(err){
      console.log(err);
      console.log("Error getting cartId");
      res.status(400).send(err);
    }else{

      const cartId = data[0].id;
      console.log(cartId);

      con.query(`DELETE FROM cartelements WHERE productId='${productId}'`, (err, result)=>{
        console.log(productId);
        console.log(err);
        if(err){
          console.log("Error Deleting from cart");
          //console.log(result.affectedRows);
          res.status(400).send(err);
        }else {
          console.log("Product deleted successfully!!!");
          //console.log(result.affectedRows);
          res.status(200).send(result);
        }
      });
    }
  });



})


//Delete product from cart
/* app.route('/deleteproductfromcart').post(checkAuth, (req,res)=>{

  const userId = req.userData.id;
  const productId = req.body.productId;
  console.log("This is the userid");
  console.log(userId);

  console.log("This is the product id--------------");
  console.log(productId);
  //res.status(200).send();

  con.query(`SELECT id FROM carts WHERE userId=${userId}`, (err,data)=>{

    if(err){
      console.log(err);
      console.log("Error getting cartId");
      res.status(400).send(err);
    }else{

      const cartId = data[0].id;
      console.log(cartId);

      con.query(`DELETE FROM cartelements WHERE productId='${productId}'`, (err, result)=>{
        console.log(productId);
        console.log(err);
        if(err){
          console.log("Error Deleting from cart");
          //console.log(result.affectedRows);
          res.status(400).send(err);
        }else {
          console.log("Product deleted successfully!!!");
          //console.log(result.affectedRows);
          res.status(200).send(result);
        }
      });
    }
  });



}) */


//Closing cart
app.route('/closecart').get(checkAuth, (req,res)=>{
  const userId = req.userData.id;

  //res.status(200).send();

  con.query(`SELECT id FROM carts WHERE userId=${userId}`, (err,data)=>{

    if(err){
      console.log(err);
      console.log("Error getting cartId");
      res.status(400).send(err);
    }else{

      const cartId = data[0].id;
      console.log(cartId);

      con.query(`UPDATE carts SET finished='1' WHERE id='${cartId}'`, (err, result)=>{
        console.log(err);
        if(err){
          console.log("Error Closing CArt");
          //console.log(result.affectedRows);
          res.status(400).send(err);
        }else {
          console.log("Cart closed Successfully");
          //console.log(result.affectedRows);
          res.status(200).json({message: 'carritoCerrado'});
        }
      });
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

/*
//There is another logout
app.post('/logout', (req, res) => {
  console.log('Logged out');
  req.session.destroy();
  res.status(200).json({mensaje: "THe user has been logged out"});
  res.end();
});

*/

app.route('*').get((req,res)=>{
  res.sendFile('/index.html', {
    root: './src/'
  });
})

app.listen(4040,()=>{
  console.log("Listening app.js in 4040");
})
