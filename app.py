from flask import Flask, redirect, request, url_for, render_template, session
import firebase_admin
from firebase_admin import credentials, db, storage
import re
from badwords import badwords
import os
import datetime

# config
# server will reload on source changes, and provide a debugger for errors
DEBUG = True
TEMPLATES_AUTO_RELOAD = True 
SESSION_COOKIE_SAMESITE="None"
SESSION_COOKIE_SECURE=True

app = Flask(__name__)
app.config.from_object(__name__) # consume the configuration above
commentFailed = None

# Fetch the service account key JSON file contents
cred = credentials.Certificate('jamma-comments-332612-firebase-adminsdk-9x87k-8d8cbd899a.json')

# Initialize the app with a service account, granting admin privileges
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://jamma-comments-332612-default-rtdb.asia-southeast1.firebasedatabase.app/',
    'storageBucket': 'jamma-comments-332612.appspot.com'
})


def commentFilter(comment):
  '''Takes in a body of text and returns the censored version based on the badword filter'''
  # PLEASE DO NOT MODIFY, IT WORKS AS IT IS HAHAHA
  # print(comment)
  registerComment = comment
  commentFiltered = ""
  userCommentAsList = re.sub("[^\w](!@34%^&*.,)", " ", registerComment).split()
  for word in userCommentAsList:
                numOFasterisk = len(word) 
                asterisks = ""
                tempword = word.lower()
                if tempword in badwords:
                    asterisks = (numOFasterisk * '*')
                    commentFiltered += str(f"{asterisks} ")
                else:
                    commentFiltered += str(f"{word} ")
                # print(commentFiltered)
  # print(commentFiltered)
  return commentFiltered


@app.route('/')
def index():
  session['feedback'] = None
  session['current_username'] = request.args.get('username')
  username = request.args.get('username')

  session['profile_url'] = request.args.get('profile_url')
  profile_url = request.args.get('profile_url')
  ref = db.reference('/messages')
  result = ref.get()
  return render_template('index.html', messages=result,username=username,profile_url=profile_url)



# decorator which tells flask what url triggers this fn
@app.route('/messages')
def messages():
  username = session.get('current_username')
  profile_url = session.get('profile_url')
  feedback = session.get('feedback')
  ref = db.reference('/messages')
  result = ref.get()
  return render_template('index.html', messages=result,username=username,profile_url=profile_url,feedback=feedback)



@app.route('/submit_message', methods=['POST'])
def submit_message():
  messege = request.form.get('message')
  esername = request.form.get('username')  
  esermail = request.form.get('email')
  esertel = request.form.get('tel')

  commentFiltered = commentFilter(messege)
  print(f"{esername} commented: {commentFiltered}")
  ref = db.reference('/messages')
  ref.push().set({
    'body': commentFiltered,
    'userName': esername,
    'userEmail': esermail,
    'userTel': esertel,
    'timestamp': str(datetime.datetime.now())
  })
  return redirect(url_for('messages'))



@app.route('/submit_message_authdUser', methods=['POST'])
def submit_message_authdUser():
  esername = request.form.get('username')
  messege = request.form.get('message')

  commentFiltered = commentFilter(messege)
  print(f"{esername} commented: {commentFiltered}")
  ref = db.reference('/messages')
  ref.push().set({
    'body': commentFiltered,
    'userName': esername,
    'timestamp': str(datetime.datetime.now()),
    'profile_url': session.get('profile_url'),
  })
  return redirect(url_for('messages'))



@app.route('/delete_message_authdUser', methods=['POST'])
def delete_message_authdUser():
  messege_id = request.form.get('message_id')
  ref = db.reference('messages/'+messege_id)
  ref.update({
      'deleted': 'True',
      'detetedTime': str(datetime.datetime.now()),
  })
  session['feedback'] = 'Your comment has now been deleted, but it can be still reviewed for potential violation.'
  return redirect(url_for('messages'))



@app.route('/edit_message_authdUser', methods=['POST'])
def edit_message_authdUser():
  messege_id = request.form.get('message_id')
  new_cemment = request.form.get('new_comment')
  commentFiltered = commentFilter(new_cemment)
  ref = db.reference('messages/'+messege_id)
  ref.update({
      'body': commentFiltered,
      'edited': 'True',
      'editedTime': str(datetime.datetime.now()),
  })
  session['feedback'] = 'Your comment has been successfully edited!'
  return redirect(url_for('messages'))



if __name__ == '__main__':
    app.secret_key = os.urandom(12)
    # Bind to PORT if defined, otherwise default to 5000.
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)