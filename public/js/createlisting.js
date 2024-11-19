import { SnacksAddress } from './ido/config.js'
import {
  approveTokens,
  createPresale,
  listenOnDogeSnacksFactoryEvents
} from './ido/DogeSnacksFactory.js'
//import { DogeSnacksPresale } from "./ido/DogeSnacksPresale.js";
// listen for TokenAllowanceSuccess event from approveTokens function that will
// get triggered when approve transaction is successfully mined on Ethereum
window.addEventListener('TokenAllowanceSuccess', async () => {
  alert_msg_box(
    'Token Allowance approved. Now you may create the presale listing.'
  )
  //can now call createPresale
  action_loader(0)
  $('.awaiting-btn').hide()
  $('.create-presale, .back-btn').css({ display: 'block' })
})

window.addEventListener('TokenAllowanceFailed', async () => {
  alert_msg_box('Token Allowance failed. Please try again!')
  action_loader(0)
  $('.submit-approve, .back-btn').css({ display: 'block' })
  $('.awaiting-btn').hide()
})

window.addEventListener('FEPresaleCreated', async () => {
  alert_msg_box('Listing is successfully created')
  reset_form()
  action_loader(0)
  $('.awaiting-btn').hide()
  $('.back-btn').show()
})

window.addEventListener('FEPresaleCreateFailed', async () => {
  alert_msg_box('Presale Creation failed. Please try again!')
  action_loader(0)
  $('.awaiting-btn').hide()
  $('.create-presale, .back-btn').show()
})

// On Document Load
$(function () {
  //Add DogeSnacks Factory Address
  $('.doge-snacks-address').text(DogeSnacksFactoryAddress)
  // Form initialization to check if any pending presale is there and autopopulate the form
  form_init()

  // Adding default dates for ido date fields
  let cur_date = new Date()
  //moment().utc()
  //moment().add(5, 'minutes')
  // add a day
  let default_close_date = cur_date.setDate(cur_date.getDate() + 1)
  let default_uni_date = cur_date.setDate(cur_date.getDate() + 1)

  $('#ido-open-date').data('timestamp', new Date().getTime())
  $('#ido-close-date').data('timestamp', new Date(default_close_date).getTime())
  $('#uniswap-listing-time').data(
    'timestamp',
    new Date(default_uni_date).getTime()
  )

  // Open Date initialize with datepicker
  $('#ido-open-date').flatpickr({
    enableTime: true,
    dateFormat: 'Y-m-d H:i',
    defaultDate: new Date(),
    minDate: new Date(),
    formatDate: (date, format, locale) => {
      return moment(date).format('MMM DD, YYYY @ HH:mm (UTCZ)')
    },
    onChange: function (selectedDates, dateStr, instance) {
      let t = new Date(selectedDates[0]).getTime()
      $('#ido-open-date').data('timestamp', t)
    }
  })
  // Close Date initialize with datepicker
  $('#ido-close-date').flatpickr({
    enableTime: true,
    dateFormat: 'Y-m-d H:i',
    defaultDate: default_close_date,
    minDate: new Date(),
    formatDate: (date, format, locale) => {
      return moment(date).format('MMM DD, YYYY @ HH:mm (UTCZ)')
    },
    onChange: function (selectedDates, dateStr, instance) {
      let t = new Date(selectedDates[0]).getTime()
      let open_t = $('#ido-open-date').data('timestamp')
      $('#ido-close-date').data('timestamp', t)
      //IDO Closing time  cannot be lower than IDO Opening time
      if (open_t >= t) {
        let h = $('#ido-close-date').parent().find('.input-error-wrap')

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
    }
  })
  // Uniswap Listing initialize with datepicker
  $('#uniswap-listing-time').flatpickr({
    enableTime: true,
    dateFormat: 'Y-m-d H:i',
    defaultDate: default_uni_date,
    minDate: new Date(),
    formatDate: (date, format, locale) => {
      return moment(date).format('MMM DD, YYYY @ HH:mm (UTCZ)')
    },
    onChange: function (selectedDates, dateStr, instance) {
      let t = new Date(selectedDates[0]).getTime()
      let close_t = $('#ido-close-date').data('timestamp')
      $('#uniswap-listing-time').data('timestamp', t)
      //Uniswap listing time cannot be lower than IDO closing time
      if (close_t > t) {
        let h = $('#uniswap-listing-time').parent().find('.input-error-wrap')

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
    }
  })

  // About Project character remaining calculation
  let about_max = 256
  $('#about-project').keyup(function () {
    let text_length = $(this).val().length
    text_length = about_max - text_length
    $('.txt-char').text(text_length)
  })

  // Dragger for Percentage Allocated to Uniswap
  var rate_drag = new Dragdealer('rate-drag', {
    animationCallback: function (x, y) {
      if (x < 0.01) {
        x = 0.01
      }
      let v = (x * 100).toFixed(0)
      $('.rate-txt span').text(v)
      $('#percentage-allocated').val(v)
      let ido_hard_cap = $('#ido-hard-cap').val()
      let uniswap_listing_rate = $('#uniswap-listing-rate').val()
      let liquidity_eth = 0.0
      let liquidity_tokens = 0.0
      if (ido_hard_cap != '') {
        liquidity_eth = ((v / 100) * ido_hard_cap).toFixed(2)
        if (uniswap_listing_rate != '') {
          liquidity_tokens = (liquidity_eth / uniswap_listing_rate).toFixed(2)
        }
      }
      $('.allocated-eth').text(liquidity_eth)
      $('.allocated-tokens').text(liquidity_tokens)
    }
  })
  // Form Validation
  $('.submit-validation').click(function () {
    listing_validation()
  })

  // Approve event
  $('.submit-approve').click(function () {
    let form_data = window.localStorage.getItem('listing_form')
    form_data = safe_parse(form_data)
    if (form_data == null) {
      let err_msg =
        "Couldn't retrieve the IDO Form Data. Please try to create presale again."
      alert_msg_box(err_msg)
      return
    }
    const project_token_address = form_data.project_token_address

    try {
      //get provider from Metamask
      const provider = new ethers.providers.Web3Provider(window.ethereum)

      //get wallet for signing a contract transactions
      const wallet = provider.getSigner()
      //approve DogeSnacksFactory to transfer tokens from ERC20 Token Address from wallet.address
      $('.submit-approve, .back-btn').hide()
      $('.awaiting-btn').show()
      action_loader(1)
      approveTokens(DogeSnacksFactoryAddress, project_token_address, wallet)
    } catch (error) {
      const message = extract_error_message_from_error(error)
      alert_msg_box(message)
      $('.awaiting-btn').hide()
      $('.submit-approve, .back-btn').show()
      action_loader(0)
    }
  })

  // Create presale event
  $('.create-presale').click(function () {
    let form_data = window.localStorage.getItem('listing_form')
    form_data = safe_parse(form_data)
    if (form_data == null) {
      let err_msg =
        "Couldn't retrieve the IDO Form Data. Please try to create presale again."
      alert_msg_box(err_msg)
      return
    }
    const project_token_address = form_data.project_token_address
    let project_unsold_address = form_data.project_unsold_address
    if (project_unsold_address == '') {
      project_unsold_address = '0x000000000000000000000000000000000000dead'
    }

    try {
      //get provider from Metamask
      const provider = new ethers.providers.Web3Provider(window.ethereum)

      //get wallet for signing a contract transactions
      const wallet = provider.getSigner()

      createPresale(
        wallet,
        provider,
        project_token_address,
        project_unsold_address,
        DogeSnacksFactoryAddress
      )
    } catch (error) {
      const message = extract_error_message_from_error(error)
      alert_msg_box(message)
    }
  })
  // Reset Form
  $('.reset-form').click(function () {
    reset_form()
  })
})
function form_init () {
  const wallet_connected = window.localStorage.getItem('wallet_connected')

  const local_form_data = window.localStorage.getItem('listing_form')
  let form_data = ''
  if (local_form_data) {
    form_data = safe_parse(local_form_data)
  }

  const local_presale_tx = window.localStorage.getItem('create_presale')
  let presale_tx = ''
  if (local_presale_tx) {
    presale_tx = safe_parse(local_presale_tx)
  }

  if (wallet_connected != 0) {
    if (form_data && !presale_tx) {
      $('#project-name').val(form_data.project_name)
      $('#about-project').val(form_data.project_detail)
      $('#project-banner-img').val(form_data.project_banner)

      $('#project-token-address').val(form_data.project_token_address)
      $('#unsold-token-address').val(form_data.project_unsold_address)

      $('#ido-token-price').val(form_data.ido_token_price)
      $('#ido-soft-cap').val(form_data.ido_soft_cap)
      $('#ido-hard-cap').val(form_data.ido_hard_cap)

      $('#max-inv-per').val(form_data.max_inv_per_wallet)
      $('#min-inv-per').val(form_data.min_inv_per_wallet)

      $('#ido-open-date').data('timestamp', form_data.ido_open_date * 1000)
      $('#ido-open-date').val(
        moment(form_data.ido_open_date).format('MMM DD, YYYY @ HH:mm (UTCZ)')
      )
      $('#ido-close-date').data('timestamp', form_data.ido_close_date * 1000)
      $('#ido-close-date').val(
        moment(form_data.ido_close_date).format('MMM DD, YYYY @ HH:mm (UTCZ)')
      )

      $('#uniswap-listing-rate').val(form_data.uniswap_listing_rate)
      $('#percentage-allocated').val(form_data.percentage_allocated)
      $('#uniswap-listing-time').data(
        'timestamp',
        form_data.uniswap_listing_time * 1000
      )
      $('#uniswap-listing-time').val(
        moment(form_data.uniswap_listing_time).format(
          'MMM DD, YYYY @ HH:mm (UTCZ)'
        )
      )
      $('#lock-duration').val(form_data.lock_duration)

      $('#website-url').val(form_data.website_url)
      $('#telegram-url').val(form_data.telegram_url)
      $('#twitter-url').val(form_data.twitter_url)
      $('#discord-url').val(form_data.discord_url)
      $('#medium-url').val(form_data.medium_url)
      $('#whitepaper-url').val(form_data.whitepaper_url)
    }
  }
}

function reset_form () {
  window.localStorage.removeItem('listing_form')
  window.localStorage.removeItem('create_presale')
  window.localStorage.removeItem('token_approval')
  $('#create-list-form').trigger('reset')
}

function listing_validation () {
  let project_name = $('#project-name').val()
  let project_detail = $('#about-project').val()
  let project_banner = $('#project-banner-img').val()

  let project_token_address = $('#project-token-address').val()
  let project_unsold_address = $('#unsold-token-address').val()

  let ido_token_price = $('#ido-token-price').val()
  let ido_soft_cap = $('#ido-soft-cap').val()
  let ido_hard_cap = $('#ido-hard-cap').val()

  let max_inv_per_wallet = $('#max-inv-per').val()
  let min_inv_per_wallet = $('#min-inv-per').val()

  let ido_open_date = $('#ido-open-date').data('timestamp')
  let ido_close_date = $('#ido-close-date').data('timestamp')

  let uniswap_listing_rate = $('#uniswap-listing-rate').val()
  let percentage_allocated = $('#percentage-allocated').val()
  let uniswap_listing_time = $('#uniswap-listing-time').data('timestamp')
  let lock_duration = $('#lock-duration').val()

  let website_url = $('#website-url').val()
  let telegram_url = $('#telegram-url').val()
  let twitter_url = $('#twitter-url').val()
  let discord_url = $('#discord-url').val()
  let medium_url = $('#medium-url').val()
  let whitepaper_url = $('#whitepaper-url').val()

  //validation
  if (project_name === '') {
    let h = $('#project-name').parent().find('.input-error-wrap')

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
  } else if (project_banner != '' && !validator.isURL(project_banner)) {
    let h = $('#project-banner-img').parent().find('.input-error-wrap')

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
  } else if (!validator.isEthereumAddress(project_token_address)) {
    let h = $('#project-token-address').parent().find('.input-error-wrap')

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
  } else if (
    project_unsold_address != '' &&
    !validator.isEthereumAddress(project_unsold_address)
  ) {
    let h = $('#unsold-token-address').parent().find('.input-error-wrap')

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
  } else if (ido_token_price == 0) {
    let h = $('#ido-token-price').parent().find('.input-error-wrap')

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
  } else if (ido_soft_cap == 0) {
    let h = $('#ido-soft-cap').parent().find('.input-error-wrap')
    h.find('.input-error').text('Please enter Soft Cap')
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
  } else if (ido_hard_cap == 0) {
    let h = $('#ido-hard-cap').parent().find('.input-error-wrap')
    h.find('.input-error').text('Please enter Hard Cap')
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
  } else if (parseFloat(ido_hard_cap) < parseFloat(ido_soft_cap)) {
    let h = $('#ido-hard-cap').parent().find('.input-error-wrap')
    h.find('.input-error').text(
      'Hard Cap value cannot be smaller than Soft Cap'
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
  } else if (max_inv_per_wallet == 0) {
    let h = $('#max-inv-per').parent().find('.input-error-wrap')

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
  } else if (min_inv_per_wallet == 0) {
    let h = $('#min-inv-per').parent().find('.input-error-wrap')

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
  } else if (ido_open_date >= ido_close_date) {
    let h = $('#ido-close-date').parent().find('.input-error-wrap')

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
  } else if (uniswap_listing_rate == 0) {
    let h = $('#uniswap-listing-rate').parent().find('.input-error-wrap')

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
  } else if (lock_duration == 0) {
    let h = $('#lock-duration').parent().find('.input-error-wrap')

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
  } else if (ido_close_date > uniswap_listing_time) {
    let h = $('#uniswap-listing-time').parent().find('.input-error-wrap')

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
  } else if (website_url != '' && !validator.isURL(website_url)) {
    let h = $('#website-url').parent().find('.input-error-wrap')

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
  } else if (telegram_url != '' && !validator.isURL(telegram_url)) {
    let h = $('#telegram-url').parent().find('.input-error-wrap')

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
  } else if (twitter_url != '' && !validator.isURL(twitter_url)) {
    let h = $('#twitter-url').parent().find('.input-error-wrap')

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
  } else if (discord_url != '' && !validator.isURL(discord_url)) {
    let h = $('#discord-url').parent().find('.input-error-wrap')

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
  } else if (medium_url != '' && !validator.isURL(medium_url)) {
    let h = $('#medium-url').parent().find('.input-error-wrap')

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
  } else if (whitepaper_url != '' && !validator.isURL(whitepaper_url)) {
    let h = $('#whitepaper-url').parent().find('.input-error-wrap')

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

  //Coverting local time to UTC
  ido_open_date = moment(ido_open_date).utc()
  ido_close_date = moment(ido_close_date).utc()
  uniswap_listing_time = moment(uniswap_listing_time).utc()

  let data_string = {
    project_name: project_name,
    project_detail: project_detail,
    project_banner: project_banner,
    project_token_address: project_token_address,
    project_unsold_address: project_unsold_address,
    ido_token_price: ido_token_price,
    ido_soft_cap: ido_soft_cap,
    ido_hard_cap: ido_hard_cap,
    max_inv_per_wallet: max_inv_per_wallet,
    min_inv_per_wallet: min_inv_per_wallet,
    ido_open_date: parseInt(new Date(ido_open_date).getTime() / 1000), //Coverting from milliseconds to seconds because block.timestamp returns in seconds
    ido_close_date: parseInt(new Date(ido_close_date).getTime() / 1000),
    uniswap_listing_rate: uniswap_listing_rate,
    percentage_allocated: percentage_allocated,
    uniswap_listing_time: parseInt(
      new Date(uniswap_listing_time).getTime() / 1000
    ),
    lock_duration: lock_duration,
    website_url: website_url,
    telegram_url: telegram_url,
    twitter_url: twitter_url,
    discord_url: discord_url,
    medium_url: medium_url,
    whitepaper_url: whitepaper_url
  }
  window.localStorage.setItem('listing_form', JSON.stringify(data_string))

  $('.project-name-value').text(project_name)
  $('.about-project-value').text(project_detail)
  $('.project-banner-img-value').text(project_banner)

  $('.project-token-address-value').text(project_token_address)
  $('.unsold-token-address-value').text(project_unsold_address)

  $('.ido-token-price-value').text(ido_token_price)
  $('.ido-soft-cap-value').text(ido_soft_cap)
  $('.ido-hard-cap-value').text(ido_hard_cap)

  $('.max-inv-per-value').text(max_inv_per_wallet)
  $('.min-inv-per-value').text(min_inv_per_wallet)

  $('.ido-open-date-value').text(
    moment(ido_open_date).format('MMM DD, YYYY @ HH:mm (UTCZ)')
  )
  $('.ido-close-date-value').text(
    moment(ido_close_date).format('MMM DD, YYYY @ HH:mm (UTCZ)')
  )

  $('.uniswap-listing-rate-value').text(uniswap_listing_rate)
  $('.percentage-allocated-value').text(percentage_allocated)
  $('.uniswap-listing-time-value').text(
    moment(uniswap_listing_time).format('MMM DD, YYYY @ HH:mm (UTCZ)')
  )
  $('.lock-duration-value').text(lock_duration)

  $('.website-url-value').text(website_url)
  $('.telegram-url-value').text(telegram_url)
  $('.twitter-url-value').text(twitter_url)
  $('.discord-url-value').text(discord_url)
  $('.medium-url-value').text(medium_url)
  $('.whitepaper-url-value').text(whitepaper_url)

  let listing_preview_modal = new bootstrap.Modal(
    document.getElementById('listing-preview-modal')
  ) // Returns a Bootstrap modal instance

  listing_preview_modal.show()
}
