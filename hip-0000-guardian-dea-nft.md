---
hip: <HIP number (this is determined by the HIP editor)>
title: Conforming Guardian’s Sustainability Assets to an Enhanced HIP412 Standard
author: Matt Smithies (matt@dovu.earth), Cyndy Montgomery (montgomery@tolam.io), Giuseppe Bertone (giuseppe.bertone@swirldslabs.com), May Chan (may@hashpack.app) 
working-group: Guardian
requested-by: DOVU (@dovuofficial)
type: <Standards Track | Informational | Process>
category: Application
needs-council-approval: No
status: Review
created: 27-03-2024
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/930
updated: 27-03-2024
requires: 412
replaces: N/A
superseded-by: N/A
---

## Abstract

This document extends the NFT Token Metadata JSON Schema v2 ([HIP412](https://hips.hedera.com/hip/hip-412)) standard to specifically cater to Digital Environmental Assets (DEAs), enabling them to be more easily integrated into existing and future NFT marketplaces while providing enhanced metadata for categorization and verification. This enhancement introduces new metadata structures and attributes designed specifically for Digital Environmental Assets, such as carbon credits, renewable energy credits, and more. By aligning with the HIP412 standard, it aims to improve the user experience, searchability, and verifiability of DEAs across multiple platforms.

## Motivation

The motivation for enhancing the HIP412 standard to specifically cater to DEAs encompasses several key areas:

- **Metadata Immutability for Long-Term Asset Integrity**: Ensuring that the metadata associated with the DEAs is immutable is crucial for their long-term integrity and verifiability. This is particularly important in the context of environmental credits, where the provenance and impact of the asset may be scrutinized over time.


- **Improved Categorization and Searchability**: This enhancement facilitates more effective asset discovery and management by including specific attributes tailored for DEAs. Intrinsic support for categorization and searchability of DEAs increases asset utility within marketplaces and platforms at no extra cost to the issuer.


- **Reduce Friction for Adoption**: Conforming DEAs to the HIP412 standard will simplify the integration for wallets and external services and allow them to render these assets accurately. This results in an improved user experience, especially for end-users who may not be familiar with Sustainability specific attributes. The open standard allows for widespread adoption in the sustainability ecosystem.


- **Structured Metadata for Additional Information**: Provide a structured way to include vital additional metadata. This can range from specific environmental benefits and impacts to verification status, thereby adding another layer of credibility and information to the asset.


- **Ease of Trade on Secondary Markets**: Enable DEAs, once standardized to conform to HIP412, to be more easily sold on secondary markets. This not only increases the liquidity of these assets but also makes them more accessible to a broader audience.

This specification is designed with an eye towards the future, particularly in light of the evolving rules and frameworks under Article 6.4 of the Paris Agreement. Article 6.4 is a pivotal component of the global climate accord. It aims to set up a uniform, worldwide mechanism for trading carbon credits. As of November 2023, the details of this mechanism—including methodologies, eligible activities, and accounting rules—are being meticulously worked out by the Supervisory Board responsible for Article 6.4.

Given that these negotiations are ongoing and carry significant implications for the future of carbon markets, it's crucial that our specification remains adaptable. Therefore, consider this document a 'living specification' that will undergo revisions as more concrete decisions are made regarding Article 6.4. By doing so, we aim to ensure that the DEAs generated under this specification remain compliant with international standards, both now and in the future as the regulatory landscape evolves.
For more information on the significance and ongoing development of Article 6.4, visit the following [link](https://www.ceezer.earth/insights/the-significance-of-article-6-4-negotiations).

## Rationale

The rationale behind enhancing the HIP412 standard for DEA is to extend its applicability to a broader range of asset types, specifically DEAs. This extension serves multiple purposes:

- **Maintain Backward Compatibility with HIP412**: One of the fundamental considerations is to maintain backward compatibility with the existing HIP412 standard. This ensures that DEAs can be seamlessly integrated into existing systems and marketplaces that already support HIP412.


- **Allow for Extensibility**: Given the evolving nature of DEA verification standards and attributes, the enhanced standard aims to be extensible. This will allow for future updates to cater to new types of DEAs or additional attributes as they become relevant.


- **Enhance User Experience**: By providing a more structured and enriched set of metadata attributes, the enhanced standard aims to improve the user experience. This is particularly true for end-users looking to purchase or manage DEAs through wallets and other platforms.


- **Promote Metadata Immutability**: It is imperative that their associated metadata is immutable to ensure the long-term integrity and verifiability of DEAs. The enhanced standard aims to uphold this principle by recommending specific protocols and methods for metadata storage and requiring that the chosen solution can provide data immutability.


- **Forward Compatibility with Article 6.4**: Given the evolving nature of international carbon credit trading rules, particularly under Article 6.4 of the Paris Agreement, this specification is designed to be adaptable. This ensures that as the international framework solidifies, the DEAs generated under this standard can easily conform to the new regulations, thus maintaining their validity and market value.

## User stories

User stories and Related usage are connected to the same outcomes of [HIP412](https://hips.hedera.com/hip/hip-412), But with the intention to allow DEAs to be consumed on systems outside the sustainability ecosystem.  

## Specification

This section outlines the detailed specifications for extending the HIP412 standard to include DEA-specific attributes and properties. The aim is to create a superset of the existing standard, ensuring that it is both backward-compatible and extensible for future needs. Each subsection below elaborates on different facets of these specifications, covering metadata structures, attributes, properties, and other considerations.

1. **Non-Fungible Token Metadata Field**

   Standard HIP412 tokens set the “metadata” field in each token to a URI that points to the location of the metadata file. Under this HIP the token’s metadata field is defined with the following structure:
   {protocol}://[CID]/[timestamp]
   Where {protocol} points to an immutable protocol (see Metadata File Immutability and URI Formatting), and the timestamp is the guardian timestamp (see Guardian Timestamp).
   This approach is compatible with the IPFS CLI where the timestamp serves as the name of the JSON file and is stored inside a folder. This format has been specified to enhance the readability of the uri for external users. Guardian-enabled applications are advised to read only the last 20 characters of the metadata field for the timestamp and reject a URI that is missing a timestamp.


2. **Format Specification (REQUIRED)**

   HIP412 provides the “format” field to specify specific extensions of the base standard. For the purpose of this HIP, the format shall be specified in the root of the metadata structure as:
    
   ```
    “format”: “guardian_dea”
    ```

   Tokens compliant with this HIP are required to set the format field exactly as shown.


3. **Guardian Proof field (REQUIRED)**

   The issuer of the token must sign the “attributes" section of the metadata in the form of a VC proof as they do for VC in the Guardian trust chain, and they must set a 'guardian_proof' field in the "properties" section accordingly.
   The guardian_proof object is a standard proof as per signature scheme in verifiable credential specification where hedera-specific ED25519 keys are used so type should be Ed25519Signature2018 for this specification. 

   However, It is worth noting that while the proof is compliant with the signature scheme the intent is to **not** be compliant with W3C verifiable credentials specifications as the signature represents a signature from the "attributes" body of the HIP412 schema.


4. **Inclusion of Sustainability-Specific Properties**
   
    The following fields are defined under this specification and may be included under the “attributes” object in the JSON metadata, timestamp is the only hard requirement:

   | Attribute             | definition                                                                               |
   |-----------------------|------------------------------------------------------------------------------------------|
   | timestamp             | Timestamp related to the issuance and trustchain of the DEA, epoch format (required)     |
   | asset_type            | Types such as CRU, REC, etc.                                                             |
   | method                | Methods like Avoidance, Reduction, etc.                                                  |
   | sector                | Sectors such as Renewable Energy, Agriculture, etc.                                      |
   | project_type          | Describes the nature of the project generating the asset.                                |
   | methodology           | Specifies the methodology used for asset verification.                                   |
   | methodology_developer | The developer or registry validating the methodology.                                    |
   | geography             | The country where the asset originates, in Country Code Alpha-2 format.                  |
   | vintage               | The time period the asset pertains to, in four digit year format.                        |
   | co-benefits           | Additional environmental or social benefits, referencing the UN SDG as a numbered array. |


   These fields are optional, but recommended to be included to enhance the searchability and categorization of DEAs in marketplaces and explorers.

   
   Attribute objects follow the format described in HIP-412. Refer to the example section below for implementation.


   The "sector" attribute specifically refers to the sectorial scopes as established by the United Nations Framework Convention on Climate Change (UNFCCC). The UNFCCC's list serves as the source of truth for specifying the sector of an DEAs. For further details and to ensure accurate sector classification, refer to the official UNFCCC sectorial scopes list [3].


5. **CreatorDID field (OPTIONAL)**

   The optional 'creatorDID' field in the metadata should reference the project developer of the DEAs. This serves as a reliable source of verification and enhances the credibility of the asset.


6. **Guardian Timestamp (REQUIRED)**

   The 20-character string at the end of the uri in the token metadata field is a Hedera message timestamp which points to the URL of the Verifiable Presentation (VP) associated with the token[1]. This is the starting point where the entire sequence of documents produced by the Guardian policy workflow can be traversed.
   Including the timestamp in the token metadata field provides an extra layer of robustness for guardian apps which will always be able to access the critical information of the token’s VP even if the auxiliary token metadata cannot be retrieved from IPFS.


6. **Metadata file Immutability**

    Tokens issued in compliance with this HIP must use a protocol that guarantees immutability for their metadata files. Protocols such as IPNS, HTTPS, and others which allow for mutable data, are not acceptable for storing the token metadata due to the necessity of maintaining long-term integrity.


8. **URI Formatting**
   
    URI’s shall follow the URI formatting per the section in HIP412. [2]


8. **Optional Use of Verifiable Presentations**

    The standard notes that verifiable presentations may optionally be stored as files within the metadata structure, which have been derived from the generation of the DEA through the Guardian. Although this is not a requirement, it provides an avenue for future expansion and additional layers of verification.

## Backwards Compatibility

This HIP is designed to be fully backwards compatible and does not disrupt any existing functionality. Instead, it offers a valuable superset of standards specifically tailored for enhancing the integration and display of metadata for HTS tokens, with a particular emphasis on accommodating the unique attributes of DEAs.
By maintaining compatibility with previous standards while expanding to incorporate DEA-specific attributes, this specification ensures a seamless transition for existing implementations while empowering the ecosystem to embrace and showcase a broader range of DEA-related information.

## Security Implications

**Immutable Data Storage for DEAs**

Ensuring the security and integrity of digital representations of DEAs is paramount in the world of carbon and environmental credits. This specification relies on the use of protocols like IPFS (InterPlanetary File System) for data storage, which inherently provides a high level of data immutability and tamper resistance. However, it's crucial to emphasize the significance of this immutability, especially when considering the potential use of IPNS (InterPlanetary Name System).
IPFS, as a core protocol, offers robust immutability by design, making it an ideal choice for storing critical data related to DEAs. This immutability means that once data is stored on IPFS, it cannot be altered or tampered with, ensuring the authenticity and reliability of the information associated with these assets.

**Beware of Mutable Data Using IPNS**

While IPFS guarantees immutability, IPNS introduces the possibility of data mutation. IPNS allows for the dynamic updating of content associated with a given CID (Content Identifier) by mapping it to different content over time. This capability, while useful in certain contexts, poses a potential security risk for the underlying DEAs. Mutable data can lead to inconsistencies, loss of trust, and challenges in verifying the historical accuracy of an asset's metadata.
To maintain the highest level of security and data integrity, it is strongly recommended to avoid using IPNS for DEA metadata. Instead, adhere to the principles of immutability provided by IPFS, or protocols built on top, itself. This ensures that once data is recorded and associated with an asset, it remains unaltered and reliable throughout its lifecycle.

## How to Teach This

Guardian-compliant HTS implementations use this standard to provide additional metadata for their DEAs.

Wallet and token explorer implementations interrogate HTS tokens using this standard to display additional metadata for tokens.

## Reference Implementation

This section provides examples of a metadata schema adhering to this specification.

### Example Schema: Required and Recommended fields ONLY

```json
{
    "name": "Redhill Farm Carbon Credit",
    "creator": "Redhill Farm",
    "format": "guardian-dea",
    "description": "This is a carbon credit issued by Redhill Farm",
    "image": "ipfs://bafybeiapq5ewrpxrsche54laxvwwvth2ye3df4wbswwe3z2mk7rgzlz7za",
    "type": "image/png",
    "properties": {
        "guardian_proof": {
            "type": "Ed25519Signature2018",
            "created": "2023-10-04T11:18:59Z",
            "verificationMethod": "did:hedera:testnet:Ci3QBHbe3Fa6gKn8hm44PJn1uMkXEDbJkPQboYN7EKWV_0.0.3160930#did-root-key",
            "proofPurpose": "assertionMethod",
            "jws": "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..c3Jmwg3Nis5puQLNh5zcMgkzmmsB-m10A9dOoGh_3tt8aaTIzMZSsxQJbiLmb795mw-sKfa9DqN7gy3kbgNDCA"
        }
    },
    "attributes": [
        {
            "trait_type": "hcs_timestamp",
            "display_type": "datetime",
            "value": "1710271999.591571"
        }
    ]
}
```

### Example Schema: Full-featured

```json
{
    "name": "Redhill Farm Carbon Credit",
    "creator": "Redhill Farm",
    "format": "guardian-dea",
    "description": "This is a carbon credit issued by Redhill Farm",
    "image": "ipfs://bafybeiapq5ewrpxrsche54laxvwwvth2ye3df4wbswwe3z2mk7rgzlz7za",
    "type": "image/png",
    "attributes": [
        {
            "trait_type": "hcs_timestamp",
            "display_type": "datetime",
            "value": "1710271999.591571003"
        },
        {
            "trait_type": "asset_type",
            "value": "CRU"
        },
        {
            "trait_type": "sector",
            "value": "Agriculture"
        },
        {
            "trait_type": "project_type",
            "value": "Agriculture"
        },
        {
            "trait_type": "method",
            "value": "removal"
        },
        {
            "trait_type": "vintage",
            "value": 2023
        },
        {
            "trait_type": "geography",
            "value": "UK"
        },
        {
            "trait_type": "methodology_developer",
            "value": "UNFCCC"
        },
        {
            "trait_type": "methodology",
            "value": "https://cdm.unfccc.int/methodologies/DB/99QRTE6N5QJEBOV2XP374B25SSIXBB"
        },
        {
           "trait_type": "co-benefits-air", 
           "display_type": "boolean", 
           "value": true
        },
        {
           "trait_type": "co-benefits-water", 
           "display_type": "boolean", 
           "value": true
        },
        {
           "trait_type": "co-benefits-soil", 
           "display_type": "boolean", 
           "value": true
        },
        {
           "trait_type": "co-benefits-biodiversity", 
           "display_type": "boolean", 
           "value": true
        },
        {
           "trait_type": "co-benefits-equity", 
           "display_type": "boolean", 
           "value": true
        },
        {
           "trait_type": "co-benefits-carbon", 
           "display_type": "boolean", 
           "value": true
        }
    ],
    "properties": {
        "guardian_proof": {
            "type": "Ed25519Signature2018",
            "created": "2023-10-04T11:18:59Z",
            "verificationMethod": "did:hedera:testnet:Ci3QBHbe3Fa6gKn8hm44PJn1uMkXEDbJkPQboYN7EKWV_0.0.3160930#did-root-key",
            "proofPurpose": "assertionMethod",
            "jws": "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..c3Jmwg3Nis5puQLNh5zcMgkzmmsB-m10A9dOoGh_3tt8aaTIzMZSsxQJbiLmb795mw-sKfa9DqN7gy3kbgNDCA"
        }
    }
}
```
## Rejected Ideas

Throughout the discussion of a HIP, various ideas will be proposed which are not accepted. Those rejected ideas should be recorded along with the reasoning as to why they were rejected. This both helps record the thought process behind the final version of the HIP as well as preventing people from bringing up the same rejected idea again in subsequent discussions.

In a way, this section can be thought of as a breakout section of the Rationale section that focuses specifically on why certain ideas were not ultimately pursued.

## Open Issues

N/A

## References

[0] https://github.com/hashgraph/guardian/issues/1672

[1] https://github.com/hashgraph/guardian#discovering-digital-environmental-assets-assets-on-hedera

[2] https://hips.hedera.com/hip/hip-412#formatting-notes

[3] UNFCCC Sectorial Scopes

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
