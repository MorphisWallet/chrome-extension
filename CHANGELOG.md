## 0.0.8.4 (May 29, 2023)

- Fix NFT transaction information display issue

## 0.0.8.3 (May 7, 2023)

- Reopen private key import
- Fix transaction information display issue

## 0.0.8.2 (May 6, 2023)

- Add wormhole link
- Fix NFT display issue

## 0.0.8.1 (May 5, 2023)

- Add address QR code
- Fix crash when send bridged tokens on mainnet
- Fix bridged tokens display on mainnet

## 0.0.8.0 (May 2, 2023)

- Support Sui mainnet

## 0.0.7.6 (Apr 18, 2023)

- Adjust approve and cancel button position

## 0.0.7.5 (Apr 17, 2023)

- Update error message toast

## 0.0.7.4 (Apr 11, 2023)

- Fix wrong 'send to' address in send confirmation page
- Fix coin display
- Update @mysten/sui.js@^0.32.1 and @mysten/wallet-standard@^0.5.3

## 0.0.7.3 (Apr 10, 2023)

- Configurable discovery banner

## 0.0.7.2 (Apr 6, 2023)

- Release wallet management
- Refactor wallet meta storage

## 0.0.7.1 (Apr 4, 2023)

- Release security and privacy settings

## 0.0.7.0 (Mar 31, 2023)

- Update @mysten/sui.js 0.30.0 and @mysten/wallet-standard 0.5.0
- Update pages related to Sui address
- Change storage structure of vault

## 0.0.6.6 (Mar 15, 2023)

- Adjust discovery scroll height

## 0.0.6.5 (Mar 14, 2023)

- Fix issue that banner show 'undefined' in case of empty data
- Add cooperated NFTs and DApps

## 0.0.6.4 (Feb 14, 2023)

- Add Banner slide

## 0.0.6.3 (Feb 10, 2023)

- Add Banner in Discovery page

## 0.0.6.2 (Jan 31, 2023)

- Support OriginByte NFTs

## 0.0.6.1 (Jan 20, 2023)

- Add discovery items hover effects

## 0.0.6.0 (Jan 18, 2023)

- Provide ability to discover dApps and NFTs

## 0.0.5.1 (Jan 18, 2023)

- Fix the issue that switching account will trigger creating a new account unexpectedly

## 0.0.5.0 (Jan 11, 2023)

- Provide ability to created derived wallet accounts

## 0.0.4.0 (Dec 26, 2022)

- Provide ability to customize the wallet, e.g. alias and avatar

## 0.0.3.2 (Dec 19, 2022)

- Upgrade @mysten/sui.js to 0.20.0
- Fix the issue of transaction failure
- Perf the code by latest @mysten/sui.js 0.20.0

## 0.0.3.1 (Dec 19, 2022)

- Provide ability to change password

## 0.0.3.0 (Dec 12, 2022)

- Provide ability to seed phrase and export private key
- Fix typo

## 0.0.2.2 (Dec 12, 2022)

- Provide new feature to display nft details and transfer nfs

## 0.0.2.1 (Dec 9, 2022)

- Provide new feature to display nfts
- Fix the issue that the wallet status will be lost after update

## 0.0.2.0 (Dec 6, 2022)

- Provide ability to connect and transact on dApp (based on Sui adapter)
- Update extension icons

## 0.0.1.3 (Dec 5, 2022)

- Refactor the export convention: export default for single-exported module
- Add not found page
- Use base64 icon as dApp display icon
- Change MIT license to Apache 2.0

## 0.0.1.2 (Dec 5, 2022)

- Use unique morphis storage keys and password
- Put keys and password into environment variables to avoid disclosure

## 0.0.1.1 (Dec 1, 2022)

- Add the transaction detail link to sui explorer
- Fix the issue that the user cannot input transaction amount, and allow users to input decimal pointor decimal comma

## 0.0.1.0 (Nov 29, 2022)

- Improve the UX, e.g. error and success toast, etc.
- Refactor UI elements, and use tailwind instead of scss
- Remove mui from morphis and use custom morphis components
- Reduce the pack size by 50%+ (~1.2MB to <600KB)

## 0.0.0.2 (Nov 23, 2022)

- Provide new feature to view the detail of coins
- Use morphis unique messaging
- Fix the toast display position

## 0.0.0.1 (Nov 18, 2022)

- Morphis wallet initial release
- Add build/pack scripts
- Provide basic wallet functionalities, e.g., coin inspecation, transaction, etc.
