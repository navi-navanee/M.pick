const { response } = require('express');
var express = require('express');
const res = require('express/lib/response');
const async = require('hbs/lib/async');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers')
var adminHelpers = require('../helpers/admin-helpers')
const userHelpers = require('../helpers/user-helpers');
const req = require('express/lib/request');
const { Db } = require('mongodb');


const verifyAdminLogin = (req, res, next) => {
  if (req.session.adminloggedIn) {
    next()
  } else {
    res.render('admin/adminlogin', { unKnown: true })
  }
}


/* GET users listing. */
router.get('/', verifyAdminLogin, function (req, res) {
  console.log("heloooo");
  adminHelpers.dashboard().then((data) => {
    console.log(data.cod);

    res.render('admin/dashboard', { admin: true, data })
  })
});

router.get('/admin-login', verifyAdminLogin, (req, res) => {


  res.redirect('/admin/dashboard')

})

router.get('/dashboard', (req, res) => {
  if (req.session.adminloggedIn) {
    console.log("helo");
    adminHelpers.dashboard().then((data) => {

      res.render('admin/dashboard', { admin: true, data })
    })

  }
  else {
    res.redirect('/admin/admin-login')
  }
})

router.get('/products', verifyAdminLogin, (req, res) => {
  let admin = req.session.admin
  productHelpers.getAllProduct().then((products) => {
    res.render('admin/view-products', { admin: true, products })
  })
})

router.post('/admin-login', (req, res) => {
  adminHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.adminloggedIn = true
      req.session.admin = response.admin
      res.redirect('/admin/dashboard')
    } else {
      req.session.loginErr = true
      res.redirect('/admin')
    }
  })
})

router.get('/view-users', verifyAdminLogin, (req, res) => {
  userHelpers.getAllusers().then((users) => {
    console.log(users);
    res.render('admin/view-users', { admin: true, users })

  })
})



router.get('/add-product', verifyAdminLogin, function (req, res) {
  productHelpers.getallCategory().then((Category) => {
    console.log(Category);
    res.render('admin/add-product', { admin: true, Category })
  })
})

router.post('/add-product', verifyAdminLogin, (req, res) => {
  console.log(req.body);
  console.log(req.files.Image);
  productHelpers.addProduct(req.body, (id) => {
    // img-1
    if (req.files?.image1) {
      let image = req.files?.image1
      image.mv('./public/product-images/' + id + '.jpg')

    }
    if (req.files?.image2) {
      let image = req.files?.image2
      image.mv('./public/product-images/' + id + 'a.jpg')

    }
    if (req.files?.image3) {
      let image = req.files?.image3
      image.mv('./public/product-images/' + id + 'b.jpg')

    }
    if (req.files?.image4) {
      let image = req.files?.image4
      image.mv('./public/product-images/' + id + 'c.jpg')

    }

    res.redirect('/admin/products')



  })
})
router.get('/delete-product/:id', verifyAdminLogin, (req, res) => {
  let proId = req.params.id
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect('/admin/products')
  })

})

router.get('/edit-product/:id', verifyAdminLogin, async (req, res) => {
  productHelpers.getallCategory().then(async (Category) => {

    let product = await productHelpers.getProductDetails(req.params.id)
    console.log(product);
    res.render('admin/edit-product', { admin: true, product, Category })
  })
})
router.post('/edit-product/:id', verifyAdminLogin, (req, res) => {
  console.log(req.params.id);
  let id = req.params.id
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    
    if (req.files?.image1) {
      let image = req.files?.image1
      image.mv('./public/product-images/' + id + '.jpg')

    }
    if (req.files?.image2) {
      let image = req.files?.image2
      image.mv('./public/product-images/' + id + 'a.jpg')

    }
    if (req.files?.image3) {
      let image = req.files?.image3
      image.mv('./public/product-images/' + id + 'b.jpg')

    }
    if (req.files?.image4) {
      let image = req.files?.image4
      image.mv('./public/product-images/' + id + 'c.jpg')

    }
    res.redirect('/admin/products')
  })
})
router.get('/add-user', verifyAdminLogin, (req, res) => {
  res.render('admin/add-user', { admin: true })
})
router.post('/adminadduser', verifyAdminLogin, (req, res) => {
  userHelpers.doSignup(req.body).then(() => {
    res.redirect('/admin/view-users')
  })
})

router.get('/logout', (req, res) => {
  req.session.adminloggedIn = null;
  res.redirect('/admin')
})

router.get('/blockuser/:id', verifyAdminLogin, (req, res) => {
  let userId = req.params.id
  console.log(userId);
  adminHelpers.blockusers(userId).then(() => {
    res.redirect('/admin/view-users')
  })

})


router.get('/unblockuser/:id', verifyAdminLogin, (req, res) => {
  let userId = req.params.id
  console.log(userId);
  adminHelpers.unblockusers(userId).then(() => {
    res.redirect('/admin/view-users')
  })

})
router.get('/deleteuser/:id', verifyAdminLogin, (req, res) => {
  let userId = req.params.id
  adminHelpers.deleteusers(userId).then(() => {
    res.redirect('/admin/view-users')
  })
})

router.get('/view-category', verifyAdminLogin, (req, res) => {
  adminHelpers.getAllCategory().then((category) => {
    res.render('admin/view-category', { admin: true, category })
  })
})

router.get('/add-category', verifyAdminLogin, (req, res) => {
  res.render('admin/add-category', { admin: true })
})

router.post('/add-category', (req, res) => {
  console.log(req.body);
  adminHelpers.addCategory(req.body).then(() => {
    res.redirect('/admin/view-category')
  })
})

router.get('/delete-category/:id', verifyAdminLogin, (req, res) => {
  let proId = req.params.id
  adminHelpers.deleteCategory(proId).then((response) => {
    res.redirect('/admin/view-category')
  })
})

router.get('/edit-category/:id', verifyAdminLogin, async (req, res) => {
  let category = await adminHelpers.getCategoryDetails(req.params.id)
  console.log(category);
  res.render('admin/edit-category', { admin: true, category })
})
router.post('/edit-category/', verifyAdminLogin, (req, res) => {
  console.log(req.query.catname);
  let id = req.query.id
  let cat = req.query.catname
  let newcat = req.body.Name
  console.log(newcat);
  adminHelpers.updateCategory(id, req.body).then((newCat) => {
    adminHelpers.findProductsCat(cat, newcat).then((response) => {
      res.redirect('/admin/view-category')
    })
  })
})

router.get('/view-order', verifyAdminLogin, (req, res) => {
  adminHelpers.getallOrders().then((orders) => {

    res.render('admin/view-order', { admin: true, orders })
  })
})

//order status section

router.get('/placedOrder', verifyAdminLogin, (req, res) => {
  console.log(req.query.id);
  console.log(req.query.name);
  let status = req.query.name;
  if (status == "placed") {
    adminHelpers.updatestatus(req.query.id, status).then((resp) => {
      res.redirect('/admin/view-order')
    })

  } else if (status == "canceled") {
    adminHelpers.updatestatus(req.query.id, status).then((resp) => {
      res.redirect('/admin/view-order')
    })
  } else if (status == "shipped") {
    adminHelpers.updatestatus(req.query.id, status).then((resp) => {
      res.redirect('/admin/view-order')
    })

  } else if (status == "delivered") {
    adminHelpers.updatestatus(req.query.id, status).then((resp) => {
      res.redirect('/admin/view-order')
    })

  }
})

router.get('/salesreport', verifyAdminLogin, (req, res) => {
  adminHelpers.getallOrders().then((orders) => {
    adminHelpers.dashboard().then((data) => {
      console.log("dataaaa....",data);
      res.render('admin/salesreport', {admin:true, orders, data })
    })

  })
})

router.post('/salesreport', (req, res) => {
  console.log(req.body);
  adminHelpers.getallOrders().then((orders) => {
    adminHelpers.salesreport(req.body).then((data) => {
      res.render('admin/salesreport', { admin: true, orders, data })

    })
  })

})

// Product Offer  segment

router.get('/productOffer-view', verifyAdminLogin, (req, res) => {
  adminHelpers.getAllProductOffers().then((proOffer) => {
    res.render('admin/productOffer-view', { admin: true, proOffer })
  })
})

router.get('/productOffer-add', verifyAdminLogin, (req, res) => {
  adminHelpers.getAllProduct().then((products) => {

    res.render('admin/productOffer-add', { admin: true, products })
  })
})

router.post('/productOffers-add', (req, res) => {
  adminHelpers.addProductOffer(req.body).then((response) => {
    if (response.exist) {
      req.session.proOfferExist = true
      res.redirect("/admin/productOffer-view")
    } else {
      res.redirect("/admin/productOffer-view")
    }
  })
})

router.get('/delete-productOffer', (req, res) => {
  console.log("deleated", req.query.id);
  adminHelpers.deleteProductOffer(req.query.id).then(() => {
    res.redirect("/admin/productOffer-view")

  })
})

//category offer 


router.get('/categoryOffer-view', verifyAdminLogin, (req, res) => {
  adminHelpers.getAllCategoryOffers().then((categoryOffer) => {
    res.render('admin/categoryOffer-view', { admin: true, categoryOffer })
  })
})

router.get('/categoryOffer-add', verifyAdminLogin, (req, res) => {
  adminHelpers.getAllCategory().then((category) => {
    res.render('admin/categoryOffer-add', { admin: true, category })
  })
})

router.post("/categoryOffer-add", (req, res) => {
  adminHelpers.addCategoryOffer(req.body).then(() => {
    res.redirect("/admin/categoryOffer-view");
  });
});

// deleat category offer

router.get("/delete-categoryOffer", (req, res) => {
  console.log("the id", req.query.id);
  adminHelpers.deleteCategoryOffer(req.query.id).then((response) => {
    res.redirect("/admin/categoryOffer-view");
  });
});

// Banner managment

router.get('/banner-view', verifyAdminLogin, (req, res) => {
  adminHelpers.getAllBanner().then((banner) => {
    res.render('admin/banner-view', { admin: true, banner })
  })
})


router.get('/banner-add', verifyAdminLogin, (req, res) => {
  adminHelpers.getAllCategory().then((category) => {
    res.render('admin/banner-add', { admin: true, category })
  })
})

router.post('/banner-add', (req, res) => {
  console.log("Heloooo", req.body);
  console.log(req.files.image);
  adminHelpers.addBanner(req.body).then((id) => {

    if (req.files?.image) {
      let image = req.files?.image
      image.mv('./public/banner-images/' + id + '.jpg')
    }
    res.redirect('/admin/banner-view')
  })
})


router.get("/banner-delete", (req, res) => {
  console.log("the id", req.query.id);
  adminHelpers.deleteBanner(req.query.id).then((response) => {
    res.redirect("/admin/banner-view");
  });
});

// coupen managment

router.get('/coupon-view', verifyAdminLogin, (req, res) => {
  adminHelpers.getAllCoupons().then((coupon) => {
    res.render('admin/coupon-view', {admin:true,coupon})
  })
})


router.get('/coupon-add', verifyAdminLogin, (req, res) => {
  res.render('admin/coupon-add',{ admin:true,})
})

router.post("/coupon-add", (req, res) => {
  console.log("my body is ",req.body);
  adminHelpers.addCoupon(req.body).then(() => {
    res.redirect('/admin/coupon-view');
  });
});

router.get("/delete-coupon", (req, res) => {
  adminHelpers.deleteCoupon(req.query.id).then(() => {
    res.redirect("/admin/coupon-view");
  });
});















module.exports = router; 
