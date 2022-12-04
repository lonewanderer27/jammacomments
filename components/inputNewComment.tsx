import {
  Button,
  Container,
  Input,
  Row,
  Spacer,
  Textarea,
} from "@nextui-org/react";

import { useState } from "react";

export default function InputNewComment(props: {
  addComment: (newComment: {
    userName: string;
    userEmail: string;
    userTel: string;
    body: string;
    deleted: string;
  }) => void;
}) {
  const [newComment, setNewComment] = useState({
    userName: "",
    userEmail: "",
    userTel: "",
    body: "",
    deleted: "False",
  });

  function handleNewCommentChange(e) {
    const { name, value } = e.target;
    setNewComment((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  }

  function handleAddComment() {
    props.addComment(newComment);
    setNewComment(() => {
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
          onChange={handleNewCommentChange}
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
          onChange={handleNewCommentChange}
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
          onChange={handleNewCommentChange}
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
          onChange={handleNewCommentChange}
          fullWidth
        />
      </Row>
      <Spacer y={0.5} />
      <Row fluid justify="flex-end">
        <Button color="gradient" size="sm" onClick={handleAddComment}>
          Submit
        </Button>
      </Row>
    </Container>
  );
}
