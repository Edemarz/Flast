function ValidateSeconds(now, ms) {
    let afkAt = now - ms;
        let remainingMinutes;
        let remainingSeconds;
        let divider;

        let backupAfk = afkAt;

        if (afkAt / 1000 / 60 / 60 >= 1 && Number.isInteger(afkAt / 1000 / 60 / 60) === true) afkAt = `${Math.round(afkAt / 1000 / 60 / 60)} hour(s) ago.`;
        if (afkAt / 1000 / 60 / 60 >= 1 && Number.isInteger(afkAt / 1000 / 60 / 60) === false) {
            remainingMinutes = `${afkAt / 1000 / 60 / 60}`.split('.')[1];
            if (!Number(remainingMinutes) / 1000 / 60 >= 1) afkAt = `${Math.round(afkAt / 1000 / 60 / 60)} hour(s) ago.`;
            if (Number(remainingMinutes) / 1000 / 60 >= 1) afkAt = `${Math.round(afkAt / 1000 / 60 / 60)} hour(s) and ${Math.round(Number(remainingMinutes) / 1000 / 60)} minute(s) ago.`;
        };
        if (afkAt / 1000 / 60 >= 1 && Number.isInteger(afkAt / 1000 / 60) === true) afkAt = `${Math.round(afkAt / 1000 / 60)} minute(s) ago.`;
        if (afkAt / 1000 / 60 >= 1 && Number.isInteger(afkAt / 1000 / 60) === false) {
            remainingSeconds = `${afkAt / 1000}`.split('.')[1];
            divider = `${afkAt / 1000 / 60}`.split('.')[0];
            divider = Number(divider);
            divider = divider * 60;
            remainingSeconds = Number(remainingSeconds) / divider;
            if (Math.round(remainingSeconds) >= 1) afkAt = `${Math.round(afkAt / 1000 / 60)} minute(s) ago.`;
            if (Math.round(remainingSeconds) >= 1) afkAt = `${Math.round(backupAfk / 1000 / 60)} minute(s) and ${Math.round(remainingSeconds)} second(s) ago.`
        }
        else afkAt = `${Math.round(afkAt / 1000)} second(s) ago.`;

    return afkAt
};

module.exports = ValidateSeconds;