// Encryption: Bycrypt-Salting
// Including necessary modules
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
var path = require("path");
var mysql = require("mysql");
const { connected } = require("process");

let time = Date.now();
let date_time = new Date(time);
let date = date_time.getDate();
let month = date_time.getMonth() + 1;
let year = date_time.getFullYear();
let todayDate = "'" + year + "-" + month + "-" + date + "'";

// Connecting MySQL
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "pavilion",
  database: "SUPERMART",
  insecureAuth: true,
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("MySQL Connected!");
});

// Basic requirements
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// ----------------------------------------------------------------------------------------

// Get - Home/Dashboard
app.get("/", function (req, res) {
  var totalQuery = "SELECT SUM(AMOUNT) AS TOTAL_SALE FROM ORDERS;";
  var numQuery = "SELECT COUNT(ORDER_ID) AS COUNT_SALE FROM ORDERS;";
  var avgQuery = "SELECT AVG(AMOUNT) AS AVG_SALE FROM ORDERS;";
  var profitQuery = "SELECT SUM(PROFIT) AS TOTAL_PROFIT FROM SALES;";
  var productQuery = "SELECT COUNT(PRODUCT_ID) AS COUNT_PROFIT FROM PRODUCT;";
  var categoryQuery =
    "SELECT COUNT(CATEGORY_ID) AS COUNT_CATEGORY FROM CATEGORY;";

  connection.query(totalQuery, function (err, totalData, fields) {
    if (err) throw err;
    var total = totalData[0].TOTAL_SALE;
    connection.query(numQuery, function (err, numData, fields) {
      if (err) throw err;
      var num = numData[0].COUNT_SALE;
      connection.query(avgQuery, function (err, avgData, fields) {
        if (err) throw err;
        var avg = avgData[0].AVG_SALE;
        connection.query(profitQuery, function (err, profitData, fields) {
          if (err) throw err;
          var profit = profitData[0].TOTAL_PROFIT;
          connection.query(productQuery, function (err, productData, fields) {
            if (err) throw err;
            var products = productData[0].COUNT_PROFIT;
            connection.query(
              categoryQuery,
              function (err, categoryData, fields) {
                if (err) throw err;
                var category = categoryData[0].COUNT_CATEGORY;

                res.render("dashboard", {
                  title: "Dashboard",
                  avg: avg,
                  num: num,
                  total: total,
                  profit: profit,
                  products: products,
                  category: category,
                });
              }
            );
          });
        });
      });
    });
  });
});

// ----------------------------------------------------------------------------------------

// Get - Register
app.get("/register", function (req, res) {
  res.render("register", { title: "Register" });
});

// Post - Register
app.post("/register", function (req, res) {
  connection.query(
    "INSERT INTO CREDENTIALS VALUES (?);",
    [[req.body.username, req.body.password]],
    function (error, result, fields) {
      if (error) throw error;
      console.log("Inserted Data!");
    }
  );
  res.redirect("login");
});

// ----------------------------------------------------------------------------------------

// Get - Login
app.get("/login", function (req, res) {
  res.render("login", { title: "Login" });
});

// Post - Login
app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  connection.query(
    'SELECT password from credentials where username = "' + username + '"',
    function (error, results, fields) {
      if (error) throw error;

      if (results[0].password == password) {
        console.log("Succesfully Logged In!");
        res.redirect("/");
      } else {
        console.log("Incorrect Password");
        res.redirect("login");
      }
    }
  );
});

// ----------------------------------------------------------------------------------------

// Get - Sales
app.get("/sales", function (req, res) {
  var sql = "SELECT * FROM sales ORDER BY PRODUCT_ID";
  connection.query(sql, function (err, salesData, fields) {
    if (err) throw err;
    res.render("sales", { title: "Sales", salesData: salesData });
  });
});

// ----------------------------------------------------------------------------------------

// Products
// Get - Products
app.get("/products", function (req, res) {
  var sql = "SELECT * FROM product ORDER BY PRODUCT_ID";
  connection.query(sql, function (err, productData, fields) {
    if (err) throw err;
    res.render("products", { title: "Products", productData: productData });
  });
});

// Get - New Product
app.get("/new-product", function (req, res) {
  res.render("newProduct", { title: "Product Registration" });
});

// Get - Delete Products
app.get("/products/delete/:deleteId", function (req, res) {
  var sql = "DELETE FROM product WHERE PRODUCT_ID = ?";
  connection.query(sql, [req.params.deleteId], function (err, data) {
    if (err) throw err;
    console.log(data.affectedRows + " record(s) deleted");
    res.redirect("/products");
  });
});

// Get - Edit Products
app.get("/edit-product/:productId", function (req, res) {
  res.render("editProduct", {
    title: "Edit Product",
    productId: req.params.productId,
  });
});

// Post - Edit Products
app.post("/editProduct", function (req, res) {
  var editedName = req.body.editedName;
  var editedCategory = req.body.editedCategory;
  var editedCostPrice = req.body.editedCostPrice;
  var editedSellingPrice = req.body.editedSellingPrice;
  var editedStock = req.body.editedStock;
  var id = req.body.productId;
  console.log(
    req.body.editedName,
    req.body.editedCategory,
    req.body.editedCostPrice,
    req.body.editedSellingPrice,
    req.body.editedStock,
    req.body.productId
  );
  var sql =
    "UPDATE PRODUCT SET PRODUCT_NAME = ?, CATEGORY_ID = ?, COST_PRICE = " +
    editedCostPrice +
    " ,SELLING_PRICE = " +
    editedSellingPrice +
    " ,STOCK = " +
    editedStock +
    " WHERE PRODUCT_ID = ?;";
  connection.query(sql, [editedName, editedCategory, id], function (err, data) {
    if (err) throw err;
    console.log(data.affectedRows + " record(s) updated");
    res.redirect("/products");
  });
});

// Post - New Product
app.post("/newProduct", function (req, res) {
  var productName = req.body.productName;
  var productCategory = req.body.productCategory;
  var productCostPrice = req.body.productCostPrice;
  var productSellingPrice = req.body.productSellingPrice;
  var productStock = req.body.productStock;
  var id = req.body.productId;

  var sql =
    "INSERT INTO PRODUCT VALUES (?, ?, ? , " +
    productCostPrice +
    ", " +
    productSellingPrice +
    ", " +
    productStock +
    ");";
  connection.query(
    sql,
    [id, productName, productCategory],
    function (err, data) {
      if (err) throw err;
      console.log(data.affectedRows + " record(s) updated");
      res.redirect("/products");
    }
  );
});

// ----------------------------------------------------------------------------------------

// Employee
// Get - Employee
app.get("/sellers", function (req, res) {
  var sql = "SELECT * FROM EMPLOYEE ORDER BY EMP_ID";
  connection.query(sql, function (err, sellerData, fields) {
    if (err) throw err;
    res.render("sellers", { title: "Sellers", sellerData: sellerData });
  });
});

// Get - New Employee
app.get("/new-seller", function (req, res) {
  res.render("newSeller", { title: "Employee Registration" });
});

// Get - Delete Employee
app.get("/sellers/delete/:deleteId", function (req, res) {
  var sql = "DELETE FROM EMPLOYEE WHERE EMP_ID = ?";
  connection.query(sql, [req.params.deleteId], function (err, data) {
    if (err) throw err;
    console.log(data.affectedRows + " record(s) deleted");
    res.redirect("/sellers");
  });
});

// Get - Edit Employee
app.get("/edit-seller/:sellerId", function (req, res) {
  res.render("editSeller", {
    title: "Edit Employee",
    sellerId: req.params.sellerId,
  });
});

// Post - Edit Employee
app.post("/editSeller", function (req, res) {
  var empId = req.body.empId;
  var empFName = req.body.empFName;
  var empLName = req.body.empLName;
  var empSal = req.body.empSal;
  var empGender = req.body.empGender;

  var sql =
    "UPDATE EMPLOYEE SET FIRST_NAME = ?, LAST_NAME = ?, EMP_GENDER = ?, EMP_SALARY = " +
    empSal +
    " WHERE EMP_ID = ?;";
  connection.query(
    sql,
    [empFName, empLName, empGender, empId],
    function (err, data) {
      if (err) throw err;
      console.log(data.affectedRows + " record(s) updated");
      res.redirect("/sellers");
    }
  );
});

// Post - New Employee
app.post("/newSeller", function (req, res) {
  var empId = req.body.empId;
  var empFName = req.body.empFName;
  var empLName = req.body.empLName;
  var empSal = req.body.empSal;
  var empGender = req.body.empGender;

  var sql = "INSERT INTO EMPLOYEE VALUES (?, ?, ?, ?" + ", " + empSal + " );";
  connection.query(
    sql,
    [empId, empFName, empLName, empGender],
    function (err, data) {
      if (err) throw err;
      console.log(data.affectedRows + " record(s) updated");
      res.redirect("/sellers");
    }
  );
});

// ----------------------------------------------------------------------------------------

// Category
// Get - Category
app.get("/categories", function (req, res) {
  var sql = "SELECT * FROM category ORDER BY CATEGORY_ID";
  connection.query(sql, function (err, categoryData, fields) {
    if (err) throw err;
    res.render("categories", {
      title: "Categories",
      categoryData: categoryData,
    });
  });
});

// Get - New Category
app.get("/new-category", function (req, res) {
  res.render("newCategory", { title: "Category Registration" });
});

// Get - Delete Category
app.get("/categories/delete/:deleteId", function (req, res) {
  var sql = "DELETE FROM category WHERE CATEGORY_ID = ?";
  connection.query(sql, [req.params.deleteId], function (err, data) {
    if (err) throw err;
    console.log(data.affectedRows + " record(s) deleted");
    res.redirect("/categories");
  });
});

// Post - New Category
app.post("/newCategory", function (req, res) {
  var categoryName = req.body.categoryName;
  var id = req.body.categoryId;

  var sql = "INSERT INTO CATEGORY (CATEGORY_ID, CATEGORY_NAME) VALUES (?, ? );";
  connection.query(sql, [id, categoryName], function (err, data) {
    if (err) throw err;
    console.log(data.affectedRows + " record(s) updated");
    res.redirect("/categories");
  });
});

// ----------------------------------------------------------------------------------------

// Customer
// Get - Customer
app.get("/customers", function (req, res) {
  var sql = "SELECT * FROM customer ORDER BY C_ID";
  connection.query(sql, function (err, customerData, fields) {
    if (err) throw err;
    res.render("customers", {
      title: "Customers",
      customerData: customerData,
    });
  });
});

// Get - New Customer
app.get("/new-customer", function (req, res) {
  res.render("newCustomer", { title: "Customer Registration" });
});

// Post - New Customer
app.post("/newCustomer", function (req, res) {
  var customerName = req.body.customerName;
  var customerMobile = req.body.customerMobile;
  var id = req.body.customerId;

  var sql = "INSERT INTO CUSTOMER VALUES (?, ?, ? );";
  connection.query(
    sql,
    [id, customerName, customerMobile],
    function (err, data) {
      if (err) throw err;
      console.log(data.affectedRows + " record(s) updated");
      // res.redirect("/customers");
      var sql1 = "SELECT * FROM product ORDER BY PRODUCT_ID";
      connection.query(sql1, function (err, productData, fields) {
        if (err) throw err;
        res.render("newOrderItems", {
          title: "New Order",
          productData: productData,
          customerId: id,
          amount: 0,
        });
      });
    }
  );
});

// ----------------------------------------------------------------------------------------

// Get - Order
app.get("/orders", function (req, res) {
  var sql = "SELECT * FROM orders ORDER BY ORDER_ID";
  connection.query(sql, function (err, orderData, fields) {
    if (err) throw err;
    res.render("orders", {
      title: "Orders",
      orderData: orderData,
    });
  });
});

// Get - New Order Items
app.get("/new-order", function (req, res) {
  var sql1 = "SELECT * FROM product ORDER BY PRODUCT_ID";
  connection.query(sql1, function (err, productData, fields) {
    if (err) throw err;
    res.render("newOrderItems", {
      title: "New Order",
      productData: productData,
      customerId: "C007",
      amount: 0,
    });
  });
});

var Amount = 0;
// Post - New Order Items
app.post("/newOrderItems", function (req, res) {
  var orderId = req.body.orderId;
  var productSel = req.body.productSel;
  var productQuantity = req.body.productQuantity;
  // Amount += (costPrice * productQuantity);

  var insert = "INSERT INTO ORDERS (ORDER_ID) VALUES (?);";
  connection.query(insert, [orderId], function (err, data, fields) {
    if (err) {
      console.log("Order already exist. Adding new products!");
    }
  });

  var sql = "INSERT INTO ORDER_ITEM VALUES (?, ?, " + productQuantity + " );";
  connection.query(
    sql,
    [orderId, productSel, productQuantity],
    function (err, data) {
      if (err) throw err;
      console.log(data.affectedRows + " record(s) updated");

      connection.query(
        "SELECT SELLING_PRICE FROM PRODUCT WHERE PRODUCT_ID = ?;",
        [productSel],
        function (err, sellingPrice) {
          if (err) throw err;
          console.log(data.affectedRows + " record(s) selected");
          Amount += sellingPrice[0].SELLING_PRICE * productQuantity;

          var sql1 = "SELECT * FROM product ORDER BY PRODUCT_ID";
          connection.query(sql1, function (err, productData, fields) {
            if (err) throw err;
            res.render("newOrderItems", {
              title: "New Order",
              productData: productData,
              customerId: req.body.customerId,
              amount: Amount,
            });
          });
        }
      );
    }
  );
});

// ----------------------------------------------------------------------------------------

// Post - Checkout
app.post("/checkout", function (req, res) {
  var orderId = req.body.orderId;
  var customerId = req.body.customerId;
  var productSel = req.body.productSel;
  var productQuantity = req.body.productQuantity;

  var insert = "INSERT INTO ORDERS (ORDER_ID) VALUES (?);";
  connection.query(insert, [orderId], function (err, data, fields) {
    if (err) {
      console.log("Order already exist. Adding new products!");
    }
  });

  var sql = "INSERT INTO ORDER_ITEM VALUES (?, ?, " + productQuantity + " );";
  connection.query(
    sql,
    [orderId, productSel, productQuantity],
    function (err, data) {
      if (err) throw err;
      console.log(data.affectedRows + " record(s) updated");

      connection.query(
        "SELECT SELLING_PRICE FROM PRODUCT WHERE PRODUCT_ID = ?;",
        [productSel],
        function (err, sellingPrice) {
          if (err) throw err;
          console.log(data.affectedRows + " record(s) selected");
          Amount += sellingPrice[0].SELLING_PRICE * productQuantity;

          var sql =
            "UPDATE ORDERS SET CUSTOMER_ID = ?, AMOUNT = " +
            Amount +
            ", ORDER_DATE = " +
            todayDate +
            " WHERE ORDER_ID = ?;";
          connection.query(sql, [customerId, orderId], function (err, data) {
            if (err) throw err;
            console.log(data.affectedRows + " record(s) updated");
            res.redirect("/orders");
          });
        }
      );
    }
  );
});

app.listen(3000, function () {
  console.log("Server Started with Port:3000");
});
