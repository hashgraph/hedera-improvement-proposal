- hip: <HIP number (this is determined by the HIP editor)>
- title: Virtual Merkle
- author: Richard Bair (@rbair23), Jasper Potts (@jasperpotts)
- type: Standards Track
- category: Core
- status: Draft
- created: 2021-09-07
- discussions-to: <a URL pointing to the official discussion thread>
- updated: <comma separated list of dates>

## Abstract

Virtualize the merkle tree as an on-disk data structure to support scaling to billions of entities per node.

## Motivation

Each node in the network must independently maintain the total state of the system at any given point in time.
This state is stored in memory as a Merkle tree. As the size of the state grows, the amount of memory used for
storing the state likewise grows. Nodes on the Hedera network have a large amount of RAM available (on the order
of 256GB). Some of this RAM is used for the operating system, some for off-heap data structures by the JVM, and
a large portion of it (on the order of 150-200GB) as Java heap. A large portion of the Java heap must be reserved
for the garbage collector so that it may operate optimally. Some of this RAM is used for transient objects during
state saving and other needs such as gossiping and hashgraph, and most of it for Merkle trees storing the state.

As the amount of state in the system grows, RAM becomes increasingly scarce. By _virtualizing_ the tree on disk,
we can move much of the state out of RAM, enabling Hedera to scale to billions of entities. This HIP proposes the
creation of a **virtual merkle tree** and custom on-disk database that is fault tolerant, fast, and highly scalable.

The initial design objective was to enable very fast and highly-scalable smart contracts. In today's system, a
Postgres database is used for storing both smart contract byte code and smart contract state (256-bit word key/value
pairs) as binary blobs. There are two problems with this approach. First, reading and writing large blob data would
be faster working directly with the disk than going through JDBC and the other layers that SQL adds. Second, for smart
contract state where the smart contract changes just a single value, we read the entire blob from Postgres, change a
single 256-bit word, hash the entire blob, and write it all back to the database. By creating a virtual merkle tree,
we are able to represent smart contract key/value pairs as leaves in the tree, reading only the necessary data,
writing only the necessary data, and hashing only the necessary data resulting in huge performance improvements.

Virtualization may prove useful for other entities beyond just smart contracts. NFTs could also be virtualized,
giving Hedera the capability to support hundreds of millions or more NFTs.

Critically, virtualizing the Merkle tree state should **not** impact the 10K TPS SLA of the Hedera network.

## Rationale

### Design Goal #1: Minimize Changes

A virtual Merkle tree should fit naturally into the existing in-memory Merkle tree code and mechanisms, including
tree traversal, hashing, state signing, state saving, and reconnect, while storing the actual data on disk and
**realizing** (i.e. bringing into memory) as little data as possible. Some modifications to the core systems and
algorithms may be needed, but we want to keep these changes to only the required set.

### Design Goal #2: Scale According to TPS not Number of Entities

Our ability to scale should be based primarily on the TPS and not the number of entities. That is, the system
with 10M entities and with 100M entities should exhibit similar memory characteristics if executed with the
same load (TPS). They won't compare exactly, since the Merkle tree itself will be larger and require more
internal (branch) nodes, but it should be true as we approach the asymptote that an increase in entity count
has little impact on the overall performance of the system, subject to disk characteristics.

### Design Goal #3: Fault Tolerant

The on-disk database should be designed to survive system faults. In particular, the design must account for
nodes which die unexpectedly, and those that go offline as part of an upgrade. As can be shown in the specification,
this is not a particularly difficult problem to solve, since the network is by design able to restore from
saved state and reconnect.

### Design Goal #4: Variable Sized Data

Initial designs called for fixed-size data in the on-disk database, corresponding to the initial use case of
smart contract data (256-bit words). As the design work progressed, it became apparent that to support NFTs and
accounts, we would need to also support variable sized data. Since these other use cases are so valuable, the
design should include support for them.

### Design Goal #5: Mechanical Sympathy

Superior performance requires designing the entire solution in a holistic manner taking into account the manner in
which the underlying storage mechanisms work. Initial design attempts were based on memory mapped files with random
reads and writes, and at low entity counts (< 200M) this looked very promising. As we increased the load testing to
include 1 billion entities, we found that memory mapped files performance dropped off a cliff due to write
amplification.

As another example, we began by making use of standard Java collections for various uses. As we profiled, we found
that using `long` variables was much better since they allowed us to use native CAS (compare-and-swap) support of the
CPU. Since the Java collections box primitives like `long`, it was not possible to use them and get the best
performance.

By understanding the nature of the machine we are able to design a solution that leads to higher performance.

### Design Goal #6: End-User Transparency

This features is a core implementation detail of the product and has no direct user-visible impact. It has an
indirect user-visible impact in the number of entities supported on the platform and overall performance of smart
contracts, but does not expose any new HAPI or other API.

### Non-Goal #1: Off-the-shelf Databases

An explicit non-goal is to force the use of an off-the-shelf database, such as Postgres, RocksDB, LMDB, or others.
After extensive POC and prototyping, we found all off-the-shelf solutions to have limitations that we were not
willing to accept. RocksDB exhibited numerous seg-faults and inferior read performance. LMDB exhibited inferior
write performance as the number of entities exceeded two hundred million. We tested more than a half-dozen
different systems and found that none of them met our criteria.

## User stories

Provide a list of "user stories" to express how this feature, functionality, improvement, or tool will be used by the end user. Template for user story: “As (user persona), I want (to perform this action) so that (I can accomplish this goal).”
  
## Specification

The technical specification should describe the syntax and semantics of any new features. The specification should be detailed enough to allow competing, interoperable implementations for at least the current Hedera ecosystem.

## Backwards Compatibility

As virtual merkle trees are adopted by Hedera Services, their adoption must be transparent to the user and contain
no backwards incompatibilities. Code in Hedera Services will be responsible for migrating state from in memory
merkle trees and/or Postgres blobs into virtual trees.

## Security Implications

Since virtualization increases the upper limit on the number of entities, it will make it more difficult
for an attacker to drive the system to exhaustion.

Smart contracts have a gas price for accessing key/value pairs and for creating new pairs. It is critical that
we test the true cost of accessing and mutation key/value pairs from smart contracts and prove that the true cost
does not exceed the gas price, otherwise a malicious smart contract could perform a DOS on the network by
accessing or mutating key/value pairs.

## How to Teach This

N/A

## Reference Implementation

The reference implementation must be complete before any HIP is given the status of “Final”. The final implementation must include test code and documentation.

## Rejected Ideas

Throughout the discussion of a HIP, various ideas will be proposed which are not accepted. Those rejected ideas should be recorded along with the reasoning as to why they were rejected. This both helps record the thought process behind the final version of the HIP as well as preventing people from bringing up the same rejected idea again in subsequent discussions.

In a way, this section can be thought of as a breakout section of the Rationale section that focuses specifically on why certain ideas were not ultimately pursued.

## Open Issues

While a HIP is in draft, ideas can come up which warrant further discussion. Those ideas should be recorded so people know that they are being thought about but do not have a concrete resolution. This helps make sure all issues required for the HIP to be ready for consideration are complete and reduces people duplicating prior discussions.

## References

A collections of URLs used as references through the HIP.

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
