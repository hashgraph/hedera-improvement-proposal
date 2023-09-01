---
hip: 801
title: Add support for debugging EVM transactions
author: Ivan Kavaldzhiev <ivan.kavaldzhiev@limechain.tech>, Stoyan Panayotov <stoyan.panayotov@limechain.tech>
working-group: Steven Sheehy <steven.sheehy@swirldslabs.com>, Nana Essilfie-Conduah <nana@swirldslabs.com>, Danno Ferrin <danno.ferrin@swirldslabs.com>, David Bakin <david.bakin@swirldslabs.com>, Georgi Lazarov <georgi.lazarov@limechain.tech>
type: Standards Track
needs-council-approval: Yes
category: Service
status: Review
created: 2023-08-31
discussions-to: https://github.com/hashgraph/hedera-improvement-proposal/discussions/802
---

## Abstract

This HIP describes the mechanism of adding initial support for handling DEBUG requests for historical EVM transaction to the JSON-RPC Relay and the Hedera Mirror Node.

## Motivation

Ethereum nodes can be configured to enable support for debugging historical transactions and thus producing a detailed output log with information related to the transaction execution. Hedera’s current architecture does not support this functionality. 

Ongoing efforts to achieve Ethereum equivalence require Hedera to enable debugging of historical EVM transactions. This enhancement would improve Hedera's interoperability with different Ethereum tools and providers, including Remix, Hardhat, Ganache, Geth, Alchemy, etc.

## Rationale

Hedera's architecture consists of three types of nodes:

- JSON-RPC Relay nodes expose a JSON-RPC API similar to the one that Ethereum nodes use. The Relay handles user requests by either forwarding them to a Consensus or Mirror node.
- Consensus nodes execute transactions, produce transaction records, and maintain the world state.
- Mirror nodes ingest the record files produced by the consensus nodes, maintain a “mirror” of the world state, and provide an API for queries and simulations which can work with the current, or a historical state.

Enhancing the JSON-RPC Relay and the Mirror Archive Node with debug APIs will allow users to replay historical transactions and inspect and analyse them by having detailed information for the execution based on a tracer type that is specified in the request. 

Add support of `debug_traceTransaction` in the JSON-RPC Relay which returns detailed information for a historical transaction that was executed in the past.

The JSON-RPC Relay will in turn make a request to the Mirror Node REST API which will be enhanced with a new endpoint that returns opcode logs. The Mirror node already has an endpoint that returns call traces.

## User stories

1. As a user, I want to perform `debug_traceTransaction` calls to explore the op code traces for a historical transaction.
2. As a user, I want to perform `debug_traceTransaction` calls to explore the sub calls that were executed for a historical transaction.

## Specification

In order to enable trace calls, we should meet some requirements on the Mirror Archive Node side:

- Support EVM versioning, so that we use the appropriate EVM version for a specific historical block.
- Use full mirror node, keeping state from the genesis block and configured with enabled ingest of `CONTRACT_BYTECODE` , `CONTRACT_STATE_CHANGE` and `CONTRACT_ACTION` sidecar types.
- Re-execute historical transactions using the information for state values read from the downloaded `CONTRACT_STATE_CHANGE` sidecar record files.

### JSON-RPC Relay Trace API

The JSON-RPC Relay will be enhanced with a `debug_traceTransaction` endpoint. The endpoint has one required parameter - `transactionHash` - and also accepts a list of properties - a `tracer`, and a list of configuration `flags`.

Example payload:

```jsx
{
	"jsonrpc": "2.0",
	"method": "debug_traceTransaction",
	"params": [
      // The transaction hash.
	  "0x123...", 
	  {
		// The tracer to use. Accepted values: `callTracer` and `opcodeLogger`. Optional field. Default value is `callTracer`.
		tracer: "callTracer"
		// Options for `opcodeLogger`. Ignored for `callTracer`. Disabling some of the metrics collected will reduce the output.
	    disableMemory: true,
	    disableStack: true,
	    disableStorage: true,
	  },
	],
	"id": 0
}
```

### Mirror node Trace REST API

The JSON-RPC Relay will in turn call the Mirror Node REST API. Depending on the `tracer` that was provided as an input parameter to the `debug_traceTransaction` RPC endpoint, one of two Mirror node endpoints will be called:
1. For `debug_traceTransaction` called with `callTracer`, the Mirror Node `/api/v1/contracts/results/{transactionIdOrHash}/actions` endpoint will be called.
2. For `debug_traceTransaction` called with `opcodeLogger`, the Mirror Node `/api/v1/contracts/results/{transactionIdOrHash}/opcodes` endpoint will be called.

The `/actions` endpoint is already implemented. 

This section will specify the `/opcodes` endpoint.

#### `/api/v1/contracts/results/{transactionIdOrHash}/opcodes`

**Input parameters:** The endpoint will accept three optional parameters:

```
// Boolean flag controlling whether to return stack information. Defaults to `true`.

stack: <bool> 

// Boolean flag controlling whether to return memory information. Defaults to `false`.

memory: <bool> 

// Boolean flag controlling whether to return storage information. Defaults to `false`.

storage: <bool>
```

Disabling stack, memory and storage traces will significantly reduce the size of the opcode related data. This would be helpful for reducing the network bandwidth. 

**Output**: detailed information for each executed op code.
Example output:
```
{
    "jsonrpc": "2.0",
    "id": 0,
    "result": {
        "gas": 52139,
        "failed": false,
        "returnValue": "0000000000000000000000000000000000000000000000000000000000000001",
        "structLogs": [
            {
                "pc": 0,
                "op": "PUSH1",
                "gas": 978428,
                "gasCost": 3,
                "depth": 1,
                "stack": [],
                "memory": [],
                "storage": {},
                "reason": null
            },
            {
                "pc": 2,
                "op": "PUSH1",
                "gas": 978425,
                "gasCost": 3,
                "depth": 1,
                "stack": [
                    "0000000000000000000000000000000000000000000000000000000000000080"
                ],
                "memory": [],
                "storage": {},
                "reason": null
            },
			[...]
        }
    }
```

For providing output formatted by `opcodeLogger`, the Mirror node will re-execute the transaction using the state from the `contract_state_changes` sidecars produced by the consensus nodes. In this way, we can have a track on all of the storage/memory information and the entire trace of opcodes that were executed during the replay.

⚠️ The output generated from the opcodeLogger is very verbose. The /traceOpcodes endpoint will be disabled by default and can be enabled by users of the Hedera Local node or users running their own Mirror Nodes.

### **Performance considerations**

Since the output generated by this tracer might be quite large, we could add a `flag` for enabling different type of tracers, based on the usage and setup of the Mirror Archive Node. This would give us control and flexibility. A user would be able to enable `opcodeLogger` in a local environment and get the full response data. The default tracer enabled by default on production, could be the `callTracer`.

Since this API would use a lot of resources like memory, CPU usage or requests to the DB, we can have a very strict rate limit that can be configurable based on the context of usage. We can use 1 call per second as initial rate limit. If a given provider want to run the Archive Node with more resources, the rate limit could be increased.

## Backward Compatibility

Mirror Nodes that will support the new REST APIs should have enabled importing of CONTRACT_BYTECODE , CONTRACT_STATE_CHANGE and CONTRACT_ACTION sidecar types. Otherwise, executing the endpoints would result in missing runtime bytecode for execution or using stale contract storage data. In addition, the mirror node should have full historical support (keeping state from the first block), so that it could replay transactions from the entire lifetime of the system.

## Security Implications

There would be some security implementations for Mirror Nodes. Since the debug_trace RPC calls would be free of charge and the Mirror Nodes don’t have throttle mechanism, some attack vectors would be possible. The Nodes could be overloaded with huge amount of calls or calls invoking smart contract methods with huge gas usage, both of which might take more system usage and slow down the network for other users. A rate limit mechanism will be implemented, so that the load put on Mirror Nodes to be balanced.

## How to Teach This

Respective documentation will be added.

## References

https://hips.hedera.com/hip/hip-584

https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-debug

https://ganache.dev/#debug_traceTransaction

https://book.getfoundry.sh/reference/anvil/?highlight=debug_tra#description

https://docs.alchemy.com/reference/debug-tracetransaction

https://hardhat.org/hardhat-network/docs/reference#debug_tracetransaction

https://hardhat.org/hardhat-network/docs/overview#the-debug-tracetransaction-method

## Open Issues

None.

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)