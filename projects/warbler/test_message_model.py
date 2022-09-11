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
MSG1 = Message()
MSG2 = Message()


class MessagesModelTestCase(TestCase):
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

        MSG1 = Message(text='MSG1 Text1', user_id=self.USER1.id)
        MSG2 = Message(text='MSG2 Text2', user_id=self.USER1.id)

        self.MSG1 = MSG1
        self.MSG2 = MSG2

        db.session.add_all([MSG1, MSG2])
        db.session.commit()

        self.client = app.test_client()

    def tearDown(self):
        """Clean up fouled transactions."""

        db.session.rollback()

    def test_message_model(self):
        """Does basic model work?"""

        self.assertEqual(self.MSG1.text, 'MSG1 Text1')
        self.assertEqual(self.MSG2.text, 'MSG2 Text2')

    def test_message_repr(self):
        """Test __repr__ for the class test"""

        self.assertEqual(
            self.MSG1.__repr__(), f"<Msg #{self.MSG1.id}: {self.MSG1.text}, {self.MSG1.timestamp}, u-id: {self.MSG1.user_id}>")

    def test_messagges_for_user(self):
        """Does basic model work?"""

        user = User.query.filter_by(username=self.USER1.username).first()
        user2 = User.query.filter_by(username=self.USER2.username).first()

        self.assertEqual(len(user.messages), 2)
        self.assertEqual(len(user2.messages), 0)



