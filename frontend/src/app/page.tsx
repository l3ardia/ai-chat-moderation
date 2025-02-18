"use client";
import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Textarea,
  VStack,
  Text,
} from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { moderationApi } from "@/clients/moderation-api/instance";

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [violations, setViolations] = useState<
    {
      part?: string;
      level?: string;
      flag?: string;
      description?: string | null;
    }[]
  >([]);

  const sendMessage = async () => {
    if (message.trim() !== "") {
      const newMessages = [...messages, message];

      const response = await moderationApi.default.sendMessage({
        messages: newMessages,
      });

      setViolations(response.violations || []);
      setMessages([...messages, message]);
      setMessage("");
    }
  };

  const getHighlightColor = (level: string | undefined) => {
    switch (level) {
      case "warning":
        return "yellow.200";
      case "danger":
        return "red.200";
      case "info":
        return "blue.200";
      default:
        return "transparent";
    }
  };

  const highlightMessage = (msg: string) => {
    if (!violations.length) return <Text>{msg}</Text>;

    let parts: { text: string; level?: string; description?: string | null }[] =
      [{ text: msg, level: undefined, description: null }];

    violations.forEach(({ part, level, description }) => {
      if (!part) return;

      parts = parts.flatMap(
        ({ text, level: prevLevel, description: prevDesc }) =>
          text.includes(part)
            ? text.split(part).flatMap((splitText, index, arr) =>
                index < arr.length - 1
                  ? [
                      {
                        text: splitText,
                        level: prevLevel,
                        description: prevDesc,
                      },
                      { text: part, level, description },
                    ]
                  : [
                      {
                        text: splitText,
                        level: prevLevel,
                        description: prevDesc,
                      },
                    ]
              )
            : [{ text, level: prevLevel, description: prevDesc }]
      );
    });

    return (
      <Text>
        {parts.map((part, index) =>
          part.level ? (
            <Tooltip
              key={index}
              content={part.description || ""}
              showArrow
              positioning={{ offset: { mainAxis: 4, crossAxis: 4 } }}
              contentProps={{
                p: 2
              }}
            >
              <Box
                as="span"
                bg={getHighlightColor(part.level)}
                p={1}
                borderRadius="md"
              >
                {part.text}
              </Box>
            </Tooltip>
          ) : (
            <Box as="span" key={index}>
              {part.text}
            </Box>
          )
        )}
      </Text>
    );
  };

  return (
    <Container
      centerContent
      height="100vh"
      display="flex"
      justifyContent="center"
    >
      <VStack gap={4} width="100%" maxW="lg">
        <Textarea
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          size="lg"
          p={2}
        />
        <Button colorPalette={"teal"} onClick={sendMessage} width="full">
          Send Message
        </Button>
        <Box
          width="full"
          p={4}
          borderWidth={1}
          borderRadius="md"
          overflowY="auto"
          maxH="300px"
        >
          {messages.map((msg, index) => (
            <Box key={index} p={2} borderBottom="1px solid #ddd">
              {highlightMessage(msg)}
            </Box>
          ))}
        </Box>
      </VStack>
    </Container>
  );
}
