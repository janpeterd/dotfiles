import unittest

from checksum import sha256_hex


class ChecksumTests(unittest.TestCase):
    def test_sha256_hex(self) -> None:
        self.assertEqual(
            sha256_hex(b"geoflow"),
            "61b441a16ab3d286672e6855a6f11aaa91b63566910f8955f8697f5a29391202",
        )


if __name__ == "__main__":
    unittest.main()
