
import os
from unittest import TestCase
from models import db, User, Message, Follows

# BEFORE we import our app, let's set an environmental variable
# to use a different database for tests (we need to do this
# before we import our app, since that will have already
# connected to the database

os.environ['DATABASE_URL'] = "postgresql:///warbler-test"


# Now we can import app

from app import app

# Create our tables (we do this here, so we only create the tables
# once for all tests --- in each test, we'll delete the data
# and create fresh new clean test data

db.create_all()

USER1 = User()
USER2 = User()


class UserModelTestCase(TestCase):
    """Test Model for User."""

    def setUp(self):
        """Create test client, add sample data."""

        User.query.delete()
        Message.query.delete()
        Follows.query.delete()

        USER1 = User(
            email="user1@test.com",
            username="user1",
            password="123456"
        )

        USER2 = User(
            email="user2@test.com",
            username="user2",
            password="123456"
        )

        self.USER1 = USER1
        self.USER2 = USER2

        db.session.add_all([USER1, USER2])
        db.session.commit()

        self.client = app.test_client()

    def tearDown(self):
        """Clean up fouled transactions."""

        db.session.rollback()

    def test_user_model(self):
        """Does basic model work?"""

        u = User(
            email="test@test.com",
            username="testuser",
            password="HASHED_PASSWORD"
        )

        db.session.add(u)
        db.session.commit()

        # User should have no messages & no followers
        self.assertEqual(len(u.messages), 0)
        self.assertEqual(len(u.followers), 0)

    def test_user_repr(self):
        """Self __repr__ for the class test"""

        self.assertEqual(
            USER1.__repr__(), f'<User #{USER1.id}: {USER1.username}, {USER1.email}>')

    def test_user_following(self):
        """Testing following user to users works"""

        following = Follows(user_being_followed_id=self.USER1.id,
                            user_following_id=self.USER2.id)

        db.session.add(following)
        db.session.commit()

        self.assertEqual(len(self.USER1.followers), 1)
        self.assertEqual(len(self.USER2.followers), 0)

    def test_user1_following_user2(self):
        """Testing one user is following another user works"""

        following1 = Follows(user_being_followed_id=self.USER1.id,
                             user_following_id=self.USER2.id)
        following2 = Follows(user_being_followed_id=self.USER2.id,
                             user_following_id=self.USER1.id)

        db.session.add_all([following1, following2])
        db.session.commit()

        self.assertEqual(self.USER1.followers[0].username, self.USER2.username)
        self.assertEqual(self.USER2.followers[0].username, self.USER1.username)

    def test_user_signup(self):
        """Test user created or signup"""

        u = User.signup(
            username="test3",
            email="test3@test.com",
            password="123456",
            image_url=''
        )

        self.assertEqual(u.username, 'test3')

    def test_user_signup(self):
        """Test user signup fails"""

        u = User.signup(
            username="user1",
            email="test3@test.com",
            password="123456",
            image_url=''
        )

        self.assertEqual(u.id, None)

    def test_user_authenticate(self):
        """Test user test_user_authenticate"""

        u = User.signup(
            username="test2",
            email="test3@test.com",
            password="123456",
            image_url=''
        )

        u = User.authenticate('test2', '123456')
        u2 = User.authenticate('test2', '123')
        u3 = User.authenticate('tesas', '123456')

        self.assertEqual(u.email, 'test3@test.com')
        self.assertEqual(u2, False)
        self.assertEqual(u3, False)
