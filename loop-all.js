/*
  PS: this code is registered under a license: 
  do not share or distribute this code without permission

  Copyright (c) 2025 knife

  also this code is no-longer a working crash, it is merely a reference for educational purposes.
*/

const realmAPI = require("./func/realm");

(async () => {
    try {
        const realm = new realmAPI({ enabled: true, loop: 1000 }, false);
        await realm.init();

        const worlds = await realm.getWorlds();
        if (!worlds.body?.servers || worlds.body?.servers.length === 0) throw new Error("no servers found");

        console.log(`${worlds.body?.servers.map(server => server.state === "OPEN" ? `${server.name} | ${server.id}` : null)
            .filter(Boolean).join('\n')}`)

        console.log(`\nTotal servers: ${worlds.body?.servers.length}`)

        Promise.all(worlds.body?.servers.map(async server => {
            await realm.getRealmIP(server.id).then(res => { console.log(`\n${server.name} | ${server.id} | ${JSON.stringify(res.body, null, 2)}`) })
        }))
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
})();
