import { Database } from "firebase-admin/lib/database/database";
import { getCurrentDateString } from "./time";

const admin = require("firebase-admin");
const serviceAccount = {
  "type": process.env.TYPE,
  "project_id": process.env.GOOGLE_PROJECT_TYPE,
  "private_key_id": process.env.GOOGLE_PROJECT_PRIVATE_KEY_ID,
  "private_key": process.env.GOOGLE_PROJECT_PRIVATE_KEY,
  "client_email": process.env.GOOGLE_PROJECT_CLIENT_EMAIL,
  "client_id": process.env.GOOGLE_PROJECT_CLIENT_ID,
  "auth_uri": process.env.GOOGLE_PROJECT_AUTH_URI,
  "token_uri": process.env.GOOGLE_PROJECT_TOKEN_URI,
  "auth_provider_x509_cert_url": process.env.GOOGLE_PROJECT_AUTH_PROVIDER_X509_CERT_URL,
  "client_x509_cert_url": process.env.GOOGLE_PROJECT_CLIENT_X509_CERT_URL
};

export async function getFirebaseDb(): Promise<Database> {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL:
        "https://jamma-comments-332612-default-rtdb.asia-southeast1.firebasedatabase.app",
    });
  }
  return admin.database();
}

export async function getComments(): Promise<[boolean, object, object]> {
  const db = await getFirebaseDb();
  const ref = (await db).ref("messages");
  let comments = {};
  let error = {};
  let success = false;
  const response = await ref.once(
    "value",
    (snapshot) => {
      comments = snapshot.val();
      success = true;
    },
    (error) => {
      error = error;
      success = false;
    }
  );
  return [success, comments, error];
}

export async function postComment(
  body: string | undefined,
  profile_url: string | undefined,
  timestamp: string,
  userEmail: string,
  userName: string,
  userTel: string | null
): Promise<[boolean, string, object, object]> {
  const db = await getFirebaseDb();
  const ref = await db.ref("messages");
  let error = {};
  let success = false;
  const newCommentRef = await ref.push(
    {
      body,
      profile_url: profile_url || "",
      timestamp: timestamp || getCurrentDateString(),
      userEmail,
      userName,
      userTel: userTel || "",
    },
    (error) => {
      if (error) {
        console.log("new comment cannot be created, error:");
        console.log(error);
        success = false;
      } else {
        console.log("comment successfully created!");
        success = true;
      }
    }
  );
  const newComment = await newCommentRef.get();
  const newCommentKey = await newCommentRef.key;

  return [success, newCommentKey, newComment, error];
}

export async function deleteComment(
  commentKey: string
): Promise<[boolean, object]> {
  const db = await getFirebaseDb();
  const ref = await db.ref(`messages/${commentKey}`);
  let error = {};
  let success = false;
  await ref.set(null, (error) => {
    if (error) {
      console.log("Comment cannot be deleted, error:");
      console.log(error);
      success = false;
    } else {
      console.log("Comment successfully deleted!");
      success = true;
    }
  });
  return [success, error];
}

export async function hideComment(
  commentKey: string
): Promise<[boolean, object]> {
  const db = await getFirebaseDb();
  const commentRef = await db.ref(`messages/${commentKey}`);
  let error = {};
  let success = false;
  await commentRef.update(
    {
      deleted: "True",
    },
    (error) => {
      if (error) {
        console.log("Comment cannot be hide, error: " + error);
        error = error;
        success = false;
      } else {
        console.log("Comment successfully hidden!");
        success = true;
      }
    }
  );
  return [success, error];
}
