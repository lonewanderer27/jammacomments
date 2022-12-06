import {
  Button,
  Container,
  Input,
  Loading,
  Row,
  Spacer,
  Textarea,
} from "@nextui-org/react";

import { NewCommentStatus } from "../enums";
import axios from "axios";
import delay from "../utils/delay";
import { getCurrentDateString } from "../utils/time";
import { useState } from "react";

export default function InputNewComment(props: {
  handleAddComment: (
    commentKey: string,
    newComment: {
      userName: string;
      userEmail: string;
      userTel: string;
      body: string;
      deleted: string;
    }
  ) => void;
}) {
  const [comment, setComment] = useState({
    userName: "",
    userEmail: "",
    userTel: "",
    body: "",
    deleted: "False",
  });

  const [commentStatus, setCommentStatus] = useState(
    () => NewCommentStatus.IDLE
  );

  function resetCommentText() {
    setComment((prevCommentText) => {
      return {
        ...prevCommentText,
        body: "",
      };
    });
  }

  function handleCommentChange(e) {
    const { name, value } = e.target;
    setComment((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  }

  function handleAddCommentToDb() {
    setCommentStatus(() => NewCommentStatus.SENDING);
    axios
      .post(
        "http://localhost:2000/api/comments",
        {},
        {
          headers: {
            body: comment.body,
            profile_url: "",
            timestamp: getCurrentDateString(),
            useremail: comment.userEmail,
            username: comment.userName,
            usertel: comment.userTel,
          },
        }
      )
      .then((res) => {
        setCommentStatus(() => NewCommentStatus.SUCCESS);
        console.log("adding new comment to db response:");
        console.log(res);
        props.handleAddComment(
          res.data.data.newCommentKey,
          res.data.data.newComment
        );
        resetCommentText();
      })
      .catch((error) => {
        setCommentStatus(() => NewCommentStatus.ERROR);
        console.log(error);
      })
      .finally(async () => {
        await delay(1500);
        setCommentStatus(() => NewCommentStatus.IDLE);
      });
  }

  function handleAddComment() {
    handleAddCommentToDb();
    setComment(() => {
      return {
        userName: "",
        userEmail: "",
        userTel: "",
        body: "",
        deleted: "False",
      };
    });
  }

  return (
    <Container gap={1} fluid css={{ fontFamily: "Roboto" }}>
      <Spacer y={1} />
      <Row fluid>
        <Input
          labelLeft="Username"
          placeholder="lonewanderer27"
          bordered={false}
          name="userName"
          onChange={handleCommentChange}
          value={comment.userName}
          fullWidth
        />
      </Row>
      <Spacer y={0.5} />
      <Row>
        <Input
          labelLeft="Email"
          placeholder="user@mail.com"
          bordered={false}
          name="userEmail"
          onChange={handleCommentChange}
          value={comment.userEmail}
          fullWidth
        />
      </Row>
      <Spacer y={0.5} />
      <Row>
        <Input
          labelLeft="Phone"
          placeholder="+639983082814"
          bordered={false}
          name="userTel"
          onChange={handleCommentChange}
          value={comment.userTel}
          fullWidth
        />
      </Row>
      <Spacer y={0.5} />
      <Row>
        <Textarea
          aria-label="Write your thoughts"
          placeholder="Write your thoughts"
          bordered={false}
          name="body"
          onChange={handleCommentChange}
          value={comment.body}
          fullWidth
        />
      </Row>
      <Spacer y={0.5} />
      <Row fluid justify="flex-end">
        <Button
          color={
            commentStatus !== NewCommentStatus.ERROR ? "gradient" : "error"
          }
          size="sm"
          onClick={handleAddComment}
        >
          {commentStatus === NewCommentStatus.SENDING && (
            <Loading type="points-opacity" />
          )}
          {(commentStatus === NewCommentStatus.IDLE ||
            commentStatus === NewCommentStatus.SUCCESS) &&
            "Send"}
        </Button>
      </Row>
    </Container>
  );
}
