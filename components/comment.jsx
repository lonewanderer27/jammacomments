import {
  Grid,
  Text,
  Button,
  Textarea,
  Spacer,
  Avatar,
  Row,
  Col,
} from "@nextui-org/react";
import { useState } from "react";
import { UilArrowUp, UilArrowDown } from "@iconscout/react-unicons";
import * as dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function Comment(props) {
  const [comment, setComment] = useState(() => props.data["body"]);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [replying, setReplying] = useState(false);

  function handleEdit(e) {
    setEditing((prev) => !prev);
  }

  function handleCommentChange(e) {
    const { value } = e.target;
    setComment(() => value);
  }

  function handleDelete(e) {
    setDeleting((prev) => !prev);
  }

  function handleReply(e) {
    setReplying((prev) => !prev);
  }

  console.log(
    `isEditing: ${editing}\nisDeleting: ${deleting}\nisReplying: ${replying}`
  );

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
              {!editing && (
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
                </>
              )}
            </Row>

            <Row justify="flex-start">
              {!editing && (
                <Text
                  css={{
                    fontFamily: "Roboto",
                  }}
                >
                  {comment}
                </Text>
              )}
              {editing && (
                <Textarea
                  placeholder="Your new comment?"
                  initialValue={comment}
                  onChange={handleCommentChange}
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
              {editing == false && deleting == false && replying == false ? (
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
                    <Button onPress={handleEdit}>Edit</Button>
                    <Button onPress={handleReply}>Reply</Button>
                    <Button onPress={handleDelete}>Delete</Button>
                  </Button.Group>
                </>
              ) : (
                ""
              )}
              {editing == true && (
                <Button onPress={handleEdit} size="xs" light>
                  Save Changes
                </Button>
              )}
            </Row>
          </Col>
        </Grid>
      </Grid.Container>
    </>
  );
}
