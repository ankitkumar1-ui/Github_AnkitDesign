# Sephora journey: "Find a foundation that won't turn orange"

Short journey for the ADX end-user prototype. One shopper, one real problem, three AI moments.
Built from the studio's Sephora experiences (search clarification, shade shortlist, "what changed since your last order").

## The shopper
Linda, Beauty Insider Rouge. Signed in, shopping on her phone in the evening.
- **Problem:** her March foundation (516W) went orange by midday. It is hot out and her skin is oily. She wants one that lasts and matches, and she does not want to return another bottle.
- **What the site knows:** Color IQ 526N (neutral), March order 516W (warm). It does not know her skin type.
- **What goes wrong without help:** 100+ search results, a 50-swatch shade grid, and no way to tell which shade is right.

## The journey

| # | Linda does | The page shows | AI does | Type |
|---|---|---|---|---|
| 1 | Searches "foundation for oily skin" | 126 results, mixed finishes | Nothing yet. Waits to see if she needs help. | none |
| 2 | Scrolls the results, opens nothing for ~10s | Results grid | **Asks one question**: which matters most? Chips: Matte finish, All-day wear, Fragrance-free (or type or say it). | Question 1 (Preference) |
| 3 | Taps "All-day wear" | Grid narrows to 3 long-wear foundations | Replies and shows the 3, with the best match first. | Reply |
| 4 | Opens Pro Filt'r, hovers over many swatches, picks none | 50-swatch shade grid | **Asks nothing.** Lifts "Your shades": 526N and 516W, using Color IQ and her order. | Shortlist (no question) |
| 5 | Selects 526N, hovers over Add to Basket for 4s, does not add | Product page | **Asks one question** about what changed since March. | Question 2 (Verification) |
| 6 | "It went orange by midday" | Product page | Confirms 526N, a step cooler than 516W, and offers to add it. | Reply |
| 7 | "Yes" | Basket | Adds it. One soft line: $27 to her offer. Stops there. | Close |

Two questions, one shortlist, one closing line. Everything else is silent.

## Voice lines (spoken by the assistant)

| # | Line |
|---|---|
| 2 | "Lots of options for that. Quick question so I can narrow it down: which matters most to you? Matte finish, all-day wear, or fragrance-free?" |
| 3 | "These three hold up all day on oily skin. The first one is my best match for you." |
| 4 | "I've put two shades at the top: 526N, your Color IQ match, and 516W, from your last order." |
| 5 | "Your March bottle was 516W and your Color IQ reads 526N. Can you share what changed since March?" |
| 6 | "Thanks for telling me. 526N is a step cooler than 516W, so it should hold its colour. Shall I add it?" |
| 7 | "Done. It's in your basket. You're $27 away from your offer." |

## Rules for "the right amount" of micro-interaction
1. **Never ask what we already know.** Shade and last order come from her profile, so the shortlist (step 4) needs no question. Skin type is not on her profile, so step 2 asks.
2. **Ask only when the answer changes what she sees.** Both questions change the products or the shade shown next.
3. **At most two questions per journey, one at a time.** A question is only sent after a clear signal (10s of scrolling with no click, a 4s hover with no add).
4. **Every question has quick answers plus free text or voice.** She can answer in one tap.
5. **Always show what the answer did** (narrowed list, kept shade) so the question feels worth answering.
6. **Do not nudge twice.** After the offer line in step 7, the assistant goes quiet.

## Open questions for you
- Phone or desktop for the first build? (The journey above is written phone-first.)
- Keep the offer line ($27 to the offer, taken from the studio's basket example) or drop it?
- Should the assistant speak every line, or only questions and confirmations?
