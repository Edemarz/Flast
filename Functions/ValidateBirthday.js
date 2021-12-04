const getMonth = require("./getMonth");

function Validate(num, month) {
    const CheckMonths = [

        "January",
        "March",
        "May",
        "July",
        "August",
        "October",
        "November",
        "December"
    ];

    const NormalMonths = [
        "April",
        "June",
        "September",
        "November"
    ];
    
    if (Number.isInteger(num) === false) return { success: false, code: 1002 };
    if (num?.toString() == "0" || num === 0) return { success: false, code: 901 };
    if (num > 28 && month === 2) return { success: false, code: 2002 };
    if (num === 31 && (!CheckMonths.includes(getMonth(month)))) return { success: false, code: 3002 };
    if (num > 31 && (CheckMonths.includes(getMonth(month)))) return { success: false, code: 403 };
    if (num > 30 && (NormalMonths.includes(getMonth(month)))) return { success: false, code: 405 };
    return { success: true, code: 200 }
};

module.exports = Validate;

/*
Validate Birthdays
Guide on How to use the Function for TheLight#5002
Import the Function
then use <ValidateBirthday Function>(day, month); Returns Code that express and explains why it rejected the request aka got denied, Ex: Having more than 31 days in december, using decimals etc.
*/