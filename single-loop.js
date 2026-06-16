/*
  PS: this code is registered under a license: 
  do not share or distribute this code without permission

  Copyright (c) 2025 knife

  also this code is no-longer a working crash, it is merely a reference for educational purposes.
*/

const realmAPI = require("./func/realm");
const prompt = require("prompt-sync")();

(async () => {
  try {
    const realm = new realmAPI({ enabled: true, loop: 1000 });
    await realm.init();

    const worlds = await realm.getWorlds();
    if (!worlds.body?.servers || worlds.body?.servers.length === 0) throw new Error("no servers found");

    console.log(
      `${worlds.body?.servers.map(
        server => server.state === "OPEN" ? `(open) ${server.name} | ${server.id}` : null
      ).filter(Boolean).join('\n')}`
    )

    const selectedWorld = prompt("realmID: ");
    if (!worlds.body?.servers.some(server => String(server.id) === selectedWorld)) throw new Error("invalid realmID");

    const selected = await realm.getRealmInfoByID(selectedWorld);
    if (!selected) throw new Error("no realmID provided or invalid realmID");

    const activeSlot = (selected.body?.activeSlot ?? 1) - 1;
    const versionRef = JSON.parse(selected.body?.slots[activeSlot]?.options)?.versionRef

    if (!versionRef) throw new Error(`no versionRef found in slot ${activeSlot}, ${JSON.stringify(selected.body?.slots[activeSlot] ?? {})}`);

    console.clear();
    console.log(`\n\nselected realm: ${selected.body.name} - ${selected.body.id}\nslot: ${activeSlot}\nversionRef: ${versionRef}`);

    realm.headers["client-ref"] = versionRef
    console.log(realm.headers["client-ref"])
    await realm.getRealmIP(selected.body.id).then(res => { console.log(res.body) })
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
})();
