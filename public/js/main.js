window.error_map = {
  1: 'Factory address cannot be zero.',
  2: 'DogeSnacks Dev address cannot be zero.',
  3: 'Golden Tuck Shop address cannot be zero.',
  4: 'You are not a DogeSnacks Developer.',
  5: 'You are not a DogeSnacks Developer.',
  6: 'You are not an IDO creator or DogeSnacks Factory Contract.',
  7: 'You are not an IDO creator.',
  8: 'Address not whitelisted.',
  9: 'The IDO has been canceled.',
  10: 'You are not an IDO investor yet.',
  11: 'Tokens have already been claimed or refunded.',
  12: "'The IDO creators' address can not be zero.",
  13: 'The token address can not be zero.',
  14: 'The unsold token dump address can not be zero.',
  15: 'Total tokens available for sale can not be zero.',
  16: 'Token price in Wei can not be zero.',
  17: 'You can not set the IDO open time in the past.',
  18: 'You can not set the IDO close time in the past.',
  19: 'The hard cap can not be zero.',
  20: 'The hard cap should be greater than (token amount * token price).',
  21: 'The soft cap should be less than the hard cap.',
  22: 'Minimum Wei investment should be less than maximum Wei investment.',
  23: 'IDO open time can not be after the IDO closing time.',
  24: "Would you please ensure that the 'About Project' text is less than 256 chars/bytes?",
  25: 'Uniswap Listing Price should be greater than zero.',
  26: 'Uniswap Liquidity Adding Time should be greater than zero.',
  27: 'Uniswap Liquidity Pool Lock Duration In Days should be greater than zero.',
  28: 'Uniswap Liquidity Percentage Allocation should be greater than zero.',
  29: 'IDO close time should be greater than zero.',
  30: 'Uniswap Liquidity Listing time should be greater than the closing time.',
  31: 'The IDO has not started yet. Please see the IDO starting date and time.',
  32: 'The IDO was successfully launched and is now closed for investments.',
  33: 'The IDO has successfully reached the hard cap and is now closed for investments.',
  34: 'There are no more tokens left to purchase.',
  35: 'The investment amount is not sufficient enough for acquiring the tokens.',
  36: 'You have not reached the minimum investment required to participate in this IDO.',
  37: 'You have reached your maximum investment limit.',
  38: 'The IDO has not reached the hard cap or the soft cap.',
  39: 'The IDO has already been successfully listed.',
  40: 'You should be the IDO creator to lock and list this IDO.',
  41: 'The connected wallet is not the creator of this IDO.',
  42: 'You should be an IDO creator or an investor.',
  43: 'The investments in this IDO have not reached the soft cap.',
  44: 'The conditions for listing the IDO have not been fulfilled.',
  45: 'You can only claim your tokens once the Uniswap listing is live.',
  46: 'Not yet opened.',
  47: 'To be refunded, the IDO should be canceled or aborted.',
  48: 'To be refunded, the IDO should be canceled or aborted.',
  49: 'To be refunded, the IDO should be canceled or aborted.',
  50: 'Pre-sale contract has no more funds.',
  51: 'You are not an IDO creator, DogeSnacks Developer, and the Uniswap listing is already successfully created.',
  52: 'You are not an IDO creator, DogeSnacks Developer, and the Uniswap listing is already successfully created.',
  53: 'The IDO has already been cancelled.',
  54: 'To collect the raised funds, the IDO should be listed on Uniswap.',
  55: 'To collect the raised funds, the IDO should not be canceled.',
  56: 'Should wait till claim time',
  57: 'A minimum of 50% of the investors should have claimed their tokens to collect the raised funds.',
  58: 'Your token has already been listed on Uniswap.',
  59: 'Golden Tuck Shop address cannot be zero.',
  60: 'Pausable: paused',
  61: 'Pausable: not paused',
  62: 'The connected wallet does not have access to the Golden Tuck Shop.',
  77: 'You should be an IDO creator or an investor.'
}

window.alert_modal = new bootstrap.Modal(
  document.getElementById('alert-modal'),
  {
    keyboard: false
  }
)

$(function () {
  menu_active()

  //hide preloader
  setTimeout(function () {
    $('.preloader').fadeOut(400)
  }, 500)
})

function action_loader (action) {
  if (action) {
    $('.action-loader').fadeIn(300)
  } else {
    $('.action-loader').fadeOut(300)
  }
}

function ido_status_display (status_code) {
  /*
    enum PreSaleIDOState {
        Created = 0,
        IDOStarted = 1,
        Cancelled = 2,
        IDOFailed = 3,
        SoftCapReached = 4,
        HardCapReached = 5,
        UniSwapListed = 6
      }
    */
  const status_display_array = [
    'Created',
    'IDO Started',
    'Cancelled',
    'IDO Failed',
    'Soft Cap Reached',
    'Hard Cap Reached',
    'Uniswap Listed'
  ]
  if (status_code < status_display_array.length) {
    return status_display_array[status_code]
  } else {
    return 'Invalid status'
  }
}

function random_color () {
  let random_color_code =
    '#' +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')
  return random_color_code
}

function count_down (ido_close_date) {
  let count_down_date = new Date(ido_close_date).getTime()
  let count_method = setInterval(function () {
    let now = new Date().getTime()
    let timeleft = count_down_date - now

    // Calculating the days, hours, minutes and seconds left
    let days = Math.floor(timeleft / (1000 * 60 * 60 * 24))
    let hours = Math.floor(
      (timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    )
    let minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60))
    let seconds = Math.floor((timeleft % (1000 * 60)) / 1000)

    // Result is output to the specific element
    if (days == 1) {
      $('.c-days').text(`${days} day `)
    } else if (days > 1) {
      $('.c-days').text(`${days} days `)
    }

    if (hours == 1) {
      $('.c-hours').text(`${hours} hr `)
    } else if (hours > 1) {
      $('.c-hours').text(`${hours} hrs `)
    }

    if (minutes == 1) {
      $('.c-mins').text(`${minutes} min `)
    } else if (minutes > 1) {
      $('.c-mins').text(`${minutes} mins `)
    }
    if (seconds == 1) {
      $('.c-secs').text(`${seconds} sec`)
    } else if (seconds > 1) {
      $('.c-secs').text(`${seconds} secs`)
    }

    // Display the message when countdown is over
    if (timeleft < 0) {
      clearInterval(count_method)
      $('.c-days').text('')
      $('.c-hours').text('')
      $('.c-mins').text('')
      $('.c-secs').text('')
      $('.c-end').text('IDO Started')
    }
  }, 1000)
}
function extract_error_message_from_error (error) {
  try {
    if (error && error.data && error.data.message) {
      const result = error.data.message
      let msg_arr = result.split(' ')
      let msg_code = msg_arr[msg_arr.length - 1]
      if (error_map[msg_code]) {
        msg = error_map[msg_code]
        if (msg !== null) {
          return msg
        }
        throw result //throw some random stuff
      }
      throw result
    }
    if (
      error &&
      error.message &&
      typeof error.message == 'string' &&
      error.message.indexOf("the tx doesn't have the correct nonce") != -1
    ) {
      return 'Please reset your nonce in Metamask'
    }
    throw error
  } catch (error) {
    console.error(error)
    return 'System error, please contact the DogeSnacks team'
  }
}

function alert_msg_box (msg) {
  $('.alert-body-txt').html('')
  $('.alert-body-txt').html(msg)
  alert_modal.show()
}

function menu_active () {
  var page = get_url_parameter()
  var page_class = '.' + page + '-link'
  var pages_with_nowallet = ['', 'about', 'snacks', 'help', 'roadmap']

  // Hide wallet connect/disconnect and create listing link on some pages
  if (pages_with_nowallet.includes(page)) {
    $('.disconnect-metamask, .createlisting-link, .wallet-modal-btn').hide()
  }
  // Add active class in menu link of the current page
  if ($(page_class).length) {
    var menu_item = $('.dogesnacks-nav').find(page_class)
    $(menu_item).addClass('active')
  }
}

function safe_parse (object) {
  try {
    object = JSON.parse(object)
    return object
  } catch (error) {
    console.error(error)
    return null
  }
}
//Get clean and clickable link

function get_clickable_link (link) {
  let cleaned_link =
    link.startsWith('http://') || link.startsWith('https://')
      ? link
      : `https://${link}`
  return cleaned_link
}

//format number with comma

function add_comma_format (number) {
  let formatted_number = number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return formatted_number
}
