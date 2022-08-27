var express = require('express');
var router = express.Router();

router.get('/',(req,res)=>{
    if(!req.session.loggedIn)
    {

   
    res.render('user/user-login',{"loginEr":req.session.error})

    req.session.error=false;
    }

    else
    {
        res.redirect('/')
    }
}) 


module.exports=router;