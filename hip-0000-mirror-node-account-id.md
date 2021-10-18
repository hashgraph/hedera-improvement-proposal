- hip: <HIP number (this is determined by the HIP editor)>
- title: Add Parameter for Message Account Id to Mirror Node API
- author: scalemaildev
- type: Standards Track
- category: <Core | Service | API | Mirror | Application>
- status: Draft
- created: <date created on>
- discussions-to: <a URL pointing to the official discussion thread>
- updated: <comma separated list of dates>
- requires: <HIP number(s)>
- replaces: <HIP number(s)>
- superseded-by: <HIP number(s)>

## Abstract

Add a parameter to the Hedera mirror node API that will return the Account ID of each message's sender.

## Motivation

In the development of the [Hashgraph Chess Application](https://github.com/scalemaildev/hashgraph_chess) I ran into a problem: the game needs to filter out chess moves or chat messages that aren't from one of the game's two players. But I also don't want to make either player the admin of their game's topic.

Since the Account ID of a message's sender isn't included in the message metadata, I had to put the sender's Account ID into the message content. This leaves the application open to spoof attacks. While there are some workaround methods to address this, the simplest method for addressing this problem would be to add a parameter to the mirror node's API that will ask it to return each message's sender's Account ID along with the rest of its metadata.

## Rationale

Many use cases for the HCS would want to know who is sending a message to a public topic. Workaround methods, such as querying the Transaction ID for a message and pulling the sender's Account ID from its timestamp, would involve extra API calls and put unnecessary strain on the mirror node and add complexity to the app. Having a trustworthy source of information for who sent a message would allow developers to handle logic involving the sender's ID in their application.

## User stories

As a developer, I want to know what account sent an HCS message from the message's metadata.
  
## Specification

The technical specification should describe the syntax and semantics of any new features. The specification should be detailed enough to allow competing, interoperable implementations for at least the current Hedera ecosystem.

## Backwards Compatibility

All HIPs that introduce backward incompatibilities must include a section describing these incompatibilities and their severity. The HIP must explain how the author proposes to deal with these incompatibilities. HIP submissions without a sufficient backward compatibility treatise may be rejected outright.

## Security Implications

If there are security concerns in relation to the HIP, those concerns should be explicitly addressed to make sure reviewers of the HIP are aware of them.

## How to Teach This

For a HIP that adds new functionality or changes interface behaviors, it is helpful to include a section on how to teach users, new and experienced, how to apply the HIP to their work.

## Reference Implementation

The reference implementation must be complete before any HIP is given the status of “Final”. The final implementation must include test code and documentation.

## Rejected Ideas

Throughout the discussion of a HIP, various ideas will be proposed which are not accepted. Those rejected ideas should be recorded along with the reasoning as to why they were rejected. This both helps record the thought process behind the final version of the HIP as well as preventing people from bringing up the same rejected idea again in subsequent discussions.

In a way, this section can be thought of as a breakout section of the Rationale section that focuses specifically on why certain ideas were not ultimately pursued.

## Open Issues

While a HIP is in draft, ideas can come up which warrant further discussion. Those ideas should be recorded so people know that they are being thought about but do not have a concrete resolution. This helps make sure all issues required for the HIP to be ready for consideration are complete and reduces people duplicating prior discussions.

## References

Hashgraph Chess: https://github.com/scalemaildev/hashgraph_chess

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
