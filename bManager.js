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
            choices: [
                "View Products for Sale",
                "View Low Inventory",
                "Add to Inventory",
                "Add New Product",
                "Exit",
            ],
        })
        .then(function(answer) {
            if (answer.action === "Exit") {
                connection.end();
                process.exit();
            } else {
                switch (answer.action) {
                    case "View Products for Sale":
                        viewProductsForSale();
                        break;

                    case "View Low Inventory":
                        viewLowInventory();
                        break;

                    case "Add to Inventory":
                        addToInventory();
                        break;

                    case "Add New Product":
                        addNewProduct();
                        break;
                }
            }
        });
} //function askOptions

function viewProductsForSale() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        // Log all results of the SELECT statement
        console.log("\n\n");
        console.table(res);
        console.log("\n\n");
        askOptions();
    });
}

function viewLowInventory() {
    connection.query("SELECT * FROM products where inventory < 5 ", function(
        err,
        res
    ) {
        if (err) throw err;
        // Log all results of the SELECT statement
        console.log("\n\n");
        console.table(res);
        console.log("\n\n");
        askOptions();
    });
}

function addNewProduct() {
    inquirer
        .prompt([{
                name: "item_name",
                type: "input",
                message: "Enter item name",
            },
            {
                name: "department",
                type: "rawlist",
                message: "Choose a department",
                choices: ["Crafts", "Electronics", "Clothes"],
            },
            {
                name: "price",
                type: "input",
                message: "Enter a price",
                // validate: function(value) {
                //     if (typeof value !== "number") {
                //         return false;
                //     }
                //     return true;
                // },
            },
            {
                name: "inventory",
                type: "input",
                message: "Enter available qty",
                // validate: function(value) {
                //     if (typeof value !== "number") {
                //         return true;
                //     }
                //     return true;
                // },
            },
            {
                name: "fulfillment_days",
                type: "input",
                message: "Enter number of days it takes to fulfill the order for this item",
                validate: function(value) {
                    if (typeof value !== "number") {
                        return true;
                    }
                    return true;
                },
            },
        ])
        .then(function(answer) {
            // when finished prompting, insert a new item into the db with that info
            var department_id = 1;
            switch (answer.department) {
                case "Crafts":
                    department_id = 1;
                    break;
                case "Electronics":
                    department_id = 2;
                    break;
                case "Clothes":
                    department_id = 3;
                    break;
            }
            console.log(`department : ${department_id}`);
            connection.query(
                "INSERT INTO products SET ?", {
                    item_name: answer.item_name,
                    department_id: department_id,
                    price: answer.price || 0,
                    inventory: answer.inventory || 0,
                    fulfillment_days: answer.fulfillment_days || 0,
                },
                function(err, result) {
                    //console.log(result);
                    if (err) {
                        console.log(err);
                        throw err;
                    }
                    console.log("********************************");
                    console.log(
                        `Inserted ${result.affectedRows} with new ID as ${result.insertId}`
                    );
                    console.log("********************************");
                    askOptions();
                }
            );
        });
}

function addToInventory() {
    inquirer
        .prompt([{
                name: "item_id",
                type: "input",
                message: "Enter item id",
            },
            {
                name: "inventory",
                type: "input",
                message: "Enter available qty",
                // validate: function(value) {
                //     if (typeof value === "number") {
                //         return true;
                //     }
                //     return false;
                // }
            },
        ])
        .then(function(answer) {
            // when finished prompting, update inventory
            connection.query(
                "UPDATE products SET ? WHERE ?", [{
                        inventory: answer.inventory || 0,
                    },
                    {
                        item_id: answer.item_id || 0,
                    },
                ],
                function(err, result) {
                    if (err) throw err;
                    console.log("********************************");
                    console.log(result.affectedRows + " record(s) updated");
                    console.log("********************************");

                    askOptions();
                }
            );
        });
}