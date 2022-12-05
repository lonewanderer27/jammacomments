import { NextApiRequest, NextApiResponse } from "next";
import {
  deleteComment,
  getComments,
  hideComment,
  postComment,
} from "../../utils/database";

import { Status } from "../../enums";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET": {
      console.log("request params");
      const { userName } = req.query;
      console.log("userName: " + userName);
      const [success, comments, error] = await getComments();
      if (success) {
        res.status(200).json({
          status: Status.SUCCESS,
          data: {
            comments: comments,
          },
          message: null,
          description: null,
        });
      } else {
        res.status(500).json({
          status: Status.ERROR,
          data: null,
          message:
            "The server has encountered an error that it doesn't know how to handle",
          description: error.toString(),
        });
      }
    }
    case "POST": {
      console.log("request headers");
      const { body, profile_url, timestamp, useremail, username, usertel } =
        req.headers;
      console.log(req.headers);
      const [success, newCommentKey, newComment, error] = await postComment(
        body,
        profile_url,
        timestamp,
        useremail,
        username,
        usertel
      );
      if (success) {
        res.status(200).json({
          status: Status.SUCCESS,
          data: {
            newComment: {
              [newCommentKey]: newComment,
            },
            newCommentKey: newCommentKey,
          },
        });
      } else {
        res.status(500).json({
          status: Status.ERROR,
          data: null,
          message:
            "The server has encountered an error that it doesn't know how to handle",
          description: error,
        });
      }
    }
    case "PUT": {
    }
    case "DELETE": {
      console.log("request headers");
      const { commentkey } = req.headers;
      const [success, error] = await hideComment(commentkey);
      if (success) {
        res.status(204).json({
          status: Status.SUCCESS,
        });
      } else {
        res.status(404).json({
          status: Status.ERROR,
          data: null,
          message: "There has been an error trying to hide the comment",
          description: JSON.stringify(error),
        });
      }
    }
  }
}
