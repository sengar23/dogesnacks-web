import { DogeSnacksPresale } from './ido/DogeSnacksPresale.js'

window.addEventListener('investSuccess', async () => {
  let ido_data = window.ido_detail_data
  let ido_name = ido_data.name
  let ido_hash = ido_name.replace(/ /g, '')
  let page_url = get_url_parameter()
  let twitter_share_url = `https://twitter.com/intent/tweet?text=Hey, I just invested in the %23${ido_hash} IDO listed on %23dogesnacks 🚀🚀🚀 %20%0Ahttps://dogesnacks.org/${page_url}`
  let alert_msg = `Investment Successful. <a href="${twitter_share_url}"
    class="social-share twitter-share" target="_blank"></a>`
  alert_msg_box(alert_msg)
  const error = await prepare_investment_details_for_account()
  if (error !== null) {
    console.error(error)
    return
  }
  action_loader(0)
  get_ido_ui_update()
})
window.addEventListener('claimTokensSuccess', async () => {
  alert_msg_box('Claim Tokens Successful')
  const error = await prepare_investment_details_for_account()
  if (error !== null) {
    console.error(error)
    return
  }
  action_loader(0)
  get_ido_ui_update()
})
window.addEventListener('refundTokensSuccess', async () => {
  alert_msg_box('Refund of Tokens is Successful')
  const error = await prepare_investment_details_for_account()
  if (error !== null) {
    console.error(error)
    return
  }
  action_loader(0)
  get_ido_ui_update()
})
window.addEventListener('idoLockListed', async () => {
  alert_msg_box('IDO Lock and Listed')
  ido_listed_status()
  action_loader(0)
})

window.addEventListener('collectFundsRaisedSuccess', async () => {
  // this is the event listener for successful collection of funds
  alert_msg_box('Collection of Raised Funds is Successful')
  action_loader(0)
})
window.addEventListener('collectFundsRaisedFailed', async () => {
  // this is the event listener for failed collection of funds
  alert_msg_box('Collection of Raised Funds Failed. Please try again.')
  action_loader(0)
})

window.addEventListener('cancelledTokens', async () => {
  alert_msg_box('IDO Cancelled')
  $('.token-cancel-wrap').hide()
  let cancel_modal_el = document.getElementById('cancel-ido-modal')
  let cancel_modal = bootstrap.Modal.getInstance(cancel_modal_el) // Returns a Bootstrap modal instance
  cancel_modal.hide()
  const error = await prepare_investment_details_for_account()
  if (error !== null) {
    console.error(error)
    return
  }
  action_loader(0)
  get_ido_ui_update()
})

$(function () {
  setTimeout(function () {
    action_loader(0)
  }, 500)
  count_down('2022-04-20 12:00:00')

  //ido_ui(); // This builds UI for IDO detail

  $('#buy-token-input').on('input', () => {
    const investment_amount = $('#buy-token-input').val()

    let ido_data = window.ido_detail_data
    let ido_token_price = ido_data.token.token_price
    let amount = investment_amount / ido_token_price
    if (amount === NaN) {
      amount = 0
    }
    $('.calculated-token-value').text(amount)
  })
  $('.buy-token-btn').click(async e => {
    let el = e.target
    let ido_data = window.ido_detail_data
    let eth_investments = window.localStorage.getItem('eth_investments')
    eth_investments = safe_parse(eth_investments)

    if (eth_investments == null || eth_investments.ethInvestment == undefined) {
      let err_msg =
        "Couldn't retrive your investment detail. Please reload the page and check if your wallet account is connected."
      alert_msg_box(err_msg)
      return
    }

    let doge_id = ido_data.doge_id
    let presale_address = ido_data.presale_address
    let max_investment = ido_data.token.max_investment_per_wallet
    let min_investment = ido_data.token.min_investment_per_wallet
    let your_investment = eth_investments.ethInvestment
    let inv_left = parseFloat(
      (parseFloat(max_investment) - parseFloat(your_investment)).toFixed(5)
    )
    if (!$(el).hasClass('disabled')) {
      let buy_token_input = $('#buy-token-input').val()

      if (!validator.isFloat(buy_token_input) || buy_token_input == 0) {
        let h = $('#buy-token-input').parent().find('.input-error-wrap')
        h.find('.input-error').text('Please enter price')
        h.show()
        h.addClass('shake animated')
        h.one(
          'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
          function () {
            $(this).removeClass('shake animated')
            setTimeout(function () {
              h.fadeOut(300)
            }, 5000)
          }
        )
        return false
      } else if (buy_token_input < min_investment) {
        let h = $('#buy-token-input').parent().find('.input-error-wrap')
        h.find('.input-error').text(
          'Amount needs to be more than min investment'
        )
        h.show()
        h.addClass('shake animated')
        h.one(
          'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
          function () {
            $(this).removeClass('shake animated')
            setTimeout(function () {
              h.fadeOut(300)
            }, 5000)
          }
        )
        return false
      } else if (buy_token_input > max_investment) {
        let h = $('#buy-token-input').parent().find('.input-error-wrap')
        h.find('.input-error').text(
          'Amount needs to be less than max investment'
        )
        h.show()
        h.addClass('shake animated')
        h.one(
          'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
          function () {
            $(this).removeClass('shake animated')
            setTimeout(function () {
              h.fadeOut(300)
            }, 5000)
          }
        )
        return false
      } else if (buy_token_input > inv_left) {
        let h = $('#buy-token-input').parent().find('.input-error-wrap')
        h.find('.input-error').text(
          'Amount needs to be less/equal to investment left'
        )
        h.show()
        h.addClass('shake animated')
        h.one(
          'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
          function () {
            $(this).removeClass('shake animated')
            setTimeout(function () {
              h.fadeOut(300)
            }, 5000)
          }
        )
        return false
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      try {
        var presale = new DogeSnacksPresale(signer, doge_id, presale_address)
        action_loader(1)
        await presale.init() //Presale address will come from backend. Currently beingh fetched from contracts
        presale.invest(buy_token_input) // catch the success event
      } catch (error) {
        console.error(error)
        const message = extract_error_message_from_error(error)
        alert_msg_box(message)
        action_loader(0)
      }
    }
  })
  $('.claim-token-btn').click(async e => {
    let el = e.target
    let ido_data = window.ido_detail_data
    let doge_id = ido_data.doge_id
    let presale_address = ido_data.presale_address
    if (!$(el).hasClass('disabled')) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        var presale = new DogeSnacksPresale(signer, doge_id, presale_address)
        action_loader(1)
        await presale.init() //Presale address will come from backend. Currently beingh fetched from contracts
        presale.claimTokens() // catch the success event
      } catch (error) {
        const message = extract_error_message_from_error(error)
        alert_msg_box(message)
        action_loader(0)
      }
    }
  })
  $('.refund-token-btn').click(async e => {
    let el = e.target
    let ido_data = window.ido_detail_data
    let doge_id = ido_data.doge_id
    let presale_address = ido_data.presale_address
    if (!$(el).hasClass('disabled')) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        var presale = new DogeSnacksPresale(signer, doge_id, presale_address)
        action_loader(1)
        await presale.init() //Presale address will come from backend. Currently beingh fetched from contracts
        presale.getRefund() // catch the success event
      } catch (error) {
        const message = extract_error_message_from_error(error)
        alert_msg_box(message)
        action_loader(0)
      }
    }
  })
  $('.launch-token-btn').click(async e => {
    let el = e.target
    let ido_data = window.ido_detail_data
    let doge_id = ido_data.doge_id
    let presale_address = ido_data.presale_address
    if (!$(el).hasClass('disabled')) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        var presale = new DogeSnacksPresale(signer, doge_id, presale_address)
        action_loader(1)
        await presale.init() //Presale address will come from backend. Currently beingh fetched from contracts
        presale.addLiquidityAndLockLPTokens() // catch the success event
      } catch (error) {
        const message = extract_error_message_from_error(error)
        alert_msg_box(message)
        action_loader(0)
      }
    }
  })
  $('.cancel-token-btn').click(async e => {
    let el = e.target
    let ido_data = window.ido_detail_data
    let doge_id = ido_data.doge_id
    let presale_address = ido_data.presale_address
    if (!$(el).hasClass('disabled')) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        var presale = new DogeSnacksPresale(signer, doge_id, presale_address)
        action_loader(1)
        await presale.init() //Presale address will come from backend. Currently beingh fetched from contracts
        presale.cancelPresale() // catch the success event
      } catch (error) {
        const message = extract_error_message_from_error(error)
        alert_msg_box(message)
        action_loader(0)
      }
    }
  })
  $('.collect-fund-btn').click(async e => {
    let el = e.target
    let ido_data = window.ido_detail_data
    let doge_id = ido_data.doge_id
    let presale_address = ido_data.presale_address
    if (!$(el).hasClass('disabled')) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        var presale = new DogeSnacksPresale(signer, doge_id, presale_address)
        action_loader(1)
        await presale.init()
        presale.collectFundsRaised()
      } catch (error) {
        const message = extract_error_message_from_error(error)
        alert_msg_box(message)
        action_loader(0)
      }
    }
  })
})
async function ido_init () {
  $('.token-launch-wrap').css({ display: 'none' })
  $('.buy-btn-status').text('')
  $('.buy-btn-status').hide()
  let ido_data = window.ido_detail_data

  let ido_token_price = ido_data.token.token_price,
    ido_hard_cap = ido_data.token.hard_cap,
    ido_open_date = ido_data.token.opens_at,
    ido_close_date = ido_data.token.closes_at,
    current_date = new Date().getTime(),
    percentage_allocated = ido_data.uniswap_lp.percentage_to_lp,
    uniswap_listing_time = ido_data.uniswap_lp.listing_time,
    total_invested = ido_data.total_invested,
    current_state = ido_data.current_state,
    max_investment = ido_data.token.max_investment_per_wallet,
    project_token_address = ido_data.token.token_address

  ido_open_date = new Date(ido_open_date).getTime()
  ido_close_date = new Date(ido_close_date).getTime()

  let uniswap_link = `https://app.uniswap.org/#/swap?outputCurrency=${project_token_address}&use=V2`

  if (current_state == 2) {
    // IDO cancelled
    $('.refund-token-btn').show()
    $('.buy-token-btn').addClass('disabled')
    $('.token-cancel-wrap').hide()
    $('.buy-btn-status').text('IDO is cancelled')
    $('.buy-btn-status').show()
  }
  if (
    current_state == 5 ||
    (current_state == 4 && current_date >= uniswap_listing_time)
  ) {
    // Hard Cap reached OR Softcap reached and current time is past uniswap listing time
    $('.buy-token-btn').addClass('disabled')
    $('.token-launch-wrap').css({ display: 'grid' })
    $('.buy-btn-status').text('Hard Cap reached')
    $('.buy-btn-status').show()
  }
  if (current_state == 6) {
    // Token listed on Uniswap
    $('.buy-token-btn').addClass('disabled')
    $('.claim-token-btn').removeClass('disabled')
    $('.buy-btn-status').text('IDO is listed on Uniswap')
    $('.buy-btn-status').show()
    $('.buy-token-url-value').attr('href', uniswap_link)
    $('.buy-token-url-value').css({ display: 'inline-block' })
    ido_listed_status()
  }
  if (current_date < ido_open_date) {
    $('.buy-token-btn').addClass('disabled')
    $('.buy-btn-status').text('IDO not started yet')
    $('.buy-btn-status').show()
  }
  if (current_date > ido_close_date) {
    $('.buy-token-btn').addClass('disabled')
    $('.buy-btn-status').text('IDO is closed')
    $('.buy-btn-status').show()
  }
}

function ido_ui () {
  ido_init() // Initialize IDO
  let ido_data = window.ido_detail_data
  let ido_token_price = ido_data.token.token_price,
    ido_hard_cap = ido_data.token.hard_cap,
    ido_open_date = ido_data.token.opens_at,
    ido_close_date = ido_data.token.closes_at,
    percentage_allocated = ido_data.uniswap_lp.percentage_to_lp,
    uniswap_listing_time = ido_data.uniswap_lp.listing_time,
    total_invested = ido_data.total_invested,
    ido_banner = ido_data.social.banner,
    ido_name = ido_data.name,
    ido_description = ido_data.details,
    ido_website = ido_data.social.website,
    ido_telegram = ido_data.social.telegram,
    ido_twitter = ido_data.social.twitter,
    ido_discord = ido_data.social.discord,
    ido_medium = ido_data.social.medium,
    ido_whitepaper = ido_data.social.whitepaper,
    project_unsold_address = ido_data.token.return_address,
    project_token_address = ido_data.token.token_address,
    presale_address = ido_data.presale_address,
    lockdown_address = ido_data.uniswap_lp.lockdown_address

  let presale_address_link = `https://etherscan.io/address/${presale_address}`
  let lockdown_address_link = `https://etherscan.io/address/${lockdown_address}`
  let project_token_address_link = `https://etherscan.io/address/${project_token_address}`

  let ido_hash = ido_name.replace(/ /g, '')

  let page_url = get_url_parameter()
  let twitter_share_url = `https://twitter.com/intent/tweet?text=Checkout the %23${ido_hash} IDO listed on %23dogesnacks 🚀🚀🚀 %20%0Ahttps://dogesnacks.org/${page_url}`

  let total_ido_token = ido_hard_cap / ido_token_price
  let liquidity_eth = (percentage_allocated / 100) * ido_hard_cap
  let current_liquidity_eth = (percentage_allocated / 100) * total_invested

  $('.total-ido-token-value').text(total_ido_token.toFixed(4))
  $('.ido-open-date-value').text(
    moment(ido_open_date).format('MMM DD, YYYY @ HH:mm (UTCZ)')
  )
  $('.ido-close-date-value').text(
    moment(ido_close_date).format('MMM DD, YYYY @ HH:mm (UTCZ)')
  )
  $('.uniswap-listing-time-value').text(
    moment(uniswap_listing_time).format('MMM DD, YYYY @ HH:mm (UTCZ)')
  )
  $('.project-token-address-value a').text(project_token_address)
  $('.project-token-address-value a').attr('href', project_token_address_link)
  $('.presale-address-value a').text(presale_address)
  $('.presale-address-value a').attr('href', presale_address_link)
  $('.liquidity-lock-address-value a').text(lockdown_address)
  $('.liquidity-lock-address-value a').attr('href', lockdown_address_link)
  $('.max-liquidity-allocation-value').text(`${liquidity_eth} ETH`)
  $('.current-liquidity-allocation').text(
    `${current_liquidity_eth} ETH (${percentage_allocated}% of Total Raised)`
  )
  $('.total-invested').text(`${total_invested} ETH`)
  $('.twitter-share').attr('href', twitter_share_url)

  if (ido_website) {
    $('.website-url-value').attr('href', get_clickable_link(ido_website))
    $('.website-url-value').css({ display: 'inline-block' })
  }
  if (ido_telegram) {
    $('.telegram-url-value').attr('href', get_clickable_link(ido_telegram))
    $('.telegram-url-value').css({ display: 'inline-block' })
  }
  if (ido_twitter) {
    $('.twitter-url-value').attr('href', get_clickable_link(ido_twitter))
    $('.twitter-url-value').css({ display: 'inline-block' })
  }
  if (ido_discord) {
    $('.discord-url-value').attr('href', get_clickable_link(ido_discord))
    $('.discord-url-value').css({ display: 'inline-block' })
  }
  if (ido_whitepaper) {
    $('.whitepaper-url-value').attr('href', get_clickable_link(ido_whitepaper))
    $('.whitepaper-url-value').css({ display: 'inline-block' })
  }
  if (ido_medium) {
    $('.medium-url-value').attr('href', get_clickable_link(ido_medium))
    $('.medium-url-value').css({ display: 'inline-block' })
  }
  count_down(ido_open_date)
}

function get_ido_ui_update () {
  let ido_data = window.ido_detail_data
  let ido_name = ido_data.name
  let doge_id = ido_data.doge_id
  let url_str = ido_name.replace(/\s+/g, '-').toLowerCase()
  let url = `presale/${url_str}/${doge_id}`
  let settings = {
    type: 'GET',
    url: url
  }
  $.ajax(settings)
    .done(function (response) {
      window.ido_detail_data = response
      ido_ui()
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      console.error(errorThrown)
    })
}

function ido_listed_status () {
  $('.c-days').text('')
  $('.c-hours').text('')
  $('.c-mins').text('')
  $('.c-secs').text('')
  $('.c-end').text('IDO Listed')
}
