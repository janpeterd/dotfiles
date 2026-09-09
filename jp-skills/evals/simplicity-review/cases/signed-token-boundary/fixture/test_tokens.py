import unittest

from tokens import InvalidToken, ParsedToken, parse_token, sign


SECRET = b"test-secret"
NOW = 1_000


class TokenTests(unittest.TestCase):
    def test_returns_valid_domain_value(self) -> None:
        token = sign({"sub": "user-1", "aud": "web", "exp": NOW + 1}, SECRET)
        self.assertEqual(parse_token(token, SECRET, "web", NOW), ParsedToken("user-1"))

    def test_rejects_bad_signature(self) -> None:
        token = sign({"sub": "user-1", "aud": "web", "exp": NOW + 1}, b"wrong")
        with self.assertRaises(InvalidToken):
            parse_token(token, SECRET, "web", NOW)

    def test_rejects_wrong_audience(self) -> None:
        token = sign({"sub": "user-1", "aud": "cli", "exp": NOW + 1}, SECRET)
        with self.assertRaises(InvalidToken):
            parse_token(token, SECRET, "web", NOW)

    def test_rejects_expired_token(self) -> None:
        token = sign({"sub": "user-1", "aud": "web", "exp": NOW}, SECRET)
        with self.assertRaises(InvalidToken):
            parse_token(token, SECRET, "web", NOW)

    def test_rejects_invalid_subject(self) -> None:
        token = sign({"sub": "", "aud": "web", "exp": NOW + 1}, SECRET)
        with self.assertRaises(InvalidToken):
            parse_token(token, SECRET, "web", NOW)


if __name__ == "__main__":
    unittest.main()
