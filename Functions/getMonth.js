function getMonth(num) {
    return (num === 1) ? "January" : (num === 2) ? "February" : (num === 3) ? "March" : (num === 4) ? "April" : (num === 5) ? "May" : (num === 6) ? "June" : (num === 7) ? "July" : (num === 8) ? "August" : (num === 9) ? "September" : (num === 10) ? "October" : (num === 11) ? "November" : (num === 12) ? "December" : null
};

module.exports = getMonth;

/*
Get the Name of a Month!
Ex: 9 is September, 12 is December
*/