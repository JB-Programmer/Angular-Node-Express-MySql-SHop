//Finally not used

const jwt = require("jsonwebtoken");

module.export = (req, res, next) =>{
  try{
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, 'secret_this_should_be_longer');

    console.log("Valid Token");
    next();
  }catch(error) {

    res.status(401).json({
      message:"Auth failed!"
    });
  }

};

