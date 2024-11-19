$(function () {
  //get_ido_list();
  ido_list_click()
})

function get_ido_list () {
  let settings = {
    type: 'GET',
    url: 'presale'
  }
  $.ajax(settings)
    .done(function (response) {
      update_ido_table(response)
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      console.error(errorThrown)
    })
}

function update_ido_table (ido_list_data) {
  const ido_list_items = ido_list_data.items
  $('.ido-list-table tbody').empty()
  let table_html = ''
  for (let i = 0; i < ido_list_items.length; i++) {
    let ido_name = ido_list_items[i].name
    let listing_rate = ido_list_items[i].uniswap_lp.listing_rate
    let amount = (1 / listing_rate).toFixed(4)
    let doge_id = ido_list_items[i].doge_id
    let presale_address = ido_list_items[i].presale_address
    let hard_cap = ido_list_items[i].token.hard_cap
    let total_invested = ido_list_items[i].total_invested
    let ido_open_date = ido_list_items[i].token.opens_at
    let ido_close_date = ido_list_items[i].token.closes_at
    let current_date = new Date().getTime()
    ido_open_date = new Date(ido_open_date).getTime()
    ido_close_date = new Date(ido_close_date).getTime()
    let random_color_code = random_color()
    let status_code = ido_list_items[i].current_state
    let status_display = ido_status_display(status_code)
    if (status_code == 0) {
      if (current_date >= ido_open_date && current_date < ido_close_date) {
        status_display = 'IDO Started'
      } else if (current_date < ido_open_date) {
        status_display = 'Awaiting IDO'
      }
    }
    let url_str = ido_name.replace(/\s+/g, '-').toLowerCase()
    let table = `<tr data-dogeid="${doge_id}" data-presaleaddress="${presale_address}" data-idoname="${url_str}"><td><span class="random-color" style="background-color: ${random_color_code}"></span><span>${ido_name}</span></td><td>1 ETH = ${amount} Tokens</td><td>${total_invested} / ${hard_cap} Hard Cap</td><td>${status_display}</td></tr>`

    table_html = table_html + table
  }
  $('.ido-list-table tbody').html(table_html)
  ido_list_click()
}

function ido_list_click () {
  //Launch pad table row click to view respective IDO Detail page
  $('.ido-list-table tbody tr').click(function () {
    const el = $(this)

    let doge_id = el.data('dogeid')
    let ido_name_raw = el.data('idoname')
    let ido_name = ido_name_raw.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ''
    ) // removing emojis when generating the url
    let ido_url = `ido-${ido_name}-${doge_id}`
    window.open(ido_url, '_self')
  })
}
