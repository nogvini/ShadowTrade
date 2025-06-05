TITLE: Creating Websocket Client and Subscribing to Channels (JavaScript)
DESCRIPTION: Initializes an asynchronous Websocket client, subscribes to public price and index channels using `publicSubscribe`, and sets up event listeners for general responses and specific channel updates.
SOURCE: https://github.com/ln-markets/api-js/blob/master/README.md#_snippet_12

LANGUAGE: javascript
CODE:
```
import { createWebsocketClient } from '@ln-markets/api'
// Need to be async
const client = await createWebsocketClient()

await client.publicSubscribe([
  'futures:btc_usd:last-price',
  'futures:btc_usd:index'
])

// Event on all response
client.on('response', console.log)
// Event emitter on subscribed channels
client.on('futures:btc_usd:last-price', console.log)
client.on('futures:btc_usd:index', console.log)

// Handle websocket error here
client.ws.on('error', console.error)
```

----------------------------------------

TITLE: Creating REST Client with Custom Headers (JavaScript)
DESCRIPTION: Initializes a REST client configured to include custom HTTP headers in all outgoing requests by providing a `headers` object.
SOURCE: https://github.com/ln-markets/api-js/blob/master/README.md#_snippet_11

LANGUAGE: javascript
CODE:
```
import { createRestClient } from '@ln-markets/api'
const client = createRestClient({
  headers: {
    'X-My-Header': 'My value'
  }
})
```

----------------------------------------

TITLE: Creating Default REST Client (JavaScript)
DESCRIPTION: Initializes a new REST client instance using `createRestClient` with default configuration, which connects to the mainnet API.
SOURCE: https://github.com/ln-markets/api-js/blob/master/README.md#_snippet_4

LANGUAGE: javascript
CODE:
```
import { createRestClient } from '@ln-markets/api'
const client = createRestClient()
```

----------------------------------------

TITLE: Disable Heartbeat - LN Markets API - JavaScript
DESCRIPTION: Illustrates how to disable the automatic heartbeat (ping) mechanism for the LN Markets websocket client by setting the `heartbeat` option to `false` during initialization. Requires the `@ln-markets/api` library.
SOURCE: https://github.com/ln-markets/api-js/blob/master/README.md#_snippet_17

LANGUAGE: javascript
CODE:
```
import { createWebsocketClient } from '@ln-markets/api'
const client = createWebsocketClient({ heartbeat: false })
```

----------------------------------------

TITLE: Creating Websocket Client for Testnet (Config Object) (JavaScript)
DESCRIPTION: Initializes a Websocket client configured to connect to the LN Markets testnet environment by passing the `network: 'testnet'` option to the constructor.
SOURCE: https://github.com/ln-markets/api-js/blob/master/README.md#_snippet_13

LANGUAGE: javascript
CODE:
```
import { createWebsocketClient } from '@ln-markets/api'
const client = createWebsocketClient({ network: 'testnet' })
```

----------------------------------------

TITLE: Creating REST Client with API Key/Secret from Variables (JavaScript)
DESCRIPTION: Initializes a REST client with API key and secret provided as variables. This example implies the passphrase may be sourced from environment variables if required by the API.
SOURCE: https://github.com/ln-markets/api-js/blob/master/README.md#_snippet_6

LANGUAGE: javascript
CODE:
```
// process.env.LNM_API_KEY = `<LNM API KEY>`
// process.env.LNM_API_SECRET = `<LNM API SECRET>`
// process.env.LNM_API_PASSPHRASE = `<LNM API PASSPHRASE>`

const client = new createRestClient({ key, secret })

const trades = await client.futuresGetTrades()
console.log(trades)
```

----------------------------------------

TITLE: Use Env Var for API Version - LN Markets API - JavaScript
DESCRIPTION: Shows how the LN Markets websocket client can pick up the API version from the `LNM_API_VERSION` environment variable if not explicitly set in the options. Requires the `@ln-markets/api` library.
SOURCE: https://github.com/ln-markets/api-js/blob/master/README.md#_snippet_16

LANGUAGE: javascript
CODE:
```
// process.env.LNM_API_VERSION = 'v42'
import { createWebsocketClient } from '@ln-markets/api'
const client = createWebsocketClient()
```

----------------------------------------

TITLE: Creating REST Client for Testnet (Environment Variable) (JavaScript)
DESCRIPTION: Initializes a REST client configured for the testnet by relying on the `LNM_API_NETWORK` environment variable being set to 'testnet'.
SOURCE: https://github.com/ln-markets/api-js/blob/master/README.md#_snippet_8

LANGUAGE: javascript
CODE:
```
// process.env.LNM_API_NETWORK = 'testnet'
import { createRestClient } from '@ln-markets/api'
const client = createRestClient()
```

----------------------------------------

TITLE: Set API Version - LN Markets API - JavaScript
DESCRIPTION: Demonstrates how to explicitly set the API version when initializing the LN Markets websocket client by passing the `version` option to `createWebsocketClient`. Requires the `@ln-markets/api` library.
SOURCE: https://github.com/ln-markets/api-js/blob/master/README.md#_snippet_15

LANGUAGE: javascript
CODE:
```
import { createWebsocketClient } from '@ln-markets/api'
const client = createWebsocketClient({ version: 'v42' })
```

----------------------------------------

TITLE: Creating REST Client for Testnet (Config Object) (JavaScript)
DESCRIPTION: Initializes a REST client configured to connect to the LN Markets testnet environment by passing the `network: 'testnet'` option to the constructor.
SOURCE: https://github.com/ln-markets/api-js/blob/master/README.md#_snippet_7

LANGUAGE: javascript
CODE:
```
import { createRestClient } from '@ln-markets/api'
const client = createRestClient({ network: 'testnet' })
```

----------------------------------------

TITLE: Importing REST and Websocket Clients (JavaScript)
DESCRIPTION: Imports the necessary functions `createRestClient` and `createWebsocketClient` from the @ln-markets/api package. This syntax is for use in an ES module environment.
SOURCE: https://github.com/ln-markets/api-js/blob/master/README.md#_snippet_3

LANGUAGE: javascript
CODE:
```
import { createRestClient, createWebsocketClient } from '@ln-markets/api'
```

----------------------------------------

TITLE: Installing @ln-markets/api with yarn (Shell)
DESCRIPTION: Installs the @ln-markets/api package using the yarn package manager. This command downloads the package and its dependencies.
SOURCE: https://github.com/ln-markets/api-js/blob/master/README.md#_snippet_2

LANGUAGE: shell
CODE:
```
$> yarn add @ln-markets/api
```

----------------------------------------

TITLE: Installing @ln-markets/api with pnpm (Shell)
DESCRIPTION: Installs the @ln-markets/api package using the pnpm package manager. This command downloads the package and its dependencies.
SOURCE: https://github.com/ln-markets/api-js/blob/master/README.md#_snippet_1

LANGUAGE: shell
CODE:
```
$> pnpm install @ln-markets/api
```

----------------------------------------

TITLE: Creating REST Client with Specific API Version (Config Object) (JavaScript)
DESCRIPTION: Initializes a REST client configured to use a specific API version by passing the `version` option to the constructor.
SOURCE: https://github.com/ln-markets/api-js/blob/master/README.md#_snippet_9

LANGUAGE: javascript
CODE:
```
import { createRestClient } from '@ln-markets/api'
const client = createRestClient({ version: 'v42' })
```

----------------------------------------

TITLE: Installing @ln-markets/api with npm (Shell)
DESCRIPTION: Installs the @ln-markets/api package using the npm package manager. This command downloads the package and its dependencies.
SOURCE: https://github.com/ln-markets/api-js/blob/master/README.md#_snippet_0

LANGUAGE: shell
CODE:
```
$> npm install @ln-markets/api
```

----------------------------------------

TITLE: Creating Websocket Client for Testnet (Environment Variable) (JavaScript)
DESCRIPTION: Initializes a Websocket client configured for the testnet by relying on the `LNM_API_NETWORK` environment variable being set to 'testnet'.
SOURCE: https://github.com/ln-markets/api-js/blob/master/README.md#_snippet_14

LANGUAGE: javascript
CODE:
```
// process.env.LNM_API_NETWORK = 'testnet'
import { createWebsocketClient } from '@ln-markets/api'
const client = createWebsocketClient()
```

----------------------------------------

TITLE: Creating REST Client with API Key/Secret/Passphrase from Variables (JavaScript)
DESCRIPTION: Initializes a REST client with authentication credentials (key, secret, passphrase) provided directly as variables. These credentials are required for authenticated API routes.
SOURCE: https://github.com/ln-markets/api-js/blob/master/README.md#_snippet_5

LANGUAGE: javascript
CODE:
```
import { createRestClient } from '@ln-markets/api'
const key = `<LNM API KEY>`
const secret = `<LNM API SECRET>`
const passphrase = `<LNM API PASSPHRASE>`

const client = new createRestClient({ key, secret, passphrase })

const trades = await client.futuresGetTrades()
console.log(trades)
```

----------------------------------------

TITLE: Creating REST Client with Specific API Version (Environment Variable) (JavaScript)
DESCRIPTION: Initializes a REST client configured to use a specific API version by relying on the `LNM_API_VERSION` environment variable being set.
SOURCE: https://github.com/ln-markets/api-js/blob/master/README.md#_snippet_10

LANGUAGE: javascript
CODE:
```
// process.env.LNM_API_VERSION = 'v42'
import { createRestClient } from '@ln-markets/api'
const client = createRestClient()
```