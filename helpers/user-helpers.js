var db = require('../configuration/connection')
var collection = require('../configuration/collection')
var bcrypt = require('bcrypt');
const objectId = require('mongodb').ObjectId

const accountSid = "ACa32652eaf8489caecd2234f9b8b0c9ff";
const authToken = "0a2217412e1b3bdf4e89ac3c65659a99";
const client = require('twilio')(accountSid, authToken)
const serviceID = 'VA7395bd17db80873a758e3eba3c1087c8'

const Razorpay = require('razorpay');
const paypal = require('paypal-rest-sdk');

// ---------------------paypal set up--------------------

paypal.configure({
  'mode': 'sandbox', //sandbox or live 
  'client_id': 'AbefN-j6WxlmZ1dSQuuT96ImcKsuWmtKv7GVNcYGnglTvdUYCEqc_T793V7Q9Fm5EKISY25NQXUJwnJY', // please provide your client id here 
  'client_secret': 'EO2LmtWyusBrYslcDWsgOq1U3p92DW3vfQGL4kUY33b5p59R6pjWmYgyPWO-JL7WSV1cO62EIfO29BUE' // provide your client secret here 
});


// -----------------------------------------razorpay setup--------------------------

var instance = new Razorpay({
  key_id: 'rzp_test_tktJ5Z7OxNsc7R',
  key_secret: 'hq9Jc4vNQD75rEpL7ngYGa7q',
});



module.exports =
{
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      let existinguser = await db.get().collection(collection.NEWUSER_COLLECTION).findOne({ Email: userData.Email })

      if (existinguser) {
        existingStatus = true
        reject(existingStatus)
      }

      else {

        userData.Wallet = 0

        if (userData.Rcode.length !== 0) {
          let refferedUser = await db.get().collection(collection.NEWUSER_COLLECTION).findOne({ Refferalcode: userData.Rcode })
          console.log('reffered userrrrrrrr');
          console.log(refferedUser);
          if (refferedUser) {

            db.get().collection(collection.NEWUSER_COLLECTION).updateOne({ _id: refferedUser._id }, {
              $set: {
                Wallet: refferedUser.Wallet + 100
              }
            }).then(() => {
              userData.Wallet = userData.Wallet + 50
            })

          }
        }
        userData.status = true

        userData.Password = await bcrypt.hash(userData.Password, 10)

        db.get().collection(collection.NEWUSER_COLLECTION).insertOne(userData).then((data) => {
          resolve(userData)
        })

      }
    })
  },


  doLogin: (userData) => {

    return new Promise(async (resolve, reject) => {

      let response = {}

      let user = await db.get().collection(collection.NEWUSER_COLLECTION).findOne({ Email: userData.Email })

      if (user) {
        bcrypt.compare(userData.Password, user.Password).then((status) => {
          if (status) {
            console.log("Login Success");
            response.user = user
            response.status = true
            resolve(response)
          } else {
            console.log("Login Failed");
            resolve({ status: false })
          }

        })
      } else {
        console.log("Login Failed");
        resolve({ status: false })
      }
    })

  },


  doOtpLogin: (userData) => {

    return new Promise(async (resolve, reject) => {

      let loginStatus = false

      let response = {}

      let user = await db.get().collection(collection.NEWUSER_COLLECTION).findOne({ Phone: userData.Phone })

      if (user) {
        if (user.status) {

          let mobileNumber = user.Phone
          client.verify.services(serviceID)
            .verifications
            .create({ to: '+91' + mobileNumber, channel: 'sms' })
            .then(verification => {
              console.log(verification.status)


            })
            .catch((err) => {

              console.log(err);
            })

          response.user = user
          response.status = true

          resolve(response)
        }

        else response.status = false
      }

      else {

        err = 'Phone number dosent exist'
        reject(err)
      }

    })

  },


  doVerify: (otp, userData) => {
    return new Promise((resolve, reject) => {

      let mobileNumber = userData.Phone
      client.verify.services(serviceID)
        .verificationChecks
        .create({ to: '+91' + mobileNumber, code: otp })
        .then(

          (verification_check) => {

            if (verification_check.status == 'approved') {
              console.log(verification_check.status)
              resolve(userData)

            }
          }

        ).catch((err) => {

          console.log(err);

        })

    })

  },


  // getAllUsers: () => {
    
  //   return new Promise(async (resolve, reject) => {
    
  //     let users = await db.get().collection(collection.NEWUSER_COLLECTION).find().toArray()
     
  //    if (user){ console.log(user); resolve(users) }
  //    else{ 
  //     console.log();
  //      reject(err)
  //    }

  //   })

  // },

  getAllUsers:()=>{
   return new Promise ((resolve,reject)=>{
     
    db.get().collection(collection.NEWUSER_COLLECTION).find().toArray().then((user)=>{

      resolve(user)
    }).catch((err)=>{
        console.log(err);
    })

   })
  },


  getUser: (uId) => {

    return new Promise(async (resolve, reject) => {

      let user = await db.get().collection(collection.NEWUSER_COLLECTION).findOne({ _id: objectId(uId) })
      console.log(user);
      resolve(user)
    })
  },



  blockUser: (uId) => {

    return new Promise((resolve, reject) => {

      db.get().collection(collection.NEWUSER_COLLECTION).updateOne({ _id: objectId(uId) },

        {
          $set: {

            status: false
          }
        })

      resolve()

    })

  },

  unblocklUser: (uId) => {

    return new Promise((resolve, reject) => {

      db.get().collection(collection.NEWUSER_COLLECTION).updateOne({ _id: objectId(uId) },
        {
          $set: {
            status: true
          }
        }
      )

      resolve()
    })

  },

  addTocart: (proId, userId) => {

    let proObj =
    {
      item: objectId(proId),
      quantity: 1
    }
    return new Promise(async (resolve, reject) => {



      let usercart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
      if (usercart) {
        let proExist = usercart.products.findIndex(product => product.item == proId)
        console.log(proExist);

        if (proExist != -1) {
          db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId), 'products.item': objectId(proId) },

            {
              $inc: { 'products.$.quantity': 1 }
            }

          ).then(() => {
            resolve()
          })

        }
        else {
          db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) },

            {
              $push: { products: proObj }
            }

          ).then((response) => {

            resolve()
          })

        }
      }
      else {

        let cartObj =
        {
          user: objectId(userId),
          products: [proObj]
        }

        db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {

          resolve()
        })
      }
    })

  },


  getCartItems: (userId) => {

    return new Promise( async (resolve, reject) => {

      let cartItems = await   db.get().collection(collection.CART_COLLECTION).aggregate([

        {
          $match: { user: objectId(userId) }
        },

        {
          $unwind: '$products'
        },
        {
          $project:
          {
            item: '$products.item',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup:
          {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },

        {
          $project:
          {
            item: 1, quantity: 1, offer: 1, discountPrice: 1, product: { $arrayElemAt: ['$product', 0] }
          }

        }

      ]).toArray()
      
     resolve(cartItems)
    
    })

  },

  getCartCount: (userId) => {

    return new Promise(async (resolve, reject) => {

      let count = 0
      let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })

      if (cart) {
        count = cart.products.length
        resolve(count)
      }
      else {
        count = 0
        resolve(count)
      }



    })

  },

  changeProductQuantity: (details) => {

    details.count = parseInt(details.count)

    console.log('asdfgh');
    console.log(details.count);

    details.quantity = parseInt(details.quantity)


    return new Promise((resolve, reject) => {

      if (details.count == -1 && details.quantity == 1) {
        db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(details.cart) },
          {
            $pull: { products: { item: objectId(details.product) } }
          }
        ).then((response) => {

          resolve({ removeProduct: true })
        })

      } else {

        db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },

          {
            $inc: { 'products.$.quantity': details.count }
          }

        ).then((response) => {

          console.log(response);
          resolve({ status: true })
        })
      }
    })

  },

  removeCart: (details) => {

    return new Promise((resolve, reject) => {


      db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(details.cart) },
        {
          $pull: { products: { item: objectId(details.product) } }
        }
      ).then((response) => {

        resolve({ removeProduct: true })

      })
    })

  },


  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {

  let total =    await db.get().collection(collection.CART_COLLECTION).aggregate([

        {
          $match: { user: objectId(userId) }
        },

        {
          $unwind: '$products'
        },
        {
          $project:
          {
            item: '$products.item',
            quantity: '$products.quantity'

          }
        },

        {
          $lookup:
          {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },

        {
          $project:
          {
            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
          }

        },

        {
          $project: {
            item: 1, quantity: 1, product: 1,
            Price:
            {
              $cond: {
                if: '$product.offer', then: '$product.discountPrice', else:
                {
                  $cond: { if: '$product.productoffer', then: '$product.productdiscountprice', else: '$product.Price' }
                }
              }

            }, actualPrice: '$product.Price',

            discount:
            {
              $cond: {
                if: '$product.offer', then: '$product.categoryDiscount', else:
                {
                  $cond: { if: '$product.productoffer', then: '$product.productdiscount', else: 0 }

                }
              }
            }
          }
        },

        {
          $group:
          {
            _id: null,
            total: { $sum: { $multiply: ['$quantity', { $toInt: '$Price' }] } },
            discount: { $sum: { $multiply: ['$discount', '$quantity'] } },
            subtotal: { $sum: { $multiply: ['$quantity', { $toInt: '$actualPrice' }] } }
          }
        }

      ]).toArray()

      console.log('total-------------------');

      console.log(total[0]);
      resolve(total[0])
    })

  },


  placeOrder: (order, products, total, uId) => {
    return new Promise(async (resolve, reject) => {

      let productArray = products.map((product) => {
        return product.item;
      })

      let item = await db.get().collection(collection.PRODUCT_COLLECTION).find({ _id: { $in: productArray } }).toArray()

      for (let i = 0; i < products.length; i++) {
        products[i].item = item[i]
      }

      let status = order.paymentmethod === 'COD' ? 'placed' : 'pending'
      let orderObj =

      {
        deliveryDetails: objectId(order.address),
        userId: objectId(uId),
        paymentMethod: order.paymentmethod,
        products: products,
        totalAmount: total,
        date: new Date(),
        status: status,
        discount: parseInt(order.discount),
        couponoffer: parseInt(order.couponoffer),
        walletoffer: parseInt(order.walletoffer)
      }

      db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {

        db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(uId) })

        resolve(response.insertedId)

      })


    })

  },

  getCartProductList: (userId) => {

    return new Promise(async (resolve, reject) => {

      let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
      resolve(cart.products)
    })
  },


  getUserOrders: (userId) => {
    
    console.log(userId);
    return new Promise(async (resolve, reject) => {
      console.log(userId);

      let order = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: { 
            userId: objectId(userId) }
        },

        {
          $lookup: {
            from: collection.ADDRESS_COLLECTION,
            localField: 'deliveryDetails',
            foreignField: '_id',
            as: 'address'
          }
        },
        {
          $project: {
            address: 1,couponoffer:1,walletoffer:1, status: 1, paymentMethod: 1,  cancel: 1, return: 1, userId: 1,totalAmount:1,
            date:
              { $dateToString: { format: "%d/%m/%Y %H:%M:%S", date: "$date" } }
          }
        },

        {
          $unwind: '$address'
        },

        {
          $project: { date: 1, paymentMethod: 1, address: 1, status: 1,  cancel: 1, return: 1, address: '$address.addressDetail',
          totalAmount:1 }

        },
        {
          $sort: { date: -1 }
        }

      ]).toArray()

      console.log('user ordersssss');
     console.log(order);
      resolve(order)

    })
  },



  getOrderProducts: (orderId) => {
    return new Promise(  (resolve, reject) => {

        db.get().collection(collection.ORDER_COLLECTION).aggregate([

        {
          $match: { _id: objectId(orderId) }
        },

        {
          $lookup:
          {
            from: collection.ADDRESS_COLLECTION,
            localField: 'deliveryDetails',
            foreignField: '_id',
            as: 'address'
          }
        }, 
        {
          $lookup:
          {
            from: collection.NEWUSER_COLLECTION,
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },

        {
          $unwind: '$products'
        },
        {
          $unwind: '$address'
        },
        {
          $unwind: '$user'
        },

        {
          $project:
          {
            item: '$products.item',quantity: '$products.quantity',totalAmount: 1,couponoffer: 1, user: 1,address: '$address.addressDetail',
            walletoffer: 1,status: 1, discount: 1, 
            date: {
              $dateToString: {
                date: '$date',
                format: '%d-%m-%Y %H:%M:%S'
              }
            }

          }
        },
        {
          $project:
          {
            item: 1, quantity: 1,  couponoffer: 1, address: 1, user: 1, status: 1, date: 1,
            walletoffer: 1, discount: 1,totalAmount: 1,
            productDiscount: {
              $cond: {
                if: '$item.productoffer', then: '$item.productdiscount',
                else: {
                  $cond: { if: '$item.offer', then: '$item.categoryDiscount', else: 0 }
                }
              }

            },
            productDiscountPrice:
            {
              $cond: {
                if: '$item.productoffer', then: '$item.productdiscountprice',
                else: {
                  $cond: { if: '$item.offer', then: '$item.discountPrice', else:{$toInt: '$item.Price'} }
                }
              }
            },
            Discount:
            {
              $cond: {
                if: '$item.productoffer', then: '$item.productdiscount',
                else: {
                  $cond: { if: '$item.offer', then: '$item.categoryDiscount', else:0 }
                }
              }
            },

          }
        },
        {
          $project: {
            item: 1, quantity: 1,  couponoffer: 1, address: 1, user: 1, status: 1, date: 1,Discount:1,
            walletoffer: 1, discount: 1, productDiscount: 1, productDiscountPrice: 1,
            totalDiscount: { $multiply: ['$quantity', '$productDiscount'] },
             actualPrice:{ $multiply: ['$quantity', {$toInt:'$item.Price'}] },
             totalPrice:{$multiply:['$quantity','$productDiscountPrice']},
             totalAmount:1
          }
        },
       

      ]).toArray().then((orderItems)=>{
        console.log(orderItems);
        
        resolve(orderItems)
      }).catch((err)=>{
              reject(err)
      })


    })
  },


  getOrderProductsTotal: (orderId) => {
    return new Promise( (resolve, reject) => {

       db.get().collection(collection.ORDER_COLLECTION).aggregate([
       
        {
          $match: { _id: objectId(orderId) }
        },

        {
          $unwind: '$products'
        },
        
        {
          $project:
          {
            item: '$products.item',quantity: '$products.quantity',totalAmount: 1,
             discount: 1, 
           
          }
        },
        {
          $project:
          {
            item: 1, quantity: 1,  
            discount: 1,
            productDiscount: {
              $cond: {
                if: '$item.productoffer', then: '$item.productdiscount',
                else: {
                  $cond: { if: '$item.offer', then: '$item.categoryDiscount', else: 0 }
                }
              }

            },
            productDiscountPrice:
            {
              $cond: {
                if: '$item.productoffer', then: '$item.productdiscountprice',
                else: {
                  $cond: { if: '$item.offer', then: '$item.discountPrice', else:{$toInt: '$item.Price'} }
                }
              }
            },

          }
        },
        {
          $project: {
            totalDiscount: { $multiply: ['$quantity', '$productDiscount'] },
             subtotal:{$sum:{$multiply:['$quantity',{$toInt:'$item.Price'}]}},
          }
        },
        
        {
          $group:{_id:null,subtotal:{$sum:'$subtotal'},discount:{$sum:'$totalDiscount'}}
        }
       
      ]).toArray().then((orderItems)=>{
        resolve(orderItems)

      }).catch((err)=>{
        reject(err)
      })

     

    })
  },




  // getOrderSingleProducts: (orderId) => {
  //   return new Promise(async (resolve, reject) => {

  //     let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

  //       {
  //         $match: { _id: objectId(orderId) }
  //       },

  //       {
  //         $unwind: '$products'
  //       },


  //       {
  //         $project:
  //         {
  //           item: '$products.item',
  //           quantity: '$products.quantity',
  //           totalAmount: 1,
  //           deliveryDetails: 1,
  //           date: 1,
  //           status: 1

  //         }
  //       },

  //       {
  //         $lookup:
  //         {
  //           from: collection.PRODUCT_COLLECTION,

  //           localField: 'item',
  //           foreignField: '_id',
  //           as: 'product'

  //         }

  //       },

  //       {
  //         $lookup:
  //         {
  //           from: collection.BRAND_COLLECTION,
  //           localField: 'product.Brand',
  //           foreignField: '_id',
  //           as: 'brand'
  //         }
  //       },

  //       {
  //         $unwind: '$brand'
  //       },
  //       {
  //         $lookup:
  //         {
  //           from: collection.ADDRESS_COLLECTION,
  //           localField: 'deliveryDetails',
  //           foreignField: '_id',
  //           as: 'address'
  //         }
  //       },

  //       {
  //         $unwind: '$address'
  //       },

  //       {
  //         $project:
  //         {
  //           totalAmount: 1,
  //           deliveryDetails: '$address.addressDetail',
  //           date: 1,
  //           status: 1,
  //           brand: '$brand.Brand',
  //           item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] },

  //         }
  //       },

  //       {

  //         $project:
  //         {
  //           totalAmount: 1,
  //           deliveryDetails: 1,
  //           date: 1,
  //           status: 1,
  //           brand: 1,
  //           item: 1, quantity: 1, product: 1,
  //           discount: {
  //             $cond: {
  //               if: '$product.productoffer', then: '$product.productdiscount',
  //               else: {
  //                 $cond: { if: '$product.offer', then: '$product.categoryDiscount', else: 0 }
  //               }
  //             }
  //           },

  //           actualPrice: {
  //             $cond: {
  //               if: '$product.productoffer', then: '$product.productdiscountprice',
  //               else: {
  //                 $cond: { if: '$product.offer', then: '$product.discountPrice', else: '$product.Price' }
  //               }
  //             }
  //           }
  //         }

  //       },

  //       {
  //         $project:
  //         {
  //           totalAmount: 1,
  //           deliveryDetails: 1,
  //           status: 1,
  //           brand: 1,
  //           item: 1, quantity: 1, product: 1,
  //           discount: { $multiply: ['$quantity', '$discount'] },
  //           actualPrice: { $multiply: [{ $toInt: '$actualPrice' }, '$quantity'] },
  //           Price: { $multiply: [{ $toInt: '$product.Price' }, '$quantity'] },
  //           date: {
  //             $dateToString: {
  //               date: '$date',
  //               format: '%d-%m-%Y %H:%M:%S'
  //             }
  //           }
  //         }
  //       }
  //     ]).toArray()

  //     console.log('singlleeeeeeeeee');
  //     console.log(orderItems[0]);
  //     resolve(orderItems[0])
  //   })
  // },



  cancelOrder: (orderId) => {

    return new Promise((resolve, reject) => {

      db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
        {
          $set: {
            status: "canceled",
            cancel: true
          }

        }).then(() => {

          resolve()
        })
    })
  },

  genarateRazorpay: (orderId, total) => {

    return new Promise((resolve, reject) => {

      var options = {
        amount: total * 100,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + orderId
      };
      instance.orders.create(options, function (err, order) {

        if (err) {
          console.log(err);
        }
        else {

          resolve(order)
        }
      })
    })
  },


  verifyPayment: (details) => {

    console.log('helper');


    return new Promise((resolve, reject) => {

      const crypto = require('crypto');
      var hmac = crypto.createHmac('sha256', 'hq9Jc4vNQD75rEpL7ngYGa7q');

      hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
      hmac = hmac.digest('hex')
      if (hmac == details['payment[razorpay_signature]']) {
        resolve()
      } else {
        reject()
      }

      if (generated_signature == razorpay_signature) {
        console.log('payment is successful');
      }


    })
  },



  genaratePaypal: (orderId, total) => {

    return new Promise((resolve, reject) => {

      const create_payment_json = {
        "intent": "sale",
        "payer": {
          "payment_method": "paypal"
        },
        "redirect_urls": {
          "return_url": "http://fashionfeet.shop//success",
          "cancel_url": "http://fashionfeet.shop//cancel"
        },
        "transactions": [{
          "item_list": {
            "items": [{
              "name": "Red Sox Hat",
              "sku": "001",
              "price": total,
              "currency": "USD",
              "quantity": 1
            }]
          },
          "amount": {
            "currency": "USD",
            "total": total,
          },
          "description": "Hat for the best team ever"
        }]
      };

      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          throw error;
        } else {

          resolve(payment)

        }
      });




    })

  },

  changePaymentStatus: (orderId) => {


    return new Promise((resolve, reject) => {

      db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
        {
          $set: {

            status: 'placed'
          }
        }).then(() => {

          resolve()
        })
    })
  },


  // addAddress: (addressData, uId) => {

  //   let addressdetail =
  //     addressData



  //   return new Promise(async (resolve, reject) => {

  //     let addressExist = await db.get().collection(collection.ADDRESS_COLLECTION).findOne({ user: objectId(uId) })

  //     if (addressExist) {

  //       db.get().collection(collection.ADDRESS_COLLECTION).updateOne({ user: objectId(userId) },

  //         {
  //           $push: { address: addressdetail }
  //         }

  //       ).then((response) => {



  //         resolve()
  //       })

  //     }

  //     else {
  //       let addressObj = {

  //         user: objectId(uId),

  //         address: [addressdetail]

  //       }

  //       db.get().collection(collection.ADDRESS_COLLECTION).insertOne(addressObj).then(() => {

  //         resolve()
  //       })

  //     }
  //   })
  // },

  addAddress: (addressData, uId) => {

    let addressObj =
    {
      addressDetail:
      {
        Housename: addressData.Housename,
        Streetname: addressData.Streetname,
        State: addressData.State,
        Pin: addressData.Pin
      },

      user: objectId(uId)
    }

    return new Promise((resolve, reject) => {

      db.get().collection(collection.ADDRESS_COLLECTION).insertOne(addressObj)

      resolve()
    })


  },

  getAddress: (uId) => {

    return new Promise(async (resolve, reject) => {

      let address = await db.get().collection(collection.ADDRESS_COLLECTION).find({ user: objectId(uId) }).toArray()

      resolve(address)

      // console.log(address.addressDetail);
    })
  },

  // getAddress: (uId) => {

  //   return new Promise(async (resolve, reject) => {

  //     let address = await db.get().collection(collection.ADDRESS_COLLECTION).aggregate([

  //       {
  //         $match:
  //         {
  //           user: objectId(uId)
  //         }
  //       },

  //       {
  //         $unwind: '$address'
  //       },

  //       {
  //         $project:
  //         {
  //           address: 1
  //         }

  //       }

  //     ]).toArray()

  //     console.log('hiiiiiiiiiiiii');
  //     console.log(address);

  //     resolve(address)
  //     console.log(address);
  //   })


  // }


  getAddressDetails: (adId) => {

    return new Promise( (resolve, reject) => {

       db.get().collection(collection.ADDRESS_COLLECTION).findOne({ _id: objectId(adId) }).then((address)=>{
        resolve(address)

       }).catch((err)=>{
           reject(err)
       })

    })

  },

  editAddress: (aId, data) => {

    return new Promise((resolve, reject) => {

      db.get().collection(collection.ADDRESS_COLLECTION).updateOne({ _id: objectId(aId) },

        {
          $set:
          {
            addressDetail:
            {
              Housename: data.Housename,
              Streetname: data.Streetname,
              State: data.State,
              Pin: data.Pin
            }
          }
        }

      )

      resolve()
    })
  },

  editProfile: (uId, data) => {

    console.log('helper');
    console.log(uId, data);
    return new Promise((resolve, reject) => {


      db.get().collection(collection.NEWUSER_COLLECTION).updateOne({ _id: objectId(uId) },

        {
          $set:
          {
            Name: data.Name,
            Email: data.Email,
            Phone: data.Phone
          }
        }

      )
      resolve()
    })

  },

  resetPassword: (uId, data) => {

    return new Promise(async (resolve, reject) => {

      let user = await db.get().collection(collection.NEWUSER_COLLECTION).findOne({ _id: objectId(uId) })

      if (user) {

        bcrypt.compare(data.Currentpassword, user.Password).then(async (status) => {

          if (status) {
            data.Newpassword = await bcrypt.hash(data.Newpassword, 10)

            db.get().collection(collection.NEWUSER_COLLECTION).updateOne({ _id: objectId(uId) },
              {
                $set:
                {
                  Password: data.Newpassword
                }
              })

            console.log("reset successfull");
            resolve()
          }

          else {
            err = "Your current password is incorrect"

            console.log(err);

            reject(err)
          }
        })

      }

    })
  },

  verifyCoupon: (data) => {

    console.log(data);

    return new Promise(async (resolve, reject) => {

      let coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({ code: data.coupon })
      if (coupon) {
        console.log('coupon exist');
        let currentdate = new Date()
        let expiryDate = new Date(coupon.date)

        if (currentdate <= expiryDate) {
          console.log('coupon valid');

          let userExist = coupon.users.includes(data.user)

          if (userExist) {
            console.log('userexist');
            resolve({ exist: true })
          }

          else {
            console.log('new user');
            let user = data.user

            db.get().collection(collection.COUPON_COLLECTION).updateOne({ code: data.coupon },

              { $push: { users: (user) } }

            ).then((response) => {

              console.log(data.total);
              let offer = data.total * (coupon.offer / 100)

              let newTotal = data.total - offer
              console.log('new user');
              console.log(newTotal);

              response.total = newTotal
              response.couponamount = offer
              resolve(response)
              console.log(response);
            })
          }
        }
        else {
          resolve({ couponExpired: true })
          console.log('coupon expired');
        }
      }
      else {

        resolve({ noCoupon: true })
        console.log('no coupon');
      }

    })
  },

  addToWhishlist: (proId, userId) => {

    return new Promise(async (resolve, reject) => {
      let user = await db.get().collection(collection.WHISHLIST_COLLECTION).findOne({ user: objectId(userId) })

      if (user) {
        console.log('userexist');
        let productExist = user.product.findIndex(product => product == proId)

        console.log(productExist);

        if (productExist == -1) {
          console.log('product not exist');

          db.get().collection(collection.WHISHLIST_COLLECTION).updateOne({ user: objectId(userId) },

            {
              $push: { product: objectId(proId) }
            }
          )
          resolve({ status: true })
        }
        else {

          db.get().collection(collection.WHISHLIST_COLLECTION).updateOne({ user: objectId(userId) },

            {
              $pull: { product: objectId(proId) }
            }
          )
          resolve({ removed: true })

          console.log('product  exist');


        }

      }
      else {
        console.log('new whishlist');
        let whishlist =
        {
          user: objectId(userId),
          product: [objectId(proId)]
        }

        db.get().collection(collection.WHISHLIST_COLLECTION).insertOne(whishlist)

        resolve({ status: true })
      }

    })
  },


  getWhishlistCount: (userId) => {

    return new Promise(async (resolve, reject) => {

      let count = await db.get().collection(collection.WHISHLIST_COLLECTION).findOne({ user: objectId(userId) })
      if (count) {
        resolve(count.product.length)
      }
      else {
        resolve(0)

      }


    })
  },


  getWhishlistProducts: (userId) => {

    return new Promise(async (resolve, reject) => {
      let product = await db.get().collection(collection.WHISHLIST_COLLECTION).aggregate([
        {
          $match: { user: objectId(userId) }
        },

        {
          $unwind: '$product'
        },
        {
          $lookup:
          {
            from: collection.PRODUCT_COLLECTION,
            localField: 'product',
            foreignField: '_id',
            as: 'productlist'
          }
        },
        {
          $project: { productlist: 1 }
        },
        {
          $unwind: '$productlist'
        }

      ]).toArray()
      resolve(product)
      console.log('whishlist');
      console.log(product);
    })

  },

 

  applyWallet:(data,userId)=>{
          
    let wallet = parseInt(data.wallet)
    let total =  parseInt(data.total)
    return new Promise(async(resolve,reject)=>{
      
    let user = await db.get().collection(collection.NEWUSER_COLLECTION).findOne({_id:objectId(userId)})
        if(user)
        {
          if(wallet>user.Wallet)
          {
            console.log('you dont have amount');
            resolve({walletempty:true})
          }
         
          else{
            
            db.get().collection(collection.NEWUSER_COLLECTION).updateOne({_id:user._id},
              {
                $set:{
                  Wallet:user.Wallet-wallet
                }
              }).then(()=>{
                 
                let result = 
                { 
                  newTotal : total-wallet,
                  deductedWalletAmount:wallet,

                  updatedWalletAmount:user.Wallet-wallet

                }
                console.log('resulttttttttt');
           
                console.log(result);
                resolve(result)

              })
          }
        }
    })
  }

}









