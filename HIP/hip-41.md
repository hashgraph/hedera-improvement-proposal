---
hip: 41
title: NFT Metadata JSON Schema
author: Sam Wood sam.wood@luthersystems.com, Susan Chan susan.chan@luthersystems.com, Stephanie Yi stephanie.yi@luthersystems.com, Khoa Luong khoa.luong@luthersystems.com
type: Standards Track
category: Application
status: Draft
created: 2020-2-18
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/issues/40
updated:
requires:
replaces:
superseded-by:
---

## Abstract

This specification provides a standard way to interrogate Non-fungible Tokens (NFT) on HTS for associated metadata. For example, it provides a standard way for HTS token explorers to display an image associated with a NFT on HTS, in the same way ERC721 images are displayed on the Ethereum network.

## Motivation

Token creators often desire to include an image and supplemental metadata that is associated with non-fungible tokens (NFTs).
For example, tokens representing artwork include an URL that serves an image of the artwork.
This specification provides an OPTIONAL standard for referencing and processing token metadata stored outside of HTS.
A standard adopted by the community increases the interoperability and re-usability for systems that process Hedera NFTs.

The motiviation for this specific standard is the same as the metadata extension in [0]:
> A mechanism is provided to associate NFTs with URIs. We expect that many implementations will take advantage of this to provide metadata for each NFT. The image size recommendation is taken from Instagram, they probably know much about image usability. The URI MAY be mutable (i.e. it changes from time to time). We considered an NFT representing ownership of a house, in this case metadata about the house (image, occupants, etc.) can naturally change.

## Rationale

The specific "NFT Metadata JSON Schema" is chosen to make the implementation easier for token explorers and wallet providers that wish to display metadata for NFTs issued on HTS.
The specifiation is based on [0] which has served the Ethereum community well.
A familiar standard adpated for HTS could accelerate the implementation and adoption of HTS NFTs.

The choice for using the token "name" field to represent the URI that serves the metadata is primarily because the metadata standard includes a "name" field. See the "Open Issues" section for alternative choices.

## Specification

The exact method for implementing an NFT on HTS is outside the scope of this specificaiton. See [3] for an example.

NFTs optionally specify a URI in the token "name" attribute.
This URI MAY link to data on the Hedera File Service, IPFS, a DID, AWS, or any other URI the issuer specifies.
This URI references token metadata that MUST conform to the "NFT Metadat JSON Schema".
This allows your NFTs to be interrogated for its name and for details about the assets which your NFTs represent.

This is the "NFT Metadata JSON Schema" referenced above.

```
{
    "title": "Asset Metadata",
    "type": "object",
    "properties": {
        "name": {
            "type": "string",
            "description": "Identifies the asset to which this NFT represents"
        },
        "description": {
            "type": "string",
            "description": "Describes the asset to which this NFT represents"
        },
        "image": {
            "type": "string",
            "description": "A URI pointing to a resource with mime type image/* representing the asset to which this NFT represents. Consider making any images at a width between 320 and 1080 pixels and aspect ratio between 1.91:1 and 4:5 inclusive."
        }
    }
}
```

## Backwards Compatibility

This HIP is entirely opt-in, and does not break any existing functionality. It simply provides standards to facilitate integratons for the display of metadata for HTS NFTs.

## Security Implications

No known security concerns.

## How to Teach This

HTS implementations use this standard to provide additional metadata for their tokens. See the reference implementation below for an example.

Wallet and token explorer implementations interrogate HTS tokens using this standard to display additional metadata for NFTs.

## Reference Implementation

See token 0.0.365571 [4] which is a NFT deployed on the testnet that conforms to this specification.

Where the endpoint `https://dev.luthersystemsapp.com/nft-test.json` serves:

```
$ curl -s https://dev.luthersystemsapp.com/nft-test.json | jq ''
{
  "name": "CHLOET",
  "description": "Chloe Test NFT",
  "image": "https://dev.luthersystemsapp.com/chloe_assets/SearchingForLightNo_81_20/image_part_005.jpg"
}
```

## Rejected Ideas

N/A

## Open Issues

This proposal uses the HTS "name" field to specify the URI for token metadata. Alternatives include the token "symbol" field or transaction "memo" field. Note that symbol is used to represent HTS metadata in [3].

## References

[0] https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md#specification
[1] https://opensea.io/
[2] https://dcentwallet.com/
[3] https://github.com/hashgraph/hedera-hts-demo/pull/4
[4] https://explorer.kabuto.sh/testnet/id/0.0.365571

## Copyright/license

Each new HIP must be placed under the Apache License, Version 2.0 -- see [LICENSE](LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
