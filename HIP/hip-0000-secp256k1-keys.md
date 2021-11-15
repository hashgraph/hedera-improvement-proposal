---
hip: <HIP number (this is determined by the HIP editor)>
title: Support ECDSA(secp256k1) keys
author: Michael Tinker <michael.tinker@hedera.com>
type: Standards Track
category: Service
needs-council-approval: Yes
status: Review
created: 2021-11-15
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/221
---

## Abstract

The only kind of public key that may currently appear in a Hedera key structure is a [Ed25519](https://ed25519.cr.yp.to/) public key. It follows that users can only secure their transactions using Ed25519 signatures.

We propose to enable support for ECDSA(secp256k1) cryptography by,
1. Extending the Hedera API protobufs with new fields for ECDSA(secp256k1) keys and signatures.
2. Clearly documenting how users will populate these new protobuf fields.
3. Updating the node software to support ECDSA(secp256k1) keys and signatures wherever their Ed25519 equivalents are currently supported.

## Motivation

Some users might prefer to use ECDSA(secp256k1) keys as on the [Bitcoin network](https://en.bitcoin.it/wiki/Secp256k1); 
for example, to ease re-use of existing client code with the Hedera network or simple familiarity.

## Rationale

The specification below is the only natural extension of the existing Hedera API protobufs. We propose using the 33-byte 
compressed public keys instead of uncompressed keys because the compressed form reduces both network usage and state size.

## User stories

- As an owner of a Hedera account, I want to secure transactions involving my account with one or more ECDSA(secp256k1) keys. 
- As the creator of a Hedera token, I want the supply manager role to be controlled by one or more ECDSA(secp256k1) keys.
  
## Specification

Only two protobuf changes are required. To the `Key` message type, we need to extend the `oneof key` with a new choice:
```
message Key {
    oneof key {
        ...
        /**
         * Compressed ECDSA(secp256k1) public key bytes
         */
        bytes ECDSA_secp256k1 = 7;
```
To the `SignaturePair` message type, we need to extend the `oneof signature` with a new choice:
```
message SignaturePair {
    ...
    oneof signature {
        ...
        /**
         * ECDSA(secp256k1) signature
         */
        bytes ECDSA_secp256k1 = 6;
```

When a user is creating or updating a Hedera key structure to include a ECDSA(secp256k1) public key, they should set the bytes of the `Key.ECDSA_secp256k1` field to the [_compressed_ form](https://en.bitcoin.it/wiki/Elliptic_Curve_Digital_Signature_Algorithm) of the public key. (That is, the first byte should be `0x02` if the `y`-coordinate of the key is even, and `0x03` if the `y`-coordinate is odd; and the following 32 bytes should be the `x`-coordinate as an unsigned 256-bit integer.)

For example, if the user's key pair has,
```
  public x coord: 30215706507791629899960430517232235275000002464034938000648205570353843228303
  public y coord: 14152164375773628889345997156717932001811675396914245134380969244261391953841
``` 
Then the hex-encoded bytes of the `Key.ECDSA_secp256k1` field should be,
```
0x0342cd7bdc42bb0bbf9cd3c31479521ebbe7c729251e21cf2148bcd8d43c4d4e8f
```

While if the key pair has,
```
  public x coord: 82320372298163969708040656530484673130018359270243775662302157667426266882648
  public y coord: 16530900404587179989301633022594415830923307118357223838237239310583951083392
```
Then the hex-encoded bytes of the `Key.ECDSA_secp256k1` field should be,
```
0x02b5ffadf88d625cd9074fa01e5280b773a60ed2de55b0d6f94460c0b5a001a258
```

When a user is providing an ECDSA(secp256k1) signature in a `SignaturePair.ECDSA_secp256k1` field, it should be the full result of signing the [`SignedTransaction.bodyBytes`](https://hashgraph.github.io/hedera-protobufs/#proto.SignedTransaction) from the top-level `Transaction` with the relevant ECDSA(secp256k1) private key. 

## Backwards Compatibility

This HIP does not make any breaking changes. Clients that continue to use Ed25519 keys and signatures will be unaffected.

## Security Implications

If we observe a significant performance impact when verifying ECDSA(secp256k1) signatures compared to Ed25519 signatures,
we will need to throttle transactions with ECDSA(secp256k1) signatures at a lower TPS.

## How to Teach This

In one sentence: "Allow Hedera entities to be secured using ECDSA(secp256k1) keys and signatures."

## Reference Implementation

Ongoing.
- For protobufs changes, please follow [this issue](https://github.com/hashgraph/hedera-protobufs/issues/110).
- For node software changes, please follow [issues with the label "secp256k1"](https://github.com/hashgraph/hedera-services/issues?q=is%3Aopen+is%3Aissue+label%3Asecp256k1).

## Rejected Ideas

No other designs seemed natural. 

## Open Issues

Signature verification is done through the Platform SDK, so the node software depends on the SDK being updated 
to also verify ECDSA(secp256k1) signatures with acceptable performance.

## References

- [Ed25519 cryptography](https://ed25519.cr.yp.to/)
- [ECDSA cryptography](https://en.bitcoin.it/wiki/Elliptic_Curve_Digital_Signature_Algorithm)
- [Use of secp256k1 curve in Bitcoin](https://en.bitcoin.it/wiki/Secp256k1)
- [Hedera API protobufs](https://hashgraph.github.io/hedera-protobufs)

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
