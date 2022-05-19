var db = require('../config/connection ')
// var collection=require('../config/collections')
const bcrypt = require('bcrypt')
const { promise, reject } = require('bcrypt/promises')
const async = require('hbs/lib/async')
const collections = require('../config/collections')
const { status } = require('express/lib/response')
const res = require('express/lib/response')
const req = require('express/lib/request')
const { CATEGORY_COLLECTION } = require('../config/collections')
var objectId = require('mongodb').ObjectId
const Razorpay = require('razorpay')
const { resolve } = require('path')
var instance = new Razorpay({
    key_id: 'rzp_test_azCUmSfuOkd3GM',
    key_secret: '6jGwaO3CeAqX1M65L6ob37UM',
});
const paypal = require('paypal-rest-sdk');
const moment=require('moment')

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AUzd_MTKZTiVFtCqwNa8KOZd1L6m3AVmtJDQtHfb0qyByE0x6kXhGI3U94ecppjaR9LxQeOK6PlHciB2',
    'client_secret': 'EE_p_qQvcH4hoBG2be-HrHzLhj-7pZ92lVT7RYVeYP6juIY-PPU0EkpLdj5yPu7tf1O4UYarskgE5zAx'
  });

module.exports = {
    doSignup: (userData) => {
        console.log("IM data...",userData);
        return new Promise(async (resolve, reject) => {
            if (userData.wallet) {
                let mainUser=await db.get().collection(collections.USER_COLLECTION).findOne({_id:userData.referedBy})
                if(mainUser.wallet<200){
                  await db.get().collection(collections.USER_COLLECTION).updateOne({ _id: userData.referedBy }, { $inc: { wallet: 50 } });
                }
              }
            userData.wallet = userData.wallet ? userData.wallet : 0;

            let phoneext= `+91${userData.Phonenumber}`;
            let response={};
            userData.Password = await bcrypt.hash(userData.Password, 10)
            user = {
                Name: userData.Name,
                Email: userData.Email,
                Phonenumber: `+91${userData.Phonenumber}`,
                Password: userData.Password,
                Status: true,
                wallet:userData.wallet,
                referedBy:userData.referedBy,
                refer:userData.refer
            }
             //check the user exist
             let userexst= await db.get().collection(collections.USER_COLLECTION).findOne({"$or":[{Email: userData.Email},{Phonenumber: phoneext} ] });
             if (userexst) {
                 response.usererr=true;
                 console.log(userexst);
                 resolve(response)
                 
             }else{
             db.get().collection(collections.USER_COLLECTION).insertOne(user).then(async(data)=>{
                 let user = await db.get().collection(collections.USER_COLLECTION).findOne({ _id:data.insertedId });
                   response.user = user;
                 resolve(response)
             })
             }
        })
    },
          // Chech the referal Code
          checkReferal: (referal) => {
            return new Promise(async (res, rej) => {
              let refer = await db.get().collection(collections.USER_COLLECTION).find({ refer: referal}).toArray();
              if(refer){
                  res(refer)
              }else{
                  res(err)
              }
            });
          },


    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({ Email: userData.Email })
            if (user) {
                bcrypt.compare(userData.Password, user.Password).then((status) => {

                    if (status) {
                        console.log("login success");
                        response.user = user
                        response.status = true
                        resolve(response)
                        console.log(response);
                    } else {
                        console.log("login failed");
                        resolve({ status: false })
                    }

                })
            } else {
                console.log('login failed');
                resolve({ status: false })
            }
        })
    },
    getAllusers: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collections.USER_COLLECTION).find().toArray()

            resolve(users)

        })

    },

    getUserdetails: (num) => {
        return new Promise(async (res, rej) => {
            let users = await db.get().collection(collections.USER_COLLECTION).findOne({ Phonenumber: num })
            res(users)
        })


    },
    findUser: (num) => {

        return new Promise((res, rej) => {
            db.get().collection(collections.USER_COLLECTION).findOne({ Phonenumber: num }).then((user) => {

                res(user)
            })
        })
    },
    addToCart: (proId, userId) => {
        let proObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                console.log(proExist);
                if (proExist != -1) {
                    db.get().collection(collections.CART_COLLECTION)
                        .updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }
                        ).then(() => {
                            resolve()

                        })

                } else {

                    db.get().collection(collections.CART_COLLECTION)
                        .updateOne({ user: objectId(userId) },
                            {
                                $push: { products: proObj }

                            }).then((response) => {
                                resolve()
                            })
                }

            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collections.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()

                })
            }

        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collections.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()
            console.log(cartItems[0]?.products);
            resolve(cartItems)
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    },
    changeProductQuantity: (details) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        console.log("helooo");
        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collections.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart) },
                        {
                            $pull: { products: { item: objectId(details.product) } }
                        }).then((response) => {
                            resolve({ removeProduct: true })
                        })
            } else {
                db.get().collection(collections.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
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

    removeCartProduct: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CART_COLLECTION)
                .updateOne({ _id: objectId(details.cart) },
                    {
                        $pull: { products: { item: objectId(details.product) } }
                    }).then((response) => {
                        resolve({ removeProduct: true })
                    })
        })
    },



    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collections.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }, {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: [{ '$toInt': '$quantity' }, { '$toInt': '$product.Price' }] } }
                    }
                }

            ]).toArray()
            resolve(total[0]?.total)
        })
    },
    placeOrder: (order, products, total) => {
        return new Promise((resolve, reject) => {
            console.log("mmmmmmmmmmmmm",order, products, total);
            let dat=moment(new Date()).format('YYYY/MM/DD')
            let status = order['payment-method'] === 'COD' ? 'placed' : 'pending'
            let orderObj = {
                deliveryDetails: {
                    mobile: order.phone,
                    address: order.address,
                    town: order.town,
                    pincode: order.pincode
                },
                userId: objectId(order.userId),
                paymentMethod: order['payment-method'],
                products: products,
                totalAmount: total,
                offerapply:order.walletAmount,
                coupenAmount:order.coupondiscount,
                status: status,
                date: dat
            }

            db.get().collection(collections.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                console.log("order id:", response.insertedId);
                resolve(response.insertedId)
            })

        })

    },
    clearCart: (User) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CART_COLLECTION).deleteOne({ user: objectId(User) }).then(() => {
                resolve()
            })
        })
    },


    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })
            resolve(cart?.products)
        })
    },
    getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collections.ORDER_COLLECTION)
                .find({ userId: objectId(userId) }).sort({$natural:-1}).toArray()
            console.log(orders)
            resolve(orders)
        })
    },

    getProfile: (userId) => {
        return new Promise(async (resolve, reject) => {
            let profile = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: objectId(userId) })
            resolve(profile)
        })
    },
    updateUser: (data, userId) => {
        return new Promise(() => {
            return new Promise((resolve, reject) => {
                db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) }, {
                    $set: {
                        Name: data.Name,
                        Email: data.Email,
                        Phonenumber: `+91${data.Phonenumber}`,
                    }
                }).then((response) => {
                    resolve(response)

                }).catch((response) => {

                    resolve(error)
                })
            })
        })
    },
    changePassword: (userId, details) => {
        return new Promise(async (resolve, reject) => {
            console.log("calleddd");
            console.log(userId);
            console.log(details);
            let response = {}
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: objectId(userId) })
            if (user) {
                data1 = await bcrypt.hash(details.password1, 10)
                bcrypt.compare(details.password, user.Password).then((status) => {
                    console.log(user.Password);
                    console.log(data1);
                    if (status) {
                        console.log("matchingg");
                        response.status = true
                        db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) },
                            {
                                $set: {
                                    Password: data1
                                }
                            }).then(() => {
                                resolve(response)
                            })
                    } else {
                        console.log("password not matching");
                        response.status = false
                        resolve(response)
                    }
                })
            }

        })
    },
    addaddress: (userId, details) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: objectId(userId) })
            console.log(user);
            if (user) {
                details._id = objectId()
                if (user.address) {
                    db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) },
                        {
                            $push: { address: details }
                        }).then((response) => {
                            resolve(response)
                        })

                } else {
                    let add = [details]
                    db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) },
                        {
                            $set: {
                                address: add
                            }
                        }).then((response) => {
                            resolve(response)
                        })
                }
            }
        })
    },
    getAllAddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: objectId(userId) })
            let address = user.address
            resolve(address)
        })
    },
    getAddress: (addId, userId) => {
        return new Promise(async (resolve, reject) => {
            let address = await db.get().collection(collections.USER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(userId) }
                },
                {
                    $unwind: '$address'
                },
                {
                    $match: { 'address._id': objectId(addId) }
                },
                {
                    $project: {
                        address: 1, _id: 0
                    }
                }
            ]).toArray()
            resolve(address[0].address)

        })

    },
    editAddress: (updateData, userId) => {
        console.log("heloo");
        console.log(updateData.id);
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId), "address._id": objectId(updateData.id) }, {
                $set: {
                    "address.$.name": updateData.name,
                    "address.$.address": updateData.address,
                    "address.$.town": updateData.town,
                    "address.$.pincode": updateData.pincode,
                    "address.$.phone": updateData.phone,
                    "address.$.email": updateData.email,
                }
            }).then((response) => {
                res((response))
            }).catch((err) => {
                resolve(err)
            })
        })
    },
    deleteAddress: (userId, deleteId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) },
                {
                    $pull: { "address": { _id: objectId(deleteId) } }
                }).then((response) => {
                    resolve(response)
                }).catch((err) => {
                    resolve(err)
                })

        })

    },

    viewOrder: (order, userId) => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(order) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },

            ]).toArray()
            console.log("BOss",product);
            resolve(product)

        })
    },
    cancelOrder: (body) => {
        let orderId = body.orderId
        let userId = body.userId
        console.log(orderId);
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, {
                $set: {
                    status: "canceled",
                    cancel: true
                }
            }).then((response) => {
                console.log("cancelled");
                resolve({ cancelOrder: true })

            }).catch((response) => {

                resolve(error)
            })
        })
    },

    generateRazorpay: (orderId, total) => {
        console.log(total);
        console.log("heiii");
        console.log(orderId);
        return new Promise((resolve, reject) => {
            var options = {
                amount: total*100,
                currency: "INR",
                receipt: "" + orderId
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err);
                } else {

                    console.log("New Order :", order.amount);
                    resolve(order)

                }
            })

        })
    },
    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto')
            let hmac = crypto.createHmac('sha256', '6jGwaO3CeAqX1M65L6ob37UM');

            hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
            hmac=hmac.digest('hex')
            if(hmac==details['payment[razorpay_signature]']){
                resolve()
            }else{
                reject()
            }
        })
    },
    changePaymentStatus:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.ORDER_COLLECTION)
            .updateOne({_id:objectId(orderId)},
            {
                $set:{
                    status:'placed'
                }
            }).then(()=>{
                    resolve()
            })
        })
    },
    addToCart: (proId, userId) => {
        let proObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                console.log(proExist);
                if (proExist != -1) {
                    db.get().collection(collections.CART_COLLECTION)
                        .updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }
                        ).then(() => {
                            resolve()

                        })

                } else {

                    db.get().collection(collections.CART_COLLECTION)
                        .updateOne({ user: objectId(userId) },
                            {
                                $push: { products: proObj }

                            }).then((response) => {
                                resolve()
                            })
                }

            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collections.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()

                })
            }

        })
    },

    removeWhish:(proId,userId)=>{
        return new Promise((resolve, reject) => {
            db.get()
              .collection(collections.WISHLIST_COLLECTION)
              .updateOne(
                  {user : objectId(userId)},
                 { $pull : { product: { item: objectId(proId)}}}                
               )
              .then(() => {
                resolve();
              });
          });
    },
    
    addtowishlist:(proId,userId)=>{
        let proObj = {
            item: objectId(proId),
            user:userId,
            status:true
        }
        return new Promise(async(resolve,reject)=>{
            let wishlist=await db.get().collection(collections.WISHLIST_COLLECTION).findOne({user:objectId(userId)})
            if(wishlist){
               let proExist=wishlist.product.findIndex(e=> e.item == proId)
               console.log("Helloo",proExist);
               if (proExist!=-1){
                    resolve({status:false})

               }else{
                   db.get().collection(collections.WISHLIST_COLLECTION).updateOne({user:objectId(userId)},
                   {
                       $push: { product: proObj }
                   }).then((response)=>{
                    resolve({status:true})
                   })
               }

            }else{
                let wishObj = {
                    user: objectId(userId),
                    product: [proObj]
                }
                db.get().collection(collections.WISHLIST_COLLECTION).insertOne(wishObj).then((response)=>{
                    resolve({ status:true })
                })
            }
        })
    },
    getWishlistProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let wishlistItems = await db.get().collection(collections.WISHLIST_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        item: '$product.item',
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()
            resolve((wishlistItems))
        })
    },

    removeWishlist: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.WISHLIST_COLLECTION)
                .updateOne({ _id: objectId(details.wish) },
                    {
                        $pull: { product: { item: objectId(details.product) } }
                    }).then((response) => {
                        resolve({ removeProduct: true })
                    })
        })
    },
    getWishCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collections.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart.product.length
            }
            resolve(count)
        })
    },
    wishStatus:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let status=await db.get().collection(collections.WISHLIST_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$product'
                },
                {
                    $project:{
                        item: '$product.item',
                        status:'$product.status'
                    }
                }
            ]).toArray()
            console.log("HEIIIIIII",status);
            resolve(status)
        })

    },
    getWhish:(userId)=>{
        return new Promise((res,rej)=>{
            db.get().collection(collections.WISHLIST_COLLECTION).findOne({user:objectId(userId)}).then((output)=>{
               res(output) 
            })  
        })
    },

    couponValidate: (data, user) => {
        console.log("im dataaa",data);
        return new Promise(async(res,rej)=>{
            obj = {}
                let date=new Date()
                date=moment(date).format('YYYY-MM-DD')
                let coupon= await db.get().collection(collections.COUPON_COLLECTION).findOne({Coupon:data.Coupon,Available:true})
                console.log("imcoupennnn...",coupon);
                if(coupon){
                        let users = coupon.Users
                        let userChecker = users.includes(user)
                        if(userChecker){
                            obj.couponUsed=true;
                            res(obj)
                        }else{
                            if(date <= coupon.endDate){
                                let total = parseInt(data.Total)
                                let percentage = parseInt(coupon.Offer)
                                let discountVal = ((total * percentage)/100).toFixed()
                                obj.total = total - discountVal
                                obj.success = true
                                obj.discountVal=discountVal
                                obj.mainTotal=total
                                console.log(percentage);
                                console.log(discountVal);
                                console.log( obj.total);
                                db.get().collection(collections.COUPON_COLLECTION).updateOne({_id:objectId(coupon._id)},
                                {
                                    $push:{Users:user}
                                }).then((response)=>{

                                    res(obj)
                                })
                            }else{
                                obj.couponExpired = true
                                  console.log("Expired");
                                   res(obj)
                            }
                        }
                    }else{
                        obj.invalidCoupon = true
                        console.log("invalid");
                        res(obj)

                    }   
             })
        },
//  add to wallet

        addWallet:(userId,total)=>{
            let Total=parseInt(total)
            console.log("HELOOOO....",Total,userId);
            return new Promise((res,rej)=>{
                db.get().collection(collections.USER_COLLECTION).updateOne({_id:objectId(userId)},{ $inc: { wallet: Total } }).then((response)=>{
                    console.log("response",response);
                    res(response)
                })
            })

        },

        applayWallet:(val,userId)=>{
            let value=parseInt(val)
          return new Promise((res,rej)=>{
              db.get().collection(collections.USER_COLLECTION).updateOne({_id:objectId(userId)},{$inc:{ wallet:-value }}).then((response)=>{
                  res(response)
          })
          }) 
      },

    //   search product

      searchProduct:(name)=>{
        return new Promise(async(res,rej)=>{
            let search= await db.get().collection(collections.PRODUCT_COLLECTION).find({Name:{$regex:new RegExp('^'+name+'.*','i')}}).toArray();
            console.log("product",search);
            res(search)
        })

    },







}

    



