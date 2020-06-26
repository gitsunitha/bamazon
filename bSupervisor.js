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
                "View Products Sales for Department",
                "Create new Department",
                "Exit",
            ],
        })
        .then(function(answer) {
            if (answer.action === "Exit") {
                connection.end();
                process.exit();
            } else {
                switch (answer.action) {
                    case "View Products Sales for Department":
                        viewProductsSalesByDept();
                        break;

                    case "Create new Department":
                        createDepartment();
                        break;
                }
            }
        });
} //function askOptions

function viewProductsSalesByDept() {
    connection.query(
        "select  d.department_id, d.department_name, " +
        "d.over_head_costs, " +
        "round(IFNULL(sum(product_sales),0),2) as total_product_sales, " +
        "round(GREATEST((IFNULL(sum(product_sales),0) - d.over_head_costs ),0) , 2) as total_profit " +
        "from bamazon.departments d left join bamazon.products p " +
        "on d.department_id = p.department_id " +
        "group by d.department_id",
        function(err, res) {
            if (err) throw err;
            // Log all results of the SELECT statement
            console.log("\n\n");
            console.table(res);
            console.log("\n\n");
            askOptions();
        }
    );
}

function createDepartment() {
    inquirer
        .prompt([{
                name: "department_name",
                type: "input",
                message: "Enter department name",
            },
            {
                name: "overhead_costs",
                type: "input",
                message: "Enter the department's overhead costs",
                // validate: function(value) {
                //     if (typeof value !== "number") {
                //         return false;
                //     }
                //     return true;
                // },
            },
        ])
        .then(function(answer) {
            // when finished prompting, insert a new department into the db with that info

            connection.query(
                "INSERT INTO departments SET ?", {
                    department_name: answer.department_name,
                    over_head_costs: answer.overhead_costs || 0,
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