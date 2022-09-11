from crypt import methods
import os
from flask import Flask, render_template, request, flash, redirect, session, g, jsonify, url_for
from sqlalchemy.exc import IntegrityError, PendingRollbackError
from forms import UserAddForm, UserEditForm, LoginForm, MessageForm, ChangePasswordForm
from models import Likes, db, connect_db, User, Message, Follows
from psycopg2.errors import UniqueViolation
from sqlalchemy import text, and_
from flask_login import LoginManager, login_user, login_required, logout_user


CURR_USER_KEY = "curr_user"
start = ''

app = Flask(__name__)


# Get DB_URI from environ variable (useful for production/testing) or,
# if not set there, use development local db.
app.config['SQLALCHEMY_DATABASE_URI'] = (
    os.environ.get('DATABASE_URL', 'postgresql:///warbler'))

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = True
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', "it's a secret")


connect_db(app)
login_manager = LoginManager()
login_manager.init_app(app)


@login_manager.user_loader
def load_user(user_id):
    return g.user


##############################################################################
# User signup/login/logout

@app.before_request
def add_user_to_g():
    """If we're logged in, add curr user to Flask global."""

    if CURR_USER_KEY in session:
        g.user = User.query.get(session[CURR_USER_KEY])

    else:
        g.user = None


def do_login(user):
    """Log in user."""

    session[CURR_USER_KEY] = user.id


def do_logout():
    """Logout user."""

    if CURR_USER_KEY in session:
        del session[CURR_USER_KEY]


@app.route('/signup', methods=["GET", "POST"])
def signup():
    """Handle user signup.

    Create new user and add to DB. Redirect to home page.

    If form not valid, present form.

    If the there already is a user with that username: flash message
    and re-present form.
    """

    form = UserAddForm()

    if form.validate_on_submit():
        try:
            user = User.signup(
                username=form.username.data,
                password=form.password.data,
                email=form.email.data,
                image_url=form.image_url.data or User.image_url.default.arg,
            )
            db.session.commit()

        except IntegrityError:
            flash("Username already taken", 'danger')
            return render_template('users/signup.html', form=form)

        do_login(user)
        login_user(user)
        return redirect("/")

    else:
        return render_template('users/signup.html', form=form)


@app.route('/login', methods=["GET", "POST"])
def login():
    """Handle user login."""

    form = LoginForm()

    if form.validate_on_submit():
        user = User.authenticate(form.username.data,
                                 form.password.data)

        if user:
            do_login(user)
            flash(f"Hello, {user.username}!", "success")
            login_user(user)
            return redirect("/")

        flash("Invalid credentials.", 'danger')

    return render_template('users/login.html', form=form)


@app.route('/logout')
@login_required
def logout():
    """Handle logout of user."""

    # IMPLEMENT THIS

    do_logout()
    logout_user()

    flash('You have been logged out successfully.', 'info')
    return redirect('/')


##############################################################################
# General user routes:

@app.route('/users')
def list_users():
    """Page with listing of users.

    Can take a 'q' param in querystring to search by that username.
    """

    search = request.args.get('q')

    if not search:
        users = User.query.all()
    else:
        users = User.query.filter(User.username.like(f"%{search}%")).all()

    return render_template('users/index.html', users=users)


@app.route('/users/<int:user_id>')
@login_required
def users_show(user_id):
    """Show user profile."""

    user = User.query.get_or_404(user_id)

    # snagging messages in order from the database;
    # user.messages won't be in order by default
    messages = (Message
                .query
                .filter(Message.user_id == user_id)
                .order_by(Message.timestamp.desc())
                .limit(100)
                .all())

    msg_likes = get_user_following_messages_and_likes()

    return render_template('users/show.html', user=user, messages=messages,  msg_liked=len(msg_likes[1]))


@app.route('/users/<int:user_id>/following')
@login_required
def show_following(user_id):
    """Show list of people this user is following."""

    user = User.query.get_or_404(user_id)
    msg_likes = get_user_following_messages_and_likes()
    return render_template('users/following.html', user=user, msg_liked=len(msg_likes[1]))


@app.route('/users/<int:user_id>/followers')
@login_required
def users_followers(user_id):
    """Show list of followers of this user."""

    user = User.query.get_or_404(user_id)
    msg_likes = get_user_following_messages_and_likes()
    return render_template('users/followers.html', user=user, msg_liked=len(msg_likes[1]))


@app.route('/users/<int:user_id>/liked')
@login_required
def users_liked_msg(user_id):
    '''Show list of liked masseges for this user'''

    msg_likes = get_user_following_messages_and_likes()

    msgs_ids = [m.message_id for m in msg_likes[1]]
    masseges = (Message.
                query.
                filter(Message.id.in_(msgs_ids))
                .order_by(Message.timestamp.desc()))

    return render_template('users/show_liked_msg.html', user=g.user, messages=masseges, msg_liked=len(msg_likes[1]))


@app.route('/users/follow/<int:follow_id>', methods=['POST'])
@login_required
def add_follow(follow_id):
    """Add a follow for the currently-logged-in user."""

    followed_user = User.query.get_or_404(follow_id)
    g.user.following.append(followed_user)
    db.session.commit()

    return redirect(url_for('show_following', user_id=g.user.id))
    # return redirect(f"/users/{g.user.id}/following")


@app.route('/users/stop-following/<int:follow_id>', methods=['POST'])
@login_required
def stop_following(follow_id):
    """Have currently-logged-in-user stop following this user."""

    followed_user = User.query.get(follow_id)
    g.user.following.remove(followed_user)
    db.session.commit()

    return redirect(url_for('show_following', user_id=g.user.id))
    # return redirect(f"/users/{g.user.id}/following")


@app.route('/users/profile', methods=["GET", "POST"])
@login_required
def profile():
    """Update profile for current user."""

    # IMPLEMENT THIS

    form = UserEditForm(obj=g.user)

    if form.validate_on_submit():
        # Check for user password in order to updated the user information

        if g.user.authenticate(g.user.username, form.password.data):

            g.user.image_url = form.image_url.data or g.user.image_url
            g.user.header_image_url = form.header_image_url.data or g.user.header_image_url or User.header_image_url.default.arg
            g.user.bio = form.bio.data or g.user.bio

            # Added a bunch of logic to control duplicate name and email in the db
            # Because for some reason cant control duplicate name or email with the exeptions
            # This works for now but is not efficiency can be better
            user = User.query.filter_by(username=form.username.data).first()
            if g.user.username == form.username.data:
                pass
            else:
                if not user:
                    g.user.username = form.username.data
                else:
                    form.username.errors.append(
                        'Username Taken. Please pick another')
                    return render_template('users/edit.html', form=form)

            user = User.query.filter_by(email=form.email.data).first()
            if g.user.email == form.email.data:
                pass
            else:
                if not user:
                    g.user.email = form.email.data
                else:
                    form.email.errors.append(
                        'E-Mail Taken. Please pick another')
                    return render_template('users/edit.html', form=form)

            db.session.commit()

            flash(f'{g.user.username} updated successfully.', 'info')
            return redirect(url_for('users_show', user_id=g.user.id))
            # return redirect(f'/users/{g.user.id}')

            # try:
            #     # db.session.add(g.user)
            #     db.session.commit()

            #     flash(f'{g.user.username} updated successfully.', 'info')
            #     return redirect(f'/users/{g.user.id}')

            # except IntegrityError:
            #     flash("Username/Mail already taken", 'danger')
            #     return render_template('users/edit.html', form=form)

        else:

            flash('Invalid Password Information Entered.', 'danger')
            return redirect('/')

    return render_template('users/edit.html', form=form)


@app.route('/users/pwd_change', methods=['GET', "POST"])
@login_required
def change_password():
    """update user password user."""

    form = ChangePasswordForm(obj=g.user)

    if form.validate_on_submit():

        password = form.password.data
        new_pwd = form.new_pwd.data
        confirm_pwd = form.confirm_pwd.data

        user = User.password_change(g.user.id, password, new_pwd, confirm_pwd)

        if user == 'pwd_wrong':
            form.password.errors.append(
                'Password is incorrect!')

        if user == 'pwd_dont_match':
            flash('New and Confirm Password do not match', 'danger')

        if user == 'success':
            flash('Password has Updated', 'info')
            return redirect('/')

    return render_template('users/change_password.html', form=form)


@app.route('/users/delete', methods=["POST"])
@login_required
def delete_user():
    """Delete user."""

    do_logout()

    db.session.delete(g.user)
    db.session.commit()

    return redirect("/signup")


##############################################################################
# Messages routes:

@app.route('/messages/new', methods=["GET", "POST"])
@login_required
def messages_add():
    """Add a message:

    Show form if GET. If valid, update message and redirect to user page.
    """

    form = MessageForm()

    if form.validate_on_submit():
        msg = Message(text=form.text.data)
        g.user.messages.append(msg)
        db.session.commit()

        return redirect(url_for('users_show', user_id=g.user.id))
      # return redirect(f'/users/{g.user.id}')

    return render_template('messages/new.html', form=form)


@app.route('/messages/<int:message_id>', methods=["GET"])
def messages_show(message_id):
    """Show a message."""

    msg = Message.query.get(message_id)
    return render_template('messages/show.html', message=msg)


@app.route('/messages/<int:message_id>/delete', methods=["POST"])
@login_required
def messages_destroy(message_id):
    """Delete a message."""

    msg = Message.query.get(message_id)
    db.session.delete(msg)
    db.session.commit()

    return redirect(url_for('users_show', user_id=g.user.id))
  # return redirect(f'/users/{g.user.id}')


##############################################################################
# Homepage and error pages


@app.route('/')
# @auth.login_required
def homepage():
    '''Show homepage:'''

    if g.user:

        msg_likes = get_user_following_messages_and_likes()

        return render_template('home.html', messages=msg_likes[0], likes=[l.message_id for l in msg_likes[1]])

    else:
        return render_template('home-anon.html')


@app.route('/users/add_like/<int:msg_id>', methods=['POST'])
def get_and_add_likes(msg_id):
    '''Show likes for a user or add a like to for the user

    This is working with a Json Request from the client side
    it return in json to work on the client

    '''

    action = request.json['action']

    if action == 'add':
        like = Likes(user_id=g.user.id, message_id=msg_id)
        db.session.add(like)
        db.session.commit()
        return (jsonify({'result': 'add_pass'}), 200)

    if action == 'remove':
        like_delete = Likes.query.filter_by(
            user_id=g.user.id, message_id=msg_id).first()
        db.session.delete(like_delete)
        db.session.commit()
        return (jsonify({'result': 'remove_pass'}), 200)


@app.errorhandler(404)
def not_found(e):
    '''404 Error Handeling'''

    return render_template("404.html")


@app.errorhandler(401)
def custom_401(e):
    '''401 Error Handeling'''

    flash("Access unauthorized.", "danger")
    return redirect("/login")


##############################################################################
# Turn off all caching in Flask
#   (useful for dev; in production, this kind of stuff is typically
#   handled elsewhere)
#
# https://stackoverflow.com/questions/34066804/disabling-caching-in-flask

@app.after_request
def add_header(req):
    """Add non-caching headers on every request."""

    req.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    req.headers["Pragma"] = "no-cache"
    req.headers["Expires"] = "0"
    req.headers['Cache-Control'] = 'public, max-age=0'
    return req


# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# print what i need to see in the console


def get_user_following_messages_and_likes():
    '''Return messages and likes for a user for the users that he/she is following'''

    user_id_following = (Follows
                         .query
                         .filter(Follows.user_being_followed_id == g.user.id)
                         .all())

    # Return only the messages that the user that is login
    # for the users that he/she is followings
    messages = (Message
                .query
                .filter(Message.user_id.in_([u.user_following_id for u in user_id_following]))
                .order_by(Message.timestamp.desc())
                .limit(100)
                .all())

    likes = Likes.query.filter_by(user_id=g.user.id).all()

    return (messages, likes)


def personal_debugger(var):
    print('========================================')
    print('========================================')
    print('========================================')
    print('========================================')
    print(var)
    print('========================================')
    print('========================================')
    print('========================================')
    print('========================================')
