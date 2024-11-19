const erc20ABI = [{ 'anonymous': false, 'inputs': [{ 'indexed': true, 'internalType': 'address', 'name': 'owner', 'type': 'address' }, { 'indexed': true, 'internalType': 'address', 'name': 'spender', 'type': 'address' }, { 'indexed': false, 'internalType': 'uint256', 'name': 'value', 'type': 'uint256' }], 'name': 'Approval', 'type': 'event' }, { 'anonymous': false, 'inputs': [{ 'indexed': true, 'internalType': 'address', 'name': 'from', 'type': 'address' }, { 'indexed': true, 'internalType': 'address', 'name': 'to', 'type': 'address' }, { 'indexed': false, 'internalType': 'uint256', 'name': 'value', 'type': 'uint256' }], 'name': 'Transfer', 'type': 'event' }, { 'inputs': [], 'name': 'totalSupply', 'outputs': [{ 'internalType': 'uint256', 'name': '', 'type': 'uint256' }], 'stateMutability': 'view', 'type': 'function' }, { 'inputs': [{ 'internalType': 'address', 'name': 'account', 'type': 'address' }], 'name': 'balanceOf', 'outputs': [{ 'internalType': 'uint256', 'name': '', 'type': 'uint256' }], 'stateMutability': 'view', 'type': 'function' }, { 'inputs': [{ 'internalType': 'address', 'name': 'recipient', 'type': 'address' }, { 'internalType': 'uint256', 'name': 'amount', 'type': 'uint256' }], 'name': 'transfer', 'outputs': [{ 'internalType': 'bool', 'name': '', 'type': 'bool' }], 'stateMutability': 'nonpayable', 'type': 'function' }, { 'inputs': [{ 'internalType': 'address', 'name': 'owner', 'type': 'address' }, { 'internalType': 'address', 'name': 'spender', 'type': 'address' }], 'name': 'allowance', 'outputs': [{ 'internalType': 'uint256', 'name': '', 'type': 'uint256' }], 'stateMutability': 'view', 'type': 'function' }, { 'inputs': [{ 'internalType': 'address', 'name': 'spender', 'type': 'address' }, { 'internalType': 'uint256', 'name': 'amount', 'type': 'uint256' }], 'name': 'approve', 'outputs': [{ 'internalType': 'bool', 'name': '', 'type': 'bool' }], 'stateMutability': 'nonpayable', 'type': 'function' }, { 'inputs': [{ 'internalType': 'address', 'name': 'sender', 'type': 'address' }, { 'internalType': 'address', 'name': 'recipient', 'type': 'address' }, { 'internalType': 'uint256', 'name': 'amount', 'type': 'uint256' }], 'name': 'transferFrom', 'outputs': [{ 'internalType': 'bool', 'name': '', 'type': 'bool' }], 'stateMutability': 'nonpayable', 'type': 'function' }];

const getPresaleAddress = async (wallet, dogeId) => {
    const dogeSnakcsFactoryContract = new ethers.Contract(window.DogeSnacksFactoryAddress, window.DogeSnacksFactoryABI, wallet);
    return await dogeSnakcsFactoryContract.getPresaleAddress(dogeId)
}

const getDogeSnacksFactoryContract = async (wallet) => {
    return new ethers.Contract(window.DogeSnacksFactoryAddress, window.DogeSnacksFactoryABI, wallet)
}

const listenOnDogeSnacksFactoryEvents = async (wallet) => {
    let dogeSnacksFactoryContract = await getDogeSnacksFactoryContract(wallet);
    //listen for PresaleCreated event from DogeSnacksFactory smart contract
    dogeSnacksFactoryContract.on('PresaleCreated', async (title, dogeId, creator, presaleAddress) => {
        if (creator.toLowerCase() === window.ethereum.selectedAddress.toLowerCase()) {
            window.localStorage.setItem('FEPresaleCreated', JSON.stringify({ 'success': true, 'dogeId': dogeId }))
            //triger FEPresaleCreated event for the front end
            window.dispatchEvent(new Event('FEPresaleCreated'));
        }
    })
}

const approveTokens = async (DogeSnacksFactoryAddress, tokenAddress, signer) => {
    try {
        const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, signer);
        const tokenAllowance = await tokenContract.allowance(window.ethereum.selectedAddress, DogeSnacksFactoryAddress);

        //Add UI loader until it's approved in metamask wallet

        if (tokenAllowance.eq(0)) {
            //approve(spender, amount)
            const approvalTx = await tokenContract.approve(DogeSnacksFactoryAddress, ethers.constants.MaxUint256);

            //Add UI element for pending approval transaction
            let state = { 'tx': approvalTx.hash, 'status': 'pending' };
            window.localStorage.setItem('token_approval', JSON.stringify(state));
            const receipt = await approvalTx.wait();
            if (receipt.status)
            {
                state = { 'tx': approvalTx.hash, 'status': 'success' }
                window.localStorage.setItem('token_approval', JSON.stringify(state))
            }
            else {
                //approval failed. Should try approve again
                let state = { 'tx': approvalTx.hash, 'status': 'failed' };
                window.localStorage.setItem('token_approval', JSON.stringify(state));
                window.dispatchEvent(new Event("TokenAllowanceFailed"))
                return
            }
        }

        let event = new Event('TokenAllowanceSuccess');
        window.dispatchEvent(event);

    } catch (error) {
        const message = extract_error_message_from_error(error)
        alert_msg_box(message)
        $(".awaiting-btn").hide();
        $(".submit-approve, .back-btn").show();
        action_loader(0);
    }



}

const createPresale = async (signer, provider, tokenAddress, unsoldTokensDumpAddress, DogeSnacksFactoryAddress) => {
    try {
        const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, signer);
        const tokenAllowance = await tokenContract.allowance(window.ethereum.selectedAddress, DogeSnacksFactoryAddress);

        if (tokenAllowance.eq(0)) {
            alert("Plesae approve");
            return;
        }

        let form_data = window.localStorage.getItem("listing_form");
        form_data = safe_parse(form_data);
        if (form_data == null) {
            let err_msg = "Couldn't retrive the IDO Form Data. Please try to create presale again.";
            alert_msg_box(err_msg);
            return;
        }


        const openTime = form_data.ido_open_date;
        const closeTime = form_data.ido_close_date;

        const uniLpTokensLockDurationInDays = form_data.lock_duration; //days
        // const uniLiquidityPercentageAllocation  = new BN('30');  //30% liq

        const saleTitle = form_data.project_name;
        const linkTelegram = form_data.telegram_url;
        const linkDiscord = form_data.discord_url;
        const linkTwitter = form_data.twitter_url;
        const linkWebsite = form_data.website_url;
        const linkMedium = form_data.medium_url;
        const linkWhitepaper = form_data.whitepaper_url;
        const linkBannerImage = form_data.project_banner;

        const aboutProject = form_data.project_detail;

        const minInvestInWei = ethers.utils.parseEther(form_data.min_inv_per_wallet);
        const maxInvestInWei = ethers.utils.parseEther(form_data.max_inv_per_wallet);
        const softCapInWei = ethers.utils.parseEther(form_data.ido_soft_cap);
        const hardCapInWei = ethers.utils.parseEther(form_data.ido_hard_cap);

        const uniLiquidityPercentageAllocation = form_data.percentage_allocated;


        const tokenPriceInWei = ethers.utils.parseEther(form_data.ido_token_price)
        const uniListingPrice = ethers.utils.parseEther(form_data.uniswap_listing_rate)


        const maxEthPoolTokenAmount = hardCapInWei.mul(uniLiquidityPercentageAllocation).div(100)
        const maxLiqPoolTokenAmount = maxEthPoolTokenAmount.div(uniListingPrice);



        const maxTokensToBeSold = hardCapInWei.div(tokenPriceInWei)



        const requiredTokenAmount = maxTokensToBeSold.add(maxLiqPoolTokenAmount)


        const presaleInfo = {
            tokenAddress: tokenAddress,
            unsoldTokensDumpAddress: unsoldTokensDumpAddress,
            whitelistedAddresses: [],
            tokenPriceInWei: tokenPriceInWei,        //ido token price
            hardCapInWei: hardCapInWei,
            softCapInWei: softCapInWei,
            maxInvestInWei: maxInvestInWei,    //1eth
            minInvestInWei: minInvestInWei,  //0.1 eth
            openTime: openTime,
            closeTime: closeTime,
            aboutProject: aboutProject
        }

        const presaleUniswapInfo = {
            listingPriceInWei: uniListingPrice,
            liquidityAddingTime: closeTime,
            lpTokensLockDurationInDays: +uniLpTokensLockDurationInDays,
            liquidityPercentageAllocation: +uniLiquidityPercentageAllocation
        };

        const presaleStringInfo = {
            saleTitle: ethers.utils.formatBytes32String(saleTitle),
            linkTelegram: ethers.utils.formatBytes32String(linkTelegram),
            linkDiscord: ethers.utils.formatBytes32String(linkDiscord),
            linkTwitter: ethers.utils.formatBytes32String(linkTwitter),
            linkWebsite: ethers.utils.formatBytes32String(linkWebsite),
            linkMedium: linkMedium,
            linkWhitepaper: linkWhitepaper,
            linkBannerImage: linkBannerImage,
        };


        //Add preloader until wallet opens and user confirms the transaction
        $(".create-presale, .back-btn").hide();
        $(".awaiting-btn").show();
        action_loader(1);
        let dogeSnacksFactoryContract = await getDogeSnacksFactoryContract(signer);

        const dtx = await dogeSnacksFactoryContract.createPresale(presaleInfo, presaleUniswapInfo, presaleStringInfo);
        let state = { 'tx': dtx.hash, 'status': 'pending' };
        window.localStorage.setItem('create_presale', JSON.stringify(state));

        // listenOnDogeSnacksFactoryEvents(signer);

        const receipt = await provider.waitForTransaction(dtx.hash);
        if (receipt.status)
        {
            state['status'] = 'success';
            window.localStorage.setItem('create_presale', JSON.stringify(state));
            window.dispatchEvent(new Event('FEPresaleCreated'));
        }
        else
        {
            state['status'] = 'failed';
            window.localStorage.setItem('create_presale', JSON.stringify(state));
            window.dispatchEvent(new Event("FEPresaleCreateFailed"))
        }
        
    } catch (error) {
        const message = extract_error_message_from_error(error)
        alert_msg_box(message)

        $(".create-presale, .back-btn").show();
        $(".awaiting-btn").hide();
        action_loader(0);
    }





}


export { getPresaleAddress, getDogeSnacksFactoryContract, listenOnDogeSnacksFactoryEvents, approveTokens, createPresale }
