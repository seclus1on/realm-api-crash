although this exploit is patched, it's worth posting it for educational purposes.

all code is licensed under the MIT license.

@knife.

## file of contents
- [`single-loop.js`](./single-loop.js) - single loop test
- [`loop-all.js`](./loop-all.js) - loop all test
- [`func/`](./func/) - functions
  - [`realm.js`](./func/realm.js) - realm api
  - [`xbox.js`](./func/xbox.js) - xbox api

## usage

```bash
npm i prompt-sync prismarine-auth

# only choose one from here, if you dont it will run both.
node single-loop.js # prompts for realm id
node loop-all.js # loops all realms on the account's realm list
```

## notes
- this is a proof of concept, and is not meant to be used for any malicious purposes.
- this is not a "hack" or "cheat", it is a vulnerability in the game's API.
- this exploit is patched, but it's still worth posting it for educational purposes.
- all code is licensed under the MIT license.
- @knife.

## credits
- @knife - publisher
- vision | [@vision](https://github.com/thejfkvis) - contributor, helped with func/realm.js structure
    also main exploit finder!
