---
hip: <HIP number (assigned by the HIP editor), usually the PR number>
title: "Improve Hedera Sharding via Dynamic Committee Reconfiguration"
author: Ziwei Wang <t4stek1ng@whu.edu.cn>, Cong Wu <cnacwu@gmail.com>, Paolo Tasca <p.tasca@exp.science>
working-group: <List of the technical and business stakeholders' names and/or usernames, or names and emails. Ex: John Doe <@johnDoeGithub1778>, Jane Smith <jane@email.com>>
requested-by: <Name(s) and/or username(s), or name(s) and email(s) of the individual(s) or project(s) requesting the HIP. Ex: Acme Corp <request@acmecorp.com>>
type: Standards Track
category: <"Core" | "Service" | "Mirror" | "Application">
needs-council-approval: <"Yes" | "No">
status: Draft
created: 2025-03-13
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/1150
updated: <Latest date HIP was updated, in YYYY-MM-DD format.>
requires: <HIP number(s) this HIP depends on, if applicable. Ex: 101, 102>
replaces: <HIP number(s) this HIP replaces, if applicable. Ex: 99>
superseded-by: <HIP number(s) that supersede this HIP, if applicable. Ex: 104>
---

## Abstract

This HIP proposes the integration of a sharding mechanism into Hedera. By partitioning the overall network into Local Committees and a coordinating Global Committee, the design aims to reduce per-node storage and communication overhead while preserving security and Byzantine Fault Tolerance. The proposal details protocols for inter-shard synchronization, efficient cross-shard transaction processing, dynamic committee reconfiguration, and the incorporation of shard state proofs. In addition, the design leverages Hedera’s mirror network to offload full historical data storage, thereby enabling Hedera to scale effectively without sacrificing performance.

------

## Motivation

Hedera’s underlying Gossip-about-Gossip protocol and DAG-based consensus deliver excellent performance, fairness, and low latency. However, with network expansion, several challenges emerge:

- **Scalability Limitations:** Every consensus node must store the ledger’s most recent snapshot (lasting a few minutes) for consensus, while mirror nodes maintain the complete transaction history. This leads to increased resource demands as the network grows.
- **Communication Overhead:** The extensive Gossip protocol can cause significant per-node bandwidth usage as events proliferate.
- **Security Concerns:** Static committee assignments can make targeted attacks more effective. Adversaries might exploit this by focusing on a specific shard.

The introduction of sharding with dynamic committee reconfiguration and shard state proofs partitions the workload and data across multiple committees, thereby creating a scalable ecosystem that supports enterprise-level applications while leveraging mirror nodes to maintain full historical data retention.

------

## Rationale

Drawing inspiration from academic research (e.g., Elastico, OmniLedger, RapidChain) and industry practices (e.g., Ethereum’s Danksharding, BNB Smart Chain, Zilliqa), the proposed sharding mechanism is designed to complement and extend Hedera’s architecture:

- **Efficiency:** Localizing data and transactions within Local Committees reduces the storage and communication burden on consensus nodes. Historical data is offloaded to mirror nodes that offer audit support, analytic services, and persistent storage of the full ledger.
- **Scalability:** Parallel processing across shards increases transaction throughput and overall network responsiveness.
- **Security:** Randomized node assignments and dynamic committee reconfiguration, in concert with the use of state proofs for shards, minimize risks like Sybil and collusion attacks. In addition, segregating local and global transaction ordering helps defend against cross-shard tampering.

This approach not only enhances Hedera’s scalability and performance but also maintains its core principles of fast, fair, and secure consensus.

------

## User Stories

1. **Node Operator:**
   I want the network load to be localized and optimized so that my node only processes data relevant to its shard while the mirror nodes handle full historical records.
2. **Application Developer:**
   I need fast, predictable cross-shard transaction processing to ensure my dApp can scale seamlessly, with the added benefit of using state proofs for validation.
3. **Security Engineer:**
   I require assurance that dynamic committee reconfiguration, randomized node assignments, and shard state proofs reduce the risk of targeted attacks while the mirror nodes maintain a secure and full transaction history.

------

## Specification

### Architecture

The architecture introduces a two-tier committee system defining the roles of consensus and mirror nodes:

- **Local Committees:**
  Nodes are randomly partitioned into smaller groups responsible for maintaining a specific slice of the overall DAG, with one of this ones randomly selected as coordinator for their shard. Each committee handles intra-shard transactions and uses state proofs to validate and verify the shard’s state. This reduces storage and communication overhead for consensus nodes.
- **Global Committee:**
  A randomly designated coordinator from each Local Committee forms the Global Committee. This committee manages cross-shard transactions, ensuring a consistent total order of events. It also serves as a backup for critical metadata and coordinates the generation and distribution of state proofs, further strengthening network security.
- **Mirror Nodes:**
  While consensus nodes only keep a snapshot of the recent transactions (a window of a few minutes), mirror nodes serve as the comprehensive storage of all past events and states across the full DAG.

### Data Partitioning and DAG Slicing

To optimize data management and synchronization, the continuous DAG (Hashgraph) is partitioned into interlinked subgraphs through periodic checkpointing:

- **Checkpointing:**
  Each Local Committee creates checkpoints that include cryptographic links such as signed timestamps, hash pointers, and shard state proofs. This method maintains global synchronization and validates that each shard’s state is correct without all nodes needing to store the entire history.
- **Tagging Cross-Shard Events:**
  When cross-shard transactions occur, Local Committees tag these operations and temporarily cache the related events. Once the Global Committee processes them, updated state proofs accompany the disseminated state changes.

### Cross-Shard Communication

A three-phase model ensures efficient and secure cross-shard processing:

1. **Intra-Shard Phase:**
   Each Local Committee maintains a self-contained, fully-functional Hashgraph DAG with complete consensus properties. 
2. **Global Phase:**
   The Global Committee maintains a higher-order DAG with the coordinators aggregating cross-shard transactions and process them using batch operations combined with lightweight atomic commit protocols (e.g., a two-phase commit)
3. **Synchronization Phase:**
   Once the Global Committee finalizes transactions, the updated state along with new state proofs is disseminated to the corresponding Local Committees. This ensures that all shards update their state consistently and securely.

### Committee Reconfiguration

**Dynamic Assignment:**
 New nodes are randomized into committees using consensus-derived entropy (e.g., consensus timestamps), along with verifiable randomness beacons and delay functions (VDFs) for additional security. This randomization prevents predictable patterns and minimizes the risk of adversarial targeting.

**Reorganization Protocol:**
 If a committee’s membership falls below a predefined threshold, a reconfiguration is triggered. The Global Committee employs cryptographic randomness sources to reassign nodes and reseat coordinators. This process also mandates the generation of updated state proofs to ensure continued validity and trust across shards.

------

## Backward Compatibility

To ensure a smooth transition without disrupting the existing network:

- **Dual Mode Operation:**
  The new sharding functionality will be introduced as an enhancement rather than a disruptive change. Nodes can operate in both sharded and non-sharded modes during the transition period.
- **Protocol Versioning:**
  Legacy nodes will continue participating with complete interoperability through versioning. Coordination layers will facilitate interaction between fully sharded components (using state proofs) and the traditional model where mirror nodes retain extended historical data.

------

## Security Implications

- **Reduced Attack Surface:**
  Localizing data and employing randomized reconfiguration limits an adversary’s ability to compromise a significant portion of any shard.
- **Resilience through Redundancy:**
  The Global Committee acts as a backup repository, and state proofs further secure each shard’s authenticity. Mirror nodes provide a fail-safe by maintaining the full ledger history.
- **Tamper Resistance:**
  Cryptographic links, state proofs, and the regular incorporation of randomness in node reassignments significantly lower the risk of coordinated or cross-shard attacks.

Altogether, these security measures enhance the overall integrity and resilience of the Hedera network as it scales.

------

## How to Teach This

- **Documentation and Tutorials:**
  Comprehensive guides will be produced for node operators, developers, and auditors to explain the sharding architecture, data partitioning, reconfiguration protocols, the role of mirror nodes, and the mechanism of state proofs.
- **Workshops:**
  Interactive sessions and webinars will be organized to demonstrate protocol changes in real-time, including live examples of state proof generation and verification.
- **Community Engagement:**
  Regular updates and Q&A sessions on forums (e.g., Hedera Discord, GitHub issues) will clarify operational details, benefits of sharding, and the workings of the mirror network.

------

## References

1. Wang, Z,. et al.[Investigating Sharding Advancements, Methodologies, and Adoption Potential in Hedera](https://cdn.prod.website-files.com/669a53c60f11ddb32e07366a/67dda22b3182a5f07ac28d2b_Discussion%20Paper%2008-2025%20(1).pdf)
2. Kokoris-Kogias, E., et al. “OmniLedger: A Secure, Scale-Out, Decentralized Ledger via Sharding.”
3. Zamani, M., et al. “RapidChain: Scaling Blockchain via Full Sharding.”
4. Solat, et al. "Sharding Distributed Databases: A Critical Review."
5. Baird, L. “The Swirlds Hashgraph Consensus Algorithm: Fair, Fast, and Secure.”
6. Hedera Mirror Node Documentation – [Hedera Core Concepts](https://docs.hedera.com/hedera/core-concepts/mirror-nodes).
7. Luu, L., et al. “Elastico: A Secure Sharding Protocol For Open Blockchains.”
------

## Open Issues

- **Reconfiguration Thresholds:**
  Further research is required to determine the optimal thresholds and triggers for committee reconfiguration.
- **Simulation and Testing:**
  Additional simulation and testing must validate the performance improvements and verify security guarantees under varying network loads.
- **Interoperability During Transition:**
  The interoperability between legacy nodes and sharded nodes needs to be robustly defined and thoroughly tested.
- **State Proof Implementation:**
  Further exploration is needed regarding the design trade-offs, computational overhead, and practical implementation of state proofs for shard validation.
- **Randomness Sources:**
  The selection and integration of randomness sources with a high level of entropy and unpredictability must be carefully evaluated.
