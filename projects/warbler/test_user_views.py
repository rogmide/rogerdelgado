
import os
from unittest import TestCase
from models import db, connect_db, Message, User, Likes, Follows

os.environ['DATABASE_URL'] = "postgresql:///warbler-test"

from app import app, CURR_USER_KEY

db.create_all()


class UserViewTestCase(TestCase):
    """Test views for messages."""

    def setUp(self):
        """Create test client, add sample data."""

        db.drop_all()
        db.create_all()

        self.user1 = User.signup("user1", "user1@test.com", "123456", None)
        self.user2 = User.signup("user2", "user2@test.com", "123456", None)
        self.user3 = User.signup("user3", "user3@test.com", "123456", None)

        db.session.commit()

    def tearDown(self):

        db.session.rollback()

    def test_users(self):
        '''Test /users page to see if properlly display the 3 users'''
        with app.test_client() as client:
            resp = client.get("/users")

            self.assertIn("@user1", str(resp.data))
            self.assertIn("@user2", str(resp.data))
            self.assertIn("@user3", str(resp.data))

    def test_user_need_signup(self):
        '''Making sure that the user has to be sign up first to see user profile'''

        with app.test_client() as client:
            resp = client.get("/users/profile", follow_redirects=True)

            self.assertEqual(resp.status_code, 200)
            self.assertIn(
                "Sign up now to get your own personalized timeline!", str(resp.data))

    def test_users_search(self):
        '''Testing search for users'''

        with app.test_client() as client:
            resp = client.get("/users?q=user")

            self.assertNotIn("NoIn", str(resp.data))
            self.assertIn("@user1", str(resp.data))
            self.assertIn("@user3", str(resp.data))    



