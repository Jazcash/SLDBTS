# SLDBTS
A TypeScript abstraction wrapper arround SLDB's XMLRPC endpoint

## Usage

`npm i --save sldbts`

```
import { SLDBClient } from "sldbts";

(async () => {
    const client = new SLDBClient({
        host: "sldb.coolsite.com",
        port: 8300,
        username: "xmlrpcUsername",
        password: "xmlrpcPassword"
    });

    const leaderboards = await client.getLeaderboards("BYAR", ["Duel", "Team"]);
})();
```
