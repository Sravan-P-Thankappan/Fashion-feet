
var express = require('express');
const adminhelper = require('../helpers/adminhelper');
const userHelper = require('../helpers/user-helpers')
const productHelper = require('../helpers/producthelpers')
const categoryHelper = require('../helpers/category');
var router = express.Router();
var multer = require('multer');


// ----------multer set up-----------------

var fileStorage = multer.diskStorage({

  destination: (req, file, cb) => { 

    cb(null, './public/product-image')

  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '--' + file.originalname)
  }
})

const upload = multer({ storage: fileStorage })



//  -----------middleware--------------
const auth = (req, res, next) => {

  if (req.session.admin) {
    next()
  }

  else res.redirect('/admin')
}




// get admin loginpage

router.get('/', (req, res, next) => {

  if (req.session.adminLoggedIn)
    res.redirect('/admin/home')
  else
    res.render('admin/login')


})

// get admin homepage

router.get('/home', auth, async (req, res, next) => {

  let salesReport = await adminhelper.salesData()
  let paymentMode = await adminhelper.paymentMethod()
  let monthlyData = await adminhelper.salesMonthly()
  let dailyData = await adminhelper.salesDaily()
  let categoryData = await adminhelper.categorySale()
  let totalOrder = await adminhelper.totalOrder()
  let totalUser = await adminhelper.totalUser()
  let totalRevenue = await adminhelper.totalRvenue()

  res.render('admin/index', { admin: true, paymentMode, salesReport, monthlyData, dailyData, categoryData, totalOrder, totalUser, totalRevenue })

})




// redirected to home after login

router.post('/signin', (req, res) => {

  adminhelper.adminLogin(req.body).then((response) => {

    if (response.status) {

      req.session.adminLoggedIn = true
      req.session.admin = response.admin

      res.redirect('/admin/home')
    }

    else res.redirect('/admin')


  })



})

//-------- redirected to login page after logout------------

router.get('/logout', (req, res) => {

  req.session.adminLoggedIn = null
  req.session.admin = null
  res.redirect('/admin')

})


// ------------getting userlistpage------------ 


router.get('/userdetails', auth, (req, res, next) => {
  userHelper.getAllUsers().then((users) => {

    res.render('admin/userlist', { admin: true, users })

  })

})


router.get('/users', (req, res) => {

  res.redirect('/admin/userdetails')
})


// ------------getting product list page------------ 


router.get('/productdetails', auth, (req, res, next) => {

  productHelper.getAllProducts().then((products) => {


    res.render('admin/productlist', { admin: true, products })

  })

})

router.get('/products', (req, res) => {

  res.redirect('/admin/productdetails')
})

// ------------getting category page---------------- 


router.get('/category', auth, (req, res, next) => {

  categoryHelper.getAllCategory().then((category) => {

    res.render('admin/category', { admin: true, category })
  })

})

// ---------------get add category page--------------- 

router.get('/addcategory', auth, (req, res, next) => {

  res.render('admin/addcategory', { admin: true })


})


// --------------------adding category----------------


router.post('/addc', upload.array('Image', 1), (req, res) => {

  var filenames = req.files.map(function (file) {
    return file.filename
  })

  console.log(req.body);

  req.body.Image = filenames

  categoryHelper.addCategory(req.body).then((id) => {

    res.redirect('/admin/category')


  })


})




// ---------------------editing category-----------------------

router.get('/editcategory/:id', auth, (req, res, next) => {
 
  try {
    
  let cId = req.params.id

  categoryHelper.getCategoryDetails(cId).then((category) => {


    res.render('admin/editcategory', { admin: true, category })

  }).catch(()=>{
    res.render('error')
  })

} catch (error) {
    
}

})


router.post('/editc/:id', upload.array('Image', 1), (req, res) => {

  let cId = req.params.id

  var filenames = req.files.map(function (file) {
    return file.filename
  })

  console.log(req.body);

  req.body.Image = filenames

  categoryHelper.updateCategory(cId, req.body).then(() => {

    res.redirect('/admin/category')


  })


})


// ----------------------delete category--------------

router.get('/deletecategory/:id', (req, res) => {

  categoryHelper.deleteCategory(req.params.id).then(() => {

    res.redirect('/admin/category')
  })
})


// ------------------subcategory page-----------------

router.get('/addsubcategory', auth, (req, res) => {

  res.render('admin/addsubcategory', { admin: true })

})

router.post('/addsubcategory', (req, res) => {

  categoryHelper.addSubCategory(req.body).then(() => {

    res.redirect('/admin/addproduct')

  })

})


// --------------------brand page----------------------

router.get('/addbrand', auth, (req, res) => {

  res.render('admin/addbrand', { admin: true })
})

router.post('/addbrand', (req, res) => {

  categoryHelper.addBrand(req.body).then(() => {

    res.redirect('/admin/addproduct')
  })
})


// -------------------------------color----------------------

router.get('/addcolor', auth, (req, res) => {

  res.render('admin/addcolor', { admin: true })
})

router.post('/addcolor', auth, (req, res) => {

  categoryHelper.addColor(req.body).then(() => {

    res.redirect('/admin/addproduct')
  })

})

// ------------getting add products page------------ 

router.get('/addproduct', auth, async (req, res, next) => {

  let category = await categoryHelper.getAllCategory()

  let subcategory = await categoryHelper.getAllSubCategory()

  let color = await categoryHelper.getAllColor()

  let brand = await categoryHelper.getAllBrand()

  res.render('admin/addproduct', { admin: true, category, subcategory, color, brand })



})



// -----------------add Products to database-----------------

router.post('/addp', upload.array('Image', 4), (req, res, next) => {

  var filenames = req.files.map(function (file) {
    return file.filename
  })

  console.log(req.body);

  req.body.Image = filenames

  productHelper.addProducts(req.body).then(() => {

    res.redirect('/admin/productdetails')

  })

})



//----------- get edit products page-------------




router.get('/edit/:id', auth, async (req, res, next) => {

  let pId = req.params.id

  let category = await categoryHelper.getAllCategory()

  let subcategory = await categoryHelper.getAllSubCategory()

  let color = await categoryHelper.getAllColor()

  let brand = await categoryHelper.getAllBrand()

  productHelper.getProductsDetails(pId).then((product) => {

    res.render('admin/editproduct', { admin: true, product, category, subcategory, brand, color })

  }).catch((error)=>{
       res.render('error')
  })

})



router.post('/editproduct/:id', upload.array('Image', 4), (req, res, next) => {


  let pId = req.params.id

  var filenames = req.files.map(function (file) {
    return file.filename
  })

  req.body.Image = filenames
  console.log(req.body);
 
  productHelper.updateProducts(pId, req.body).then(() => {




    res.redirect('/admin/productdetails')


  })
})




// --------deleting of product---------------

router.get('/delete/:id', (req, res) => {

  let pId = req.params.id
  productHelper.deleteProduct(pId).then(() => {

    res.redirect('/admin/productdetails')
  })
})


// --------------blocking of user---------------

router.get('/block/:id', (req, res) => {

  let uId = req.params.id

  userHelper.blockUser(uId).then(() => {


    req.session.user = null
    req.session.loggedIn = null

    res.redirect('/admin/userdetails')

  })
})



// -------------------unblocking of user----------------

router.get('/unblock/:id', (req, res) => {

  let uId = req.params.id
  userHelper.unblocklUser(uId).then(() => {
    res.redirect('/admin/userdetails')

  })
})



//  --------------------------order list---------------------------

router.get('/orderlist', auth, (req, res, next) => {

  adminhelper.getAllOrders().then((orders) => {

    res.render('admin/orderlist', { admin: true, orders })
  })
})


//  ------------------------order details----------------------------

router.get('/orderdetails/:id', auth, (req, res, next) => {
 
  
 
  console.log(req.params.id);
  adminhelper.getOrderDetails(req.params.id).then((data) => {

    res.render('admin/orderdetails', { admin: true, data })

  }).catch((error)=>{
    res.render('error')
  })



})

// ----------------------order status change-----------------

router.get('/cancel/:id', (req, res) => {

  adminhelper.cancelOrder(req.params.id).then(() => {

    res.redirect('/admin/orderlist')
  })

})

router.get('/shipp/:id', (req, res) => {

  adminhelper.shippOrder(req.params.id).then(() => {

    res.redirect('/admin/orderlist')
  })

})

router.get('/delivered/:id', (req, res) => {

  adminhelper.deliverOrder(req.params.id).then(() => {

    res.redirect('/admin/orderlist')
  })

})


// -----------------offer management-------------------

router.get('/offermanagement', auth, async (req, res, next) => {

  let category = await categoryHelper.getAllCategory()
  let offer = await adminhelper.getOfferdetails()

  res.render('admin/offermanagement', { admin: true, category, offer })
})


router.post('/offer', (req, res) => {

  console.log(req.body);
  adminhelper.addOffer(req.body).then(() => {
    console.log('checkkkkkk');
    console.log(req.body); // evde req.body addOffer resolve cheyyunnadh anu
    adminhelper.applyOffer(req.body)


    res.redirect('/admin/offermanagement') 

  })
})

router.get('/deleteoffer/:id/:name', (req, res) => {
  console.log(req.params.name);
  console.log(req.params.id);
  adminhelper.deleteOffer(req.params.id, req.params.name).then(() => {

    res.redirect('/admin/offermanagement')
  })
})
 


//  ------------------product offer management--------------------

router.get('/productoffer/:id',auth,(req,res)=>{
   
     productHelper.getProductsDetails(req.params.id).then((product)=>{
          
      res.render('admin/addproductoffer',{admin:true,product})
     }).catch(()=>{
      res.render('error')
     })
})


router.post('/productoffer',(req,res)=>{
    
  console.log(req.body);
     productHelper.updateProductOffer(req.body).then(()=>{
       
      res.redirect('/admin/productdetails')
  
     })
})



//  -------------------coupon-------------------

router.get('/coupon-management', auth, async (req, res, next) => {
  let coupon = await adminhelper.getCoupnDetails()
  res.render('admin/coupon', { admin: true, coupon })
})



router.post('/coupon', (req, res) => {

  adminhelper.addCoupon(req.body).then(() => {

    res.redirect('/admin/coupon-management')
  })
})


// --------------------banner management-----------------------


router.get('/banner-management',auth,async(req,res,next)=>{
  
  let brand = await categoryHelper.getAllBrand()

  let banner  = await adminhelper.getAllBanner()

     res.render('admin/banner',{admin:true,brand,banner})
})


router.post('/banner',upload.array('Banner',1),(req,res)=>{

  var filenames = req.files.map(function (file) {
    return file.filename
  })
   
  req.body.Banner = filenames

   adminhelper.addBanner(req.body).then(()=>{
    res.redirect('/admin/banner-management')
   })
})


module.exports = router;
