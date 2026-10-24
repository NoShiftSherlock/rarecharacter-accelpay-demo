/* Rare Character x AccelPay: static commerce stand-in.
 *
 * Rare Character has no LiquidCommerce partner account, so the Elements SDK
 * cannot run. This file reproduces the product element, cart drawer and
 * checkout, and publishes the SAME `lce:actions.*` CustomEvents the SDK does
 * (same { data, metadata } envelope). See elements-config.js for the switch.
 *
 * WHAT IS REAL
 *   Products, bottle images, tasting notes and ABV: the brand's ReserveBar.com
 *   listings (24 Oct 2026). Retailer names, cities, prices and stock: the
 *   LiquidCommerce retailer feed (variants synced 6 to 19 Sep 2026).
 * WHAT IS ILLUSTRATIVE
 *   "Licensed retailer in <state>" routes for states with no stocking retailer
 *   today (priced at the ReserveBar.com list price), shipping and delivery
 *   fees, tax, and the order confirmation. No order is ever placed.
 */
(function () {
  'use strict';

  // ------------------------------------------------------------- retailers
  // Real network retailers that carry Rare Character today. `metro` is the
  // set of ZIP3 prefixes treated as local for same-day delivery.
  const RETAILERS = {
    'r-vista': { id: 'r-vista', name: 'Vista Wine & Spirits', city: 'Santee, CA', st: 'CA', metro: ['919', '920', '921'] },
    'r-lbarn': { id: 'r-lbarn', name: 'Liquor Barn', city: 'Wheeling, IL', st: 'IL', metro: ['600', '601', '602', '603', '604', '605', '606'] },
    'r-brep':  { id: 'r-brep',  name: 'Bottle Republic', city: 'Somerset, NJ', st: 'NJ', metro: ['070', '071', '072', '073', '077', '079', '088', '089'] }
  };

  // Real per-retailer price (cents) and stock from the retailer feed.
  const VARIANTS = {
    'cs-bourbon-s4b6': [{ retailerId: 'r-brep', price: 9999, stock: 86 }],
    'cs-rye-s4b7':     [{ retailerId: 'r-brep', price: 9999, stock: 153 }],
    'amburana-rye-ii': [{ retailerId: 'r-lbarn', price: 15999, stock: 5 }, { retailerId: 'r-vista', price: 11299, stock: 0 }],
    'malt-2011-s3b7':  [{ retailerId: 'r-vista', price: 19299, stock: 3 }],
    'maple-s2b10':     [{ retailerId: 'r-vista', price: 12699, stock: 0 }]
  };

  const CATALOG = {
    'cs-bourbon-s4b6': {
      id: 'cs-bourbon-s4b6', series: 'Single Barrel Series', name: 'Cask Strength Kentucky Straight Bourbon', batch: 'S4B6',
      type: 'Bourbon', abv: '60.26%', price: 9999, image: 'assets/bottle-cs-bourbon.png',
      rb: 'https://www.reservebar.com/products/rare-character-cask-strength-kentucky-straight-bourbon-s4b6/GROUPING-2554484',
      nose: 'Orange citrus, toasted vanilla, baking spice, chocolate, rye bread, oak.',
      palate: 'Honey, orange zest, brûléed sugar, cinnamon, bread pudding.',
      finish: 'Candied cherry, mint, cola, roasted nuts, leather tannins.'
    },
    'cs-rye-s4b7': {
      id: 'cs-rye-s4b7', series: 'Single Barrel Series', name: 'Cask Strength Kentucky Straight Rye', batch: 'S4B7',
      type: 'Rye', abv: '60.71%', price: 9999, image: 'assets/bottle-cs-rye.png',
      rb: 'https://www.reservebar.com/products/rare-character-cask-strength-kentucky-straight-rye-s4b7/GROUPING-2554485',
      nose: 'Baked rye, lime zest, toffee, rosemary, clove, cardamom.',
      palate: 'Grain, thyme, grapefruit zest, honey, cinnamon, vanilla.',
      finish: 'Orange, honey, herbal tea, baking spices, maple syrup, toasted oak.'
    },
    'amburana-rye-ii': {
      id: 'amburana-rye-ii', series: 'Native Wood & Finishing Series', name: 'Single Barrel Amburana Cask Finished Rye II', batch: '',
      type: 'Rye', abv: '59%', price: 15999, image: 'assets/bottle-amburana.png',
      rb: 'https://www.reservebar.com/products/rare-character-single-barrel-amburana-cask-finished-rye-ii/GROUPING-2472545',
      nose: 'Cinnamon, pastry, woody spice, clove, allspice and nuttiness.',
      palate: 'Cacao, almond, cinnamon, crème brûlée and citrus.',
      finish: 'Candied orange, dark chocolate, cashew, toasted oak and pipe tobacco.'
    },
    'malt-2011-s3b7': {
      id: 'malt-2011-s3b7', series: 'Exceptional Series', name: 'Kentucky Malt Whiskey 2011', batch: 'S3B7',
      type: 'American Malt', abv: '52%', price: 19299, image: 'assets/bottle-malt2011.png',
      rb: 'https://www.reservebar.com/products/rare-character-exceptional-series-kentucky-malt-whiskey-2011-s3b7/GROUPING-2324462',
      nose: 'Malt, caramel, chocolate and hazelnut.',
      palate: 'Honey, marzipan, malt, dark fruit, walnut and toasted oak.',
      finish: 'Dark chocolate, cereal, stone fruit and tea.'
    },
    'maple-s2b10': {
      id: 'maple-s2b10', series: 'Native Wood & Finishing Series', name: 'Bourbon Finished in Maple Cask', batch: 'S2B10',
      type: 'Bourbon', abv: '56%', price: 12699, image: 'assets/bottle-maple.png',
      rb: 'https://www.reservebar.com/products/rare-character-bourbon-finished-in-maple-cask-s2b10/GROUPING-2461316',
      nose: 'Baking spices, toasted rye grains, chocolate, pancakes and maple syrup.',
      palate: 'Cacao, vanilla, maple, graham cracker and a touch of mint.',
      finish: 'Long, with dark chocolate, ripe orange citrus, a subtle nuttiness and ginger spice.'
    }
  };
  const ORDER = ['cs-bourbon-s4b6', 'cs-rye-s4b7', 'amburana-rye-ii', 'malt-2011-s3b7', 'maple-s2b10'];

  const SHIP_FEE = 1499, LOCAL_FEE = 999, TAX = 0.08, MAX_QTY = 6;

  const STATE_NAMES = { AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',CT:'Connecticut',DE:'Delaware',DC:'District of Columbia',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming' };
  // ZIP3 ranges to state.
  const ZIP3 = [[5,5,'NY'],[10,27,'MA'],[28,29,'RI'],[30,38,'NH'],[39,49,'ME'],[50,59,'VT'],[60,69,'CT'],[70,89,'NJ'],[100,149,'NY'],[150,196,'PA'],[197,199,'DE'],[200,205,'DC'],[201,201,'VA'],[206,219,'MD'],[220,246,'VA'],[247,268,'WV'],[270,289,'NC'],[290,299,'SC'],[300,319,'GA'],[320,349,'FL'],[350,369,'AL'],[370,385,'TN'],[386,397,'MS'],[398,399,'GA'],[400,427,'KY'],[430,458,'OH'],[460,479,'IN'],[480,499,'MI'],[500,528,'IA'],[530,549,'WI'],[550,567,'MN'],[570,577,'SD'],[580,588,'ND'],[590,599,'MT'],[600,629,'IL'],[630,658,'MO'],[660,679,'KS'],[680,693,'NE'],[700,714,'LA'],[716,729,'AR'],[730,749,'OK'],[733,733,'TX'],[750,799,'TX'],[800,816,'CO'],[820,831,'WY'],[832,838,'ID'],[840,847,'UT'],[850,865,'AZ'],[870,884,'NM'],[885,885,'TX'],[889,898,'NV'],[900,961,'CA'],[967,968,'HI'],[970,979,'OR'],[980,994,'WA'],[995,999,'AK']];
  function zipToState(zip) {
    const z = parseInt(zip.slice(0, 3), 10); let hit = null;
    ZIP3.forEach(r => { if (z >= r[0] && z <= r[1]) hit = r[2]; });  // later, narrower ranges win
    return hit;
  }

  // ------------------------------------------------------------- routing
  // Returns the fulfillment options for a product at the current address:
  // real in-state retailers first, then an illustrative in-state route.
  function optionsFor(id) {
    const a = state.address; if (!a) return [];
    const p = CATALOG[id], out = [];
    (VARIANTS[id] || []).forEach(v => {
      const r = RETAILERS[v.retailerId];
      if (r.st !== a.st) return;
      const local = a.zip && r.metro.indexOf(a.zip.slice(0, 3)) >= 0;
      const base = { retailerId: r.id, name: r.name, city: r.city, price: v.price, stock: v.stock, real: true };
      if (local) out.push(Object.assign({ type: 'onDemand', key: r.id + ':onDemand', fee: LOCAL_FEE, eta: 'Same-day delivery, DoorDash from local retailers' }, base));
      out.push(Object.assign({ type: 'shipping', key: r.id + ':shipping', fee: SHIP_FEE, eta: 'Ships in 2 to 5 business days' }, base));
    });
    const inStockReal = out.filter(o => o.stock > 0).length;
    if (!inStockReal) {
      out.push({ type: 'shipping', key: 'r-local-' + a.st + ':shipping', retailerId: 'r-local-' + a.st,
        name: 'Licensed retailer in ' + (STATE_NAMES[a.st] || a.st), city: 'Assigned at launch', price: p.price,
        stock: 24, fee: SHIP_FEE, eta: 'Ships in 2 to 5 business days', real: false });
    }
    return out;
  }
  // Lowest price among retailers with stock today; ReserveBar.com price if none.
  function fromPrice(id) {
    const live = (VARIANTS[id] || []).filter(v => v.stock > 0).map(v => v.price);
    return live.length ? Math.min.apply(null, live) : CATALOG[id].price;
  }
  function optionByKey(id, key) { return optionsFor(id).filter(o => o.key === key)[0] || null; }

  // ------------------------------------------------------------- state
  const LS = 'rc-accelpay-demo-v1';
  const state = load() || { address: null, items: [], cartId: 'cart_' + Math.random().toString(36).slice(2, 10) };
  function load() { try { return JSON.parse(localStorage.getItem(LS)); } catch (e) { return null; } }
  function save() { try { localStorage.setItem(LS, JSON.stringify(state)); } catch (e) {} }

  // ------------------------------------------------------------- events
  let seq = 0;
  function publish(name, data, ns) {
    const detail = { data: data, metadata: {
      eventId: 'evt_' + (++seq), namespace: 'actions', event: name, originalEvent: name,
      actionNamespace: ns || 'other', timestamp: Date.now(), sdkVersion: 'static-standin',
      env: 'demo', tenantName: 'Rare Character', tenantCode: 'rc' } };
    window.dispatchEvent(new CustomEvent('lce:actions.' + name, { detail: detail }));
    window.dispatchEvent(new CustomEvent('lce:actions', { detail: detail }));
  }

  const money = c => '$' + (c / 100).toFixed(2);
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ------------------------------------------------------------- address
  function setAddress(raw) {
    const text = (raw || '').trim(); if (!text) return false;
    const zm = text.match(/\b(\d{5})(?:-\d{4})?\b/);
    let zip = zm ? zm[1] : null, st = zip ? zipToState(zip) : null;
    if (!st) {
      const sm = text.toUpperCase().match(/(?:,|\s)\s*([A-Z]{2})\s*$/) || text.toUpperCase().match(/^([A-Z]{2})$/);
      if (sm && STATE_NAMES[sm[1]]) st = sm[1];
    }
    if (!st) { announce('Add a ZIP code so we can find a licensed retailer in your state'); flagAddress(); return false; }
    state.address = { formattedAddress: text, zip: zip, st: st };
    state.items = state.items.filter(i => optionByKey(i.id, i.optKey));  // drop lines that no longer route
    save();
    publish('address_updated', { googlePlacesId: 'demo_places_id', formattedAddress: text,
      address: { one: text, two: '', city: '', state: st, zip: zip || '', country: 'US' }, coordinates: null }, 'address');
    renderAll();
    return true;
  }
  function clearAddress() {
    state.address = null; state.items = []; save();
    publish('address_cleared', true, 'address'); publish('cart_reset', true, 'cart');
    renderAll();
  }
  function flagAddress() { const b = $('.lce-address'); if (b) { b.classList.add('needs'); const i = $('input', b); if (i) i.focus(); } }

  // ------------------------------------------------------------- cart ops
  function totals() {
    let subtotal = 0, itemCount = 0, fees = 0; const seen = {};
    state.items.forEach(i => {
      subtotal += i.price * i.qty; itemCount += i.qty;
      if (!seen[i.optKey]) { seen[i.optKey] = 1; fees += i.fee; }
    });
    const tax = Math.round(subtotal * TAX);
    return { subtotal, fees, tax, total: subtotal + fees + tax, itemCount };
  }
  function snapshot() { const t = totals(); return { cartId: state.cartId, subtotal: t.subtotal, itemCount: t.itemCount, promoCodeDiscount: null }; }

  let pendingAdd = null;
  function addProduct(params, openCart) {
    if (!state.address) { pendingAdd = params; flagAddress(); announce('Enter a delivery address to continue'); return false; }
    const o = optionByKey(params.identifier, params.optKey); if (!o || o.stock < 1) return false;
    const key = params.identifier + '::' + o.key;
    const ex = state.items.filter(i => i.key === key)[0];
    if (ex) ex.qty = Math.min(MAX_QTY, o.stock, ex.qty + params.quantity);
    else state.items.push({ key: key, id: params.identifier, optKey: o.key, qty: params.quantity,
      price: o.price, fee: o.fee, type: o.type, retailer: o.name, city: o.city, eta: o.eta, real: o.real });
    save();
    publish('product_add_to_cart', { identifier: params.identifier, fulfillmentId: o.retailerId, partNumber: params.identifier, quantity: params.quantity, engravingLines: [] }, 'product');
    publish('cart_item_added', { cartId: state.cartId, itemId: key, fulfillmentId: o.retailerId, partNumber: params.identifier, quantity: params.quantity, engravingLines: [] }, 'cart');
    publish('cart_updated', { current: snapshot() }, 'cart');
    renderAll();
    if (openCart !== false) openDrawer();
    return true;
  }
  function setQty(key, d) {
    const it = state.items.filter(i => i.key === key)[0]; if (!it) return;
    const prev = it.qty; it.qty = Math.min(MAX_QTY, it.qty + d);
    if (it.qty < 1) { state.items = state.items.filter(i => i.key !== key); publish('cart_item_removed', { cartId: state.cartId, itemId: key }, 'cart'); }
    else publish(d > 0 ? 'cart_item_quantity_increase' : 'cart_item_quantity_decrease', { cartId: state.cartId, itemId: key, quantity: it.qty, previousQuantity: prev }, 'cart');
    save(); renderAll();
  }
  function resetCart() { state.items = []; save(); publish('cart_reset', true, 'cart'); renderAll(); }

  let live;
  function announce(msg) {
    if (!live) { live = document.createElement('div'); live.setAttribute('role', 'status'); live.setAttribute('aria-live', 'polite');
      live.className = 'sr-only'; document.body.appendChild(live); }
    live.textContent = msg;
    const t = $('#toast'); if (t) { t.textContent = msg; t.classList.add('on'); clearTimeout(announce._t); announce._t = setTimeout(() => t.classList.remove('on'), 2600); }
  }

  // ------------------------------------------------------------- product element
  const pstate = { id: null, optKey: null, qty: 1 };
  function addressBlock() {
    if (state.address) {
      const a = state.address;
      return '<div class="lce-address set"><span>Delivering to <strong>' + esc(a.formattedAddress) + '</strong>' +
        ' <span class="muted">(' + esc(STATE_NAMES[a.st] || a.st) + ')</span></span>' +
        '<button class="linkbtn" data-addr-change>Change</button></div>';
    }
    return '<div class="lce-address"><label class="lce-label" for="lce-address-input">Where should we send it?</label>' +
      '<div class="row"><input id="lce-address-input" placeholder="Street address with ZIP, or just a ZIP" autocomplete="off">' +
      '<button class="btn sm" data-addr-set>Check</button></div>' +
      '<div class="try">Try <button class="linkbtn" data-try="92071">San Diego 92071</button> · ' +
      '<button class="linkbtn" data-try="60090">Chicago area 60090</button> · ' +
      '<button class="linkbtn" data-try="08873">Somerset, NJ 08873</button> · ' +
      '<button class="linkbtn" data-try="78701">Austin 78701</button></div></div>';
  }

  function renderProduct() {
    const host = $('#lce-product'); if (!host) return;
    const id = host.getAttribute('data-lce-product'); const p = CATALOG[id];
    if (!p) { host.innerHTML = '<p>Product not found.</p>'; return; }
    if (pstate.id !== id) { pstate.id = id; pstate.qty = 1; pstate.optKey = null; }
    const opts = optionsFor(id);
    const buyable = opts.filter(o => o.stock > 0);
    if (!buyable.filter(o => o.key === pstate.optKey)[0]) pstate.optKey = (buyable[0] || {}).key || null;
    const sel = opts.filter(o => o.key === pstate.optKey)[0] || null;
    const unit = sel ? sel.price : p.price;
    const cap = sel ? Math.min(MAX_QTY, sel.stock) : MAX_QTY;
    if (pstate.qty > cap) pstate.qty = Math.max(1, cap);

    host.innerHTML = [
      '<div class="pdp">',
        '<div class="pdp-img"><img src="', p.image, '" alt="Rare Character ', esc(p.name), '"></div>',
        '<div class="pdp-body">',
          '<div class="eyebrow">', esc(p.series), p.batch ? ' · ' + p.batch : '', '</div>',
          '<h1>', esc(p.name), '</h1>',
          '<div class="price">', state.address ? money(unit) : 'From ' + money(fromPrice(id)),
            '<span class="unit">750 ML · ', p.abv, ' ABV · ', p.type, '</span></div>',
          '<dl class="notes"><dt>Nose</dt><dd>', p.nose, '</dd><dt>Palate</dt><dd>', p.palate, '</dd><dt>Finish</dt><dd>', p.finish, '</dd></dl>',
          addressBlock(),
          state.address ? (opts.length ? [
            '<div class="lce-label">', opts.some(o => o.type === 'onDemand') ? 'Choose delivery or shipping' : 'Shipping from a licensed retailer in your state', '</div>',
            '<div class="opts" role="radiogroup">',
            opts.map(o => [
              '<button class="opt" role="radio" data-opt="', o.key, '" aria-checked="', o.key === pstate.optKey, '"', o.stock < 1 ? ' disabled' : '', '>',
                '<span class="ico">', o.type === 'onDemand' ? '<img src="assets/doordash-icon.svg" alt="DoorDash">' : '<span class="truck">&#9636;</span>', '</span>',
                '<span class="txt"><span class="nm">', esc(o.name), o.real ? '' : ' <span class="tag">Demo route</span>', '</span>',
                '<span class="meta">', esc(o.city), ' · ', o.eta, o.stock < 1 ? ' · <b>Out of stock today</b>' : (o.real && o.stock <= 6 ? ' · only ' + o.stock + ' left' : ''), '</span></span>',
                '<span class="amt">', money(o.price), '<span class="fee">', money(o.fee), ' ', o.type === 'onDemand' ? 'delivery' : 'shipping', '</span></span>',
              '</button>'].join('')).join(''),
            '</div>'].join('') : '') : '',
          '<div class="buy">',
            '<div class="qty"><button data-q="-1" aria-label="Decrease">&minus;</button><span>', pstate.qty, '</span><button data-q="1" aria-label="Increase">+</button></div>',
            '<button class="btn" id="addbtn"', state.address && !sel ? ' disabled' : '', '>',
              state.address ? (sel ? 'Add to cart · ' + money(unit * pstate.qty) : 'Not available at this address') : 'Add to cart',
            '</button>',
          '</div>',
          '<p class="fine">Sold and fulfilled by a licensed retailer in your state. Adult signature (21+) required on delivery. Checkout by AccelPay.</p>',
          '<a class="rb-note" href="', p.rb, '" target="_blank" rel="noopener"><span>Also on</span> <strong>ReserveBar.com</strong> &rarr;</a>',
        '</div>',
      '</div>'
    ].join('');

    $$('[data-opt]', host).forEach(b => b.addEventListener('click', () => {
      const prev = pstate.optKey; pstate.optKey = b.getAttribute('data-opt');
      const o = optionByKey(id, pstate.optKey), po = optionByKey(id, prev);
      publish(po && po.type !== o.type ? 'product_fulfillment_type_changed' : 'product_fulfillment_changed', {
        identifier: id, selectedFulfillmentId: o.retailerId, selectedFulfillmentType: o.type,
        previousFulfillmentId: po ? po.retailerId : null, previousFulfillmentType: po ? po.type : null }, 'product');
      renderProduct();
    }));
    $$('[data-q]', host).forEach(b => b.addEventListener('click', () => {
      const d = parseInt(b.getAttribute('data-q'), 10), prev = pstate.qty;
      pstate.qty = Math.max(1, Math.min(cap, pstate.qty + d));
      if (pstate.qty !== prev) publish(d > 0 ? 'product_quantity_increase' : 'product_quantity_decrease', { identifier: id, quantity: pstate.qty, previousQuantity: prev }, 'product');
      else if (d > 0) announce(sel && sel.stock < MAX_QTY ? 'Only ' + sel.stock + ' in stock at this retailer' : 'Limit ' + MAX_QTY + ' per order');
      renderProduct();
    }));
    wireAddress(host);
    const add = $('#addbtn', host);
    if (add) add.addEventListener('click', () => addProduct({ identifier: id, optKey: pstate.optKey, quantity: pstate.qty }, true));
  }

  function wireAddress(root) {
    const inp = $('#lce-address-input', root), go = $('[data-addr-set]', root);
    const submit = v => { if (setAddress(v) && pendingAdd) { const pa = pendingAdd; pendingAdd = null; pa.optKey = pstate.optKey; if (pa.optKey) addProduct(pa, true); } };
    if (go && inp) { go.addEventListener('click', () => submit(inp.value)); inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(inp.value); } }); }
    $$('[data-try]', root).forEach(b => b.addEventListener('click', () => submit(b.getAttribute('data-try'))));
    $$('[data-addr-change]', root).forEach(b => b.addEventListener('click', clearAddress));
  }

  // ------------------------------------------------------------- drawer
  function openDrawer() { const d = $('#drawer'); if (!d) return; d.classList.add('on'); $('#scrim').classList.add('on'); document.body.style.overflow = 'hidden'; publish('cart_opened', true, 'cart'); }
  function closeDrawer() { const d = $('#drawer'); if (!d || !d.classList.contains('on')) return; d.classList.remove('on'); $('#scrim').classList.remove('on'); document.body.style.overflow = ''; publish('cart_closed', true, 'cart'); }

  function groups() {
    const m = {};
    state.items.forEach(i => { (m[i.optKey] = m[i.optKey] || { key: i.optKey, retailer: i.retailer, city: i.city, eta: i.eta, type: i.type, fee: i.fee, real: i.real, items: [] }).items.push(i); });
    return Object.keys(m).map(k => m[k]);
  }
  function lineHTML(i) {
    const p = CATALOG[i.id];
    return '<div class="line"><div class="thumb"><img src="' + p.image + '" alt=""></div><div class="info">' +
      '<span class="nm">' + esc(p.name) + '</span><span class="sz">750 ML' + (p.batch ? ' · ' + p.batch : '') + '</span>' +
      '<div class="foot"><div class="qty sm"><button data-k="' + i.key + '" data-d="-1">&minus;</button><span>' + i.qty + '</span><button data-k="' + i.key + '" data-d="1">+</button></div>' +
      '<span class="amt">' + money(i.price * i.qty) + '</span></div></div></div>';
  }
  function groupHead(g) {
    return '<div class="rg-head">' + (g.type === 'onDemand' ? '<img src="assets/doordash-icon.svg" alt="">' : '') +
      '<div><strong>' + esc(g.retailer) + '</strong><span>' + esc(g.city) + ' · ' + g.eta + '</span></div></div>';
  }
  function renderDrawer() {
    const box = $('#drawer-items'); if (!box) return;
    const gs = groups(), t = totals();
    box.innerHTML = gs.length ? gs.map(g => '<div class="rgroup">' + groupHead(g) + g.items.map(lineHTML).join('') + '</div>').join('')
      : '<div class="empty">Your cart is empty.<br><a href="index.html#shop">Shop the bottles</a></div>';
    $$('[data-d]', box).forEach(b => b.addEventListener('click', () => setQty(b.getAttribute('data-k'), parseInt(b.getAttribute('data-d'), 10))));
    const foot = $('#drawer-foot');
    if (foot) foot.innerHTML = gs.length ? [
      '<div class="totals"><div class="r"><span>Subtotal</span><span>', money(t.subtotal), '</span></div>',
      '<div class="r"><span>Shipping and delivery</span><span>', money(t.fees), '</span></div>',
      '<div class="r"><span>Estimated tax</span><span>', money(t.tax), '</span></div>',
      '<div class="r big"><span>Total</span><span>', money(t.total), '</span></div></div>',
      '<a class="btn block" href="checkout.html">Checkout · ', money(t.total), '</a>',
      '<p class="fine center">Secure checkout by AccelPay</p>'].join('') : '';
  }
  function renderHeader() {
    const t = totals();
    $$('[data-lce-cart-items-count]').forEach(el => { el.textContent = t.itemCount; });
  }

  // ------------------------------------------------------------- checkout page
  function renderCheckout() {
    const side = $('#co-summary'); if (!side) return;
    const gs = groups(), t = totals();
    side.innerHTML = '<h3>Order summary</h3>' + (gs.length ? gs.map(g =>
      '<div class="rgroup">' + groupHead(g) + g.items.map(lineHTML).join('') +
      '<div class="r small"><span>' + (g.type === 'onDemand' ? 'Same-day delivery' : 'Shipping') + '</span><span>' + money(g.fee) + '</span></div></div>').join('')
      : '<div class="empty">Your cart is empty. <a href="index.html#shop">Shop the bottles</a></div>') +
      '<div class="totals"><div class="r"><span>Subtotal</span><span>' + money(t.subtotal) + '</span></div>' +
      '<div class="r"><span>Shipping and delivery</span><span>' + money(t.fees) + '</span></div>' +
      '<div class="r"><span>Tax</span><span>' + money(t.tax) + '</span></div>' +
      '<div class="r big"><span>Total</span><span>' + money(t.total) + '</span></div></div>';
    $$('[data-d]', side).forEach(b => b.addEventListener('click', () => setQty(b.getAttribute('data-k'), parseInt(b.getAttribute('data-d'), 10))));
    const fl = $('#co-fulfil');
    if (fl) fl.innerHTML = gs.length ? gs.map(g => '<div class="fulfil">' + groupHead(g) +
      '<p>' + (g.real ? esc(g.retailer) + ' is a licensed retailer in ' + esc(STATE_NAMES[state.address.st]) + ' and is on the order as the seller.'
                     : 'Demo route. At launch this order goes to a licensed retailer in ' + esc(STATE_NAMES[state.address.st]) + ' from the AccelPay network.') + '</p></div>').join('')
      : '<p class="muted">Add a bottle to see who fulfills your order.</p>';
    const st = $('#co-state'); if (st && state.address) st.value = state.address.st;
    const zp = $('#co-zip'); if (zp && state.address && state.address.zip && !zp.value) zp.value = state.address.zip;
    const place = $('#place-order'); if (place) { place.textContent = 'Place order · ' + money(t.total); place.disabled = !gs.length; }
  }
  function wireCheckout() {
    const form = $('#co-form'); if (!form) return;
    publish('checkout_loaded', { token: 'demo_token', cartId: state.cartId, isGift: false, billingSameAsShipping: true, itemCount: totals().itemCount }, 'checkout');
    const gift = $('#is-gift');
    if (gift) gift.addEventListener('change', () => { $('#gift-fields').hidden = !gift.checked;
      publish('checkout_is_gift_toggled', { cartId: state.cartId, isActive: gift.checked, previousIsActive: !gift.checked }, 'checkout'); });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const t = totals();
      publish('checkout_submit_started', { started: true }, 'checkout');
      const orderNumber = 'RC-DEMO-' + String(Math.floor(100000 + Math.random() * 899999));
      setTimeout(() => {
        publish('checkout_submit_completed', { orderNumber: orderNumber, orderTotal: t.total }, 'checkout');
        try { sessionStorage.setItem('rc-order', JSON.stringify({ orderNumber: orderNumber, total: t.total })); } catch (err) {}
        resetCart(); location.href = 'checkout.html?confirmed=1';
      }, 700);
    });
  }

  // ------------------------------------------------------------- homepage grid
  function renderGrid() {
    const g = $('#grid'); if (!g) return;
    g.innerHTML = ORDER.map(id => { const p = CATALOG[id];
      const lo = fromPrice(id);
      return '<a class="card" href="product.html?p=' + id + '"><div class="ci"><img src="' + p.image + '" alt="' + esc(p.name) + '" loading="lazy"></div>' +
        '<div class="cs">' + esc(p.series) + '</div><div class="cn">' + esc(p.name) + (p.batch ? ' <span>' + p.batch + '</span>' : '') + '</div>' +
        '<div class="cp">From ' + money(lo) + '</div></a>'; }).join('');
  }

  function renderAll() { renderHeader(); renderProduct(); renderDrawer(); renderCheckout(); }

  function boot() {
    $$('[data-lce-cart-toggle-button]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); const d = $('#drawer'); d && d.classList.contains('on') ? closeDrawer() : openDrawer(); }));
    const x = $('#drawer-close'); if (x) x.addEventListener('click', closeDrawer);
    const s = $('#scrim'); if (s) s.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
    const burger = $('#burger'); if (burger) burger.addEventListener('click', () => document.body.classList.toggle('nav-open'));
    const notes = $('#demo-notes-toggle'); if (notes) notes.addEventListener('click', () => $('#demo-notes').classList.toggle('on'));
    $$('[data-close-notes]').forEach(b => b.addEventListener('click', () => $('#demo-notes').classList.remove('on')));
    renderGrid(); wireCheckout(); renderAll();
    publish('client_ready', { isReady: true, message: 'Static stand-in ready', timestamp: Date.now(), version: 'standin-1.0' }, 'other');
  }

  window.RCDemo = {
    actions: { cart: { openCart: openDrawer, closeCart: closeDrawer, addProduct: addProduct, resetCart: resetCart, getDetails: snapshot },
               address: { getDetails: () => state.address, set: setAddress, clear: clearAddress },
               product: { getDetails: id => CATALOG[id] } },
    catalog: CATALOG, retailers: RETAILERS, variants: VARIANTS, optionsFor: optionsFor
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
