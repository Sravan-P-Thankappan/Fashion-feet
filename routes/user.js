var express = require('express');

var err
var blockEr
var router = express.Router();
var mobileNumber;
var userdemo = {}
var cartCount
var whishlistCount
var editDetails

const userHelper = require('../helpers/user-helpers')

const productHelper = require('../helpers/producthelpers')

const categoryHelper = require('../helpers/category');
const paypal = require('paypal-rest-sdk');
const adminhelper = require('../helpers/adminhelper');

// const accountSid = "ACa32652eaf8489caecd2234f9b8b0c9ff";
// const authToken = "0a2217412e1b3bdf4e89ac3c65659a99";

// const client = require('twilio')(accountSid, authToken)
// const serviceID = 'VA7395bd17db80873a758e3eba3c1087c8'


// -----------------middleware---------------------

const auth = (req, res, next) => {

   if (req.session.user) {
      next()
   }
   else
      res.redirect('/login-register')
}


/* --------------------GET home page.--------------------- */

router.get('/', async function (req, res, next) {
    
      
   
      cartCount = null
      whishlistCount = null

      if (req.session.user) {

         whishlistCount = await userHelper.getWhishlistCount(req.session.user._id)
         cartCount = await userHelper.getCartCount(req.session.user._id)
      }

      let category = await categoryHelper.getAllCategory() 

      productHelper.getFeaturedProducts().then((products) => {
       
         adminhelper.getAllBanner().then((banner)=>{
          
            if (req.session.loggedIn) {
               res.render('user/index', { user: true, login: req.session.user, products, cartCount, whishlistCount, banner, category });
            }
            else {
               res.render('user/index', { user: true, products, banner, category })
            }
         })
         
        
      })

});
  


// ---------------------get login-register page-------------------------


router.get('/login-register', (req, res) => {
   if (req.session.loggedIn) {
      res.redirect('/')
   }

   else res.render('user/user-login', { 'ex': err, 'block': blockEr })

   err = false
   blockEr = false

})

// ---------------------after login get home page----------------------

router.post('/login', (req, res) => {
   
   console.log(req.body);

   userHelper.doLogin(req.body).then((response) => {
      let a = response.user
      if (response.status) {
         if (a.status) {
            req.session.loggedIn = true
            req.session.user = response.user

            res.redirect('/')
         }
         else {
            blockEr = true
            res.redirect('/login-register')
         }
      }

      else {
         req.session.error = true
         res.redirect('/loginfail')

      }

   })

})

router.get('/otp', (req, res) => {

   res.render('user/otp')
}

)


router.post('/getotp', (req, res) => {

   userHelper.doOtpLogin(req.body).then((response) => {
      userdemo = response.user
      if (!response.status) {
         console.log("user is blocked");
      }
   }).catch((err) => {

      console.log(err);
   })


})

router.post('/otplogin', (req, res) => {

   let otp = req.body.Otp

   userHelper.doVerify(otp, userdemo).then((userData) => {

      console.log(userData)

      req.session.loggedIn = true
      req.session.user = userData
      res.redirect('/')

   })

})


// ---------------after register get home page-------------------

router.post('/register', (req, res) => {

   console.log(req.body);
   let name = req.body.Name
   let number = req.body.Phone
   let newString = name.concat('', number)

   function getRandomInt(n) {
      return Math.floor(Math.random() * n);
   }
   function shuffle(newString) {
      var arr = newString.split('');
      var n = arr.length;

      for (let i = 0; i < n; i++) {
         var j = getRandomInt(n);

         var temp = arr[i];
         arr[i] = arr[j];
         arr[j] = temp;
      }

      shuffeledString = arr.join('');
      return shuffeledString;
   }

   req.body.Refferalcode = shuffle(newString);

   userHelper.doSignup(req.body).then((response) => {


      console.log(response);

      req.session.loggedIn = true
      req.session.user = response
      res.redirect('/')

 
   }).catch((existingUser) => {

      if (existingUser)
         res.redirect('/login-register')
      err = true

   })



})

// ----------------------after logout----------------

router.get('/logout', (req, res) => {

   req.session.loggedIn = null
   req.session.user = null
   res.redirect('/')
})



// --------------getting product details page---------------------

router.get('/getdetails/:id',  (req, res) => {
 
   try {
      
   
   productHelper.getProductsDetails(req.params.id).then((product) => {
      res.render('user/productdetails', { user: true, product, login: req.session.user, cartCount, whishlistCount })
   })
   .catch((error)=>{
     
      res.render('error') 
   })
} catch (error) {
 
}
 
})
   



// ----------------------showing products page----------------------

router.get('/shop', async (req, res) => {
   try {
      let category = await categoryHelper.getAllCategory()
      let brand = await categoryHelper.getAllBrand()
      let collection = await categoryHelper.getAllSubCategory()

      productHelper.getAllProducts().then((products) => {

         res.render('user/shop', { user: true, login: req.session.user, cartCount, whishlistCount, products, category, brand, collection })

      })
      .catch((error)=>{
         res.render('error')

      })
   } 
   catch (error) {
      console.log(error);
      res.render('error')
   }
})


// -----------------------filteration using categorywise-----------------

router.get('/categorywise/:id', async (req, res) => {
  try {

   let category = await categoryHelper.getAllCategory()
   let brand = await categoryHelper.getAllBrand()
   let collection = await categoryHelper.getAllSubCategory()

   productHelper.getCategorywiseProducts(req.params.id).then((products) => {
 
      res.render('user/product-categories', { user: true, login: req.session.user, products, cartCount, category, whishlistCount,brand,collection })
   })
   .catch((error)=>{
      res.render('error')
   })
} 
catch (error) {
   res.render('error')
}

})

// -----------------------filteration using brandwise-----------------
router.get('/brandwise/:id', async (req, res) => {
 try {
   
   let brand = await categoryHelper.getAllBrand()
   let collection = await categoryHelper.getAllSubCategory()
   let category = await categoryHelper.getAllCategory()
   productHelper.getBrandwiseProducts(req.params.id).then((products) => {

      res.render('user/product-categories', {collection,brand, user: true, login: req.session.user, products, cartCount, category, whishlistCount })


   })
   .catch((error)=>{
      res.render('error')
   })
} catch (error) {
   res.render('error')
 
}
})

// ---------------------filteration using subcategories-----------------------

router.get('/collectionwise/:id', async (req, res) => {
 try {
   
   let brand = await categoryHelper.getAllBrand()
   let collection = await categoryHelper.getAllSubCategory()
   let category = await categoryHelper.getAllCategory()
   
   productHelper.getSubcategorywiseProducts(req.params.id).then((products) => {

      res.render('user/product-categories', {brand,collection, user: true, login: req.session.user, products, cartCount, category, whishlistCount })

   }).catch(()=>{
      res.render('error')

   })
} catch (error) {
   res.render('error')
}
})


// --------------------cart page---------------------- 

router.get('/cart', auth, async (req, res, next) => {

   try {
      
   let totalValue = await userHelper.getTotalAmount(req.session.user._id)

   userHelper.getCartItems(req.session.user._id).then((products) => {

      res.render('user/cart', { user: true, login: req.session.user, products, cartCount, totalValue, whishlistCount,cartEmpty:true })

   })

} catch (error) {
   res.render('error')
 
}

})

//  ----------------------add to cart--------------------------

router.get('/addcart/:id', (req, res, next) => {

   console.log("api call");
   userHelper.addTocart(req.params.id, req.session.user._id).then(() => {

      // res.redirect('/cart')
      res.json({ status: true })
   })

})

// ---------------------------change product quantity----------------------

router.post('/change-product-quantity/', (req, res, next) => {

   userHelper.changeProductQuantity(req.body).then(async (response) => {
      response.total = await userHelper.getTotalAmount(req.body.user)
      res.json(response)

   })
})


//  --------------------------remove cart------------------------


router.post('/remove-cart', (req, res) => {

   userHelper.removeCart(req.body).then((response) => {

      res.json(response)
   })
})


// --------------------------checkout page--------------------------------


router.get('/checkout', auth, async (req, res, next) => {
  try {
   
  
   let user = await userHelper.getUser(req.session.user._id)

   let total = await userHelper.getTotalAmount(req.session.user._id)
   let address = await userHelper.getAddress(req.session.user._id)

   res.render('user/checkout', { user: true, login: req.session.user, cartCount, total, whishlistCount, address, user })
} catch (error) {
   res.render('error')
}
})



// ----------------------------place order-----------------------





router.post('/place-order', async (req, res) => {

   console.log('place orderrrrrrr');
   console.log(req.body);

   let products = await userHelper.getCartProductList(req.session.user._id)

   let totalPrice = parseInt(req.body.total)

   req.session.total = totalPrice

   userHelper.placeOrder(req.body, products, totalPrice, req.session.user._id).then((orderId) => {

      req.session.orderId = orderId

      if (req.body.paymentmethod === 'COD') {
         res.json({ codSuccess: true })

      }

      else if (req.body.paymentmethod === 'Razorpay') {

         //  -----------------online payment----------------
         userHelper.genarateRazorpay(orderId, totalPrice).then((response) => {

            console.log(response);
            response.razorpaySuccess = true
            console.log(response);

            res.json(response)
         })

      }

      else {
         userHelper.genaratePaypal(orderId, totalPrice).then((response) => {

            res.json(response)

         })
      }

   })


})

router.get('/success', (req, res) => {

   let amount = req.session.total
   let orderIdPaypal = req.session.orderId
   userHelper.changePaymentStatus(orderIdPaypal).then(() => {

      const payerId = req.query.PayerID;
      const paymentId = req.query.paymentId;

      const execute_payment_json = {
         "payer_id": payerId,
         "transactions": [{
            "amount": {
               "currency": "USD",
               "total": "" + amount
            },
         }]
      };

      paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
         if (error) {
            console.log(error);
            console.log('err');
            throw error
         } else {
            console.log('success');
            console.log(payment);
            res.redirect('/orderlist')
         }
      })
   })
})


// ---------------------online payment verification----------------

router.post('/verifypayment', (req, res) => {

   console.log(req.body);

   console.log(req.body['order[receipt]']);

   userHelper.verifyPayment(req.body).then(() => {
      userHelper.changePaymentStatus(req.body['order[receipt]']).then(() => {

         res.json({ status: true })
      })
   }).catch((err) => {

      res.json({ status: false })
   })
})




//  -------------------order placed successfully-------------------

router.get('/orderlist', auth, async (req, res, next) => {

   res.render('user/orderlist', { user: true, login: req.session.user, cartCount, whishlistCount })
})

// -----------------view orders in seprate page--------------------------

router.get('/vieworders', auth, async (req, res) => {
   let orders = await userHelper.getUserOrders(req.session.user._id)

   res.render('user/orders', { user: true, login: req.session.user, cartCount, whishlistCount, orders })
})


router.get('/vieworder', (req, res) => {
   res.redirect('/vieworders')
})


// -----------------------view ordered products-----------------------



router.get('/view-order-products/:id', auth, async (req, res, next) => {

    try {
        
   let products = await userHelper.getOrderProducts(req.params.id)

   let totals = await userHelper.getOrderProductsTotal(req.params.id)

   res.render('user/view-order-products', { user: true, login: req.session.user, products, totals })

} catch (error) {
   res.render('error')

}
})


// -----------------------------invoice----------------------------------

router.get('/invoice/:id', auth, async (req, res) => {

   let products = await userHelper.getOrderSingleProducts(req.params.id)

   res.render('user/invoice', { user: true, login: req.session.user, products })
})


// -------------------------user profile---------------------------------

var userOrder

router.get('/account', auth, async (req, res, next) => {
  try {
   
  
   let address = await userHelper.getAddress(req.session.user._id)
   let orders = await userHelper.getUserOrders(req.session.user._id)
   let userDetails = await userHelper.getUser(req.session.user._id)
   console.log(address);

   res.render('user/userprofile', {
      user: true, login: req.session.user, orders, address, cartCount, 'change': editDetails, userDetails,

      'passwordSuccess': passwordSuccess, 'resetEr': resetEr, 'passwordMatchEr': passwordMatchEr, whishlistCount
   })

   editDetails = false
   passwordSuccess = false
   resetEr = false
   passwordMatchEr = false
} catch (error) {
   res.render('error')
}
})



//  ---------------------order cancel from user side------------------------


router.get('/cancelorder/:id', (req, res) => {

   userHelper.cancelOrder(req.params.id).then(() => {

      res.redirect('/account')

   })
})

router.get('/cancelordertwo/:id', (req, res) => {

   userHelper.cancelOrder(req.params.id).then(() => {

      res.redirect('/vieworders')

   })
})



//   -----------------------add address------------------------

router.post('/addaddress', (req, res) => {
   
       
   userHelper.addAddress(req.body, req.session.user._id).then(() => {

      res.redirect('/account')
   })


})

router.post('/addaddresstwo', (req, res) => {
          
   userHelper.addAddress(req.body, req.session.user._id).then(() => {
      res.redirect('/checkout')
   })


})


//   -----------------------------edit address-----------------------

router.get('/editaddress/:id', (req, res) => {
   try {
      let adId = req.params.id

   userHelper.getAddressDetails(adId).then((address) => {

      res.render('user/editaddress', { user: true, cartCount, login: req.session.user, address, whishlistCount })

   }).catch(()=>[
      res.render('error') 

   ])
} catch (error) {
     res.render('error') 
}

})

router.post('/editaddress/:id', (req, res) => {

   let aId = req.params.id
   userHelper.editAddress(aId, req.body).then(() => {

      res.redirect('/account')

   })

})


//   ---------------edit profile---------------

router.post('/editprofile', (req, res) => {

   userHelper.editProfile(req.session.user._id, req.body).then(() => {

      console.log(req.session.user._id, req.body);

      editDetails = true

      res.redirect('/account')
   })
})


// ----------------------reset password------------------

var resetEr
var passwordMatchEr
var passwordSuccess
router.post('/resetpassword', (req, res) => {

   console.log(req.body);
   if (req.body.Newpassword === req.body.Confirmpassword) {

      console.log('true');
      userHelper.resetPassword(req.session.user._id, req.body).then(() => {

         res.redirect('/account')
         passwordSuccess = true

      }).catch((err) => {
         res.redirect('/account')
         resetEr = true
      })
   }

   else {

      res.redirect('/account')
      console.log('false');
      passwordMatchEr = true

   }


})

// --------------------coupon-------------------

router.post('/verifycoupon', (req, res) => {

   console.log("api call");
   console.log(req.body);
   userHelper.verifyCoupon(req.body).then((response) => {

      res.json(response)

      console.log('userroute');
      console.log(response);


   })
})

router.get('/whishlist', auth, async (req, res, next) => {
  try {
   
  
   let products = await userHelper.getWhishlistProducts(req.session.user._id)
  
   res.render('user/whishlist', { user: true, login: req.session.user, cartCount, whishlistCount, products })
} catch (error) {
   res.render('error')
}
})


router.get('/addtowhishlist/:id', (req, res) => {

   

   userHelper.addToWhishlist(req.params.id, req.session.user._id).then((response) => {
      res.json(response)
   })

})

router.post('/applywallet', (req, res) => {

   

   userHelper.applyWallet(req.body, req.session.user._id).then((data) => {
      res.json(data)
   })

})

router.get('/contact',(req,res)=>{
   res.render('user/contact',{user: true, login: req.session.user, cartCount, whishlistCount})
})




module.exports = router;    