import { Database } from "firebase-admin/lib/database/database";
import { getCurrentDateString } from "./time";

const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

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

export async function getComments(): Promise<{}> {
  const db = await getFirebaseDb();
  const ref = (await db).ref("messages");
  let entries = {};
  const response = await ref.once("value", (snapshot) => {
    entries = snapshot.val();
  });

  return [entries, response];
}

export async function postComment(
  body: string | undefined,
  profile_url: string | undefined,
  timestamp: string,
  userEmail: string,
  userName: string,
  userTel: string | null
): Promise<[any, any]> {
  const db = await getFirebaseDb();
  const ref = await db.ref("messages");
  const newCommentRef = await ref.push({
    body,
    profile_url: profile_url || "",
    timestamp: timestamp || getCurrentDateString(),
    userEmail,
    userName,
    userTel: userTel || "",
  });
  const newComment = await newCommentRef.get();
  const newCommentKey = await newCommentRef.key;

  return [newComment, newCommentKey];
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
