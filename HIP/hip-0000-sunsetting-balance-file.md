---
hip: <HIP number (this is determined by the HIP editor)>
title: Sunsetting Balance File
author: Michael Heinrichs <michael@swirldslabs.com>
type: Standards Track
category: Service
needs-council-approval: Yes
status: Draft
created: 2023-08-28
---

## Abstract

This HIP proposes sunsetting the balance file.

## Motivation

The ongoing success of the Hedera Network has caused an enormous growth of the data stored in consensus nodes. To ensure the continuous delivery of stable and responsive services, functionality that requires reading large amounts of data has to be disabled on consensus nodes and moved to other systems.

## Rationale

Calculating and providing balance files requires iterating over all accounts. This causes many disk reads, which can interfere with normal operations.

## User stories

As a user, I want a stable and responsive system that does not degrade as the usage scales out.
  
## Specification

Producing and making the balance file available will be stopped completely.

## Backwards Compatibility

Systems that depend on balance file availability must adapt and request account balances from Mirror Nodes. It is an open discussion if balance files should be provided in the future using other techniques.

## Security Implications

There are no security implications for this change.

## How to Teach This

It should be updated if balance files are mentioned at all in the Hedera documentation. Specific education is not required.

## Reference Implementation

The reference implementation must be complete before HIPs are given the "Final" status.

## Rejected Ideas

All ideas that produced the balance file on consensus nodes were rejected because they would solve the original problem of vast numbers of file reads.

## Open Issues

It is under discussion if balance files can be provided with a process that does not involve analyzing the data on consensus nodes.

## References

N/A

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
