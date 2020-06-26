var mysql = require("mysql2");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon",
});

connection.connect(function(err) {
    if (err) throw err;
    askOptions();
});


function askOptions() {
    inquirer
        .prompt({
            name: "action",
            type: "rawlist",
            message: "What would you like to do?",
            choices: ["List all the Products and order", "Exit"],
        })
        .then(function(answer) {
            if (answer.action === "Exit") {
                connection.end();
                process.exit();
            } else {
                showAllItems();
            }
        });
} //function askOptions


function showAllItems() {
    console.log("Selecting all products...\n");
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        // Log all results of the SELECT statement
        console.table(res);

        inquirer
            .prompt({
                name: "chosenItem",
                type: "input",
                message: "Please enter the item number to order or e to Go Back:\n2",
            })
            .then(function(answer) {
                if (answer.chosenItem && answer.chosenItem !== "e") {
                    checkAvailableInventory(answer.chosenItem);
                    //console.log("Return value" + JSON.stringify(item_status));
                    // if (item_status.error != 0) {
                    //     orderItem(answer.chosenItem, item_status);
                    // }
                } else {
                    askOptions();
                }
            });
    });
} //function showAllItems


//Function: checkAvailableInventory
//Purpose: Check available inventory
//Input:
//Output:
function checkAvailableInventory(chosenProduct) {
    //console.log("In checkAvailableInventory:" + chosenProduct);

    var errorJSON = { success: false, message: "Item not found" };
    var query = "SELECT * FROM products WHERE ?";

    connection.query(query, { item_id: chosenProduct }, function(err, res) {
        if (err) {
            console.log("Please check this error");
            console.log(err);
            process.exit();
        } else {
            if (res.length > 0) {
                var resultJSON = {
                    success: true,
                    item_id: res[0].item_id,
                    price: res[0].price,
                    product_sales: res[0].product_sales,
                    inventory: res[0].inventory,
                    fulfillment_time_days: res[0].fulfillment_time_days,
                };
                // console.log(JSON.stringify(resultJSON));
                // return resultJSON;
                orderItem(chosenProduct, resultJSON);
            } else {
                console.log("****************************");
                console.log("No Item found for item_id = " + chosenProduct);
                console.log("****************************\n\n");
                askOptions();
            }
        }
    });
}

//Function: orderItem
//Purpose: To decrement the available inventory by the order qty
function orderItem(chosenProduct, item_availability_status) {
    console.log("In orderItem");
    var availableQty = item_availability_status.inventory;
    var itemPrice = item_availability_status.price;
    var totalProductSales = item_availability_status.product_sales;
    var fulfillment_days = item_availability_status.fulfillment_time_days;
    inquirer
        .prompt({
            name: "requiredQty",
            type: "input",
            message: "Please enter the quantity to order or e to Exit: ",
            validate: async(input) => {
                if (input !== "e" && input > availableQty) {
                    return `Cannot order more than ${availableQty}. More will be available in ${fulfillment_days} \n`;
                }
                return true;
            },
        })
        .then(function(answer) {
            //decrement by 1 provided it is not at 0
            let updateQty = availableQty - answer.requiredQty;
            let itemSale = itemPrice * answer.requiredQty;
            connection.query(
                "UPDATE products SET ? WHERE ?", [{
                        inventory: updateQty,
                        product_sales: totalProductSales + itemSale
                    },
                    {
                        item_id: chosenProduct,
                    },
                ],
                function(err, res) {
                    if (err) throw err;
                    console.log("Product ordered");
                    askOptions();
                }
            );
        });
} //function order