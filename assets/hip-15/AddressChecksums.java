//(c) 2020-2021 Hedera Hashgraph, released under Apache 2.0 license.
package com.hedera;

import java.util.Arrays;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static java.lang.Math.*;

/**
 * Static methods and classes useful for dealing with Hedera address checksums, as defined in
 * <a href="https://github.com/hashgraph/hedera-improvement-proposal/HIP/hip-15.md>HIP-15</a>
 */
public class AddressChecksums {
	/** regex accepting both no-checksum and with-checksum formats, with 4 capture groups: 3 numbers and a checksum */
	final private static Pattern addressInputFormat = Pattern.compile(
			"^(0|(?:[1-9]\\d*))\\.(0|(?:[1-9]\\d*))\\.(0|(?:[1-9]\\d*))(?:-([a-z]{5}))?$");

	/** the status of an address parsed by parseAddress */
	public enum parseStatus {
		BAD_FORMAT,         //incorrectly formatted
		BAD_CHECKSUM,      //checksum was present, but it was incorrect
		GOOD_NO_CHECKSUM,  //good no-checksum format address (no checksum was given)
		GOOD_WITH_CHECKSUM //good with-checksum format address (a correct checksum was given)
	}

	/**
	 * The result returned by {@link }#parseAddress(addr)}, including all 4 components of addr, and correct checksum.
	 */
	public static class ParsedAddress {
		/** is this a valid address? (If it's valid, then it either has a correct checksum, or no checksum) */
		boolean isValid;
		/** the status of the parsed address */
		parseStatus status;
		/** the first number in the address (10 in 10.20.30) */
		int num1;
		/** the second number in the address (20 in 10.20.30) */
		int num2;
		/** the third number in the address (30 in 10.20.30) */
		int num3;
		/** the checksum in the address that was parsed */
		String givenChecksum;
		/** the correct checksum */
		String correctChecksum;
		/** the address in no-checksum format */
		String noChecksumFormat;
		/** the address in with-checksum format */
		String withChecksumFormat;

		public String toString() {
			return String.format(
					"[isValid: %s, status: %s, num1: %s, num2: %s, num3: %s, correctChecksum: %s, " +
							"givenChecksum: %s, noChecksumFormat: %s, withChecksumFormat: %s]",
					isValid, status, num1, num2, num3, correctChecksum,
					givenChecksum, noChecksumFormat, withChecksumFormat);
		}
	}


	/**
	 * Given an address in either no-checksum or with-checksum format, return the components of the address, the correct
	 * checksum, and the canonical form of the address in no-checksum and with-checksum format.
	 *
	 * @param ledgerId
	 * 		the ledger ID for the ledger this address is on
	 * @param addr
	 * 		the address string to parse, such as "0.0.123" or "0.0.123-vfmkw"
	 * @return the address components, checksum, and forms
	 */
	public static ParsedAddress parseAddress(byte[] ledgerId, String addr) {
		ParsedAddress results = new ParsedAddress();
		Matcher match = addressInputFormat.matcher(addr);
		if (!match.matches()) {
			results.isValid = false;
			results.status = parseStatus.BAD_FORMAT; //when status==BAD_FORMAT, the rest of the fields should be ignored
			return results;
		}
		results.num1 = Integer.parseInt(match.group(1));
		results.num2 = Integer.parseInt(match.group(2));
		results.num3 = Integer.parseInt(match.group(3));
		String ad = results.num1 + "." + results.num2 + "." + results.num3;
		String c = checksum(ledgerId, ad);
		results.status = ("".equals(match.group(4))) ? parseStatus.GOOD_NO_CHECKSUM
				: (c.equals(match.group(4))) ? parseStatus.GOOD_WITH_CHECKSUM
				: parseStatus.BAD_CHECKSUM;
		results.isValid = (results.status != parseStatus.BAD_CHECKSUM);
		results.correctChecksum = c;
		results.givenChecksum = match.group(4);
		results.noChecksumFormat = ad;
		results.withChecksumFormat = ad + "-" + c;
		return results;
	}

	/**
	 * Given an address like "0.0.123", return a checksum like "vfmkw" . The address must be in no-checksum format, with
	 * no extra characters (so not "0.0.00123" or "==0.0.123==" or "0.0.123-vfmkw"). The algorithm is defined by the
	 * HIP-15 standard to be:
	 *
	 * <pre>{@code
	 * a = a valid no-checksum address string, such as 0.0.123
	 * d = int array for the digits of a (using 10 to represent "."), so 0.0.123 is [0,10,0,10,1,2,3]
	 * h = unsigned byte array containing the ledger ID followed by 6 zero bytes
	 * p3 = 26 * 26 * 26
	 * p5 = 26 * 26 * 26 * 26 * 26
	 * s0 = (d[0] + d[2] + d[4] + d[6] + ...) mod 11
	 * s1 = (d[1] + d[3] + d[5] + d[7] + ...) mod 11
	 * s = (...((((d[0] * 31) + d[1]) * 31) + d[2]) * 31 + ... ) * 31 + d[d.length-1]) mod p3
	 * sh = (...(((h[0] * 31) + h[1]) * 31) + h[2]) * 31 + ... ) * 31 + h[h.length-1]) mod p5
	 * c = (((d.length mod 5) * 11 + s0) * 11 + s1) * p3 + s + sh ) mod p5
	 * c = (c * 1000003) mod p5
	 * checksum = c, written as 5 digits in base 26, using a-z
	 * }</pre>
	 *
	 * @param ledgerId
	 * 		the ledger ID for the ledger this address is on
	 * @param addr
	 * 		no-checksum address string without leading zeros or extra characters (so ==00.00.00123== becomes 0.0.123)
	 * @return the checksum
	 */
	public static String checksum(byte[] ledgerId, String addr) {
		String a = addr;      //address, such as "0.0.123"
		int[] d = new int[addr.length()]; //digits of address, with 10 for '.', such as [0,10,0,10,1,2,3]
		byte[] h = ledgerId;  //ledger ID as an array of unsigned bytes
		int s0 = 0;           //sum of even positions (mod 11)
		int s1 = 0;           //sum of odd positions (mod 11)
		int s = 0;            //weighted sum of all positions (mod p3)
		int sh = 0;           //hash of the ledger ID
		long c = 0;           //the checksum, as a single number (it's a long, to prevent overflow in c * m)
		String checksum = ""; //the answer to return
		final int p3 = 26 * 26 * 26;             //3 digits base 26
		final int p5 = 26 * 26 * 26 * 26 * 26;   //5 digits base 26
		final int ascii_0 = '0';                 //48
		final int ascii_a = 'a';                 //97
		final int m = 1_000_003;                 //min prime greater than a million. Used for the final permutation.
		final int w = 31;     //sum of digit values weights them by powers of w. Should be coprime to p5.

		for (int i = 0; i < a.length(); i++) {
			d[i] = (a.charAt(i) == '.' ? 10 : (a.charAt(i) - ascii_0));
		}
		for (int i = 0; i < d.length; i++) {
			s = (w * s + d[i]) % p3;
			if (i % 2 == 0) {
				s0 = (s0 + d[i]) % 11;
			} else {
				s1 = (s1 + d[i]) % 11;
			}
		}
		for (byte sb : h) {
			sh = (w * sh + (sb & 0xff)) % p5; //convert signed byte to unsigned before adding
		}
		for (int i = 0; i < 6; i++) { //process 6 zeros as if they were appended to the ledger ID
			sh = (w * sh + 0) % p5;
		}
		c = ((((a.length() % 5) * 11 + s0) * 11 + s1) * p3 + s + sh) % p5;
		c = (c * m) % p5;
		for (int i = 0; i < 5; i++) {
			checksum = Character.toString(ascii_a + (int)(c % 26)) + checksum;
			c /= 26;
		}

		return checksum;
	}

	/**
	 * Check if the given checksum matches the calculated checksum, and println the result
	 *
	 * @param ledgerId
	 * 		the ledger that the address is on
	 * @param addr
	 * 		the address string (with or without checksum)
	 */
	private static void verify(byte[] ledgerId, String addr, String correctChecksum) {
		ParsedAddress parsed = parseAddress(ledgerId, addr);
		System.out.println(
				(correctChecksum.equals(parsed.correctChecksum) ? "GOOD: " : "BAD:  ")
						+ "Ledger " + Arrays.toString(ledgerId)
						+ " address " + parsed.withChecksumFormat);
	}

	/**
	 * Demonstrate use of checksum and parseAddress methods.
	 *
	 * @param args
	 * 		ignored
	 */
	public static void main(String[] args) {
		byte[] mainnetLedgerId = new byte[] { (byte) 0 };
		byte[] exampleLedgerId = new byte[] { (byte) 0xa1, (byte) 0xff, (byte) 0x01 };

		//the following should all output a line starting with "GOOD:"

		verify(mainnetLedgerId, "0.0.1", "dfkxr");
		verify(mainnetLedgerId, "0.0.4", "cjcuq");
		verify(mainnetLedgerId, "0.0.5", "ktach");
		verify(mainnetLedgerId, "0.0.6", "tcxjy");
		verify(mainnetLedgerId, "0.0.12", "uuuup");
		verify(mainnetLedgerId, "0.0.123", "vfmkw");
		verify(mainnetLedgerId, "0.0.1234567890", "zbhlt");
		verify(mainnetLedgerId, "12.345.6789", "aoyyt");
		verify(mainnetLedgerId, "1.23.456", "adpbr");

		verify(exampleLedgerId, "0.0.1", "xzlgq");
		verify(exampleLedgerId, "0.0.4", "xdddp");
		verify(exampleLedgerId, "0.0.5", "fnalg");
		verify(exampleLedgerId, "0.0.6", "nwxsx");
		verify(exampleLedgerId, "0.0.12", "povdo");
		verify(exampleLedgerId, "0.0.123", "pzmtv");
		verify(exampleLedgerId, "0.0.1234567890", "tvhus");
		verify(exampleLedgerId, "12.345.6789", "vizhs");
		verify(exampleLedgerId, "1.23.456", "uxpkq");

		//The following should all output a line starting with "[isValid: false".
		//The first one should have a status of BAD_CHECKSUM, and the rest should have BAD_FORMAT.

		System.out.println(parseAddress(mainnetLedgerId, "0.0.123-abcde"));
		System.out.println(parseAddress(mainnetLedgerId, "0.00.123"));
		System.out.println(parseAddress(mainnetLedgerId, "0.0.0123-vfmkw"));
		System.out.println(parseAddress(mainnetLedgerId, "0.0.123-VFMKW"));
		System.out.println(parseAddress(mainnetLedgerId, "0.0.123-vFmKw"));
		System.out.println(parseAddress(mainnetLedgerId, "0.0.123#vfmkw"));
		System.out.println(parseAddress(mainnetLedgerId, "0.0.123vfmkw"));
		System.out.println(parseAddress(mainnetLedgerId, "0.0.123 - vfmkw"));
		System.out.println(parseAddress(mainnetLedgerId, "0.123"));
		System.out.println(parseAddress(mainnetLedgerId, "0.0.123."));
		System.out.println(parseAddress(mainnetLedgerId, "0.0.123-vf"));
		System.out.println(parseAddress(mainnetLedgerId, "0.0.123-vfm-kw"));
		System.out.println(parseAddress(mainnetLedgerId, "0.0.123-vfmkwxxxx"));
	}
}
