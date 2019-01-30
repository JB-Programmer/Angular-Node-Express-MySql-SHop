const jwt = require('jsonwebtoken');

module.exports = (req, res, next) =>{
  //I gave authorization as name


  //const token = jwt.sign({id: row[0].id, email: row[0].email, role:row[0].role, street:row[0].street, city:row[0].city},

  try{
   const token = req.headers.authorization.split(" ")[1];
   const decodedToken = jwt.verify(token, 'Thisisthesecret');
   req.userData = {id: decodedToken.id, email: decodedToken.email, role: decodedToken.role, street:decodedToken.street, city: decodedToken.city}
   console.log("Token has been recognized as authentic");
   next();

  }catch(error){
    res.status(401).json({message: "There is not a valid token"});
  }

}
