// let config = require('../config.js')
// const ethers = require('ethers')
// const {IERC20Abi} = require('./contracts/IERC20.js')

module.exports.convertWeiToEth = function(value) 
{
	return ethers.utils.formatEther(value)
}

module.exports.convertEthToWei = function(value) 
{
	return ethers.utils.parseEther(value)
}

module.exports.getWallet = function(privateKey)
{
	return new ethers.Wallet(privateKey, provider);
}

module.exports.getSnackBalace = async (address) =>
{
	const snacks = new web3.eth.Contract(IERC20Abi, config.snackAddress);
	return await snacks.methods.balanceOf(address).call();
}

module.exports.getETHWalletBalanceInWei = async (walletAddress) =>
{
	return await web3.eth.getBalance(walletAddress)
}

module.exports.getETHWalletBalanceInEther = async (walletAddress) =>
{
	let res = await web3.eth.getBalance(walletAddress)
	return ethers.utils.formatEther(res)
}

module.exports.getGasFromEtherScan = async () => {
	const gasPrice = await provider.getGasPrice();
	// console.log(`Current Gas Price ${web3.utils.fromWei(gasPrice.toString(),'ether')}`)
	return gasPrice;
}