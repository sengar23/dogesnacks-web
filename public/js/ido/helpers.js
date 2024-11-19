Date.prototype.epoch = function () {
    return Math.floor(this.valueOf() / 1e3)
}

Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

export function checkMetaMask() {
    if (window.ethereum)
        return true

    return false
}

export function setLocalItem(key, value) {
    window.localStorage.setItem(key, value)
}

export function getLocalItem(key) {
    window.localStorage.getItem(key)
}

export function setMetamaskAsProvider() {
    window.provider = new ethers.providers.Web3Provider(window.ethereum)
}