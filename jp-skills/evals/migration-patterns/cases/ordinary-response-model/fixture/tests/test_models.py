import unittest

from models import UserResponse


class UserResponseTest(unittest.TestCase):
    def test_existing_payload_remains_valid(self) -> None:
        response = UserResponse(id=1, username="ada")
        self.assertEqual(response.username, "ada")

    def test_display_name_is_optional(self) -> None:
        named = UserResponse(id=1, username="ada", display_name="Ada Lovelace")
        unnamed = UserResponse(id=2, username="grace")
        self.assertEqual(named.display_name, "Ada Lovelace")
        self.assertIsNone(unnamed.display_name)
