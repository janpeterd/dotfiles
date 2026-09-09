import tempfile
import unittest
from pathlib import Path

from storage import GzipJsonCodec, JsonCodec, load, save


class StorageTests(unittest.TestCase):
    def test_both_codecs_use_the_same_storage_path(self) -> None:
        value = {"measurements": [1.5, 2.25], "unit": "m"}

        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for index, codec in enumerate((JsonCodec(), GzipJsonCodec())):
                path = root / f"value-{index}"
                save(path, value, codec)
                self.assertEqual(load(path, codec), value)

    def test_gzip_payload_is_compressed(self) -> None:
        payload = GzipJsonCodec().encode({"values": ["same value"] * 100})

        self.assertTrue(payload.startswith(b"\x1f\x8b"))


if __name__ == "__main__":
    unittest.main()
