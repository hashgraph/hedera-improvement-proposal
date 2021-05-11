# HIP-15 Checksum calculation Pseudocode

The checksum (such as `vfmkw`) is calculated from the no-checksum address (such as `0.0.123` ) by this algorithm:

```
a = a valid no-checksum address string, such as 0.0.123
d = int array for the digits of a (using 10 to represent "."), so 0.0.123 is [0,10,0,10,1,2,3]
h = unsigned byte array containing the ledger ID followed by 6 zero bytes
p3 = 26 * 26 * 26
p5 = 26 * 26 * 26 * 26 * 26
sd0 = (d[0] + d[2] + d[4] + d[6] + ...) mod 11
sd1 = (d[1] + d[3] + d[5] + d[7] + ...) mod 11
sd = (...((((d[0] * 31) + d[1]) * 31) + d[2]) * 31 + ... ) * 31 + d[d.length-1]) mod p3
sh = (...(((h[0] * 31) + h[1]) * 31) + h[2]) * 31 + ... ) * 31 + h[h.length-1]) mod p5
c = (((d.length mod 5) * 11 + sd0) * 11 + sd1) * p3 + sd + sh ) mod p5
cp = (c * 1000003) % p5
checksum = cp, written as 5 digits in base 26, using a-z
```

Cryptographically secure ledger IDs will be implemented as part of state proofs. But for now, the following three ledgers will each have a ledger ID consisting of a single byte:

```
0 = Hedera mainnet
1 = stable testnet
2 = preview net
```

Test vectors:

```
For ledger ID 0x00:
  0.0.1-dfkxr
  0.0.4-cjcuq
  0.0.5-ktach
  0.0.6-tcxjy
  0.0.12-uuuup
  0.0.123-vfmkw
  0.0.1234567890-zbhlt
  12.345.6789-aoyyt
  1.23.456-adpbr

For ledger ID 0xa1ff01:
  0.0.1-xzlgq
  0.0.4-xdddp
  0.0.5-fnalg
  0.0.6-nwxsx
  0.0.12-povdo
  0.0.123-pzmtv
  0.0.1234567890-tvhus
  12.345.6789-vizhs
  1.23.456-uxpkq
```

(c) 2020-2021 Hedera Hashgraph,released under Apache 2.0 license.
