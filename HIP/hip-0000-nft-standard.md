---
hip: 0000
title: Define a granular NFT Standard (Extends HIP-412)
author: Michiel Mulders <@michielmulders>
working-group: Michiel Mulders <@michielmulders>, Ashe Oro <@Ashe_Oro>, Hash Axis <@hashaxis>, Rocket May <@rocketmay>, HGP Patches <@HGP_Patches>
type: Informational
needs-council-approval: No
status: Draft
created: 2022-09-05
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/413#discussioncomment-3465759
updated: 2022-09-05
requires: 412
---

## Abstract

This HIP specifies a more granular standard for non-fungible token metadata on HTS to make it easier for NFT tooling, such as NFT explorers or NFT wallets, to parse and interpret NFT metadata. 

This HIP extends the active HIP 412 by using its standard scheme for non-fungible token metadata on HTS. NFTs minted using a more granular standard allow for better metadata parsing and reduce implementation nuances due to different interpretations of HIP 412.

## Motivation

NFT creators desire a more granular standard to define their non-fungible token metadata on HTS. The current implementation defined by HIP 412 allows for different interpretations. It's a risk for the Hedera NFT community because users will create different metadata implementations. Therefore, making it harder for NFT tooling to interpret this data correctly. 

The goal is that this HIP defines a granular standard that the entire Hedera NFT community can adopt to set us up for the future.

## Rationale

This token metadata standard has been developed with input from multiple developers and projects in the NFT space. The goal is to provide a more granular NFT standard for "Web3 NFTs", providing a more concrete implementation for HIP-412. 

This HIP focuses on:

1. Providing strict guidelines for artists to define their NFT token metadata
2. Maintaining flexibility via the `properties` object allowing for non-specified fields
3. Maintaining a good level of interoperability and coherence with other standards such as OpenSea
4. Providing sufficient examples for all types of NFTs to find the correct metadata implementation as an artist
  
## Specification

Below is the human-readable schema, presented to maximize clarity. 

```json
{
    "name": "NFT name (required)",
    "creator": "artist (required)",
    "creatorDID": "DID URI (optional)",
    "description": "human readable description of the asset (recommended)",
    "image": "cid or path to the NFT's preview image file (required)",
    "image_integrity": "SHA-256 digest of the file pointed by the image field (recommended)",
    "type": "MIME type (required)",
    "format": "standard specification (required - i.e. none, opensea, HIPXXX, hashaxis)",
    "properties": {
        // json object that cover the overarching properties of the token
        "files": [
            {
                "uri": "uri to file (required)",
                "sha256_checksum": "cryptographic hash of the representation of the resource the author expects to load (recommended)",
                "type": "MIME type (required)",
                "is_default_file": "(Type: boolean) indicates if the file is the main file for this NFT (conditionally optional - required when multiple files are listed)",
                "metadata": "metadata object (optional)",
                "metadata_uri": "uri to metadata (optional)",
                "localization": [
                    // optional localization array
                    {
                        "uri": "uri to file (required)",
                        "locale": "language identifier (required)"
                    }
                ]
            }
        ],
        "collection": "Define your collection name to which the NFT belongs (optional)",
        "external_url": "External URI pointing to an informational page about your collection or specific NFT information i.e. www.mynft/collection/<serial>/ (optional)"
    },
    "attributes": [
        // Can only contain trait types for rarity calculation
        {
            "trait_type": "name of trait (required)",
            "value": "value for this trait (required)",
            "max_value": "maximum possible value for this trait (optional)"
        }
    ]
    // no additional root-level properties allowed - properties array should contain additional properties you may require
}
```

Below is the field-specific rationale.

### name

**Type:** string

**Required**

**Description:** Specific NFT name


### creator

**Type:** string

**Required**

**Description:** Artist name


### creatorDID

**Type:** string (URI)

**Optional**

**Description:** 

This is an optional field to carry a decentralized identifier for the creator. This would allow a creator to subsequently lay claim to a creation even if the current ownership is different.

The DID resolves to a DID document with a public key, and the creator would prove ownership of the corresponding key with a signature.

For example, a Hedera DID looks like 'did:hedera:mainnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm;hedera:mainnet:fid=0.0.123'. The DID resolves to a JSON DID Document.

References: 
https://github.com/hashgraph/did-method/blob/master/did-method-specification.md
https://w3c.github.io/did-core/


### description

**Type:** string

**Required**

**Description:** Human-readable description of the NFT.


### image

**Type:** string (CID or URI)

**Required**

**Description:** CID or path to the NFT's **preview image** file. Each NFT should have a preview image set to allow NFT tooling to load a display image quickly. 

For image-based NFTs, you can use a compressed image optimized for the web. For other types of NFTs, you can use any compressed image that gives a visual clue as to what to expect as a user. 

It's recommended to host your file on [IPFS](https://ipfs.io/) and use a service like [Pinata](https://pinata.cloud/) to easily pin your file. Your CID should look like this: `ipfs://<hash>`.

Alternatively, you can use [Arweave](https://www.arweave.org/), receiving a similar CID that looks like this: `ar://<hash>`.


### image_integrity

**Type:** string (SHA-256)

**Optional (recommended)**

**Description:** SHA-256 digest of the file pointed by the `image` property. The `image_integrity` property that contains a cryptographic hash of the representation of the resource the author expects to load. 

For instance, an author may wish to load some image from a shared server. Specifying that the expected SHA-256 hash of https://example.com/image.jpeg is ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad means that the user agent can verify that the data it loads from that URL matches that expected hash before loading the NFT. This integrity verification significantly reduces the risk that an attacker can substitute malicious content.

References: https://w3c.github.io/webappsec-subresource-integrity/


### type

**Type:** string (MIME type)

**Required**

**Description:** Mime formatting shall follow the following format: **type/subtype**. As a rule, mime types are all lowercase. However apps should be programmed to accept any case for robustness.

A list of common mime types can be found here: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types

Note that mime types for directories are not uniformly defined. Some IPFS CIDs point to directories rather than files, so this type is useful. This standard shall define it using the format: text/directory.


### format

**Type:** string

**Required**

**Possible values:** 

- `none`: When not following any standard (not recommneded)
- `opensea`: When following the [OpenSea standard](https://docs.opensea.io/docs/metadata-standards)
- `HIPXXX`: When following a standard defined by HIPs, e.g. `HIP412`

**Description:** Describes the used standard to display NFT metadata. This property allows for faster parsing by NFT tooling because they don't have to figure out which standard they are dealing with. 


### properties

**Type:** object

**Required**

**Description:** JSON object that covers the overarching properties of the token. It holds all additional properties the artist wants to define for its NFT. Besides a couple of mandatory properties, the artist is free to include any other properties they want. 

**It's not allowed to add any non-specified root-level properties to the metadata.**


### properties.files

**Type:** array

**Required**

**Description:** The `files` array holds a collection of one or many files. Because the `image` property is used as a preview image, the `files` array should at least hold one `file` object that represents the NFT. 


### properties.files.uri

**Type:** string (CID or URI)

**Required**

**Description:** CID or path to the NFT's file. It's recommended to host your file on [IPFS](https://ipfs.io/) and use a service like [Pinata](https://pinata.cloud/) to easily pin your file. Your CID should look like this: `ipfs://<hash>`.

Alternatively, you can use [Arweave](https://www.arweave.org/), receiving a similar CID that looks like this: `ar://<hash>`.


### properties.files.sha256_checksum

**Type:** string (CID or URI)

**Optional (recommended)**

**Description:** SHA-256 digest of the file pointed by the `properties.files.uri` property. The `sha256_checksum` property that contains a cryptographic hash of the representation of the resource the author expects to load (just like the `image_integrity` property).

For instance, an author may wish to load some image from a shared server. Specifying that the expected SHA-256 hash of https://example.com/image.jpeg is ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad means that the user agent can verify that the data it loads from that URL matches that expected hash before loading the NFT. This integrity verification significantly reduces the risk that an attacker can substitute malicious content.

References: https://w3c.github.io/webappsec-subresource-integrity/


### properties.files.type

**Type:** string (MIME type)

**Required**

**Description:** Mime formatting shall follow the following format: **type/subtype**. As a rule, mime types are all lower case. However apps should be programmed to accept any case for robustness.

A list of common mime types can be found here: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types

Note that mime types for directories are not uniformly defined. Some IPFS CIDs point to directories rather than files, so this type is useful. This standard shall define it using the format: text/directory.


### properties.files.is_default_file

**Type:** boolean (false/true)

**Conditionally optional:** Required when multiple `file` objects are present in the `files` array. When only one `file` object is defined, this becomes the default file.

**Description:** The `is_default_file` property makes it easier for NFT tooling to identify the main file for an NFT if multiple files are present.


### properties.files.metadata

**Type:** object

**Optional**

**Description:**  This is a nested metadata object for the file, which follows the same metadata format as the root metadata. Files can be nested indefinitely in this way, but processed with the same metadata code.


### properties.files.metadata_uri

**Type:** string (CID or URI)

**Optional**

**Description:** There are situations (such as mutable metadata) where rather than including the "metadata" object it makes sense to point to a different file. Therefore this is a URI that points to a metadata json file for the file in question. 

**To avoid conflicts, if "metadata" is defined then "metadata_uri" should be ignored.**

An NFT creator has the option of using either "metadata" or "metadata_uri". Metadata should be considered the default behaviour as it minimizes the number of calls that need to be made. Metadata_uri should be used in specific situations where defining the metadata object within the base metadata file is inadequate.


### properties.files.localization

**Type:** array

**Optional**

**Description:** Allows artists to optionally add localization for their listed `files`. 


### properties.files.localization.uri

**Type:** string (CID or URI)

**Required**

**Description:** CID or path to the NFT's file. It's recommended to host your file on [IPFS](https://ipfs.io/) and use a service like [Pinata](https://pinata.cloud/) to easily pin your file. Your CID should look like this: `ipfs://<hash>`.

Alternatively, you can use [Arweave](https://www.arweave.org/), receiving a similar CID that looks like this: `ar://<hash>`.


### properties.files.localization.locale

**Type:** string (two-letter language code according to [ISO 639-1 standard](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes))

**Required**

**Description:** A two-letter language code identifying the file's language. No need to further define subregion locales such as `en-GB` to keep things simple.


### properties.collection

**Type:** string

**Optional**

**Description:** Ability to define a collection name to which the NFT belongs.


### properties.external_url

**Type:** string (URI)

**Optional**

**Description:** External URI pointing to an informational page about a collection or specific NFT information i.e. `www.mynft/collection/<serial>/`.


### attributes

**Type:** array

**Required**

**Description:** Required array of attribute objects to calculate the rarity score of NFTs. If you don't wish to implement rarity scores, add an empty array. 


### attributes.trait_type

**Type:** string

**Required**

**Description:** Name of trait.


### attributes.value

**Type:** string

**Required**

**Description:** Value for trait. Can be a textual or a numeric value. **When using a numeric value, make sure the numeric value is of type integer or float.**

To give an example, imagine an NFT with the `trait_type: mouth`. Possible values are `bubblegum`, `smiling`, `braces`, or `trumpet`. 


### attributes.max_value

**Type:** string

**Optional**

**Description:** Adding an optional `max_value` sets a ceiling for a numerical trait's possible values. **NFT tooling should default this value to the maximum value seen for a collection.** Only use this property if you want to set a different value than the maximum value seen in the collection. Make sure the `max_value` is equal to or higher than the maximum value seen for your collection.


## Reference Implementation

#### Example Schema: Full specification implementation for image

An example of a full implementation of the metadata schema described in the above specification for an image-based NFT. We are setting the image field to a URI and including the `image_integrity` field which represents a hash of the provided image. The `properties.files` array contains the main image hosted on IPFS, also including a checksum for validation purposes. No additional properties are defined on the JSON object.

```json
{
    "name": "Example NFT 001",
    "creator": "Jane Doe, John Doe",
    "creatorDID": "did:hedera:mainnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm;hedera:mainnet:fid=0.0.123",
    "description": "This describes my NFT",
    "image": "https://myserver.com/nft-001.png",
    "image_integrity": "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    "type": "image/png",
    "format": "HIP500",
    "properties" : {
        "files": [
            {
                "uri": "ipfs://bawlkjaklfjoiaefklankfldanmfoieiajfl",
                "sha256_checksum": "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
                "type": "image/png"
            }
        ],
        "collection": "My NFT Collection",
        "external_url": "https://nft.com/mycollection/001"
    },
    "attributes": [
        {
            "trait_type": "colour",
            "value": "red"
        },
        {
            "trait_type": "mouth",
            "value": "bubblegum"
        },
        {
            "trait_type": "coolness",
            "value": "50"
        }
    ]
}
```


#### Example: Video NFT with locale

An example of a video NFT with a preview `image` and added localization for the video file. No `attributes` are set because rarity scores are mostly not associated to video NFTs. Besides that, additional properties (`my_property` and `another_property`) have been set in the `properties` object. No root-level properties are allowed that are not specified in this specification. 

```json
{
    "name": "Video NFT 001",
    "creator": "Jane Doe, John Doe",
    "description": "This describes my video NFT",
    "image": "https://myserver.com/video-preview.png",
    "image_integrity": "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    "type": "image/png",
    "format": "HIP500",
    "properties" : {
        "files": [
            {
                "uri": "ipfs://bawlkjaklfjoiaefklankfldanmfoieiajfl",
                "sha256_checksum": "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
                "type": "video/mp4",
                "localization": [
                    {
                        "uri": "ipfs://bawlkjaklfjoiaefklankflda132zafga3tfa",
                        "locale": "es"
                    },
                    {
                        "uri": "ipfs://bawlkjaklfjoiaefklankf12554wa6aga4fda",
                        "locale": "jp"
                    }
                ]
            }
        ],
        "my_property": "Some random property the artist needs",
        "another_property": "Additional property"
    },
    "attributes": []
}
```


#### Example: Multi-image NFT

An example of a multi-image NFT where the last file in the `properties.files` array is set as the default file using `is_default_file`.

```json
{
    "name": "Example multi-image NFT 001",
    "creator": "Jane Doe, John Doe",
    "creatorDID": "did:hedera:mainnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm;hedera:mainnet:fid=0.0.123",
    "description": "This describes my NFT",
    "image": "https://myserver.com/preview-001.png",
    "image_integrity": "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    "type": "image/png",
    "format": "HIP500",
    "properties" : {
        "files": [
            {
                "uri": "ipfs://bawlkjaklfjoiaefklankfldanmfoieiajfl",
                "sha256_checksum": "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
                "type": "image/jpeg"
            },
            {
                "uri": "ipfs://slaijfidnsklwnwklwnwlbawlkjbawlkjseq",
                "sha256_checksum": "6db3e42df27a8c6c63a2ac8396412d585c749ef84a4b5d9fced5b891ea9fb853",
                "type": "image/jpeg"
            },
            {
                "uri": "ipfs://nsklwlaijfidbawakssaioalikwaifjljwbi",
                "is_default_file": true,
                "sha256_checksum": "b61127d81eda21b0eb789be531e76c986717b4756620666095fe19082db9d426",
                "type": "image/jpeg"
            }
        ]
    },
    "attributes": [
        {
            "trait_type": "colour",
            "value": "red"
        },
        {
            "trait_type": "mouth",
            "value": "bubblegum"
        },
        {
            "trait_type": "coolness",
            "value": "50"
        }
    ]
}
```


## Backwards Compatibility with existing NFTs?

This HIP is entirely opt-in, and does not break any existing functionality. It simply provides standards to facilitate integratons for the display of metadata for HTS tokens.


## Security Implications

No known security concerns.


## How to Teach This

Provide a validator and minting tool to make it easier to validate and create NFTs with the correct metadata schema implementation for HTS tokens. Besides that, coordinate with NFT tooling how to interpret this data.


## Open Issues

N/A

## References

- [0] https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0003.md
- [1] https://docs.metaplex.com/token-metadata/specification
- [2] https://docs.opensea.io/docs/metadata-standards
- [3] https://docs.ipfs.io/how-to/best-practices-for-nft-data/#persistence-and-availability

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
