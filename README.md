# Rare Character Whiskey x AccelPay (private sales demo)

**This is a private sales demo, not a live store.** It uses Rare Character Whiskey's name, logos, product images and copy to show the brand what its own site looks like with AccelPay checkout built in. All marks belong to their owners (Rare Character Whiskey Company, ReserveBar, Gopuff, DoorDash). Please do not share or promote it publicly. No order can be placed and no payment is taken.

Live: https://noshiftsherlock.github.io/rarecharacter-accelpay-demo/

| Page | What it shows |
| --- | --- |
| `index.html` | Home, product grid, how ordering works |
| `product.html?p=<id>` | Product page: address check, in-state retailer routing, same-day option, add to cart |
| `checkout.html` | Checkout with the fulfilling retailer named on the order |

## What is real and what is not

Real:
- Products, bottle images, ABV and tasting notes: Rare Character's ReserveBar.com listings (checked 24 Oct 2026).
- Retailers and prices: the LiquidCommerce retailer feed. Vista Wine & Spirits (Santee, CA), Liquor Barn (Wheeling, IL) and Bottle Republic (Somerset, NJ) carry these bottles at the prices shown (feed synced Sep 2026).
- Brand imagery and logo: rarecharacterwhiskey.com.

Illustrative:
- "Licensed retailer in <state>" routes for states with no stocking retailer today, priced at the ReserveBar.com list price.
- Shipping ($14.99) and same-day delivery ($9.99) fees, 8% tax, and the order confirmation.
- Same-day delivery appears only when the buyer's ZIP is in the same metro as a stocking retailer.

## How it is wired

`app.js` is a static stand-in for the LiquidCommerce Elements SDK. It publishes the same `lce:actions.*` events, with the same `{ data, metadata }` envelope, so the real SDK can replace it later. `elements-config.js` holds the switch (off: Rare Character has no LiquidCommerce partner account).

Built by AccelPay for a sales conversation with Rare Character Whiskey.
