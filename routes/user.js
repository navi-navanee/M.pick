const { reject } = require('bcrypt/promises');
const { response } = require('express');
var express = require('express');
const req = require('express/lib/request');
const res = require('express/lib/response');
const async = require('hbs/lib/async');
const adminHelpers = require('../helpers/admin-helpers');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers')
const userHelpers=require('../helpers/user-helpers');
const { route } = require('./admin');
const createReferal = require("referral-code-generator");
require('dotenv').config()


//Twilio Setups
const serviceSID=process.env.SERVICE_SID
const accountSID=process.env.ACCOUNT_SID
const authToken=process.env.AUTH_TOKEN
const client=require("twilio")(accountSID,authToken)

const paypal = require('paypal-rest-sdk');

const moment=require('moment');
const { wishStatus } = require('../helpers/user-helpers');
const { getallCategory } = require('../helpers/product-helpers');

//Paypal 
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id':process.env.CLIENT_ID,
    'client_secret':process.env.CLIENT_SECRET
  });

const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', async function (req, res, next) {
  let user = req.session.user
  let today = new Date()

  let cartCount = null;
  let wishCount = null
  productHelpers.getAllProduct().then(async (products) => {
    let category=await getallCategory()

      adminHelpers.startProductOffer(today)
      adminHelpers.startCategoryOffer(today)
      adminHelpers.getAllBanner().then(async (banner) => {
        adminHelpers.startCouponOffers(today)
        adminHelpers.getAllCoupons().then(async (coupoun) => {
          let coupencode = coupoun[0]
          if (req.session.loggedIn) {
            // wite getAllproducts
            let user = req.session.user
            cartCount = await userHelpers.getCartCount(req.session.user._id)
            wishCount = await userHelpers.getWishCount(user._id)
            let output = await userHelpers.getWhish(user._id);
            let filteredProducts = await productHelpers.handleWishlist(output, products);
            products = filteredProducts
           
            res.render('user/view-products', {products, user, category, cartCount, wishCount, banner, coupencode })

          } else {

            res.render('user/view-products', {products, category, banner, coupencode })



          }

        })
      })
  
  });
})

router.get("/remove-whish/:id", verifyLogin, (req, res) => {

  let user = req.session.user;
  userHelpers.removeWhish(req.params.id, user._id).then(() => {
    res.json({ status: true });
  });
});

router.get('/login',(req,res)=>{
  adminHelpers.getAllCategory().then((category)=>{

    if(req.session.loggedIn){
      res.redirect('/')
    }else{
  
      res.render('user/login',{"loginErr":req.session.loginErr,"blkerr":req.session.blkerr,category})
      req.session.loginErr=false
    }
  })
})

//signup.................................. 


router.get('/signup',async(req,res)=>{
  let category=await getallCategory()
  let refer = (await req.query.refer) ? req.query.refer : null;
  let existUser=req.session.existUser
  res.render('user/signup',{existUser,refer,category})
  req.session.existUser=false


})

router.post('/signup',(req,res)=>{
  let refer = createReferal.alphaNumeric("uppercase", 2, 3);
  req.body.refer = refer;
 
  if (req.body.referedBy != "") {
    userHelpers
      .checkReferal(req.body.referedBy)
      .then((data) => {
        req.body.referedBy = data[0]._id;
        req.body.wallet = 100;
        userHelpers.doSignup(req.body).then((response) => {
          req.session.loggedIn = true;
          req.session.user = response.user;
          res.redirect("/");
        });
      })
      .catch(() => {
        req.session.referErr = "Sorry No such Code Exists";
        res.redirect("/signup");
      });
  } else{

    userHelpers.doSignup(req.body).then((response)=>{
      if(response.usererr){
        req.session.existUser= true;
          res.redirect('/signup');
      }else{
        res.redirect('/login')
      }
  
    })
  }
})


router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{

    if(response.status){
      if(response.user.Status){
        req.session.loggedIn=true
        req.session.user=response.user
        res.redirect('/')
      }else{
        req.session.blkerr=true;
        res.redirect('/login')
      }
    }else{
      req.session.loginErr=true
      res.redirect('/login')
    }
  })
})

router.get('/otp',async(req,res)=>{
  let category=await getallCategory()
  let noUser=req.session.noUser
  let otperr=req.session.otperr
  let userblock=req.session.adminblock
  res.render('user/otplogin',{noUser,otperr,userblock,category})
  req.session.noUser=false
  req.session.otperr=false
  req.session.userblock=false
})
//  
router.post('/otpconform',(req,res)=>{
  let num=`+91${req.body.number}`
  userHelpers.findUser(num).then((result)=>{
  if(result){
    if(result.Status){   
      client.verify
     .services(serviceSID)
     .verifications.create({
       to: `+91${req.body.number}`,
       channel:"sms"
     }).then((resp)=>{
     
       req.session.number = resp.to
     
      res.redirect('/loginconform')
     })
    }else{
      req.session.adminblock=true
      res.redirect('/otp')
    }
  }else{
    req.session.noUser=true
    res.redirect('/otp')
  }   
  })
})


router.get('/loginconform',async(req,res)=>{
  let category=await getallCategory()
  if(req.session.loggedIn){
    res.redirect('/');
  }else{
  res.render('user/loginconform',{category})
  }
})

router.post('/otpsubmit',(req,res)=>{
  let otp=req.body.otp;

 let number=req.session.number

  client.verify
  .services(serviceSID)
  .verificationChecks.create({
    to: number,
    code: otp
  }).then((resp)=>{
    if(resp.valid){
      userHelpers.getUserdetails(number).then((user) => {
        req.session.loggedIn=true;
         req.session.user=user
        res.redirect('/')
      })
    }else{
      req.session.otperr=true

      res.redirect('/otp')
    }
  })
  })
  router.get('/productdetails',async(req, res)=>{

    let category=await getallCategory()
      productHelpers.productdetails(req.query.id).then(async(products)=>{
        productHelpers.sortedproducts(req.query.name).then(async(allproducts)=>{          
        if(req.session.loggedIn){      
          let user=req.session.user
          let output = await userHelpers.getWhish(user._id);
          let filteredProducts = await productHelpers.handleWishlist(output,products);
          allwish = filteredProducts         
          cartCount= await userHelpers.getCartCount(req.session.user._id)
          res.render('user/product',{products,user,category, cartCount,allproducts})

        }else{
          res.render('user/product',{products,category,allproducts})
        }
      })
    })
 
  });

  router.get('/all-product',async(req,res)=>{

    let catname=req.query.name
    let category=await productHelpers.getallCategory()
    productHelpers.sortedproducts(req.query.name).then(async(products)=>{

      if(req.session.loggedIn){
        let user=req.session.user
        let output = await userHelpers.getWhish(user._id);
          let filteredProducts = await productHelpers.handleWishlist(output,products);
          products = filteredProducts 
          cartCount= await userHelpers.getCartCount(req.session.user._id)


          res.render('user/all-products',{user,products,category,catname, cartCount})
        }else{
          res.render('user/all-products',{products,category,catname})
        }
    })
  })

router.get('/cart',verifyLogin,async(req,res)=>{
  let user=req.session.user
  let category=await getallCategory()
  cartCount= await userHelpers.getCartCount(req.session.user._id)
  let products=await userHelpers.getCartProducts(req.session.user._id)
  let total=await userHelpers.getTotalAmount(req.session.user._id)

  if(cartCount>0)
  res.render('user/cart',{products,user,total,cartCount,category})
  else{
    res.render('user/emptyCart')
  }
})

  router.get('/addtocart',(req,res)=>{

    let user=req.session.user

    userHelpers.addToCart(req.query.id,req.session.user._id).then(()=>{
    res.json({status:true})
      //  res.redirect('/')
    })
  })

router.get('/logout',(req,res)=>{
  req.session.loggedIn=null
  req.session.user=null
  res.redirect('/otp') 
})

router.post('/change-product-quantity',(req,res,next)=>{

  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    response.total=await userHelpers.getTotalAmount(req.body.user)

    res.json(response)

  })

})

router.post("/remove-cart-product",(req,res)=>{
  userHelpers.removeCartProduct(req.body).then((response)=>{
    res.json(response)
  })
})

router.get('/place-order',verifyLogin,async(req,res)=>{
  let category=await getallCategory()
 let user=req.session.user
 let address=await userHelpers.getAllAddress(req.session.user._id)
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  let profile=await userHelpers.getProfile(req.session.user._id)
  console.log("IM THE MAIN TOTAL",total);
  res.render('user/checkout',{total,user,address,profile,category})
})

router.post('/place-order',async(req,res)=>{
  let user=req.session.user._id
  if(!req.body.addressId)
  {
    userHelpers.addaddress(user,req.body)
  }
  let products=await userHelpers.getCartProductList(req.body.userId)
    if (req.session.couponTotal || req.session.walltotel) {
    if (req.session.couponTotal) {
      var total = req.session.couponTotal;
    } else {
      var total = req.session.walltotel;
    }
  } else {
    total = await userHelpers.getTotalAmount(req.body.userId);
  }

  userHelpers.placeOrder(req.body,products,total).then((orderId)=>{
    req.session.orderId=orderId
    if(req.body['payment-method']==='COD'){
      res.json({codSuccess:true})   
    }else if(req.body['payment-method']==='RAZORPAY'){
      userHelpers.generateRazorpay(orderId,total).then((response)=>{

        res.json({...response,razorpay:true})
      })
    }else if(req.body['payment-method']==='PAYPAL'){
      val =total  / 74
      totalPrice = val.toFixed(2)
      let totals = totalPrice.toString()

      req.session.total = totals

     
      const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://mpick.shop/success",
            "cancel_url": "http://mpick.shop/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Cart items",
                    "sku": "001",
                    "price": totals,
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": totals
            },
            "description": "Hat for the best team ever"
        }]
    };
     
    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
          throw error;
      } else {
          for(let i = 0;i < payment.links.length;i++){
            if(payment.links[i].rel === 'approval_url'){
              let url = payment.links[i].href
              res.json({ url })
            }else{
    
            }
          }
      }
    });

    }
  })


})

//order succsess
router.get("/success", async(req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  let total = req.session.total
  let totals = total.toString()
  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: totals,
        },
      },
    ],
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (
    error,
    payment
  ) {
    if (error) {
 
      throw error;
    } else {

      userHelpers.changePaymentStatus(req.session.orderId).then(()=>{
      
        res.redirect('/ordersuccess')
        })
 
    }
  });
});

  

router.get('/ordersuccess',async(req,res)=>{
  let category=await getallCategory()
  let user=req.session.user
  userHelpers.clearCart(req.session.user._id).then(()=>{
  res.render('user/ordersuccess',{user,category})
})
})


router.get('/vieworder',verifyLogin,async(req,res)=>{
  let category=await getallCategory()
  let user=req.session.user
  let orders=await userHelpers.getUserOrders(req.session.user._id)
  res.render('user/view-order',{user,orders,category})
})

router.get('/myaccount',verifyLogin,async(req,res)=>{
  let user1=req.session.user._id
  cartCount= await userHelpers.getCartCount(req.session.user._id)
  let profile=await userHelpers.getProfile(req.session.user._id)

  let address=await userHelpers.getAllAddress(req.session.user._id)

  adminHelpers.getAllCategory().then(async(category)=>{
    let user = await adminHelpers.getUserdetails(user1);
    let refer=user.refer
    let wallet=user.wallet
    let referalLink = "https://mpick.shop/signup?refer="+refer



  res.render('user/myaccount',{user,profile,category,cartCount,address,referalLink})
})
})

router.get('/edit-profile',verifyLogin,async(req,res)=>{

  let category=await getallCategory()
  let user=req.session.user
  res.render('user/edit-profile',{user,category})
})

router.post('/edit-profile',(req,res)=>{
  let user=req.session.user._id
  userHelpers.updateUser(req.body,user)
    res.redirect('/myaccount')
})

router.get('/change-password',verifyLogin,async(req,res)=>{
  let category=await getallCategory()
  let user=req.session.user
let passerror=req.session.currenterror
let cuurenterror= req.session.compareerror
  res.render('user/changepassword',{user,passerror,cuurenterror,category})
  req.session.currenterror=false
  req.session.compareerror=false
})

router.post('/submit-password',verifyLogin,(req,res)=>{

  let user=req.session.user._id

  let pass1=req.body.password1
  let pass2=req.body.password2
  if(pass1==pass2){
    userHelpers.changePassword(user,req.body).then((response)=>{
      if(response.status){
        req.session.destroy()
        res.redirect("/login")
      }else{
        req.session.compareerror=true
        res.redirect('/change-password')
      }
    })
  }else{
    req.session.currenterror=true
    res.redirect('/change-password')

  }
})

router.get('/add-address',verifyLogin,async(req,res)=>{
  let category=await getallCategory()
  res.render('user/add-address',{category})
})

router.post('/submit-address',(req,res)=>{
 let user=req.session.user._id
  userHelpers.addaddress(user,req.body).then((response)=>{
    res.redirect('/myaccount')
  })
})

router.get('/edit-address',verifyLogin,async(req,res)=>{
  let category=await getallCategory()
  let user=req.session.user
  let userId=req.session.user._id

  let addressId=req.query.id

  userHelpers.getAddress(addressId,userId).then((address)=>{

    res.render('user/edit-address',{user,address,category})
  })
  
  })

  router.post('/update-address',(req,res)=>{
    let userId=req.session.user._id

    userHelpers.editAddress(req.body,userId).then((response)=>{
      res.redirect('/myaccount')
    })

  })

  router.get('/delete-address',verifyLogin,(req,res)=>{
    let user=req.session.user
    let userId=req.session.user._id

    let deleteId=req.query.id

    userHelpers.deleteAddress(userId,deleteId).then((response)=>{
      res.redirect('/myaccount')
    })
  })

  router.get('/view-order',verifyLogin,async(req,res)=>{
    let category=await getallCategory()
    let order=req.query.id
    let user=req.session.user
   let cartCount= await userHelpers.getCartCount(user._id)
    let userId=req.session.user._id
    userHelpers.viewOrder(order,userId).then((orders)=>{
      res.render('user/viewOrder',{user,orders,cartCount,category})
    })
  })

  router.post("/cancel-order",verifyLogin,(req,res)=>{
    let total = req.body.total;
    let userId = req.session.user._id;
    let paymentMethod=req.body.paymentMethod
    let status=req.body.status

    userHelpers.cancelOrder(req.body).then((response)=>{
      if (paymentMethod == "PAYPAL"||paymentMethod=="RAZORPAY") { 
        {
          if(status=='pending'){
            res.json({ status: true });
          }else{
            userHelpers.addWallet(userId,total).then(()=>{
              res.json(response)  
            })
          }
        } 
      } else{
            res.json(response)
      }
    })

  })
  router.post('/verify-payment',(req,res)=>{

    userHelpers.verifyPayment(req.body).then(()=>{
      userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{

        res.json({status:true})
      })

    }).catch((err)=>{

      res.json({status:false,errMsg:''})
    })
  })
  

  router.get('/wishlist',verifyLogin,async(req,res)=>{
    let category=await getallCategory()
    user=req.session.user._id
    cartCount= await userHelpers.getCartCount(req.session.user._id)
    let product=await userHelpers.getWishlistProducts(user)
    res.render('user/wishlist',{user:req.session.user,product,cartCount,category})
  })

  router.get('/addtowishlist',(req,res)=>{

    userHelpers.addtowishlist(req.query.id,req.session.user._id).then((response)=>{
      res.json(response)

    })
  })

  router.post("/remove-wishList-product",(req,res)=>{
    userHelpers.removeWishlist(req.body).then((response)=>{
      res.json(response)
    })
  })

  router.post("/couponApply", (req, res) => {
    let id = req.session.user._id;

    userHelpers.couponValidate(req.body, id).then((response) => {

      req.session.couponTotal = response.total;
      if (response.success) {
        let mainTotal=response.mainTotal
        res.json({ couponSuccess: true, total: response.total,mainTotal });
      } else if (response.couponUsed) {
        res.json({ couponUsed: true });
      } else if (response.couponExpired) {
        res.json({ couponExpired: true });
      } else {
        res.json({ invalidCoupon: true });
      }
    });
  });


  //applay the wallet 
  
router.post("/applayWallet", async (req, res) => {
  var user = req.session.user._id;
  let ttl = parseInt(req.body.Total);
  let walletAmount = parseInt(req.body.wallet);
  let userDetails = await adminHelpers.getUserdetails(user);
  if (userDetails.wallet >= walletAmount) {
    let total = ttl - walletAmount;
    
    req.session.walltotel=total;
    userHelpers.applayWallet(walletAmount,user).then(() => {
      res.json({ walletSuccess: true, total});
      console.log("IM current",total);
    });
  } else {
    res.json({ valnotCurrect: true });
  }
});
  

// search section

router.post("/getProduct", async (req, res) => {
  let payload = req.body.payload;
  let search = await userHelpers.searchProduct(payload);
  search = search.slice(0, 10);
  res.send({ payload: search });
});


router.get('/contact',async(req,res)=>{
  let category=await getallCategory()
  res.render('user/contact',{category})
})






module.exports = router;
