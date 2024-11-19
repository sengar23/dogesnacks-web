// const ethers = require('ethers');
// const {DogeSnacksPresaleABI} = require('./contracts/DogeSnacksPresale')
// const DogeSnacksFactory = require('./DogeSnacksFactory')
import { DogeSnacksPresaleABI } from "./contracts/DogeSnacksPresale.js"
import { getPresaleAddress } from "./DogeSnacksFactory.js"

const getDogeSnacksPresaleContractFromPresaleAddress = async (wallet, presaleAddress) => {
	return new ethers.Contract(presaleAddress, DogeSnacksPresaleABI, wallet)
}

class DogeSnacksPresale {
	static dogeId = 0;
	static presaleAddress = 0;
	static wallet = 0;
	static contract = undefined;

	constructor(wallet, dogeId, presaleAddress) {
		this.dogeId = dogeId
		this.wallet = wallet
		this.presaleAddress = presaleAddress;
	}

	async init() {
		this.contract = await getDogeSnacksPresaleContractFromPresaleAddress(this.wallet, this.presaleAddress);
	}

	async openTime() {
		let _ot = await this.contract.openTime();

		let blockt = await this.contract.getTimeStamp();

	}

	//buy tokens
	async invest(amount) {


		try {
			const tx = await this.contract.invest({ value: ethers.utils.parseEther(amount) });
			await tx.wait();
			window.dispatchEvent(new Event("investSuccess"));
		} catch (error) {
			const message = extract_error_message_from_error(error)
			alert_msg_box(message)
			action_loader(0);
		}
	}

	//claim tokens: this is after the token is launchde on Uniswap
	async claimTokens() {

		try {
			const tx = await this.contract.claimTokens();
			await tx.wait();
			window.dispatchEvent(new Event("claimTokensSuccess"));
		} catch (error) {
			const message = extract_error_message_from_error(error)
			alert_msg_box(message)
			action_loader(0);
		}
	}

	//cancel presale
	async checkCreator() {
		try {
			const creator_address = await this.contract.presaleCreatorAddress();
			return creator_address;
		} catch (error) {
			const message = extract_error_message_from_error(error)
			alert_msg_box(message)
			action_loader(0);
		}
	}
	async cancelPresale() {
		try {
			const tx = await this.contract.cancelAndTransferTokensToPresaleCreator();
			await tx.wait();
			window.dispatchEvent(new Event("cancelledTokens"));
		} catch (error) {
			const message = extract_error_message_from_error(error)
			alert_msg_box(message)
			action_loader(0);
		}
	}

	async unlockLPTokens(liquidityLockAddress) {
		const liqLockContract = new ethers.Contract(liquidityLockAddress, unlockABICall, this.wallet);
		const tx = await liqLockContract.release();
		await tx.wait();
		window.dispatchEvent(new Event("unlockLPTokens"))
	}

	async addLiquidityAndLockLPTokens() {

		try {
			const tx = await this.contract.addLiquidityAndLockLPTokens();
			await tx.wait();
			window.dispatchEvent(new Event("idoLockListed"));
		} catch (error) {
			const message = extract_error_message_from_error(error)
			alert_msg_box(message)
			action_loader(0);
		}
	}
	async collectFundsRaised() {
		try {
			const tx = await this.contract.collectFundsRaised();
			const receipt = await tx.wait();
			if (receipt.status) {
				window.dispatchEvent(new Event("collectFundsRaisedSuccess"));
			}
			else {
				window.dispatchEvent(new Event("collectFundsRaisedFailed"));
			}
		}
		catch (error) {
			const message = extract_error_message_from_error(error)
			alert_msg_box(message)
			action_loader(0);
		}
	}

	async getRefund() {

		try {
			const tx = await this.contract.getRefund();
			await tx.wait();
			window.dispatchEvent(new Event("refundTokensSuccess"));
		} catch (error) {
			const message = extract_error_message_from_error(error)
			alert_msg_box(message)
			action_loader(0);
		}
	}

	async getEthInvestment(address) {
		try {
			const ethInvestment = ethers.utils.formatEther(await this.contract.investments(address));
			const tokenPrice = ethers.utils.formatEther(await this.contract.tokenPriceInWei());
			return {
				ethInvestment,
				claimableTokens: ethInvestment / tokenPrice
			};
		} catch (error) {
			const message = extract_error_message_from_error(error)
			alert_msg_box(message)
			action_loader(0);
		}

		return {
			ethInvestment: '0.0',
			claimableTokens: '0.0'
		};
	}

	async claimedOrRefunded(address) {
		//check if wallet has claimed the tokens or refunded eths.
		return await this.contract.claimed(address);
	}

}

export { DogeSnacksPresale, getDogeSnacksPresaleContractFromPresaleAddress }