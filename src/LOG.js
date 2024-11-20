module.exports = class LOG {

    static log(a, stringify) {
        (stringify) ? console.log(JSON.stringify(a)) : console.log(a)
    }
}