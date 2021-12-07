function sleep(int) {
    return new Promise((resolve) => setTimeout(() => resolve(), int * 1000))
};

module.exports = sleep;