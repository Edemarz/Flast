async function all(collection, maxLength) {
    const collAll = await collection.find({});

    return (collAll.length < 1) ? null : maxLength ? (collAll > maxLength) ? collAll.slice(maxLength, collAll.length) : collAll : collAll
};

module.exports = all;