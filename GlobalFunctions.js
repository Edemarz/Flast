module.exports = {
    ValidatePermissions: require("./Functions/ValidatePermission"),
    ValidateBirthday: require("./Functions/ValidateBirthday"),
    ValidateSeconds: require("./Functions/ValidateSeconds"),
    Registry: {
        Suggestion: require("./Functions/registerSuggestion")
    },
    getMonth: require("./Functions/getMonth"),
    findAll_Type_Collection: require("./Functions/findAll.collection"),
    checkEcoDisabled: require("./Functions/checkDisabled")
};

/* 
Export all the Functions in a File, More efficient than requiring the functions 1 by 1 in a command file!
*/