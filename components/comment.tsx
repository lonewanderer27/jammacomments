import {
  Avatar,
  Button,
  Col,
  Grid,
  Row,
  Spacer,
  Text,
  Textarea,
} from "@nextui-org/react";
import { UilArrowDown, UilArrowUp } from "@iconscout/react-unicons";
import { memo, useState } from "react";

import { ActionState } from "../enums";
import { CommentType } from "../interfaces";
import React from "react";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

function Comment(props: {
  data: CommentType;
  commentKey: string;
  removeComment: (commentKey: string) => void;
}) {
  const [actionState, setActionState] = useState(() => ActionState.NONE);
  const [comment, setComment] = useState(() => props.data.body);
  const [newComment, setNewComment] = useState(() => props.data.body);

  const handleNewCommentChange = (e) => {
    const { value } = e.target;
    setNewComment(() => value);
  };

  const saveNewComment = () => {
    setComment(() => newComment);
    toggleAction(ActionState.EDIT);
  };

  const toggleAction = (action: ActionState) => {
    setActionState((prevAction: ActionState) => {
      if (prevAction === action) {
        return ActionState.NONE;
      } else {
        return action;
      }
    });
  };

  const handleDelete = async () => {
    try {
      console.log("commentKey to delete: " + props.commentKey);
      toggleAction(ActionState.DELETING);
      props.removeComment(props.commentKey);
      (async () => {
        const response = await axios.delete(
          "http://localhost:2000/api/comments",
          {
            headers: {
              commentkey: props.commentKey,
            },
          }
        );
        console.log(response);
      })();
      toggleAction(ActionState.DELETING);
    } catch (err) {}
  };

  const avatar = (userName, profile_url) => {
    if (profile_url) {
      return <Avatar src={props.data.profile_url} size="lg" />;
    } else {
      return <Avatar text={userName} size="lg" />;
    }
  };

  return (
    <>
      <Grid.Container alignContent="space-between">
        <Grid xs={1}>
          {avatar(props.data.userName, props.data.profile_url)}
        </Grid>
        <Spacer x={1} y={0.5} />
        <Grid xs={10}>
          <Col>
            <Row justify="flex-start">
              <Text weight="extrabold">{props.data.userName}</Text>
              {actionState !== ActionState.EDIT && (
                <>
                  <Text
                    css={{
                      margin: "0 10px",
                    }}
                  >
                    •
                  </Text>
                  <Text
                    css={{
                      fontFamily: "Roboto",
                    }}
                  >
                    {dayjs().to(dayjs(props.data.timestamp))}
                  </Text>
                  <Text
                    css={{
                      margin: "0 10px",
                    }}
                  >
                    •
                  </Text>
                  <Text>{props.commentKey}</Text>
                </>
              )}
            </Row>

            <Row justify="flex-start">
              {actionState !== ActionState.EDIT && (
                <Text
                  css={{
                    fontFamily: "Roboto",
                  }}
                >
                  {comment}
                </Text>
              )}
              {actionState === ActionState.EDIT && (
                <Textarea
                  aria-label="New Comment Textbox"
                  placeholder="Your new comment?"
                  initialValue={comment}
                  onChange={handleNewCommentChange}
                  value={comment}
                  fullWidth={true}
                  css={{
                    margin: "5px 0",
                    fontFamily: "Roboto",
                  }}
                />
              )}
            </Row>

            <Row justify="flex-start" align="center">
              {actionState === ActionState.NONE ? (
                <>
                  <UilArrowUp size="20" className="voteBtn" />
                  <Text
                    css={{
                      margin: "0 5px",
                    }}
                  >
                    |
                  </Text>
                  <UilArrowDown size="20" className="voteBtn" />
                  <Button.Group size="xs" light>
                    <Button onPress={() => toggleAction(ActionState.EDIT)}>
                      Edit
                    </Button>
                    <Button onPress={() => toggleAction(ActionState.REPLY)}>
                      Reply
                    </Button>
                    <Button onPress={() => toggleAction(ActionState.DELETE)}>
                      Delete
                    </Button>
                  </Button.Group>
                </>
              ) : (
                ""
              )}
              {(actionState === ActionState.EDIT) == true && (
                <>
                  <Button.Group size="xs" light>
                    <Button onPress={() => toggleAction(ActionState.EDIT)}>
                      Cancel
                    </Button>
                    <Button onPress={saveNewComment}>Save Changes</Button>
                  </Button.Group>
                </>
              )}
              {(actionState === ActionState.DELETE ||
                actionState === ActionState.DELETING) == true && (
                <>
                  <Button.Group size="xs" light>
                    <Button onPress={() => toggleAction(ActionState.DELETE)}>
                      Cancel
                    </Button>
                    <Button
                      onPress={handleDelete}
                      title="Your comment can still be reviewed for potential violation after deletion."
                    >
                      Confirm Delete
                    </Button>
                  </Button.Group>
                </>
              )}
            </Row>
          </Col>
        </Grid>
      </Grid.Container>
    </>
  );
}

export default memo(Comment);
