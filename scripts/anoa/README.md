# Browser validation with Anoa

Runs the real client code in a real (headless) browser, to check what unit tests cannot: that the pieces
work together, that offline and reload behave, and that sync stays fast.

```bash
SENTRY_AUTH_TOKEN= npm run build   # once; the empty token stops source maps being uploaded
npm run test:anoa
```

Needs the `anoa` CLI on the PATH. It starts the app and a browser itself, and stops them at the end.

## What makes it safe

- The app is started with a database URL that cannot connect and with Sentry turned off.
- Inside the page, `fake-backend.js` answers every `/api` request. Nothing a check does leaves the page.
- It uses its own app port (3100) and browser port (9333), so it does not touch a dev server on 3000.

## What it checks

| Group | Check |
| --- | --- |
| Guest | A guest makes no sync or pull request, and the page throws nothing |
| Login | Sign-in settles through `GuestSyncManager`, then the engine starts and pulls the right parts |
| Speed | One change on an account with 1,000 missions and 100 bookmarks is one entry of a few hundred bytes (a full upload was about 112,000), and tracking it takes under 50 ms |
| Speed | Fifty rapid changes to one counter become one request carrying the last value |
| Offline | Changes made while the network is dead are kept, then sent in one request when it returns |
| Reload | A change survives closing the page and is sent, for the right account, when the user returns |
| Offline-first | After one visit the app opens from the service worker cache with the network off |
| Speed | Twenty `online` events in a row cause at most one full pull |
| Real screens | Completing a mission with a real click is tracked and sent as one small entry with the reward the screen showed |
| Undo | Done and undone before sending cancels out; one already sent is undone on the server |
| Other devices | A mission completed elsewhere appears, one undone elsewhere disappears, and neither is sent back |
| Accounts | A change queued for another account is never sent for the one that signs in |
| Review | A change made while its request is on the way is still sent afterwards |
| Review | Switching accounts clears the old one without sending an undo of its records |
| Review | An entry that failed for good does not stop other devices' changes from arriving |
| Guest | A guest's journal requests create a device secret that stays the same after a reload |
| Settings | The theme picker is one row at 320, 390 and 1280 px: no wrapping, no sideways scrolling, no premium markers |
| Links | The journey welcome offers no link to the Ramadan page while it is switched off |
| Review | A login that failed once still starts syncing when a later attempt succeeds |
| Review | A mission completed and sent while a slow pull is in flight is not dropped by that pull's older answer |
| Invitation | A guest with a 7-day streak is invited once, with the animation drawn, and left alone after dismissing |
| Invitation | A guest with a 6-day streak is not invited |

## Options

| Variable | Meaning |
| --- | --- |
| `APP_URL` | Use an app that is already running instead of starting one |
| `APP_PORT` | Port for the app it starts (default 3100) |
| `ANOA_PORT` | CDP port of the browser (default 9333) |
| `SW_URL` | Origin used for the service worker check (default `nawaetu.localhost`) |
| `SHOTS_DIR` | Where screenshots of failures are written |
| `ONLY` | Run only the checks whose name contains this text |

## Things learned while writing it

- The app removes service workers on `localhost` and `127.0.0.1` on purpose, so the offline-first check
  uses `nawaetu.localhost`, which browsers still treat as secure.
- A tab that was open as a guest does not notice a sign-in from a visibility change; next-auth only
  listens to its broadcast channel. The runner posts to that channel, like a sign-in in another tab.
- Anoa's `set offline` flaps `navigator.onLine` between commands, so the sync checks make the fake
  backend play dead instead. The flapping did expose real behaviour: a connection that keeps returning
  used to start a full pull for every event.
