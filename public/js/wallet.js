import { SnacksAddress, DogeSnacksFactoryAddress } from './ido/config.js'
import { DogeSnacksFactoryABI } from './ido/contracts/DogeSnacksFactory.js'
import { DogeSnacksPresale } from './ido/DogeSnacksPresale.js'
window.SnacksAddress = SnacksAddress
window.DogeSnacksFactoryAddress = DogeSnacksFactoryAddress
window.DogeSnacksFactoryABI = DogeSnacksFactoryABI
Date.prototype.epoch = function () {
  return Math.floor(this.valueOf() / 1e3)
}

Date.prototype.addDays = function (days) {
  var date = new Date(this.valueOf())
  date.setDate(date.getDate() + days)
  return date
}
if (window.ethereum && window.ethereum.isMetaMask == true) {
  window.ethereum.on('accountsChanged', function (accounts) {
    // Time to reload your interface with accounts[0]!
    if (accounts.length == 0) {
      $(
        '.disconnect-metamask, .mobile-disconnect-metamask, .wallet-info-box, .submit-validation, .createlisting-link'
      ).hide()
      $('.wallet-modal-btn').parent().show()
    } else {
      account_connect_after()
    }
  })
  window.ethereum.on('chainChanged', function (chainId) {
    // Time to reload your interface with accounts[0]!
    if (chainId !== '0x1') {
      $(
        '.disconnect-metamask, .mobile-disconnect-metamask,  .wallet-info-box, .submit-validation, .createlisting-link'
      ).hide()
      $('.wallet-modal-btn').parent().show()
    } else {
      account_connect_after()
    }
  })
}

async function account_connect_after () {
  try {
    if (ethereum.chainId !== '0x1') {
      alert_msg_box("Please connect with an 'Ethereum mainnet' wallet")
      return
    }

    const account = window.ethereum.selectedAddress
    let display_acc_1 = account.substring(0, 6)
    let last_length_index = account.length - 4
    let display_acc_2 = account.substring(last_length_index, account.length)
    let display_account = `${display_acc_1}...${display_acc_2}`
    $('.wallet-modal-btn').parent().hide()
    $('.disconnect-metamask').text(`Disconnect: ${display_account}`)
    $('.wallet-info-box').text(`Wallet: ${display_account}`)
    $(
      '.disconnect-metamask, .wallet-info-box, .submit-validation, .createlisting-link'
    ).css({ display: 'block' })
    $('.no-connect-overlay').hide()

    if (isMobile.any) {
      $('.mobile-connect-metamask').hide()
      $('.mobile-disconnect-metamask').text(`Disconnect: ${display_account}`)
      $('.mobile-disconnect-metamask').css({ display: 'inline-block' })
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()

    let ido_data = window.ido_detail_data

    if (ido_data) {
      const error = await prepare_investment_details_for_account() // Show the investment on the particular IDO
      if (error !== null) {
        // show the error box
        console.error(error)
      }
      let doge_id = ido_data.doge_id
      let presale_address = ido_data.presale_address
      var presale = new DogeSnacksPresale(signer, doge_id, presale_address)
      await presale.init()
      let current_state = ido_data.current_state
      let creator_address = await presale.checkCreator()
      if (
        window.ethereum.selectedAddress.toLowerCase() ==
        creator_address.toLowerCase()
      ) {
        if (current_state != 2 && current_state != 6) {
          // not to show Cancel Button if state is Cancelled or UniswapListed
          $('.token-cancel-wrap').css({ display: 'grid' })
        } else if (current_state == 6) {
          $('.collect-fund-btn').show()
        }
      } else {
        $('.token-cancel-wrap').hide()
        $('.collect-fund-btn').hide()
      }
    }
    //Show buy section on mobile browser with Metamask wallet
  } catch (error) {
    const message = extract_error_message_from_error(error)
    alert_msg_box(message)
  }
}
if (!window.prepare_investment_details_for_account) {
  window.prepare_investment_details_for_account = async () => {
    let ido_data = window.ido_detail_data
    let doge_id = ido_data.doge_id
    let presale_address = ido_data.presale_address
    let max_investment = ido_data.token.max_investment_per_wallet
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      var presale = new DogeSnacksPresale(signer, doge_id, presale_address)
      await presale.init()
      let eth_investments = await presale.getEthInvestment(
        window.ethereum.selectedAddress
      )

      window.localStorage.setItem(
        'eth_investments',
        JSON.stringify(eth_investments)
      )

      let your_investment = eth_investments.ethInvestment
      let your_token = eth_investments.claimableTokens
      let inv_left = (
        parseFloat(max_investment) - parseFloat(your_investment)
      ).toFixed(5)

      const claimed = await presale.claimedOrRefunded(
        window.ethereum.selectedAddress
      )
      if (claimed == true) {
        your_investment = 0
        your_token = 0
        $('.refund-token-btn').addClass('disabled')
      }

      $('.your-eth-investment').text(`${your_investment}`)
      $('.your-tokens').text(`${your_token}`)

      // $(".your-eth-investment").text(`${your_investment} (claimed/refunded = ${claimed})`);
      // $(".your-tokens").text(`${your_token} (claimed/refunded = ${claimed})`);

      //const balance = await provider.getBalance(window.ethereum.selectedAddress); //Dont remove it yet
      $('.currently-available-balance').text(`${inv_left} ETH`)
      return null
    } catch (error) {
      return error
    }
  }
}

$(async function () {
  if (window.ethereum && window.ethereum.isMetaMask == true) {
    $('body').addClass('mobile-metamask')
    //Checking if Metamaskwallet is connected then change buttons accordiangly
    const _accounts = await ethereum.request({ method: 'eth_accounts' }) // Because window.ethereum.selectedAddress throws null on Firefox on reload after wallet connect.

    if (_accounts.length > 0) {
      window.ethereum.selectedAddress = _accounts[0]
    }
    if (window.ethereum.selectedAddress) {
      let wallet_connected = window.localStorage.getItem('wallet_connected')
      if (wallet_connected != 0) {
        await account_connect_after()
      }
    }
  }
  //Click event to connect to Metamask
  $('.connect-metamask, .mobile-connect-metamask').click(async () => {
    if (window.ethereum && window.ethereum.isMetaMask == true) {
      try {
        //connect wallet
        const accounts = await ethereum.request({
          method: 'eth_requestAccounts'
        })
        if (accounts) {
          if (accounts.length > 1) {
            // add it to designed model box popup
            alert_msg_box(
              `these ${accounts} are connected. please select only one wallet address`
            )
            return
          }
          //get wallet address from array of addresses
          window.localStorage.setItem('wallet_connected', 1)
          //const account = accounts[0];
          await account_connect_after()

          let wallet_modal_el = document.getElementById('wallet-modal')
          let wallet_modal = bootstrap.Modal.getInstance(wallet_modal_el) // Returns a Bootstrap modal instance
          if (wallet_modal) {
            wallet_modal.hide()
          }
        }
      } catch (error) {
        alert_msg_box(error)
      }
    } else {
      let alert_msg =
        'Please install Metamask browser extentsion or open this website in Metamask Dapp browser.'
      alert_msg_box(alert_msg)
    }
  })

  //Click event to disconnect to Metamask
  $('.disconnect-metamask, .mobile-disconnect-metamask').click(
    async function () {
      $(
        '.disconnect-metamask, .mobile-disconnect-metamask, .wallet-info-box, .submit-validation, .createlisting-link'
      ).hide()
      $('.wallet-modal-btn').parent().show()
      $('.no-connect-overlay').show()
      if (isMobile.any) {
        $('.mobile-connect-metamask').show()
      }

      window.localStorage.setItem('wallet_connected', 0)
    }
  )
})

function connect_metamask () {}
function disconnect_metamask () {}
function connect_metamask_success () {}
